import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
} from '@angular/forms';
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
import { ActivatedRoute, Router } from '@angular/router';
import { AppStateWithUsrPreferences, SelectedProjectState } from '@core/store';
import { Store } from '@ngrx/store';
import { TransactionsStoreService } from '../../store/services/transactions-store.service';
import { VisibilityService } from '@core/services/view';
import {
  setTransactionComponentsFormValue,
  Totals,
  TransactionComponentsForm,
} from '../../components/transaction-components/transaction-components.form';
import { ProjectStoreService } from '@core/services/store-services';
import {
  FiTransactionsApiService,
  TransactionsFormService,
  TransactionStatusService,
} from '../../services';
import { createAtjForm } from './transaction-atj.form';
import { Enums, Project } from '@core/models';
import {
  Amount,
  AvailableNumbers,
  Beneficiary,
  BeneficiaryAntRequest,
  BeneficiaryDetails,
  BeneficiaryEmmiter,
  GetTransactionComponentsResponse,
  RequestAndPartNumberValid,
  ResponseJustAmount,
  TransactionByIdGetResponse,
  TransactionComponent,
  TransactionHeaderBalances,
  TransactionRequest,
  TransactionSaveResponse,
} from '@fiduciary-interface/app/features/transactions/models';
import { TransactionsStatus, TransactionsTypes } from '../../enums';
import { PermissionActions, PermissionEnum } from '@core/enums';
import { ActionsService } from '@core/services/app/actions/actions.service';
import { PersistTransactionEditService } from '../../services/persist-transaction-edit/persist-transaction-edit.service';
import { CanDeactivateFromGuard } from '@core/guards/canDeactivateForm.guard';
import { TransactionsComponents } from '../../enums/transactions-components.enum';
import { ModalService } from '@fiduciary-interface/app/shared';

