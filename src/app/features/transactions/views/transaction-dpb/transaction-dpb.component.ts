import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import {
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PermissionActions, PermissionEnum } from '@core/enums';
import { CanDeactivateFromGuard } from '@core/guards/canDeactivateForm.guard';
import { Project } from '@core/models';
import { ActionsService } from '@core/services/app/actions/actions.service';
import { ProjectStoreService } from '@core/services/store-services';
import { VisibilityService } from '@core/services/view';
import { AppStateWithUsrPreferences, SelectedProjectState } from '@core/store';
import { Store } from '@ngrx/store';
import {
  forkJoin,
  Observable,
  of,
  Subject,
  Subscription,
  throwError,
  timer,
} from 'rxjs';
import {
  catchError,
  concatMap,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  mergeMap,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import { addTotalItemsGroup } from '../../components/amounts-reimbursement/amounts-reimbursement.form';
import {
  setTransactionComponentsFormValue,
  Totals,
  TransactionComponentsForm,
} from '../../components/transaction-components/transaction-components.form';
import { TransactionsStatus, TransactionsTypes } from '../../enums';
import { TransactionsComponents } from '../../enums/transactions-components.enum';
import {
  Amount,
  AvailableNumbers,
  Beneficiary,
  BeneficiaryAntRequest,
  BeneficiaryDetails,
  BeneficiaryEmmiter,
  GetTransactionComponentsResponse,
  InstitutionExist,
  TransactionComponent,
  TransactionHeaderBalances,
  TransactionSaveResponse,
} from '../../models';
import { TransactionRequest } from '../../models/request/transaction-request.model';
import { TransactionByIdGetResponse } from '../../models/responses/transaction-byId-get-response.model';
import {
  FiTransactionsApiService,
  TransactionsFormService,
  TransactionStatusService,
} from '../../services';
import { PersistTransactionEditService } from '../../services/persist-transaction-edit/persist-transaction-edit.service';
import { TransactionsStoreService } from '../../store/services/transactions-store.service';
import { createDpbForm } from './transaction-dps.form';
import { ModalService } from '@fiduciary-interface/app/shared';

@Component({
  selector: 'fi-transaction-dpb',
  templateUrl: './transaction-dpb.component.html',
})
export class TransactionDpbComponent implements OnInit, AfterViewChecked {
  readonly subscriptions = new Subscription();
  private static readonly TRANSACTION_PREFIX = 'OD';

  @Input() transactionTitle = 'BREADCRUMB.DPB';
  @Input() transactionType = TransactionsTypes.DPB;

  projectBucketId: string;
  selectedProject: Project;
  selectedLanguage: string;
  approvedCurrency: string;
  transactionNumber: string;
  approvedCurrency$: Observable<string>;
  balances: TransactionHeaderBalances = null;
  transactionId =
    this.activatedRoute.snapshot.params.id ||
    this.persistTransaction.getTransactionId;

  isEditMode = true;
  canActivate = true;
  isLoading: boolean;
  secondStep: boolean;
  isLoadingById: boolean;
  hasMinimumDocs: boolean;
  workFlowLoading: boolean;
  partNumberLoading: boolean;

  form: UntypedFormGroup;

  transactionNumberId: number;
  transactionStatusCode: string;
  transactionNumberWithPrefix: string;
  availableNumbers: AvailableNumbers = null;

  amountsToAssign: Amount = {
    distributeIbd: 0,
    distributeCofinancing: 0,
    distributeLocalCounterpart: 0,
  };

  readonlyDistributeCofinancing: boolean;
  components: TransactionComponent[] = [];

  bankFlowId: string;
  intitutionExist: boolean;
  institutionLoader: boolean;
  beneficiaries: Beneficiary[];
  currentBeneficiaries: Beneficiary;
  beneficiaryEmmiter: BeneficiaryEmmiter;
  buttonReload = new Subject();

  displayTransactionListPermission: PermissionEnum[] = [
    PermissionEnum.TRANSACTION_MANAGEMENT,
    PermissionEnum.VIEW_DISBURSEMENT_INFORMATION,
  ];

  displayTransactionListActions: PermissionActions[] = [
    PermissionActions.TRANSACTION_ACTION,
    PermissionActions.VIEW_DISBURSEMENT_ACTION,
  ];

  constructor(
    readonly storePreferences: Store<AppStateWithUsrPreferences>,
    readonly persistTransaction: PersistTransactionEditService,
    readonly transactionsFormService: TransactionsFormService,
    readonly transactionStore: TransactionsStoreService,
    readonly transactionsApi: FiTransactionsApiService,
    private readonly permissionActions: ActionsService,
    readonly changeDectector: ChangeDetectorRef,
    readonly projectStore: ProjectStoreService,
    readonly visibilitySvc: VisibilityService,
    readonly activatedRoute: ActivatedRoute,
    readonly router: Router,
    public readonly transactionStatusService: TransactionStatusService,
    private readonly canDeactivateFromGuard: CanDeactivateFromGuard,
    readonly fiModalSvc: ModalService
  ) {
    const subscription = this.permissionActions.readOnly$.subscribe(
      (readOnly) => {
        this.setReadOnly(readOnly);
      }
    );
    this.subscriptions.add(subscription);

    const router_subscription = router.events.subscribe(() => {
      this.persistTransaction._transactionId = 0;
    });
    this.subscriptions.add(router_subscription);
  }

  get detailForm(): UntypedFormGroup {
    return this.form.get('detailForm') as UntypedFormGroup;
  }

  get amountsForm(): UntypedFormGroup {
    return this.form.get('amountsForm') as UntypedFormGroup;
  }

  get componentsForm(): UntypedFormGroup {
    return this.form.get('componentsForm') as UntypedFormGroup;
  }

  get componentsFormArray(): UntypedFormArray {
    return this.componentsForm.get('components') as UntypedFormArray;
  }

  get totalItems(): UntypedFormArray {
    return this.amountsForm.get('totalItems') as UntypedFormArray;
  }

  get componentsArray(): UntypedFormArray {
    return this.form.get('componentsForm.components') as UntypedFormArray;
  }

  get componentsTotals(): UntypedFormGroup {
    return this.form.get('componentsForm.totals') as UntypedFormGroup;
  }

  get componentsAmountsToAssign(): UntypedFormGroup {
    return this.form.get('componentsForm.amountsToAssign') as UntypedFormGroup;
  }

  get beneficiaryForm(): UntypedFormGroup {
    return this.form.get('beneficiaryForm') as UntypedFormGroup;
  }

  get bankFlowIdControl(): UntypedFormControl {
    return this.beneficiaryForm.get('bankFlowId') as UntypedFormControl;
  }

  ngOnInit(): void {
    this.transactionStatusService.transactionStatusId.next(0);

    this.visibilityServices();
    this.form = createDpbForm();

    this.loadProjectBalances();
    this.loadSelectedProject();
    this.getCurrentLang();

    this.updateTotalsAtInput();
    this.amountsValueChanges();
    this.detailFormValueChanges();
    this.initRequestAmountsFormListeners();

    this.approvedCurrency$ = this.transactionsFormService
      .getApprovedCurrency()
      .pipe(map((currency) => (this.approvedCurrency = currency)));

    this.transactionId = this.persistTransaction.verifityTransactionId(
      this.transactionId
    );

    if (this.transactionId) {
      this.persistTransaction.setTransactionId(this.transactionId);

      this.displayTransactionListActions.push(PermissionActions.IS_EDIT);
    } else {
      this.transactionId = this.activatedRoute.snapshot.params.id as number;
      this.displayTransactionListActions.push(PermissionActions.IS_CREATE);
    }

    this.reloadLogic();
  }

  ngAfterViewChecked(): void {
    this.changeDectector.detectChanges();
  }

  ngOnDestroy(): void {
    this.visibilitySvc.setVisiblityProjectHeader(true);
    this.subscriptions.unsubscribe();
  }

  visibilityServices(): void {
    this.visibilitySvc.setVisiblityProjectHeader(false);
    this.visibilitySvc.breadcrumbService.set('@dpb', 'DPB');
    this.visibilitySvc.breadcrumbService.set(
      '@transactions',
      'BREADCRUMB.FINALCIAL_TRANSACTIONS'
    );
  }

  getTransactionById(
    projectBucketId: string,
    transactionId: number,
    transactionType: string
  ): Observable<TransactionByIdGetResponse> {
    return this.transactionsApi
      .getTransactionById(projectBucketId, transactionId, transactionType)
      .pipe(
        tap((response: TransactionByIdGetResponse) => {
          this.isEditMode = response.canEdit;
          this.secondStep = true;

          this.setPermissions(response.canEdit);
          this.transactionStatusService.transactionStatusId.next(
            response.requestDetail.statusId
          );

          this.transactionNumberWithPrefix = `${TransactionDpbComponent.TRANSACTION_PREFIX}${response.requestDetail.transactionNumber}`;
          this.transactionTitle = this.transactionNumberWithPrefix;
          this.transactionNumber = response.requestDetail.transactionNumber;
          this.transactionStatusCode = response.requestDetail.status;
          this.transactionNumberId = response.requestDetail.statusId;

          this.detailForm.setValue({
            requestNumber: response.requestDetail.requestNumber,
            partNumber: response.requestDetail.partNumber,
          });

          this.availableNumbers.requestNumber =
            response.requestDetail.requestNumber;
          this.availableNumbers.partNumber = response.requestDetail.partNumber;

          this.amountsForm.controls.selectedRequestedCurrency.setValue(
            response.requestTotalsAmount.selectedRequestedCurrency
          );

          const sortedComponents =
            this.transactionsFormService.sortComponentsByCodeAsc(
              response.components
            );
          this.components = sortedComponents;
          this.componentsForm.get('components').patchValue(sortedComponents);

          response.requestTotalsAmount.totalsItems.forEach((el) => {
            this.totalItems.push(
              addTotalItemsGroup(
                el.source,
                el.sourceType,
                el.expectedBalances,
                el.requestedAmount,
                el.equivalentCurrency
              )
            );
          });

          if (response.beneficiary.bankFlowId) {
            this.currentBeneficiaries = response.beneficiary;
            this.beneficiaryForm.patchValue({
              bankFlowId: response.beneficiary.bankFlowId,
              numberId: response.beneficiary.beneficiaryId,
            });
            this.setBeneficiaryCountry(
              this.projectBucketId,
              response.beneficiary.bankFlowId
            );
          }

          if (
            this.transactionType === TransactionsTypes.DPS &&
            response.beneficiary.bankFlowId
          ) {
            this.beneficiaries = [response.beneficiary];
          }

          if (!this.isEditMode) {
            this.form.disable();
            this.beneficiaries = [response.beneficiary];
          }

          this.isLoadingById = false;
        }),
        catchError((_) => {
          this.isLoadingById = false;
          return throwError(String());
        })
      );
  }

  loadProjectBalances(): void {
    const sub = this.transactionStore.projectBalances().subscribe((data) => {
      if (data.projectBalances) {
        this.balances = data.projectBalances;
        if (!data.projectBalances.cofinanced) {
          this.readonlyDistributeCofinancing = true;
        }
      }
    });
    this.subscriptions.add(sub);
  }

  loadSelectedProject(): void {
    this.isLoading = true;
    const sub = this.projectStore
      .selectedProject()
      .pipe(filter((res: SelectedProjectState) => res.selectedProject !== null))
      .pipe(take(1))
      .pipe(
        mergeMap((res) => {
          this.projectBucketId = res.selectedProject.projectBucketId;
          this.selectedProject = res.selectedProject;
          return this.canActivateTransaction(res);
        }),
        mergeMap((_res) => this.getTransactionsDetail(this.projectBucketId)),
        tap((data) => {
          this.getAvailableNumbersSuccess(data.availableNumbers$);
          this.initComponentsFormSuccess(data.components$);

          if (this.transactionType !== TransactionsTypes.DPS) {
            this.beneficiaries = data.beneficiaries$;
          }
        }),
        mergeMap(() => {
          if (this.transactionId) {
            this.isLoadingById = true;
            return this.getTransactionById(
              this.projectBucketId,
              this.transactionId,
              this.transactionType
            );
          }
          return of(String());
        }),
        mergeMap(() =>
          this.transactionsFormService.loadWorkflowActions(
            this.transactionId,
            this.selectedProject,
            this.transactionType
          )
        )
      )
      .subscribe(
        () => (this.isLoading = false),
        () => {
          if (this.canActivate) {
            this.transactionsFormService.showErrorToast(
              'TRANSACTION.LOAD_INFO_ERROR'
            );
          }
          this.isLoading = false;
        }
      );
    this.subscriptions.add(sub);
  }

  initRequestAmountsFormListeners(): void {
    const sub = this.amountsForm
      .get('totalItems')
      .valueChanges.subscribe(() => {
        this.componentsForm.markAllAsTouched();

        const requestAmountForm = this.amountsForm.getRawValue();

        this.amountsToAssign.distributeIbd = Number(
          Number(requestAmountForm.totalItems[0]?.equivalentCurrency).toFixed(2)
        );
        this.amountsToAssign.distributeLocalCounterpart = Number(
          Number(requestAmountForm.totalItems[1]?.equivalentCurrency).toFixed(2)
        );
        this.amountsToAssign.distributeCofinancing = Number(
          Number(requestAmountForm.totalItems[2]?.equivalentCurrency).toFixed(2)
        );

        this.updateComponentTotals(this.componentsArray.value);
      });
    this.subscriptions.add(sub);
  }

  initComponentsFormSuccess(response: GetTransactionComponentsResponse): void {
    const emtpyTotals: Amount = {
      distributeCofinancing: 0,
      distributeIbd: 0,
      distributeLocalCounterpart: 0,
    };
    const sortedComponents =
      this.transactionsFormService.sortComponentsByCodeAsc(response.components);
    this.components = sortedComponents;

    this.fillComponentsForm({
      amountsToAssign: {
        distributeIbd: 0,
        distributeLocalCounterpart: 0,
        distributeCofinancing: 0,
      },
      components: sortedComponents,
      totals: {
        amountsDistribute: emtpyTotals,
        amountsProjectedAvailable: emtpyTotals,
      },
    });
    this.updateComponentTotals(this.componentsArray.value);
  }

  getAvailableNumbersSuccess(availableNumbers: AvailableNumbers): void {
    this.availableNumbers = availableNumbers;

    this.detailForm.setValue({
      partNumber: availableNumbers.partNumber,
      requestNumber: availableNumbers.requestNumber,
    });
  }

  updateComponentTotals(components: TransactionComponent[]): void {
    let totalRow: Totals;
    if (this.isEditMode === false) {
      if (
        this.transactionNumberId !== TransactionsStatus.DRAFT &&
        this.transactionNumberId !== TransactionsStatus.COMPLETED
      ) {
        totalRow = this.transactionsFormService.getComponentTotals(
          components.filter(
            (c) => c.code !== TransactionsComponents.ADVANCE_OF_FUNDS
          )
        );
      } else {
        totalRow = this.transactionsFormService.getComponentTotals(components);
      }
    } else {
      totalRow = this.transactionsFormService.getComponentTotals(
        components.filter(
          (c) => c.code !== TransactionsComponents.ADVANCE_OF_FUNDS
        )
      );
    }

    if (this.isEditMode === false) {
      components = components.map((c) => {
        if (c.code === TransactionsComponents.ADVANCE_OF_FUNDS) {
          c.amountsDistribute.distributeIbd = 0;
        }
        return c;
      });
    }

    this.updateTotalRow(totalRow);

    const amountsToAssign: Totals =
      this.transactionsFormService.getComponentTotals(components);

    if (this.isEditMode !== false) {
      this.updateAmountsToAssign(amountsToAssign.amountsDistribute);
    }
  }

  updateTotalRow(totals: Totals): void {
    this.componentsTotals
      .get('amountsDistribute')
      .patchValue(totals.amountsDistribute);
    this.componentsTotals
      .get('amountsProjectedAvailable')
      .patchValue(totals.amountsProjectedAvailable);
  }

  updateAmountsToAssign(amount: Amount): void {
    amount.distributeIbd =
      +this.amountsToAssign.distributeIbd?.toFixed(2) -
      +amount.distributeIbd?.toFixed(2);
    amount.distributeLocalCounterpart =
      +this.amountsToAssign.distributeLocalCounterpart?.toFixed(2) -
      +amount.distributeLocalCounterpart?.toFixed(2);
    amount.distributeCofinancing =
      +this.amountsToAssign.distributeCofinancing?.toFixed(2) -
      +amount.distributeCofinancing?.toFixed(2);

    this.componentsAmountsToAssign.setValue(amount);
  }

  fillComponentsForm(formValue: TransactionComponentsForm): void {
    setTransactionComponentsFormValue(this.componentsForm, formValue);
  }

  updateTotalsAtInput(): void {
    const subscription = this.componentsArray.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(() => {
        this.updateExpectedBalances(this.components);
        this.updateComponentTotals(this.componentsArray.value);
      });

    this.subscriptions.add(subscription);
  }

  updateExpectedBalances(components: TransactionComponent[]): void {
    for (const component of this.componentsArray.controls) {
      const componentObject = component.value;
      const componentData = components.find((c) => c.id === componentObject.id);

      if (componentData) {
        const distribute = componentObject.amountsDistribute;
        const available = componentData.amountsProjectedAvailable;
        let idb: number, localCounterpart: number, cofinancing: number;

        if (this.isEditMode === false) {
          if (
            this.transactionNumberId !== TransactionsStatus.DRAFT &&
            this.transactionNumberId !== TransactionsStatus.COMPLETED
          ) {
            idb = available.distributeIbd - distribute.distributeIbd;
            localCounterpart =
              available.distributeLocalCounterpart -
              distribute.distributeLocalCounterpart;
            cofinancing =
              available.distributeCofinancing -
              distribute.distributeCofinancing;
          } else {
            idb = available.distributeIbd;
            localCounterpart = available.distributeLocalCounterpart;
            cofinancing = available.distributeCofinancing;
          }
        } else {
          idb = available.distributeIbd - distribute.distributeIbd;
          localCounterpart =
            available.distributeLocalCounterpart -
            distribute.distributeLocalCounterpart;
          cofinancing =
            available.distributeCofinancing - distribute.distributeCofinancing;
        }
        const amount: Amount = {
          distributeIbd: idb,
          distributeCofinancing: cofinancing,
          distributeLocalCounterpart: localCounterpart,
        };
        component
          .get('amountsProjectedAvailable')
          .setValue(amount, { emitEvent: false });
      }
    }
  }

  getTransactionsDetail(projectBucketId: string) {
    const availableNumbers$ =
      this.transactionsFormService.availableRequestAndPartNumber(
        projectBucketId
      );
    const components$ = this.transactionsFormService.getTransactionComponents$(
      projectBucketId,
      this.transactionType
    );

    let beneficiaries$: Observable<Beneficiary[]> = of([]);
    if (this.transactionType !== TransactionsTypes.DPS) {
      beneficiaries$ =
        this.transactionsFormService.getBeneficiaries$(projectBucketId);
    }

    return forkJoin({
      availableNumbers$,
      components$,
      beneficiaries$,
    });
  }

  setBeneficiaryCountry(projectBucketId: string, bankFlowId: string): void {
    this.transactionsApi
      .getBeneficiaryDetail(projectBucketId, bankFlowId)
      .subscribe((data: BeneficiaryDetails) =>
        this.beneficiaryForm
          .get('country')
          .setValue(data?.beneficiaryBasicData?.country)
      );
  }

  onBeneficiaryChange(emmiter: BeneficiaryEmmiter): void {
    if (!emmiter) {
      const accountCurrency = this.amountsForm.get('selectedRequestedCurrency')
        .value.currency;
      const bankFlowId = this.bankFlowIdControl.value;

      emmiter = {
        accountCurrency,
        bankFlowId,
      };
    }

    this.beneficiaryEmmiter = emmiter;
  }

  amountsValueChanges(): void {
    const sub = this.amountsForm
      .get('selectedRequestedCurrency')
      .valueChanges.subscribe(() => {
        this.onBeneficiaryChange(this.beneficiaryEmmiter);
      });
    this.subscriptions.add(sub);
  }

  cancel(): void {
    const path = this.activatedRoute.snapshot.params.id ? '../../' : '../';
    this.router.navigate([path], {
      relativeTo: this.activatedRoute,
    });
  }

  submitSave(redirect = false, launchWorkflow = false): void {
    this.form.markAsPristine();
    this.partNumberLoading = true;
    this.transactionsFormService
      .checkPartNumbers(
        this.projectBucketId,
        this.detailForm.get('requestNumber').value,
        this.detailForm.get('partNumber').value,
        this.transactionId,
        this.detailForm,
        'requestNumber'
      )
      .pipe(
        tap(() => {
          this.partNumberLoading = false;
        }),
        mergeMap(() => {
          if (
            this.form.valid &&
            this.transactionType === TransactionsTypes.DPS &&
            this.beneficiaryForm.get('bankFlowId')?.value
          ) {
            return this.checkInstitutionExists(
              this.beneficiaryForm.get('bankFlowId')?.value
            );
          }

          return of(String());
        })
      )
      .subscribe(
        () => {
          if (this.form.valid) {
            this.populateFormForSubmit(redirect, launchWorkflow);
          }
        },
        () => (this.partNumberLoading = false)
      );
  }

  populateFormForSubmit(redirect: boolean, launchWorkflow = false): void {
    this.isLoading = true;

    const requestAmountForm = this.amountsForm.getRawValue();

    const beneficiary: BeneficiaryAntRequest = {
      numberId: this.beneficiaryForm.get('numberId')?.value,
      bankFlowId: this.beneficiaryForm.get('bankFlowId')?.value,
      country: this.beneficiaryForm.get('country')?.value,
    };

    const transactionRequest: TransactionRequest = {
      requestDetails: {
        ...this.detailForm.getRawValue(),
      },
      requestJustAmounts: null,
      requestAntAmounts: null,
      requestTotalsAmount: {
        selectedRequestedCurrency: requestAmountForm.selectedRequestedCurrency,
        totalsItems: requestAmountForm.totalItems,
      },
      components: this.componentsArray.value,
      requestAntAndJustDetail: null,
      beneficiary,
      documents: null,
    };

    if (
      (this.transactionId && this.transactionNumber) ||
      launchWorkflow === true
    ) {
      this.checkWorkFlowComment(transactionRequest, redirect, launchWorkflow);
    } else {
      this.saveTransaction(transactionRequest);
    }
  }

  openModalWorkflowComment(): Observable<string> {
    return this.fiModalSvc.openWorkFlowCommentsModal(
      'WORKFLOWS.COMMENTS_MODAL.FINANCIAL.TRANSACTIONS.TITLE',
      [
        { text: 'WORKFLOWS.COMMENTS_MODAL.FINANCIAL.TRANSACTION.CANCEL.BTN' },
        {
          text: 'WORKFLOWS.COMMENTS_MODAL.FINANCIAL.TRANSACTION.CONFIRM_BTN',
          cssClass: 'k-primary',
        },
      ],
      [
        {
          key: 'WORKFLOWS.COMMENTS_MODAL.FINANCIAL.TRANSACTION.TEXT',
          bold: false,
        },
      ]
    );
  }

  checkWorkFlowComment(
    savedTransaction: TransactionRequest,
    redirect: boolean,
    launchWorkflow = false
  ): void {
    if (launchWorkflow) {
      this.openModalWorkflowComment()
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe((comment) => {
          this.updateTransaction(
            savedTransaction,
            redirect,
            launchWorkflow,
            comment
          );
        });
    } else {
      this.updateTransaction(savedTransaction, redirect, launchWorkflow);
    }
  }

  updateTransaction(
    savedTransaction: TransactionRequest,
    redirect: boolean,
    launchWorkflow = false,
    comment = ''
  ): void {
    this.transactionsApi
      .updateTransactionById(
        this.projectBucketId,
        this.transactionId,
        this.transactionType,
        savedTransaction
      )
      .subscribe(
        () => {
          this.transactionAddDocumentGroup();
          this.updateTransactionSuccess(redirect, launchWorkflow, comment);
        },
        () =>
          this.transactionsFormService.showErrorToast('TRANSACTION.SAVE_ERROR')
      )
      .add(() => (this.isLoading = false));
  }

  updateTransactionSuccess(
    redirect: boolean,
    launchWorkflow = false,
    comment = ''
  ): void {
    this.secondStep = true;
    this.transactionNumberWithPrefix = `${TransactionDpbComponent.TRANSACTION_PREFIX}${this.transactionNumber}`;

    if (launchWorkflow) {
      this.launchWorkflow(comment);
    }

    this.transactionsFormService.showTransacctionSuccessToast(
      'TRANSACTION.SAVE_SUCCESS',
      this.transactionType,
      this.transactionNumberWithPrefix
    );

    if (redirect) {
      this.cancel();
    }
    this.transactionsApi.resetTransactions();
  }

  saveTransaction(savedTransaction: TransactionRequest): void {
    this.transactionsApi
      .postTransactionById(
        this.projectBucketId,
        this.transactionType,
        savedTransaction
      )
      .subscribe(
        (response: TransactionSaveResponse) => {
          this.saveTransactionSuccess(response);
          this.transactionAddDocumentGroup();
        },
        () =>
          this.transactionsFormService.showErrorToast('TRANSACTION.SAVE_ERROR')
      )
      .add(() => (this.isLoading = false));
  }

  saveTransactionSuccess(response: TransactionSaveResponse): void {
    this.form.markAsUntouched();
    this.form.markAsPristine();

    this.secondStep = true;
    this.transactionId = response.id;
    this.transactionNumber = response.transactionNumbers[0];
    this.transactionNumberWithPrefix = `${TransactionDpbComponent.TRANSACTION_PREFIX}${this.transactionNumber}`;
    this.transactionStatusCode = response.statusCode;

    timer(3000)
      .pipe(
        concatMap(() => {
          this.transactionStatusService.transactionStatusId.next(
            response.statusId
          );
          return [];
        })
      )
      .subscribe();

    this.persistTransaction.setTransactionId(response.id);

    this.transactionsFormService.showTransacctionSuccessToast(
      'TRANSACTION.SAVE_SUCCESS',
      this.transactionType,
      this.transactionNumberWithPrefix
    );
    this.transactionsApi.resetTransactions();
  }

  transactionAddDocumentGroup(): void {
    this.transactionsApi
      .transactionAddDocumentGroup(this.transactionId, this.transactionType, [])
      .pipe(
        tap(() => {
          this.isLoading = false;
        }),
        catchError((_) => {
          this.transactionsFormService.showErrorToast(
            'TRANSACTION.SAVE_ERROR_DOCUMENT'
          );
          this.isLoading = false;
          return throwError(String());
        })
      )
      .subscribe();
  }

  checkInstitutionExists(bankFlowId: string): Observable<InstitutionExist> {
    this.institutionLoader = true;
    return this.transactionsApi.checkIfInstitutionExist(bankFlowId).pipe(
      tap((data: InstitutionExist) => {
        this.institutionLoader = false;
        if (data.intitutionExist === false) {
          this.beneficiaryForm.setErrors({ institutionNotFound: true });
        }
      })
    );
  }

  onDpsBeneficiaryChange(beneficiaries: Beneficiary[]): void {
    this.beneficiaries = beneficiaries;
  }

  launchWorkflow(comment: string): void {
    this.partNumberLoading = true;
    const sub = this.transactionsFormService
      .checkPartNumbers(
        this.projectBucketId,
        this.detailForm.get('requestNumber').value,
        this.detailForm.get('partNumber').value,
        this.transactionId,
        this.detailForm,
        'requestNumber'
      )
      .pipe(
        tap((_) => (this.partNumberLoading = false)),
        mergeMap((_) => {
          if (this.form.valid) {
            this.isLoading = true;
            return this.transactionsFormService.launchWorkflow(
              this.transactionId,
              this.selectedProject,
              this.selectedLanguage,
              this.transactionType,
              [],
              comment
            );
          } else {
            return of(String());
          }
          return of(String());
        })
      )
      .subscribe(
        () => {
          this.isLoading = false;
          this.cancel();
        },
        () => (this.isLoading = false)
      );
    this.subscriptions.add(sub);
  }

  onOneDocumentValidation(event: boolean): void {
    this.hasMinimumDocs = event;
  }

  getCurrentLang(): void {
    const sub = this.storePreferences
      .select('preferences')
      .subscribe((data) => {
        if (data.preferences.preferredLanguage) {
          this.selectedLanguage = data.preferences.preferredLanguage;
        }
      });
    this.subscriptions.add(sub);
  }

  detailFormValueChanges(): void {
    const subPartNumber = this.detailForm
      .get('partNumber')
      .valueChanges.pipe(distinctUntilChanged())
      .subscribe(() => {
        this.detailForm
          .get('requestNumber')
          .updateValueAndValidity({ emitEvent: false });
      });

    this.subscriptions.add(subPartNumber);
  }

  setPermissions(canEdit: boolean): void {
    if (!canEdit) {
      this.displayTransactionListActions.push(PermissionActions.CAN_NOT_EDIT);
    } else {
      this.displayTransactionListActions.push(
        PermissionActions.CAN_EDIT,
        PermissionActions.WORKFLOW_PERMISSION
      );
    }
  }

  setReadOnly(readOnly: boolean): void {
    if (readOnly && this.form.disabled === false) {
      this.isEditMode = false;
      this.beneficiaryForm.disable();
      this.componentsForm.disable();
      this.detailForm.disable();
    }
  }

  canActivateTransaction(res: SelectedProjectState) {
    if (this.transactionId) {
      return of(String());
    } else {
      return this.transactionsFormService
        .canActivateTransaction(
          res.selectedProject.projectBucketId,
          this.transactionType
        )
        .pipe(
          tap((res) => {
            this.canActivate = res.canActivate;
            if (!res.canActivate) {
              this.transactionsFormService.showErrorToast(res.errorMsg);
              this.cancel();
            }
          }),
          catchError((_) => {
            this.canActivate = false;
            this.transactionsFormService.showErrorToast(
              'TRANSACTION.ERRORS.GET_CARDS_VALIDATION'
            );
            this.cancel();
            return throwError(String());
          })
        );
    }
  }

  canDeactivate(): boolean | Observable<boolean | Observable<boolean>> {
    return this.canDeactivateFromGuard.openModalLogic(this.form);
  }

  reloadBeneficiary(): void {
    this.buttonReload.next('');
  }

  reloadLogic(): void {
    this.buttonReload
      .pipe(
        switchMap(() =>
          this.transactionsFormService.getBeneficiaries$(this.projectBucketId)
        ),
        catchError((error) => {
          this.transactionsFormService.showErrorToast(
            'TRANSACTION.LOAD_INFO_ERROR'
          );
          return throwError(error);
        })
      )
      .subscribe((beneficiary) => {
        if (this.currentBeneficiaries) {
          this.beneficiaryForm.patchValue({
            bankFlowId: this.currentBeneficiaries.bankFlowId,
            numberId: this.currentBeneficiaries.beneficiaryId,
          });
          this.setBeneficiaryCountry(
            this.projectBucketId,
            this.currentBeneficiaries.bankFlowId
          );
        }
        return (this.beneficiaries = beneficiary);
      });
  }
}
