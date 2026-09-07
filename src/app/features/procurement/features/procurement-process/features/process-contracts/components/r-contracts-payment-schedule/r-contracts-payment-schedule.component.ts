import {
  Component,
  OnInit,
  inject,
  Input,
  Signal,
  computed,
  AfterViewInit,
  SimpleChanges,
  OnChanges,
  signal,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatSelectChange } from '@angular/material/select';
import { map, Observable, of, startWith, merge, Subject } from 'rxjs';
import { filter, finalize, switchMap, takeUntil } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';
import { FileSaverService } from 'ngx-filesaver';
import { TranslateService } from '@ngx-translate/core';
import { Currency, Enumerator, ProjectTask } from '@core/models';
import { BiddingContractApiService } from '@core/services/apis';
import {
  ContractComponentResponse,
  ContractPaymentScheduleRequest,
  ContractPaymentScheduleResponse,
  ContractResponse,
} from '../../rebrand-form';
import { FormType } from '@core/utils';
import { paymentForm } from '../../rebrand-form/forms';
import { ContractRebrandService } from '../../services/contract-rebrand.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { NotificationGlobalService } from '../../../../../../../../shared';
import { MatDialog } from '@angular/material/dialog';
import { ContractDialogComponent } from '../contract-dialog/contract-dialog.component';

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  incompleteRows: IncompleteRowError[];
}

interface IncompleteRowError {
  index: number;
  missingFields: string[];
}

enum ErrorType {
  EXCEEDED = 'EXCEEDED',
  MISSING_IN_FORM = 'MISSING_IN_FORM',
  MISSING_IN_API = 'MISSING_IN_API',
  INSUFFICIENT = 'INSUFFICIENT',
  MISMATCH = 'MISMATCH',
}

interface ValidationError {
  type: ErrorType;
  currency: string;
  componentId: string;
  productId: string;
  details?: {
    available: { idb: number; lc: number; cf: number };
    used: { idb: number; lc: number; cf: number };
    difference: { idb: number; lc: number; cf: number };
  };
}

export interface TranslatableError {
  translationKey: string;
  params: Record<string, any>;
  subErrors?: Array<{
    translationKey: string;
    params: Record<string, any>;
  }>;
}

interface GroupedData {
  [currency: string]: {
    [componentId: string]: {
      [productId: string]: {
        idbTotal: number;
        lcTotal: number;
        cfTotal: number;
      };
    };
  };
}

export enum PaymentScheduleMode {
  REGULAR = 1,
  FILE = 2,
}

const CASCADE_FIELDS = {
  PRODUCT: ['productId'],
  REQUEST_TYPE: [],
  CURRENCY: [],
  AMOUNTS: [],
} as const;

