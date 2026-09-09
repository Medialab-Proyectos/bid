import { Component, OnInit } from '@angular/core';
import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';
import { FileRestrictions, SelectEvent } from '@progress/kendo-angular-upload';
import { TranslateService } from '@ngx-translate/core';
import {
  AccumulatedComponentAmount,
  AddPaymentsSource,
  CurrencyCeiling,
  ImportValidationResult,
  ManualPaymentRequest,
  PaymentRecordError,
  PlannedPayment,
  ProjectComponent,
} from '../../models/payment-record.model';
import { PaymentRecordApiService } from '../../services/payment-record-api.service';

interface SelectablePlannedPayment extends PlannedPayment {
  selected: boolean;
}

/** One of the four ways payments get into the report. */
interface SourceOption {
  value: AddPaymentsSource;
  inputId: string;
  icon: string;
  titleKey: string;
  descriptionKey: string;
}

const ACCEPTED_EXTENSIONS = ['.xlsx', '.xls', '.csv'];
const MAX_FILE_SIZE_MB = 10;

/** "Añadir pagos": pulls rows of the payment schedule into the report. */
@Component({
  selector: 'fi-add-payments-dialog',
  templateUrl: './add-payments-dialog.component.html',
  styleUrls: ['../../payment-record.shared.scss'],
})
export class AddPaymentsDialogComponent
  extends DialogContentBase
  implements OnInit
{
  commitmentId: string;

  readonly sources = AddPaymentsSource;

  /**
   * Each option says what it does and when to use it. A bare radio label made
   * the four routes look interchangeable, and choosing wrong is expensive: the
   * accumulated report, for one, can never enter a statement afterwards.
   */
  readonly sourceOptions: SourceOption[] = [
    {
      value: AddPaymentsSource.SCHEDULE,
      inputId: 'Rad_AddPayments_Schedule',
      icon: 'fa-calendar-alt',
      titleKey: 'PAYMENT_RECORD.ADD_PAYMENTS.SOURCE_SCHEDULE',
      descriptionKey: 'PAYMENT_RECORD.ADD_PAYMENTS.SOURCE_SCHEDULE_HELP',
    },
    {
      value: AddPaymentsSource.MANUAL,
      inputId: 'Rad_AddPayments_Manual',
      icon: 'fa-pen',
      titleKey: 'PAYMENT_RECORD.ADD_PAYMENTS.SOURCE_MANUAL',
      descriptionKey: 'PAYMENT_RECORD.ADD_PAYMENTS.SOURCE_MANUAL_HELP',
    },
    {
      value: AddPaymentsSource.FILE,
      inputId: 'Rad_AddPayments_File',
      icon: 'fa-file-upload',
      titleKey: 'PAYMENT_RECORD.ADD_PAYMENTS.SOURCE_FILE',
      descriptionKey: 'PAYMENT_RECORD.ADD_PAYMENTS.SOURCE_FILE_HELP',
    },
    {
      value: AddPaymentsSource.ACCUMULATED,
      inputId: 'Rad_AddPayments_Accumulated',
      icon: 'fa-layer-group',
      titleKey: 'PAYMENT_RECORD.ADD_PAYMENTS.SOURCE_ACCUMULATED',
      descriptionKey: 'PAYMENT_RECORD.ADD_PAYMENTS.SOURCE_ACCUMULATED_HELP',
    },
  ];

  /** Currency the contract is signed in; every amount converts into it. */
  contractCurrency = '';
  readonly today = new Date();
  readonly acceptedFormats = ACCEPTED_EXTENSIONS.join(', ');
  readonly maxFileSizeMb = MAX_FILE_SIZE_MB;
  readonly fileRestrictions: FileRestrictions = {
    allowedExtensions: ACCEPTED_EXTENSIONS,
    maxFileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
  };
  /**
   * The spreadsheet is what agencies actually use, so it is the default; the
   * payment schedule and the one-by-one entry stay available behind it.
   */
  source: AddPaymentsSource = AddPaymentsSource.FILE;

  payments: SelectablePlannedPayment[] = [];
  loading = true;
  saving = false;

  components: ProjectComponent[] = [];
  /** Currencies of the contract and how much room is left in each. */
  ceilings: CurrencyCeiling[] = [];
  /** Business rule the API rejected the last attempt with. */
  failure: PaymentRecordError;

  // ---- manual entry
  manual: ManualPaymentRequest = {
    componentCode: '',
    componentName: '',
    productCode: '',
    productName: '',
    concept: '',
    accountingVoucher: '',
    paymentDate: '',
    currency: '',
    amount: null,
    exchangeRate: 1,
    reimbursable: false,
    idbFinancingAmount: null,
    localFinancingAmount: null,
    cofinancingAmount: null,
  };
  manualDate: Date;

  // ---- accumulated report
  accumulatedDate: Date;
  accumulatedCurrency = '';
  accumulatedLines: AccumulatedComponentAmount[] = [];

  // ---- file import
  showTemplateHint = true;
  uploading = false;
  importResult: ImportValidationResult;
  /** Set once the file passed validation and the user may move on. */
  importedRows: ImportValidationResult;

  constructor(
    dialog: DialogRef,
    private readonly api: PaymentRecordApiService,
    private readonly translate: TranslateService
  ) {
    super(dialog);
  }

  ngOnInit(): void {
    this.accumulatedLines = this.components.map((component) => ({
      componentCode: component.code,
      componentName: component.name,
      amount: null,
    }));

    this.api.getCurrencyCeilings(this.commitmentId).subscribe({
      next: (ceilings) => {
        this.ceilings = ceilings;
        // A payment may only be reported in a currency of the contract.
        const first = ceilings[0]?.currency ?? 'USD';
        this.manual.currency = first;
        this.accumulatedCurrency = first;
        this.contractCurrency = this.contractCurrency || first;
        this.onManualCurrencyChange();
      },
      error: () => {
        this.ceilings = [];
      },
    });

    this.api.getPlannedPayments(this.commitmentId).subscribe({
      next: (payments) => {
        this.payments = payments.map((payment) => ({
          ...payment,
          selected: false,
        }));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  get allSelected(): boolean {
    return this.payments.length > 0 && this.payments.every((p) => p.selected);
  }

  get selectedCount(): number {
    return this.payments.filter((payment) => payment.selected).length;
  }

  toggleAll(): void {
    const select = !this.allSelected;
    this.payments.forEach((payment) => (payment.selected = select));
  }

  remove(index: number): void {
    this.payments = this.payments.filter(
      (_payment, position) => position !== index
    );
  }

  get currencies(): string[] {
    return this.ceilings.map((ceiling) => ceiling.currency);
  }

  availableIn(currency: string): number {
    return (
      this.ceilings.find((ceiling) => ceiling.currency === currency)
        ?.available ?? 0
    );
  }

  get manualProducts(): Array<{ code: string; name: string }> {
    return (
      this.components.find(
        (component) => component.code === this.manual.componentCode
      )?.products ?? []
    );
  }

  onManualComponentChange(): void {
    const component = this.components.find(
      (item) => item.code === this.manual.componentCode
    );
    this.manual.componentName = component ? component.name : '';
    this.manual.productCode = '';
    this.manual.productName = '';
  }

  onManualProductChange(): void {
    const product = this.manualProducts.find(
      (item) => item.code === this.manual.productCode
    );
    this.manual.productName = product ? product.name : '';
  }

  get manualIsComplete(): boolean {
    return Boolean(
      this.manual.componentCode &&
        this.manual.concept &&
        this.manualDate &&
        this.manual.currency &&
        this.manual.amount > 0
    );
  }

  get accumulatedTotal(): number {
    return this.accumulatedLines.reduce(
      (total, line) => total + (line.amount || 0),
      0
    );
  }

  get accumulatedIsComplete(): boolean {
    return Boolean(this.accumulatedDate) && this.accumulatedTotal > 0;
  }

  get hasImportErrors(): boolean {
    return (this.importResult?.errors?.length ?? 0) > 0;
  }

  get importAccepted(): boolean {
    return Boolean(this.importResult) && !this.hasImportErrors;
  }

  /** Every row blocked on something, once each -- one row can fail more than
   *  one check, and the chips are meant to be scanned, not counted twice. */
  get blockingRowNumbers(): number[] {
    const rows = new Set<number>();
    for (const error of this.importResult?.errors ?? []) {
      for (const row of error.rows) {
        rows.add(row.rowNumber);
      }
    }
    return [...rows].sort((a, b) => a - b);
  }

  /**
   * A CSV built from what the dialog already has -- no endpoint of its own --
   * so the agency can hand the row/problem list to whoever fixes the file
   * without re-reading every card on screen.
   */
  downloadErrorReport(): void {
    const rowHeader = this.translate.instant('PAYMENT_RECORD.IMPORT.COLUMNS.ROW');
    const issueHeader = this.translate.instant('PAYMENT_RECORD.IMPORT.RULES_TITLE');
    const lines = [`${rowHeader};${issueHeader}`];

    for (const error of this.importResult?.errors ?? []) {
      const message = this.translate.instant(error.message);
      for (const row of error.rows) {
        lines.push(`${row.rowNumber};${message}`);
      }
    }
    for (const row of this.importResult?.duplicateRows ?? []) {
      const duplicateLabel = this.translate.instant(
        'PAYMENT_RECORD.IMPORT.DUPLICATE_ROWS'
      );
      lines.push(`${row};${duplicateLabel}`);
    }

    const blob = new Blob([lines.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.importResult?.fileName ?? 'import'}-errores.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * The scheduled payments of the commitment as a spreadsheet.
   *
   * The rows are already on screen, so the file is built here rather than
   * asking the back end for it again. Separator and byte order mark are the
   * ones Excel expects for a Spanish locale, same as the statement export.
   */
  downloadPlanned(): void {
    const t = (key: string) => this.translate.instant(key);
    const header = [
      t('PAYMENT_RECORD.ADD_PAYMENTS.COLUMNS.NUMBER'),
      t('PAYMENT_RECORD.ADD_PAYMENTS.COLUMNS.CONCEPT'),
      t('PAYMENT_RECORD.COLUMNS.COMPONENT'),
      t('PAYMENT_RECORD.COLUMNS.PRODUCT'),
      t('PAYMENT_RECORD.ADD_PAYMENTS.COLUMNS.DATE'),
      t('PAYMENT_RECORD.ADD_PAYMENTS.COLUMNS.CURRENCY'),
      t('PAYMENT_RECORD.ADD_PAYMENTS.COLUMNS.IDB_AMOUNT'),
      t('PAYMENT_RECORD.ADD_PAYMENTS.COLUMNS.LOCAL_AMOUNT'),
      t('PAYMENT_RECORD.ADD_PAYMENTS.COLUMNS.COFINANCING_AMOUNT'),
      t('PAYMENT_RECORD.ADD_PAYMENTS.COLUMNS.PAYMENT_AMOUNT'),
    ];

    const rows = this.payments.map((payment) => [
      String(payment.number),
      payment.concept,
      payment.componentName,
      payment.productName,
      payment.estimatedDate,
      payment.currency,
      String(payment.idbAmount),
      String(payment.localContributionAmount),
      String(payment.cofinancingAmount),
      String(payment.paymentAmount),
    ]);

    const separators = /[";\r\n]/;
    const escape = (cell: string) =>
      cell && separators.test(cell)
        ? '"' + cell.replace(/"/g, '""') + '"'
        : cell;
    const lines = [header, ...rows]
      .map((row) => row.map(escape).join(';'))
      .join(String.fromCharCode(13, 10));

    const blob = new Blob([String.fromCharCode(0xfeff) + lines], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pagos-planificados-${this.commitmentId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  downloadTemplate(): void {
    this.api.downloadImportTemplate(this.commitmentId).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payment-import-template-${this.commitmentId}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    });
  }

  onFileSelected(event: SelectEvent): void {
    const file = event.files[0]?.rawFile;
    if (!file) {
      return;
    }

    this.uploading = true;
    this.importResult = null;
    this.api.importPayments(this.commitmentId, file).subscribe({
      next: (result) => {
        this.importResult = result;
        this.uploading = false;
      },
      error: () => {
        this.uploading = false;
      },
    });
  }

  /** Clears the failed attempt so the corrected file can be dropped again. */
  retryUpload(): void {
    this.importResult = null;
  }

  get activeOption(): SourceOption {
    return (
      this.sourceOptions.find((option) => option.value === this.source) ??
      this.sourceOptions[0]
    );
  }

  get componentPlaceholder(): { code: string; name: string } {
    return {
      code: '',
      name: this.translate.instant('PAYMENT_RECORD.MANUAL.COMPONENT_PLACEHOLDER'),
    };
  }

  get productPlaceholder(): { code: string; name: string } {
    return {
      code: '',
      name: this.translate.instant('PAYMENT_RECORD.MANUAL.PRODUCT_PLACEHOLDER'),
    };
  }

  /**
   * The payment converted into the currency of the contract. The rate is
   * units of the payment's own currency per one dollar (e.g. 4000 COP = 1
   * USD) -- the same convention "Ajustar tasa de cambio" uses, where the
   * equivalent column is `1 / rate` -- so this divides by it, never
   * multiplies.
   */
  get manualEquivalent(): number {
    const rate = this.manual.exchangeRate || 0;
    return rate > 0 ? (this.manual.amount || 0) / rate : 0;
  }

  /**
   * No conversion to ask for when the payment is already in the contract's
   * own currency -- the rate can only ever be 1, so the field locks instead
   * of leaving a number there that looks editable but never actually does
   * anything.
   */
  get manualRateLocked(): boolean {
    return Boolean(this.contractCurrency) && this.manual.currency === this.contractCurrency;
  }

  onManualCurrencyChange(): void {
    if (this.manualRateLocked) {
      this.manual.exchangeRate = 1;
    }
  }

  get manualExceedsCeiling(): boolean {
    return (this.manual.amount || 0) > this.availableIn(this.manual.currency);
  }

  /**
   * How BID, contrapartida and cofinanciamiento add up so far -- shown next
   * to the payment amount, not enforced against it: a split that does not
   * match yet while the agency is still typing is normal, not an error.
   */
  get manualFundingTotal(): number {
    return (
      (this.manual.idbFinancingAmount || 0) +
      (this.manual.localFinancingAmount || 0) +
      (this.manual.cofinancingAmount || 0)
    );
  }

  get accumulatedExceedsCeiling(): boolean {
    return this.accumulatedTotal > this.availableIn(this.accumulatedCurrency);
  }

  /**
   * Fields still empty on the manual form, named the way the labels name them,
   * so the footer can say what is missing instead of only greying the button.
   */
  get missingFieldNames(): string {
    const missing: string[] = [];
    if (!this.manual.componentCode) {
      missing.push('PAYMENT_RECORD.COLUMNS.COMPONENT');
    }
    if (!this.manual.concept) {
      missing.push('PAYMENT_RECORD.DETAIL.COLUMNS.CONCEPT');
    }
    if (!this.manualDate) {
      missing.push('PAYMENT_RECORD.DETAIL.COLUMNS.DATE');
    }
    if (!(this.manual.amount > 0)) {
      missing.push('PAYMENT_RECORD.DETAIL.COLUMNS.AMOUNT');
    }
    return missing
      .map((key) => this.translate.instant(key).toLocaleLowerCase())
      .join(', ');
  }

  /**
   * Why the confirm button is closed, as a translation key. Empty means the
   * form is ready, and the footer says so rather than staying silent.
   */
  get blockingReason(): string {
    if (this.saving) {
      return 'PAYMENT_RECORD.ADD_PAYMENTS.BLOCKED_SAVING';
    }

    switch (this.source) {
      case AddPaymentsSource.SCHEDULE:
        return this.selectedCount === 0
          ? 'PAYMENT_RECORD.ADD_PAYMENTS.BLOCKED_SCHEDULE'
          : '';
      case AddPaymentsSource.FILE:
        if (this.hasImportErrors) {
          return 'PAYMENT_RECORD.ADD_PAYMENTS.BLOCKED_FILE_ERRORS';
        }
        return this.importAccepted
          ? ''
          : 'PAYMENT_RECORD.ADD_PAYMENTS.BLOCKED_FILE';
      case AddPaymentsSource.MANUAL:
        if (this.manualExceedsCeiling) {
          return 'PAYMENT_RECORD.ADD_PAYMENTS.BLOCKED_CEILING';
        }
        return this.manualIsComplete
          ? ''
          : 'PAYMENT_RECORD.ADD_PAYMENTS.BLOCKED_MANUAL';
      default:
        if (this.accumulatedExceedsCeiling) {
          return 'PAYMENT_RECORD.ADD_PAYMENTS.BLOCKED_CEILING';
        }
        return this.accumulatedIsComplete
          ? ''
          : 'PAYMENT_RECORD.ADD_PAYMENTS.BLOCKED_ACCUMULATED';
    }
  }

  /** What the footer says once nothing is blocking. */
  get readyMessage(): string {
    switch (this.source) {
      case AddPaymentsSource.SCHEDULE:
        return 'PAYMENT_RECORD.ADD_PAYMENTS.READY_SCHEDULE';
      case AddPaymentsSource.FILE:
        return 'PAYMENT_RECORD.ADD_PAYMENTS.READY_FILE';
      case AddPaymentsSource.MANUAL:
        return 'PAYMENT_RECORD.ADD_PAYMENTS.READY_MANUAL';
      default:
        return 'PAYMENT_RECORD.ADD_PAYMENTS.READY_ACCUMULATED';
    }
  }

  cancel(): void {
    this.dialog.close();
  }

  confirm(): void {
    this.failure = null;

    if (this.source === AddPaymentsSource.FILE) {
      // The imported rows are reviewed in a screen of their own.
      this.dialog.close({ imported: this.importResult });
      return;
    }

    if (this.source === AddPaymentsSource.MANUAL) {
      this.submitManual();
      return;
    }

    if (this.source === AddPaymentsSource.ACCUMULATED) {
      this.submitAccumulated();
      return;
    }

    const selected = this.payments.filter((payment) => payment.selected);
    if (selected.length === 0) {
      return;
    }

    this.saving = true;
    this.api.addPayments(this.commitmentId, selected).subscribe({
      next: () => {
        this.saving = false;
        this.dialog.close({ saved: true });
      },
      error: () => {
        this.saving = false;
      },
    });
  }

  private submitManual(): void {
    this.saving = true;
    this.manual.paymentDate = this.manualDate.toISOString();

    this.api.addManualPayment(this.commitmentId, this.manual).subscribe({
      next: () => {
        this.saving = false;
        this.dialog.close({ saved: true });
      },
      error: (response) => {
        this.saving = false;
        this.failure = response?.error;
      },
    });
  }

  private submitAccumulated(): void {
    this.saving = true;

    this.api
      .addAccumulatedPayment(this.commitmentId, {
        cutOffDate: this.accumulatedDate.toISOString(),
        currency: this.accumulatedCurrency,
        components: this.accumulatedLines.filter((line) => line.amount > 0),
      })
      .subscribe({
        next: () => {
          this.saving = false;
          this.dialog.close({ saved: true });
        },
        error: (response) => {
          this.saving = false;
          this.failure = response?.error;
        },
      });
  }
}