@Component({
  selector: 'fi-transaction-atj',
  templateUrl: './transaction-atj.component.html',
})
export class TransactionAtjComponent
  implements OnInit, OnDestroy, AfterViewChecked
{
  private readonly subscription: Subscription = new Subscription();
  private static readonly TRANSACTION_PREFIX = 'OD';

  formGroup: UntypedFormGroup;

  enums = Enums;
  transactionId: number;
  transactionIdANT: number;
  transactionIdANJ: number;
  projectBucketId: string;
  selectedProject: Project;
  selectedLanguage: string;
  transactionType = TransactionsTypes.ATJ;
  transactionTitle = 'BREADCRUMB.ATJ';
  balances: TransactionHeaderBalances = null;

  // DETAIL
  transactionNumberANJ: string;
  transactionNumberANT: string;
  transactionNumberATJ: string;
  transactionStatusCode: string;
  transactionNumberId: number;

  availableNumbers: AvailableNumbers = null;
  requestNumberANT: number;

  // ANJ AMOUNTS
  amountsToAssign: Amount = {
    distributeIbd: 0,
    distributeCofinancing: 0,
    distributeLocalCounterpart: 0,
  };
  readonlyDistributeCofinancing: boolean;

  // COMPONENTS
  components: TransactionComponent[] = [];

  // ANT AMOUNTS
  approvedCurrency: string;
  approvedCurrency$: Observable<string>;

  // BENEFICIARIES
  bankFlowId: string;
  currencyBeneficiary: string;
  beneficiaries: Beneficiary[];
  currentBeneficiaries: Beneficiary;
  isInvalidBeneficiary: boolean;
  beneficiaryEmmiter: BeneficiaryEmmiter;
  buttonReload = new Subject();

  isEditMode = true;
  canActivate = true;
  isLoading: boolean;
  secondStep: boolean;
  apiLoading: boolean;
  hasMinimumDocs: boolean;
  workFlowLoading: boolean;
  partNumberLoading: boolean;

  displayTransactionListPermission: PermissionEnum[] = [
    PermissionEnum.TRANSACTION_MANAGEMENT,
    PermissionEnum.VIEW_DISBURSEMENT_INFORMATION,
  ];

  displayTransactionListActions: PermissionActions[] = [
    PermissionActions.TRANSACTION_ACTION,
    PermissionActions.VIEW_DISBURSEMENT_ACTION,
  ];

  pendingGroupsGet = false;

  constructor(
    readonly storePreferences: Store<AppStateWithUsrPreferences>,
    private readonly transactionStore: TransactionsStoreService,
    readonly persistTransaction: PersistTransactionEditService,
    readonly transactionsFormService: TransactionsFormService,
    private readonly changeDectector: ChangeDetectorRef,
    private readonly permissionActions: ActionsService,
    readonly transactionsSvc: FiTransactionsApiService,
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
    this.subscription.add(subscription);

    const router_subscription = router.events.subscribe(() => {
      this.persistTransaction._transactionId = 0;
    });
    this.subscription.add(router_subscription);
  }

  // DETAIL FORM
  get requestDetailsForm(): UntypedFormGroup {
    return this.formGroup.get('requestDetailsForm') as UntypedFormGroup;
  }

  // ANJ AMOUNTS FORM
  get requestAmountsForm(): UntypedFormGroup {
    return this.formGroup.get('requestAmountsForm') as UntypedFormGroup;
  }

  get bidControl(): UntypedFormControl {
    return this.requestAmountsForm.get('bid') as UntypedFormControl;
  }

  get counterpartControl(): UntypedFormControl {
    return this.requestAmountsForm.get(
      'localCounterpart'
    ) as UntypedFormControl;
  }

  get cofinancingControl(): UntypedFormControl {
    return this.requestAmountsForm.get('cofinancing') as UntypedFormControl;
  }

  // COMPONENTS FORM
  get componentsForm(): UntypedFormGroup {
    return this.formGroup.get('componentsForm') as UntypedFormGroup;
  }

  get componentsArray(): UntypedFormArray {
    return this.componentsForm.get('components') as UntypedFormArray;
  }

  get componentsTotals(): UntypedFormGroup {
    return this.componentsForm.get('totals') as UntypedFormGroup;
  }

  get componentsAmountsToAssign(): UntypedFormGroup {
    return this.componentsForm.get('amountsToAssign') as UntypedFormGroup;
  }

  // ANJ AMOUNTS
  get amountsForm(): UntypedFormGroup {
    return this.formGroup.get('ammountsForm') as UntypedFormGroup;
  }

  // BENEFICIARY
  get beneficiaryForm(): UntypedFormGroup {
    return this.formGroup.get('beneficiaryForm') as UntypedFormGroup;
  }

  get bankFlowIdControl(): UntypedFormControl {
    return this.beneficiaryForm.get('bankFlowId') as UntypedFormControl;
  }

  ngOnInit(): void {
    this.visibilityServices();
    this.transactionId =
      this.activatedRoute.snapshot.params.id ||
      this.persistTransaction.getTransactionId;
    this.transactionStatusService.transactionStatusId.next(0);

    this.formGroup = createAtjForm();

    this.loadProjectBalances();
    this.loadSelectedProject();
    this.getCurrentLang();

    this.updateTotalsAtInput();
    this.amountsValueChanges();
    this.initRequestAmountsFormListeners();
    this.detailFormValueChanges();

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
      this.displayTransactionListActions.push(PermissionActions.IS_CREATE);
    }

    this.reloadLogic();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngAfterViewChecked(): void {
    this.changeDectector.detectChanges();
  }

  visibilityServices(): void {
    this.visibilitySvc.setVisiblityProjectHeader(false);
    this.visibilitySvc.breadcrumbService.set('@atj', 'ATJ');
    this.visibilitySvc.breadcrumbService.set(
      '@transactions',
      'BREADCRUMB.FINALCIAL_TRANSACTIONS'
    );
  }

  loadProjectBalances(): void {
    const subscription = this.transactionStore
      .projectBalances()
      .subscribe((data) => {
        if (data.projectBalances) {
          this.balances = data.projectBalances;
          this.initRequestAmountsForm(this.balances);
        }
      });
    this.subscription.add(subscription);
  }

  loadSelectedProject(): void {
    this.isLoading = true;
    const subscription = this.projectStore
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
          this.beneficiaries = data.beneficiaries$;
        }),
        mergeMap(() => {
          if (this.transactionId) {
            this.apiLoading = true;

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
            this.transactionType,
            [this.transactionIdANT, this.transactionIdANJ]
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
    this.subscription.add(subscription);
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

    const beneficiaries$ =
      this.transactionsFormService.getBeneficiaries$(projectBucketId);

    return forkJoin({
      availableNumbers$,
      components$,
      beneficiaries$,
    });
  }

  getAvailableNumbersSuccess(availableNumbers: AvailableNumbers): void {
    this.availableNumbers = availableNumbers;
    this.requestNumberANT = availableNumbers.requestNumber + 1;

    this.requestDetailsForm.patchValue({
      partNumberJustification: availableNumbers.partNumber,
      requestNumberJustification: availableNumbers.requestNumber,
      partNumberAdvanceOfFunds: availableNumbers.partNumber,
      requestNumberAdvanceOfFunds: this.requestNumberANT,
    });
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

  fillComponentsForm(formValue: TransactionComponentsForm): void {
    setTransactionComponentsFormValue(this.componentsForm, formValue);
  }

  initRequestAmountsForm(balances: TransactionHeaderBalances): void {
    const amountPendingJustification = balances.totalAmountPendingJustification;
    this.requestAmountsForm
      .get('amountPendingJustification')
      .setValue(amountPendingJustification);

    if (!balances.cofinanced) {
      this.requestAmountsForm.get('cofinancing').disable();
      this.readonlyDistributeCofinancing = true;
    }
  }

  initRequestAmountsFormListeners(isReadonly = false): void {
    this.bidControlValueChanges(isReadonly);
    this.counterpartControlChanges(isReadonly);
    this.cofinancingControlChanges(isReadonly);
  }

  bidControlValueChanges(isReadonly: boolean): void {
    const bidSubscription = this.bidControl.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe((value) => {
        this.componentsForm.markAllAsTouched();

        if (
          value < this.balances.minimumAmountPendingJustification &&
          value !== null
        ) {
          this.bidControl.setErrors({
            minAmountError: true,
          });
        }

        const amountPendingJustification =
          this.balances?.totalAmountPendingJustification || 0;

        let currentAmountPendingJustification: number;

        if (this.isEditMode === false) {
          if (
            this.transactionNumberId !== TransactionsStatus.DRAFT &&
            this.transactionNumberId !== TransactionsStatus.COMPLETED
          ) {
            currentAmountPendingJustification =
              amountPendingJustification - Number(value);
          } else {
            currentAmountPendingJustification = amountPendingJustification;
          }
        } else {
          currentAmountPendingJustification =
            amountPendingJustification - Number(value);
        }

        this.requestAmountsForm
          .get('amountPendingJustification')
          .setValue(currentAmountPendingJustification, { emitEvent: false });

        this.amountsToAssign.distributeIbd = value;
        if (!isReadonly) {
          this.updateComponentTotals(this.componentsArray.value);
        }
      });
    this.subscription.add(bidSubscription);
  }

  counterpartControlChanges(isReadonly: boolean): void {
    const counterpartSubscription = this.counterpartControl.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe((value) => {
        this.componentsForm.markAllAsTouched();
        this.amountsToAssign.distributeLocalCounterpart = value;
        if (!isReadonly) {
          this.updateComponentTotals(this.componentsArray.value);
        }
      });
    this.subscription.add(counterpartSubscription);
  }

  cofinancingControlChanges(isReadonly: boolean): void {
    const cofinancingSubscription = this.cofinancingControl.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe((value) => {
        this.componentsForm.markAllAsTouched();
        this.amountsToAssign.distributeCofinancing = value;
        if (!isReadonly) {
          this.updateComponentTotals(this.componentsArray.value);
        }
      });

    this.subscription.add(cofinancingSubscription);
  }

  updateTotalsAtInput(): void {
    const subscription = this.componentsArray.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(() => {
        this.updateComponentTotals(this.componentsArray.value);
        this.updateExpectedBalances(this.components);
        this.updateComponentTotals(this.componentsArray.value);
      });
    this.subscription.add(subscription);
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
      this.transactionsFormService.getComponentTotals(
        components.filter(
          (c) => c.code !== TransactionsComponents.ADVANCE_OF_FUNDS
        )
      );

    this.updateAdvanceOfFoundsComponent(
      amountsToAssign.amountsDistribute,
      components
    );
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

  updateAdvanceOfFoundsComponent(
    amount: Amount,
    components: TransactionComponent[]
  ): void {
    const index = components.findIndex(
      (c) => c.code === TransactionsComponents.ADVANCE_OF_FUNDS
    );
    if (index < 0) {
      return;
    }
    this.componentsArray
      .get(index.toString())
      .get('amountsDistribute.distributeIbd')
      .setValue(-Math.abs(amount.distributeIbd), { emitEvent: false });
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

  onBeneficiaryChange(emmiter: BeneficiaryEmmiter): void {
    if (!emmiter) {
      const accountCurrency =
        this.amountsForm.get('requestedCurrency').value.currency;
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
      .get('requestedCurrency')
      .valueChanges.pipe(distinctUntilChanged())
      .subscribe(() => this.onBeneficiaryChange(this.beneficiaryEmmiter));
    this.subscription.add(sub);
  }

  setBeneficiaryCountry(projectBucketId: string, bankFlowId: string): void {
    this.transactionsSvc
      .getBeneficiaryDetail(projectBucketId, bankFlowId)
      .subscribe((data: BeneficiaryDetails) =>
        this.beneficiaryForm
          .get('country')
          .setValue(data?.beneficiaryBasicData?.country)
      );
  }

  onOneDocumentValidation(event: boolean): void {
    this.hasMinimumDocs = event;
  }

  launchWorkflow(comment: string): void {
    this.partNumberLoading = true;
    const sub = this.antAnjPartNumbersValidation()
      .pipe(
        tap((_) => (this.partNumberLoading = false)),
        mergeMap((_) => {
          if (this.formGroup.valid) {
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
        })
      )
      .subscribe(
        () => {
          this.isLoading = false;
          this.cancel();
        },
        () => (this.isLoading = false)
      );
    this.subscription.add(sub);
  }

  getCurrentLang(): void {
    const sub = this.storePreferences
      .select('preferences')
      .subscribe((data) => {
        if (data.preferences.preferredLanguage) {
          this.selectedLanguage = data.preferences.preferredLanguage;
        }
      });
    this.subscription.add(sub);
  }

  setBeneficiaryRequest(): BeneficiaryAntRequest {
    return {
      numberId: this.beneficiaryForm.get('numberId')?.value,
      bankFlowId: this.beneficiaryForm.get('bankFlowId')?.value,
      country: this.beneficiaryForm.get('country')?.value,
    };
  }

  setRequestJustAmountsRequest(): ResponseJustAmount {
    const requestAmountsForm: ResponseJustAmount =
      this.requestAmountsForm.getRawValue();

    return {
      bid: requestAmountsForm.bid,
      cofinancing: requestAmountsForm.cofinancing
        ? requestAmountsForm.cofinancing
        : 0,
      localCounterpart: requestAmountsForm.localCounterpart
        ? requestAmountsForm.localCounterpart
        : 0,
    };
  }

  setrequestAntAndJustDetailRequest() {
    return {
      numberDaysFinancialPlanning: this.requestDetailsForm.get(
        'numberDaysFinancialPlanning'
      )?.value,
      antDetail: {
        partNumber: this.requestDetailsForm.get('partNumberAdvanceOfFunds')
          ?.value,
        requestNumber: this.requestDetailsForm.get(
          'requestNumberAdvanceOfFunds'
        )?.value,
        transactionId: this.transactionIdANT,
      },
      justDetail: {
        partNumber: this.requestDetailsForm.get('partNumberJustification')
          ?.value,
        requestNumber: this.requestDetailsForm.get('requestNumberJustification')
          ?.value,
        transactionId: this.transactionIdANJ,
      },
    };
  }

  submitSave(redirect: boolean, launchWorkflow = false): void {
    this.checkAntAndAnjNumbersDuplicates();

    if (this.formGroup.valid) {
      this.formGroup.markAsPristine();
      this.partNumberLoading = true;
      const sub = this.antAnjPartNumbersValidation().subscribe(
        () => {
          this.partNumberLoading = false;
          if (this.formGroup.valid) {
            this.isLoading = true;

            const beneficiary = this.setBeneficiaryRequest();
            const requestJustAmounts = this.setRequestJustAmountsRequest();
            const requestAntAndJustDetail =
              this.setrequestAntAndJustDetailRequest();

            const transactionRequest: TransactionRequest = {
              requestJustAmounts,
              requestAntAmounts: {
                equivalentApprovedCurrency: this.amountsForm.get(
                  'equivalentApprovedCurrency'
                )?.value,
                requestedCurrency:
                  this.amountsForm.get('requestedCurrency')?.value.currency,
                requiredAmount: this.amountsForm.get('requestedAmount')?.value,
              },
              components: this.componentsArray.getRawValue(),
              requestAntAndJustDetail,
              beneficiary,
              requestDetails: null,
              requestTotalsAmount: null,
              documents: null,
            };

            if (this.transactionId || launchWorkflow === true) {
              this.checkWorkFlowComment(
                transactionRequest,
                redirect,
                launchWorkflow
              );
            } else {
              this.saveTransaction(transactionRequest);
            }
          }
        },
        () => (this.partNumberLoading = false)
      );

      this.subscription.add(sub);
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
    this.transactionsSvc
      .updateTransactionById(
        this.projectBucketId,
        this.transactionId,
        this.transactionType,
        savedTransaction
      )
      .subscribe({
        next: () => {
          this.transactionAddDocumentGroup();
          this.updateTransactionSuccess(redirect, launchWorkflow, comment);
        },
        error: () => {
          this.transactionsFormService.showErrorToast('TRANSACTION.SAVE_ERROR');
        },
      })
      .add(() => (this.isLoading = false));
  }

  updateTransactionSuccess(
    redirect: boolean,
    launchWorkflow = false,
    comment = ''
  ): void {
    this.secondStep = true;

    if (launchWorkflow) {
      this.launchWorkflow(comment);
    }

    this.transactionsFormService.showTransacctionSuccessToast(
      'TRANSACTION.SAVE_SUCCESS',
      this.transactionType,
      this.transactionNumberATJ
    );

    if (redirect) {
      this.cancel();
    }
    this.transactionsSvc.resetTransactions();
  }

  saveTransaction(savedTransaction: TransactionRequest): void {
    this.transactionsSvc
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
    this.secondStep = true;

    this.transactionId = response.id;
    this.persistTransaction.setTransactionId(response.id);
    this.transactionIdANT = response.idANT;
    this.transactionIdANJ = response.idANJ;
    this.transactionStatusCode = response.statusCode;

    this.transactionNumberATJ = `${TransactionAtjComponent.TRANSACTION_PREFIX}${response.transactionNumbers[0]}`;
    this.transactionNumberANJ = `${TransactionAtjComponent.TRANSACTION_PREFIX}${response.transactionNumbers[1]}`;
    this.transactionNumberANT = `${TransactionAtjComponent.TRANSACTION_PREFIX}${response.transactionNumbers[2]}`;

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

    this.transactionsFormService.showTransacctionSuccessToast(
      'TRANSACTION.SAVE_SUCCESS',
      this.transactionType,
      this.transactionNumberATJ
    );
    this.transactionsSvc.resetTransactions();
  }

  transactionAddDocumentGroup(): void {
    this.transactionsSvc
      .transactionAddDocumentGroup(this.transactionId, this.transactionType, [])
      .pipe(
        catchError((_) => {
          this.transactionsFormService.showErrorToast(
            'TRANSACTION.SAVE_ERROR_DOCUMENT'
          );
          this.isLoading = false;
          return throwError(String());
        })
      )
      .subscribe(() => {
        this.isLoading = false;
        this.pendingGroupsGet = true;
      });
  }

  cancel(): void {
    const path = this.activatedRoute.snapshot.params.id ? '../../' : '../';
    this.router.navigate([path], {
      relativeTo: this.activatedRoute,
    });
  }

  getTransactionById(
    projectBucketId: string,
    transactionId: number,
    transactionType: string
  ): Observable<TransactionByIdGetResponse> {
    return this.transactionsSvc
      .getTransactionById(projectBucketId, transactionId, transactionType)
      .pipe(
        tap((response: TransactionByIdGetResponse) => {
          this.transactionIdANJ =
            response.requestAntAndJustDetail.justDetail.transactionId;
          this.transactionIdANT =
            response.requestAntAndJustDetail.antDetail.transactionId;

          this.transactionNumberId = response.requestAntAndJustDetail.statusId;
          this.isEditMode = response.canEdit;
          this.secondStep = true;

          this.setPermissions(response.canEdit);
          this.setDetailsFormSection(response);
          this.setAnjFormSection(response);
          this.setComponentFormSection(response);
          this.setAntAmountsSection(response);

          if (response.beneficiary.bankFlowId) {
            this.setBeneficiaryFormSection(response);
          }

          if (!this.isEditMode) {
            this.formGroup.disable();
            this.beneficiaries = [response.beneficiary];
          }
          this.apiLoading = false;
        }),
        catchError((_) => {
          this.apiLoading = false;
          return throwError(String());
        })
      );
  }

  setDetailsFormSection(response: TransactionByIdGetResponse): void {
    const detail = response.requestAntAndJustDetail;
    this.transactionStatusService.transactionStatusId.next(
      response.requestAntAndJustDetail.statusId
    );

    this.transactionNumberATJ = `${TransactionAtjComponent.TRANSACTION_PREFIX}${response.transactionNumber}`;
    this.transactionNumberANJ = `${TransactionAtjComponent.TRANSACTION_PREFIX}${detail.justDetail.transactionNumber}`;
    this.transactionNumberANT = `${TransactionAtjComponent.TRANSACTION_PREFIX}${detail.antDetail.transactionNumber}`;

    this.transactionStatusCode = detail.status;
    this.transactionTitle = `${this.transactionNumberANJ} / ${this.transactionNumberANT}`;

    this.requestNumberANT = detail.antDetail.requestNumber;
    this.availableNumbers.requestNumber = detail.justDetail.requestNumber;
    this.availableNumbers.partNumber = detail.justDetail.partNumber;

    this.requestDetailsForm.setValue({
      requestNumberAdvanceOfFunds: detail.antDetail.requestNumber,
      partNumberAdvanceOfFunds: detail.antDetail.partNumber,
      requestNumberJustification: detail.justDetail.requestNumber,
      partNumberJustification: detail.justDetail.partNumber,
      numberDaysFinancialPlanning: detail.numberDaysFinancialPlanning,
    });
  }

  setAnjFormSection(response: TransactionByIdGetResponse): void {
    this.requestAmountsForm.patchValue({
      bid: response.requestJustAmount.bid,
      localCounterpart: response.requestJustAmount.localCounterpart,
      cofinancing: response.requestJustAmount.cofinancing,
    });
  }

  setComponentFormSection(response: TransactionByIdGetResponse): void {
    const sortedComponents =
      this.transactionsFormService.sortComponentsByCodeAsc(response.components);
    this.components = sortedComponents;

    setTimeout(() => {
      this.componentsForm.get('components').patchValue(sortedComponents);
    });
  }

  setBeneficiaryFormSection(response: TransactionByIdGetResponse): void {
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

  setAntAmountsSection(response: TransactionByIdGetResponse): void {
    this.amountsForm.setValue({
      requestedCurrency: response.requestAntAmount.requestedCurrency,
      requestedAmount: response.requestAntAmount.requiredAmount,
      equivalentApprovedCurrency:
        response.requestAntAmount.equivalentApprovedCurrency,
      expectedBalance: response.requestAntAmount.availableBalance,
    });
  }

  antAnjPartNumbersValidation(): Observable<
    [RequestAndPartNumberValid, RequestAndPartNumberValid]
  > {
    const anjValidation = this.transactionsFormService.checkPartNumbers(
      this.projectBucketId,
      this.requestDetailsForm.get('requestNumberJustification').value,
      this.requestDetailsForm.get('partNumberJustification').value,
      this.transactionIdANJ,
      this.requestDetailsForm,
      'requestNumberJustification'
    );

    const antValidation = this.transactionsFormService.checkPartNumbers(
      this.projectBucketId,
      this.requestDetailsForm.get('requestNumberAdvanceOfFunds').value,
      this.requestDetailsForm.get('partNumberAdvanceOfFunds').value,
      this.transactionIdANT,
      this.requestDetailsForm,
      'requestNumberAdvanceOfFunds'
    );

    return forkJoin([anjValidation, antValidation]);
  }

  antAndAnjNumbersDuplicates(): boolean {
    const anjNumbers = [
      this.requestDetailsForm.get('requestNumberJustification').value,
      this.requestDetailsForm.get('partNumberJustification').value,
    ];
    const antNumbers = [
      this.requestDetailsForm.get('requestNumberAdvanceOfFunds').value,
      this.requestDetailsForm.get('partNumberAdvanceOfFunds').value,
    ];

    // check if two arrays have the same elements
    return anjNumbers.every((element, index) => element === antNumbers[index]);
  }

  detailFormValueChanges(): void {
    const subParttAnt = this.requestDetailsForm
      .get('partNumberAdvanceOfFunds')
      .valueChanges.pipe(distinctUntilChanged())
      .subscribe(() => {
        this.requestDetailsForm
          .get('requestNumberAdvanceOfFunds')
          .updateValueAndValidity({ emitEvent: false });
      });
    const subParttAnj = this.requestDetailsForm
      .get('partNumberJustification')
      .valueChanges.pipe(distinctUntilChanged())
      .subscribe(() => {
        this.requestDetailsForm
          .get('requestNumberJustification')
          .updateValueAndValidity({ emitEvent: false });
      });

    this.subscription.add(subParttAnt);
    this.subscription.add(subParttAnj);
  }

  checkAntAndAnjNumbersDuplicates(): void {
    if (this.antAndAnjNumbersDuplicates()) {
      this.requestDetailsForm.get('requestNumberJustification').setErrors({
        anjAndAtjEqualsNumbers: true,
      });
      this.requestDetailsForm.get('requestNumberAdvanceOfFunds').setErrors({
        anjAndAtjEqualsNumbers: true,
      });
    }
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
    if (readOnly && this.formGroup.disabled === false) {
      this.isEditMode = false;
      this.formGroup.controls.beneficiaryForm.disable();
      this.formGroup.controls.componentsForm.disable();
      this.formGroup.controls.requestAmountsForm.disable();
      this.formGroup.controls.requestDetailsForm.disable();
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
    return this.canDeactivateFromGuard.openModalLogic(this.formGroup);
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