@Component({
  selector: 'fi-r-contracts-payment-schedule',
  templateUrl: './r-contracts-payment-schedule.component.html',
  styleUrls: ['./r-contracts-payment-schedule.component.scss'],
})
export class RContractsPaymentScheduleComponent
  implements OnInit, AfterViewInit, OnChanges
{
  @Input() contractId: string;
  @Input() contractsPaymentRequests: Enumerator[];
  @Input() allCurrenciesRegistered: string[];
  @Input() contractStartDate: string;
  @Input() contractEndDate: string;
  @Input() componentProducts: Map<string, ProjectTask[]>;
  @Input() allProjectTasks$: Observable<ProjectTask[]>;
  @Input() contractData: ContractResponse;
  @Input() set allCurrenciesObs(value: Observable<Currency[]>) {
    if (value) {
      value.subscribe((currencies) => {
        this.allCurrenciesSignal.set(currencies);
      });
    }
  }
  @Input() set paymentSchedule(value: ContractPaymentScheduleResponse[]) {
    this._paymentSchedule = value || [];
    if (this.isDataReady()) {
      this.initializePaymentSchedule();
    }
  }
  @Output() omitStep: EventEmitter<boolean> = new EventEmitter<boolean>();

  get paymentSchedule(): ContractPaymentScheduleResponse[] {
    return this._paymentSchedule;
  }

  get isFileUploaded(): boolean {
    return this.contractsSvc.paymentScheduleFileUploadedSignalReadonly();
  }

  _paymentSchedule: ContractPaymentScheduleResponse[] = [];

  paymentScheduleModes: Array<{
    id: PaymentScheduleMode;
    title: string;
    description: string;
  }> = [];

  readonly displayedColumns: string[] = [
    'paymentNumber',
    'description',
    'estimatedDate',
    'componentId',
    'productId',
    'paymentRequestTypeId',
    'currency',
    'idbAmount',
    'lcAmount',
    'cfAmount',
    'paymentAmount',
    'actions',
  ];

  readonly PaymentScheduleMode = PaymentScheduleMode;

  allCurrencies$: Observable<string[]>;
  requestType$: Observable<Enumerator[]>;
  dataSource: MatTableDataSource<FormType<ContractPaymentScheduleResponse>>;
  payments: FormArray<FormType<ContractPaymentScheduleResponse>>;
  paymentsSignal: Signal<ContractPaymentScheduleResponse[]>;
  allCurrenciesSignal = signal<Currency[]>([]);
  paymentsTotalSignal: Signal<number[]>;
  paymentValidationSignal: Signal<ValidationResult>;
  isModifiedSignal: Signal<boolean>;
  selectedMode: PaymentScheduleMode | null = null;
  productsMap = new Map<number, ProjectTask[]>();
  isDownloading = false;
  isUploadingFile = false;
  isResettingSchedule = false;
  private readonly destroy$ = new Subject<void>();

  private readonly notificationSvc = inject(NotificationGlobalService);
  private readonly contractApiSvc = inject(BiddingContractApiService);
  private readonly contractsSvc = inject(ContractRebrandService);
  private readonly fileSaverService = inject(FileSaverService);
  private readonly translate = inject(TranslateService);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);

  constructor() {
    this.payments = this.fb.array<FormType<ContractPaymentScheduleResponse>>(
      []
    );

    const paymentsChanges$ = this.payments.valueChanges.pipe(
      startWith(null),
      switchMap(() => {
        const controlChanges$ = this.payments.controls.map((control) =>
          control.valueChanges.pipe(startWith(control.getRawValue()))
        );

        return controlChanges$.length > 0
          ? merge(...controlChanges$, this.payments.valueChanges)
          : this.payments.valueChanges;
      }),
      map(
        () => this.payments.getRawValue() as ContractPaymentScheduleResponse[]
      )
    );

    this.paymentsSignal = toSignal(paymentsChanges$, { initialValue: [] });

    this.paymentsTotalSignal = computed(() =>
      this.paymentsSignal().map(
        (payment) =>
          (payment?.lcAmount ?? 0) +
          (payment?.cfAmount ?? 0) +
          (payment?.idbAmount ?? 0)
      )
    );

    this.isModifiedSignal = computed(() => {
      if (this.isFileUploaded || this.hasModifications()) {
        return true;
      }

      const currentData = this.paymentsSignal().map(
        ({ paymentAmount, paymentNumber, ...rest }) =>
          this.normalizeObject(rest)
      );
      const originalData = this.paymentSchedule.map(
        ({ paymentAmount, paymentNumber, ...rest }) =>
          this.normalizeObject(rest)
      );

      if (this.selectedMode === PaymentScheduleMode.FILE) {
        return false;
      }

      return (
        JSON.stringify(currentData) !== JSON.stringify(originalData) &&
        this._paymentSchedule.length !== currentData.length
      );
    });

    this.paymentValidationSignal = computed(() => {
      const currentPayments = this.paymentsSignal();

      if (currentPayments.length === 0) {
        return { isValid: true, errors: [], incompleteRows: [] };
      }

      const incompleteRows: IncompleteRowError[] = [];

      currentPayments.forEach((payment, index) => {
        const missingFields: string[] = [];

        if (!payment.description?.trim()) {
          missingFields.push('description');
        }
        if (!payment.estimatedDate) {
          missingFields.push('estimatedDate');
        }
        if (!payment.componentId) {
          missingFields.push('componentId');
        }
        if (!payment.productId) {
          missingFields.push('productId');
        }
        if (!payment.paymentRequestTypeId) {
          missingFields.push('paymentRequestTypeId');
        }
        if (!payment.currency) {
          missingFields.push('currency');
        }
        if (payment.idbAmount === null || payment.idbAmount === undefined) {
          missingFields.push('idbAmount');
        }
        if (payment.lcAmount === null || payment.lcAmount === undefined) {
          missingFields.push('lcAmount');
        }
        if (payment.cfAmount === null || payment.cfAmount === undefined) {
          missingFields.push('cfAmount');
        }

        const idbAmount = payment.idbAmount ?? 0;
        const lcAmount = payment.lcAmount ?? 0;
        const cfAmount = payment.cfAmount ?? 0;

        if (idbAmount === 0 && lcAmount === 0 && cfAmount === 0) {
          missingFields.push('allAmountsZero');
        }

        if (missingFields.length > 0) {
          incompleteRows.push({ index, missingFields });
        }
      });

      if (!this.contractData?.costDistribution) {
        return {
          isValid: incompleteRows.length === 0,
          errors: [],
          incompleteRows,
        };
      }

      const availableTotals = this.groupByCurrencyComponentProduct(
        this.contractData.costDistribution
      );
      const usedTotals =
        this.groupPaymentsByCurrencyComponentProduct(currentPayments);
      const sumValidation = this.validatePaymentTotals(
        availableTotals,
        usedTotals
      );

      return {
        isValid: sumValidation.isValid && incompleteRows.length === 0,
        errors: sumValidation.errors,
        incompleteRows,
      };
    });
  }

  private normalizeObject(obj: any): any {
    const keys = Object.keys(obj).sort();
    return keys.reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {} as any);
  }

  ngAfterViewInit(): void {}

  ngOnInit(): void {
    this.paymentScheduleModes = [
      {
        id: PaymentScheduleMode.REGULAR,
        title: this.translate.instant(
          'R.CONTRACT.PAYMENT_SCHEDULE.MODE.REGULAR.TITLE'
        ),
        description: this.translate.instant(
          'R.CONTRACT.PAYMENT_SCHEDULE.MODE.REGULAR.DESCRIPTION'
        ),
      },
      {
        id: PaymentScheduleMode.FILE,
        title: this.translate.instant(
          'R.CONTRACT.PAYMENT_SCHEDULE.MODE.FILE.TITLE'
        ),
        description: this.translate.instant(
          'R.CONTRACT.PAYMENT_SCHEDULE.MODE.FILE.DESCRIPTION'
        ),
      },
    ];

    if (this._paymentSchedule.length > 0) {
      this.selectedMode = PaymentScheduleMode.REGULAR;
    }

    const savedMode = this.contractsSvc.paymentScheduleModeSignal();
    if (savedMode !== null) {
      this.selectedMode = savedMode;
    } else if (this._paymentSchedule.length > 0) {
      this.selectedMode = PaymentScheduleMode.REGULAR;
    }
  }

  canResetMode(): boolean {
    return this._paymentSchedule.length === 0;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const criticalInputsChanged =
      changes['allCurrenciesRegistered'] ||
      changes['contractsPaymentRequests'] ||
      changes['componentProducts'] ||
      changes['allProjectTasks$'];

    if (criticalInputsChanged && this.isDataReady()) {
      this.initializeObservables();

      if (this._paymentSchedule.length > 0 && this.payments) {
        this.initializePaymentSchedule();
      }
    }
  }

  private initializeObservables(): void {
    this.allCurrencies$ = of(this.allCurrenciesRegistered || []);
    this.requestType$ = of(this.contractsPaymentRequests || []);
  }

  private isDataReady(): boolean {
    return !!(
      this.allCurrenciesRegistered &&
      this.contractsPaymentRequests &&
      this.componentProducts &&
      this.allProjectTasks$
    );
  }

  groupByCurrencyComponentProduct(
    data: ContractComponentResponse[]
  ): GroupedData {
    const result: GroupedData = {};
    data.forEach((item) => {
      const { currency, componentId, detail } = item;
      if (!result[currency]) {
        result[currency] = {};
      }
      if (!result[currency][componentId]) {
        result[currency][componentId] = {};
      }
      detail.forEach((product) => {
        const { productId, idbTotal, lcTotal, cfTotal } = product;
        if (!result[currency][componentId][productId]) {
          result[currency][componentId][productId] = {
            idbTotal: 0,
            lcTotal: 0,
            cfTotal: 0,
          };
        }
        result[currency][componentId][productId].idbTotal += idbTotal;
        result[currency][componentId][productId].lcTotal += lcTotal;
        result[currency][componentId][productId].cfTotal += cfTotal;
      });
    });
    return result;
  }

  groupPaymentsByCurrencyComponentProduct(
    payments: ContractPaymentScheduleResponse[]
  ): GroupedData {
    const result: GroupedData = {};
    payments.forEach((payment) => {
      const {
        currency,
        componentId,
        productId,
        idbAmount,
        lcAmount,
        cfAmount,
      } = payment;

      if (!currency || !componentId || !productId) {
        return;
      }

      if (!result[currency]) {
        result[currency] = {};
      }
      if (!result[currency][componentId]) {
        result[currency][componentId] = {};
      }
      if (!result[currency][componentId][productId]) {
        result[currency][componentId][productId] = {
          idbTotal: 0,
          lcTotal: 0,
          cfTotal: 0,
        };
      }
      result[currency][componentId][productId].idbTotal += idbAmount || 0;
      result[currency][componentId][productId].lcTotal += lcAmount || 0;
      result[currency][componentId][productId].cfTotal += cfAmount || 0;
    });

    return result;
  }

  confirmResetToOriginalSchedule(): void {
    const dialogRef = this.dialog.open(ContractDialogComponent, {
      data: {
        title: this.translate.instant(
          'R.CONTRACT.PAYMENT_SCHEDULE.UNDO_CONFIRMATION.TITLE'
        ),
        message: this.translate.instant(
          'R.CONTRACT.PAYMENT_SCHEDULE.UNDO_DIALOG'
        ),
        confirmText: this.translate.instant(
          'R.CONTRACT.PAYMENT_SCHEDULE.UNDO_CONFIRMATION.CONFIRM'
        ),
        cancelText: this.translate.instant(
          'R.CONTRACT.PAYMENT_SCHEDULE.RESET_CONFIRMATION.CANCEL'
        ),
      },
    });
    dialogRef
      .afterClosed()
      .pipe(
        filter((result) => result === true),
        takeUntil(this.destroy$)
      )
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.resetToOriginalSchedule();
        }
      });
  }

  resetToOriginalSchedule(): void {
    this.payments.clear();
    this.productsMap.clear();

    if (this._paymentSchedule.length > 0) {
      const sortedSchedule = this.sortByDate(this._paymentSchedule);

      sortedSchedule.forEach((payment, index) => {
        this.payments.push(this.createPaymentFormGroup(payment));

        if (payment.componentId) {
          const products = this.componentProducts?.get(payment.componentId);
          if (products) {
            this.productsMap.set(index, products);
          }
        }
      });
    } else {
      this.payments.push(this.createPaymentFormGroup());
    }

    this.updateDataSource();
    this.payments.updateValueAndValidity();
  }

  private initializePaymentSchedule(): void {
    this.payments.clear();
    this.productsMap.clear();

    if (this._paymentSchedule.length > 0) {
      const sortedSchedule = this.sortByDate(this._paymentSchedule);
      sortedSchedule.forEach((payment, index) => {
        this.payments.push(this.createPaymentFormGroup(payment));

        if (payment.componentId) {
          const products = this.componentProducts?.get(payment.componentId);
          if (products) {
            this.productsMap.set(index, products);
          }
        }
      });
    } else {
      this.payments.push(this.createPaymentFormGroup());
    }

    this.updateDataSource();
    this.payments.updateValueAndValidity();
  }

  private sortByDate(
    schedule: ContractPaymentScheduleResponse[]
  ): ContractPaymentScheduleResponse[] {
    return [...schedule].sort((a, b) => {
      if (!a.estimatedDate) return 1;
      if (!b.estimatedDate) return -1;
      return (
        new Date(a.estimatedDate).getTime() -
        new Date(b.estimatedDate).getTime()
      );
    });
  }

  private createPaymentFormGroup(
    data?: Partial<ContractPaymentScheduleResponse>
  ): FormType<ContractPaymentScheduleResponse> {
    const paymentNumber =
      data?.paymentNumber ??
      (this.payments?.length ? this.payments.length + 1 : 1);

    const formGroup = paymentForm();

    formGroup.patchValue(
      {
        paymentNumber: paymentNumber,
        description: data?.description ?? '',
        estimatedDate: data?.estimatedDate ?? '',
        componentId: data?.componentId ?? '',
        productId: data?.productId ?? '',
        paymentRequestTypeId: data?.paymentRequestTypeId ?? null,
        currency: data?.currency ?? '',
        idbAmount: data?.idbAmount ?? 0,
        lcAmount: data?.lcAmount ?? 0,
        cfAmount: data?.cfAmount ?? 0,
        paymentAmount: data?.paymentAmount ?? 0,
      },
      { emitEvent: true }
    );

    this.setupInitialCascadeState(formGroup, data);

    formGroup.get('estimatedDate')?.valueChanges.subscribe(() => {
      this.sortPaymentsByDate();
    });

    return formGroup;
  }

  private setupInitialCascadeState(
    formGroup: FormGroup,
    data?: Partial<ContractPaymentScheduleResponse>
  ): void {
    if (!data?.componentId) {
      this.disableFields(formGroup, CASCADE_FIELDS.PRODUCT);
    } else if (!data?.productId) {
      this.disableFields(formGroup, CASCADE_FIELDS.REQUEST_TYPE);
    } else if (!data?.paymentRequestTypeId) {
      this.disableFields(formGroup, CASCADE_FIELDS.CURRENCY);
    } else if (!data?.currency) {
      this.disableFields(formGroup, CASCADE_FIELDS.AMOUNTS);
    }
  }

  private disableFields(formGroup: FormGroup, fields: readonly string[]): void {
    fields.forEach((field) => formGroup.get(field)?.disable());
  }

  private enableFields(formGroup: FormGroup, fields: readonly string[]): void {
    fields.forEach((field) => formGroup.get(field)?.enable());
  }

  private resetFields(formGroup: FormGroup, fields: readonly string[]): void {
    fields.forEach((field) => {
      const defaultValue =
        field.includes('Amount') || field === 'paymentRequestTypeId' ? 0 : '';
      formGroup.get(field)?.reset(defaultValue);
    });
  }

  private resetAndDisableFromField(
    formGroup: FormGroup,
    fieldsToReset: readonly string[],
    fieldsToDisable: readonly string[]
  ): void {
    this.resetFields(formGroup, fieldsToReset);
    this.disableFields(formGroup, fieldsToDisable);
  }

  private updateDataSource(): void {
    this.dataSource = new MatTableDataSource(this.payments.controls);
  }

  private sortPaymentsByDate(): void {
    const table = document.querySelector('.payment-table');
    const rows = Array.from(
      table?.querySelectorAll('tr.payment-row') || []
    ) as HTMLElement[];
    const firstPositions = new Map<number, number>();

    rows.forEach((row, index) => {
      const rect = row.getBoundingClientRect();
      firstPositions.set(index, rect.top);
    });

    const paymentsData = this.payments.controls.map((control, index) => ({
      control,
      index,
      data: control.getRawValue(),
    }));

    paymentsData.sort((a, b) => {
      if (!a.data.estimatedDate) return 1;
      if (!b.data.estimatedDate) return -1;
      return (
        new Date(a.data.estimatedDate).getTime() -
        new Date(b.data.estimatedDate).getTime()
      );
    });

    this.payments.clear();
    const newProductsMap = new Map<number, ProjectTask[]>();

    paymentsData.forEach((item, newIndex) => {
      this.payments.push(item.control);
      item.control.patchValue(
        { paymentNumber: newIndex + 1 },
        { emitEvent: false }
      );

      const oldProducts = this.productsMap.get(item.index);
      if (oldProducts) {
        newProductsMap.set(newIndex, oldProducts);
      }
    });

    this.productsMap = newProductsMap;
    this.updateDataSource();

    setTimeout(() => {
      const updatedRows = Array.from(
        table?.querySelectorAll('tr.payment-row') || []
      ) as HTMLElement[];

      updatedRows.forEach((row, newIndex) => {
        const oldIndex = paymentsData[newIndex].index;
        const firstPosition = firstPositions.get(oldIndex);

        if (firstPosition !== undefined) {
          const lastPosition = row.getBoundingClientRect().top;
          const deltaY = firstPosition - lastPosition;

          if (Math.abs(deltaY) > 1) {
            row.style.transform = `translateY(${deltaY}px)`;
            row.style.transition = 'none';
            row.classList.add('moving');

            row.style.transition =
              'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.5s ease';
            row.style.transform = 'translateY(0)';

            setTimeout(() => {
              row.style.transition = '';
              row.classList.remove('moving');
            }, 500);
          }
        }
      });
    }, 0);
  }

  onComponentSelect(event: MatSelectChange, index: number): void {
    const componentId = event.value;
    const formGroup = this.payments.at(index);
    const products = this.componentProducts?.get(componentId);

    if (products) {
      this.productsMap.set(index, products);
    } else {
      this.productsMap.delete(index);
    }

    this.resetAndDisableFromField(
      formGroup,
      CASCADE_FIELDS.PRODUCT,
      CASCADE_FIELDS.REQUEST_TYPE
    );

    formGroup.get('productId')?.enable();
  }

  onProductSelect(index: number): void {
    const formGroup = this.payments.at(index);

    this.resetAndDisableFromField(
      formGroup,
      CASCADE_FIELDS.REQUEST_TYPE,
      CASCADE_FIELDS.CURRENCY
    );

    formGroup.get('paymentRequestTypeId')?.enable();
  }

  onRequestTypeSelect(index: number): void {
    const formGroup = this.payments.at(index);

    this.resetAndDisableFromField(
      formGroup,
      CASCADE_FIELDS.CURRENCY,
      CASCADE_FIELDS.AMOUNTS
    );

    formGroup.get('currency')?.enable();
  }

  onCurrencySelect(index: number): void {
    const formGroup = this.payments.at(index);
    this.enableFields(formGroup, CASCADE_FIELDS.AMOUNTS);
  }

  getProductsForRow(index: number): ProjectTask[] {
    return this.productsMap.get(index) || [];
  }

  onModeChange(mode: PaymentScheduleMode): void {
    this.selectedMode = mode;
    this.contractsSvc.setPaymentScheduleMode(mode);
  }

  addPayment(): void {
    const newControl = this.createPaymentFormGroup();
    this.payments.push(newControl);
    this.updateDataSource();
    this.payments.updateValueAndValidity();
  }

  removePayment(index: number): void {
    this.payments.removeAt(index);
    this.reorganizeProductsMapAfterRemoval(index);
    this.renumberPayments();
    this.updateDataSource();
    this.payments.updateValueAndValidity();
  }

  shouldShowModeSelector(): boolean {
    return this._paymentSchedule.length === 0 && this.selectedMode === null;
  }

  shouldShowResetButton(): boolean {
    return this._paymentSchedule.length > 0 && this.selectedMode !== null;
  }

  shouldShowBackToModeSelector(): boolean {
    return this._paymentSchedule.length === 0 && this.selectedMode !== null;
  }

  backToModeSelector(): void {
    this.selectedMode = null;
    this.payments.clear();
    this.productsMap.clear();
    this.contractsSvc.setPaymentScheduleMode(null);
  }

  private reorganizeProductsMapAfterRemoval(removedIndex: number): void {
    const newProductsMap = new Map<number, ProjectTask[]>();

    this.productsMap.forEach((products, oldIndex) => {
      if (oldIndex < removedIndex) {
        newProductsMap.set(oldIndex, products);
      } else if (oldIndex > removedIndex) {
        newProductsMap.set(oldIndex - 1, products);
      }
    });

    this.productsMap = newProductsMap;
  }

  private renumberPayments(): void {
    this.payments.controls.forEach((control, index) => {
      control.patchValue({ paymentNumber: index + 1 }, { emitEvent: false });
    });
  }

  skipPaymentSchedule(): void {
    this.selectedMode = null;
    this.payments.clear();
    this.productsMap.clear();
    this.contractsSvc.setPaymentScheduleMode(null);
    this.omitStep.emit(true);
  }

  onFileSelected(files: File[]): void {
    if (!files?.length) return;

    const file = files[0];
    this.isUploadingFile = true;
    this.contractsSvc.setLoading(true);
    this.contractApiSvc
      .uploadFilledTemplate(this.contractId, file)
      .pipe(
        finalize(() => {
          this.isUploadingFile = false;
          this.contractsSvc.setLoading(false);
        })
      )
      .subscribe({
        next: (response: ContractPaymentScheduleResponse[]) => {
          this.notificationSvc.showSuccess(
            this.translate.instant('R.CONTRACT.NOTIFICATIONS.FILE_PROCESSED')
          );

          this._paymentSchedule = response;
          this.contractsSvc.updatePaymentSchedule(response);
          this.contractsSvc.setPaymentScheduleFileUploaded(true);

          this.selectedMode = PaymentScheduleMode.REGULAR;
          this.contractsSvc.setPaymentScheduleMode(this.selectedMode);
          this.contractsSvc.updatePaymentSchedule(response);
        },
        error: (error) => {
          console.error('Error uploading file:', error);
          this.notificationSvc.showError(
            this.translate.instant('R.CONTRACT.NOTIFICATIONS.FILE_ERROR')
          );
        },
      });
  }

  downloadTemplate(): void {
    this.isDownloading = true;
    this.contractsSvc.setLoading(true);

    this.contractApiSvc
      .getPaymentScheduleTemplate(this.contractId)
      .pipe(
        finalize(() => {
          this.isDownloading = false;
          this.contractsSvc.setLoading(false);
        })
      )
      .subscribe({
        next: (response: HttpResponse<ArrayBuffer>) => {
          const blob = new Blob([response.body], {
            type:
              response.headers.get('Content-Type') ||
              'application/octet-stream',
          });
          this.fileSaverService.save(blob, 'PaymentScheduleTemplate');
          this.notificationSvc.showSuccess(
            this.translate.instant(
              'R.CONTRACT.NOTIFICATIONS.TEMPLATE_DOWNLOADED'
            )
          );
        },
        error: (error) => {
          console.error('Error downloading template:', error);
          this.notificationSvc.showError(
            this.translate.instant('R.CONTRACT.NOTIFICATIONS.TEMPLATE_ERROR')
          );
        },
      });
  }

  private removeCalculatedFields(
    data: ContractPaymentScheduleResponse[]
  ): ContractPaymentScheduleRequest[] {
    return data.map((item) => ({
      paymentRequestTypeId: item.paymentRequestTypeId,
      componentId: item.componentId,
      productId: item.productId,
      description: item.description,
      estimatedDate: item.estimatedDate,
      currency: item.currency,
      idbAmount: item.idbAmount,
      lcAmount: item.lcAmount,
      cfAmount: item.cfAmount,
    }));
  }

  private validatePaymentTotals(
    available: GroupedData,
    used: GroupedData
  ): { isValid: boolean; errors: ValidationError[] } {
    const errors: ValidationError[] = [];

    Object.keys(used).forEach((currency) => {
      Object.keys(used[currency]).forEach((componentId) => {
        Object.keys(used[currency][componentId]).forEach((productId) => {
          const usedAmounts = used[currency][componentId][productId];
          const availableAmounts =
            available[currency]?.[componentId]?.[productId];

          if (!availableAmounts) {
            errors.push({
              type: ErrorType.MISSING_IN_API,
              currency,
              componentId,
              productId,
            });
            return;
          }

          // Take only 2 digit after 0
          const round2 = (n: number) => Math.round(n * 100) / 100;
          const idbDiff =
            round2(usedAmounts.idbTotal) - round2(availableAmounts.idbTotal);
          const lcDiff =
            round2(usedAmounts.lcTotal) - round2(availableAmounts.lcTotal);
          const cfDiff =
            round2(usedAmounts.cfTotal) - round2(availableAmounts.cfTotal);

          if (idbDiff !== 0 || lcDiff !== 0 || cfDiff !== 0) {
            errors.push({
              type: ErrorType.MISMATCH,
              currency,
              componentId,
              productId,
              details: {
                available: {
                  idb: availableAmounts.idbTotal,
                  lc: availableAmounts.lcTotal,
                  cf: availableAmounts.cfTotal,
                },
                used: {
                  idb: usedAmounts.idbTotal,
                  lc: usedAmounts.lcTotal,
                  cf: usedAmounts.cfTotal,
                },
                difference: {
                  idb: idbDiff,
                  lc: lcDiff,
                  cf: cfDiff,
                },
              },
            });
          }
        });
      });
    });

    Object.keys(available).forEach((currency) => {
      Object.keys(available[currency]).forEach((componentId) => {
        Object.keys(available[currency][componentId]).forEach((productId) => {
          const availableAmounts = available[currency][componentId][productId];
          const usedAmounts = used[currency]?.[componentId]?.[productId];

          if (!usedAmounts) {
            const hasAmounts =
              availableAmounts.idbTotal > 0 ||
              availableAmounts.lcTotal > 0 ||
              availableAmounts.cfTotal > 0;

            if (hasAmounts) {
              errors.push({
                type: ErrorType.MISSING_IN_FORM,
                currency,
                componentId,
                productId,
                details: {
                  available: {
                    idb: availableAmounts.idbTotal,
                    lc: availableAmounts.lcTotal,
                    cf: availableAmounts.cfTotal,
                  },
                  used: { idb: 0, lc: 0, cf: 0 },
                  difference: {
                    idb: availableAmounts.idbTotal,
                    lc: availableAmounts.lcTotal,
                    cf: availableAmounts.cfTotal,
                  },
                },
              });
            }
          }
        });
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  getValidationMessages(): TranslatableError[] {
    const validation = this.paymentValidationSignal();
    const messages: TranslatableError[] = [];

    // Agrupar errores de validación de montos por combinación única (currency + component + product)
    const groupedErrors = new Map<string, ValidationError>();

    validation.errors.forEach((error) => {
      const key = `${error.currency}-${error.componentId}-${error.productId}`;

      // Solo guardar el primer error de cada combinación única
      // Puedes ajustar la prioridad según tus necesidades:
      // MISSING_IN_API > MISSING_IN_FORM > MISMATCH
      if (!groupedErrors.has(key)) {
        groupedErrors.set(key, error);
      } else {
        const existing = groupedErrors.get(key)!;
        const priority = {
          [ErrorType.MISSING_IN_API]: 3,
          [ErrorType.MISSING_IN_FORM]: 2,
          [ErrorType.MISMATCH]: 1,
          [ErrorType.EXCEEDED]: 0,
          [ErrorType.INSUFFICIENT]: 0,
        };

        if (priority[error.type] > priority[existing.type]) {
          groupedErrors.set(key, error);
        }
      }
    });

    // Procesar errores de validación agrupados
    groupedErrors.forEach((error) => {
      const componentName = this.getComponentName(error.componentId);
      const productName = this.getProductName(
        error.productId,
        error.componentId
      );

      const baseParams = {
        currency: error.currency,
        componentName,
        productName,
      };

      if (error.type === ErrorType.MISSING_IN_API) {
        messages.push({
          translationKey:
            'R.CONTRACT.VALIDATION.PAYMENT_SCHEDULE.MISSING_IN_API',
          params: baseParams,
        });
        return;
      }

      if (error.type === ErrorType.MISSING_IN_FORM && error.details) {
        const subErrors = [];
        if (error.details.available.idb > 0) {
          subErrors.push({
            translationKey:
              'R.CONTRACT.VALIDATION.PAYMENT_SCHEDULE.DETAIL_IDB_MISSING',
            params: {
              amount: this.formatNumber(error.details.available.idb),
            },
          });
        }
        if (error.details.available.lc > 0) {
          subErrors.push({
            translationKey:
              'R.CONTRACT.VALIDATION.PAYMENT_SCHEDULE.DETAIL_LC_MISSING',
            params: {
              amount: this.formatNumber(error.details.available.lc),
            },
          });
        }
        if (error.details.available.cf > 0) {
          subErrors.push({
            translationKey:
              'R.CONTRACT.VALIDATION.PAYMENT_SCHEDULE.DETAIL_CF_MISSING',
            params: {
              amount: this.formatNumber(error.details.available.cf),
            },
          });
        }

        messages.push({
          translationKey:
            'R.CONTRACT.VALIDATION.PAYMENT_SCHEDULE.MISSING_IN_FORM',
          params: baseParams,
          subErrors,
        });
        return;
      }

      if (error.type === ErrorType.MISMATCH && error.details) {
        const subErrors = [];

        // IDB
        if (error.details.difference.idb > 0) {
          subErrors.push({
            translationKey:
              'R.CONTRACT.VALIDATION.PAYMENT_SCHEDULE.DETAIL_IDB_EXCEEDED',
            params: {
              available: this.formatNumber(error.details.available.idb),
              used: this.formatNumber(error.details.used.idb),
              difference: this.formatNumber(error.details.difference.idb),
            },
          });
        } else if (error.details.difference.idb < 0) {
          subErrors.push({
            translationKey:
              'R.CONTRACT.VALIDATION.PAYMENT_SCHEDULE.DETAIL_IDB_INSUFFICIENT',
            params: {
              available: this.formatNumber(error.details.available.idb),
              used: this.formatNumber(error.details.used.idb),
              difference: this.formatNumber(
                Math.abs(error.details.difference.idb)
              ),
            },
          });
        }

        // LC
        if (error.details.difference.lc > 0) {
          subErrors.push({
            translationKey:
              'R.CONTRACT.VALIDATION.PAYMENT_SCHEDULE.DETAIL_LC_EXCEEDED',
            params: {
              available: this.formatNumber(error.details.available.lc),
              used: this.formatNumber(error.details.used.lc),
              difference: this.formatNumber(error.details.difference.lc),
            },
          });
        } else if (error.details.difference.lc < 0) {
          subErrors.push({
            translationKey:
              'R.CONTRACT.VALIDATION.PAYMENT_SCHEDULE.DETAIL_LC_INSUFFICIENT',
            params: {
              available: this.formatNumber(error.details.available.lc),
              used: this.formatNumber(error.details.used.lc),
              difference: this.formatNumber(
                Math.abs(error.details.difference.lc)
              ),
            },
          });
        }

        // CF
        if (error.details.difference.cf > 0) {
          subErrors.push({
            translationKey:
              'R.CONTRACT.VALIDATION.PAYMENT_SCHEDULE.DETAIL_CF_EXCEEDED',
            params: {
              available: this.formatNumber(error.details.available.cf),
              used: this.formatNumber(error.details.used.cf),
              difference: this.formatNumber(error.details.difference.cf),
            },
          });
        } else if (error.details.difference.cf < 0) {
          subErrors.push({
            translationKey:
              'R.CONTRACT.VALIDATION.PAYMENT_SCHEDULE.DETAIL_CF_INSUFFICIENT',
            params: {
              available: this.formatNumber(error.details.available.cf),
              used: this.formatNumber(error.details.used.cf),
              difference: this.formatNumber(
                Math.abs(error.details.difference.cf)
              ),
            },
          });
        }

        messages.push({
          translationKey: 'R.CONTRACT.VALIDATION.PAYMENT_SCHEDULE.MISMATCH',
          params: baseParams,
          subErrors,
        });
        return;
      }
    });

    // Procesar errores de filas incompletas con jerarquía
    validation.incompleteRows.forEach((row) => {
      // Jerarquía de errores (del más crítico al menos crítico):
      // 1. Todos los montos en cero
      // 2. Campos obligatorios faltantes

      if (row.missingFields.includes('allAmountsZero')) {
        messages.push({
          translationKey:
            'R.CONTRACT.VALIDATION.PAYMENT_SCHEDULE.ALL_AMOUNTS_ZERO',
          params: {
            rowNumber: row.index + 1,
          },
        });
        return; // Solo mostrar este error, ignorar otros campos faltantes
      }

      // Si no es error de montos cero, mostrar campos faltantes
      const normalMissingFields = row.missingFields.filter(
        (field) => field !== 'allAmountsZero'
      );

      if (normalMissingFields.length > 0) {
        const fieldNames = normalMissingFields
          .map((field) =>
            this.translate.instant(
              `R.CONTRACT.PAYMENT_SCHEDULE.FIELDS.${field.toUpperCase()}`
            )
          )
          .join(', ');

        messages.push({
          translationKey:
            'R.CONTRACT.VALIDATION.PAYMENT_SCHEDULE.INCOMPLETE_ROW',
          params: {
            rowNumber: row.index + 1,
            fields: fieldNames,
          },
        });
      }
    });

    return messages;
  }

  private formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  canSave(): boolean {
    return (
      this.paymentValidationSignal().isValid &&
      this.payments.length > 0 &&
      (this.hasModifications() || this.isModifiedSignal())
    );
  }

  hasModifications(): boolean {
    const savedData = this.normalizeFormValue(this._paymentSchedule);
    const actualData = this.normalizeFormValue(
      this.paymentsSignal()
        .map(({ paymentAmount, paymentNumber, ...rest }) => {
          return rest;
        })
        .filter((p) => p.currency !== '')
    );
    return JSON.stringify(savedData) !== JSON.stringify(actualData);
  }

  private normalizeFormValue(obj: any): any {
    if (obj === null || obj === undefined) {
      return null;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.normalizeFormValue(item));
    }

    if (typeof obj === 'object' && obj.constructor === Object) {
      const sortedObj: any = {};
      Object.keys(obj)
        .sort()
        .forEach((key) => {
          sortedObj[key] = this.normalizeFormValue(obj[key]);
        });
      return sortedObj;
    }

    return obj;
  }

  savePaymentSchedule(): void {
    const scheduleData: ContractPaymentScheduleResponse[] =
      this.payments.controls.map((control) => control.getRawValue());

    this.contractsSvc.setLoading(true);

    this.contractApiSvc
      .postPaymentSchedule(
        this.contractId,
        this.removeCalculatedFields(scheduleData)
      )
      .pipe(
        switchMap(() =>
          this.contractApiSvc.getPaymentSchedule(this.contractId)
        ),
        finalize(() => this.contractsSvc.setLoading(false))
      )
      .subscribe({
        next: (response: ContractPaymentScheduleResponse[]) => {
          this.notificationSvc.showSuccess(
            this.translate.instant('R.CONTRACT.NOTIFICATIONS.SCHEDULE_SAVED')
          );

          this._paymentSchedule = response;
          this.contractsSvc.updatePaymentSchedule(response);
          this.contractsSvc.setPaymentScheduleFileUploaded(false);
        },
        error: (error) => {
          console.error('Error saving payment schedule:', error);
          this.notificationSvc.showError(
            this.translate.instant('R.CONTRACT.NOTIFICATIONS.SCHEDULE_ERROR')
          );
        },
      });
  }

  isPaymentScheduleValid(): boolean {
    return this.payments.valid && this.canSave();
  }

  getComponentName(componentId: string): string {
    if (!componentId) return '';

    let componentName = '';
    this.allProjectTasks$
      .subscribe((components) => {
        const component = components.find((c) => c.id === componentId);
        componentName = component?.name || componentId;
      })
      .unsubscribe();

    return componentName;
  }

  getProductName(productId: string, componentId: string): string {
    if (!productId || !componentId) return '';

    const products = this.componentProducts?.get(componentId);
    const product = products?.find((p) => p.id === productId);

    return product?.name || productId;
  }

  hasIncompleteFields(index: number): boolean {
    const validation = this.paymentValidationSignal();
    return validation.incompleteRows.some((row) => row.index === index);
  }

  getIncompleteFieldsForRow(index: number): string[] {
    const validation = this.paymentValidationSignal();
    const row = validation.incompleteRows.find((r) => r.index === index);
    return row?.missingFields || [];
  }

  confirmResetPaymentSchedule(): void {
    const dialogRef = this.dialog.open(ContractDialogComponent, {
      data: {
        title: this.translate.instant(
          'R.CONTRACT.PAYMENT_SCHEDULE.RESET_CONFIRMATION.TITLE'
        ),
        message: this.translate.instant(
          'R.CONTRACT.PAYMENT_SCHEDULE.RESET_CONFIRMATION.MESSAGE'
        ),
        confirmText: this.translate.instant(
          'R.CONTRACT.PAYMENT_SCHEDULE.RESET_CONFIRMATION.CONFIRM'
        ),
        cancelText: this.translate.instant(
          'R.CONTRACT.PAYMENT_SCHEDULE.RESET_CONFIRMATION.CANCEL'
        ),
      },
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((result) => result === true),
        takeUntil(this.destroy$)
      )
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.resetPaymentSchedule();
        }
      });
  }

  private resetPaymentSchedule(): void {
    this.isResettingSchedule = true;

    this.contractApiSvc
      .deletePaymentSchedule(this.contractId)
      .pipe(finalize(() => (this.isResettingSchedule = false)))
      .subscribe({
        next: (_: ContractPaymentScheduleResponse[]) => {
          this.notificationSvc.showSuccess(
            this.translate.instant('R.CONTRACT.NOTIFICATIONS.SCHEDULE_RESET')
          );

          this._paymentSchedule = [];
          this.payments.clear();
          this.productsMap.clear();
          this.selectedMode = null;
          this.contractsSvc.setPaymentScheduleFileUploaded(false);

          this.contractsSvc.updatePaymentSchedule([]);
          this.contractsSvc.setPaymentScheduleMode(null);
        },
        error: (error) => {
          console.error('Error resetting payment schedule:', error);
          this.notificationSvc.showError(
            this.translate.instant(
              'R.CONTRACT.NOTIFICATIONS.SCHEDULE_RESET_ERROR'
            )
          );
        },
      });
  }

  getDecimals(currency: string): number {
    const found = this.allCurrenciesSignal().find(
      (c) => c.currency === currency
    );
    return found?.numberOfDecimals ?? 2;
  }
}
