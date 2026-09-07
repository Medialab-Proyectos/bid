import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  forkJoin,
  Observable,
  of,
  Subscription,
  throwError,
  timer,
} from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  mergeMap,
  tap,
  exhaustMap,
  take,
  finalize,
  concatMap,
} from 'rxjs/operators';
import { VisibilityService } from '@core/services/view';
import {
  EnumsStoreService,
  ProjectStoreService,
} from '@core/services/store-services';
import {
  FiTransactionsApiService,
  TransactionsFormService,
} from '../../services';
import { TransactionsStoreService } from '../../store/services/transactions-store.service';
import { AppStateWithUsrPreferences, SelectedProjectState } from '@core/store';
import { AmountsJustificationForm } from '../../components/amounts-justification/amounts-justification.form';
import {
  setTransactionComponentsFormValue,
  Totals,
  TransactionComponentsForm,
} from '../../components/transaction-components/transaction-components.form';
import { TransactionsStatus, TransactionsTypes } from '../../enums';
import {
  Amount,
  GetTransactionComponentsResponse,
  AnjTransactionRequest,
  TransactionAnjGetResponse,
  TransactionComponent,
  TransactionHeaderBalances,
  TransactionSaveResponse,
  AvailableNumbers,
} from '../../models';
import { PermissionActions, PermissionEnum } from '@core/enums';
import { Store } from '@ngrx/store';
import { ErrorResponse, Project } from '@core/models';
import { createAnjForm } from './transaction-anj.form';
import { ActionsService } from '@core/services/app/actions/actions.service';
import { PersistTransactionEditService } from '../../services/persist-transaction-edit/persist-transaction-edit.service';
import { TransactionStatusService } from '../../services/transaction-status/transaction-status.service';
import { CanDeactivateFromGuard } from '@core/guards/canDeactivateForm.guard';
import { TransactionsComponents } from '../../enums/transactions-components.enum';
import { ModalService } from '@fiduciary-interface/app/shared';

@Component({
  selector: 'fi-transaction-anj',
  templateUrl: './transaction-anj.component.html',
})
export class TransactionAnjComponent implements OnInit, OnDestroy {
  readonly subscriptions = new Subscription();
  private static readonly TRANSACTION_PREFIX = 'OD';

  form: UntypedFormGroup;

  projectBucketId: string;
  selectedProject: Project;
  transactionTitle: string;
  selectedLanguage: string;
  type = TransactionsTypes.ANJ;
  balances: TransactionHeaderBalances = null;
  transactionId =
    this.activatedRoute.snapshot.params.id ||
    this.persistTransaction.getTransactionId;

  // DETAIL
  transactionNumber: string;
  transactionNumberId: number;
  transactionStatusCode: string;
  transactionNumberPrefixed: string;
  availableNumbers: AvailableNumbers = null;

  // AMOUNTS
  amountsToAssign: Amount = {
    distributeIbd: 0,
    distributeCofinancing: 0,
    distributeLocalCounterpart: 0,
  };
  readonlyDistributeCofinancing: boolean;
  approvedCurrency$: Observable<string>;

  // COMPONENTS
  components: TransactionComponent[] = [];

  isLoading = true;
  isEditMode = true;
  canActivate = true;
  secondStep = false;
  isLoadingById = false;
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

  constructor(
    readonly storePreferences: Store<AppStateWithUsrPreferences>,
    private readonly transactionStore: TransactionsStoreService,
    readonly persistTransaction: PersistTransactionEditService,
    readonly transactionsFormService: TransactionsFormService,
    private readonly permissionActions: ActionsService,
    readonly transactionsApi: FiTransactionsApiService,
    readonly projectStore: ProjectStoreService,
    readonly visibilitySvc: VisibilityService,
    readonly activatedRoute: ActivatedRoute,
    readonly enumsSvc: EnumsStoreService,
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

  get requestAmountsForm(): UntypedFormGroup {
    return this.form.get('requestAmountsForm') as UntypedFormGroup;
  }

  get requestDetailsForm(): UntypedFormGroup {
    return this.form.get('requestDetailsForm') as UntypedFormGroup;
  }

  get componentsForm(): UntypedFormGroup {
    return this.form.get('componentsForm') as UntypedFormGroup;
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

  ngOnInit(): void {
    this.transactionStatusService.transactionStatusId.next(0);

    this.form = createAnjForm();
    this.visibilityServices();

    this.loadProjectBalances();
    this.loadSelectedProject();
    this.getCurrentLang();
    this.detailFormValueChanges();

    this.transactionId = this.persistTransaction.verifityTransactionId(
      this.transactionId
    );

    if (this.transactionId) {
      this.persistTransaction.setTransactionId(this.transactionId);

      this.getTransactionById(this.transactionId);
      this.displayTransactionListActions.push(PermissionActions.IS_EDIT);
    } else {
      this.transactionTitle = 'BREADCRUMB.ANJ';
      this.updateTotalsAtInput();
      this.initRequestAmountsFormListeners();
      this.displayTransactionListActions.push(PermissionActions.IS_CREATE);
    }

    this.approvedCurrency$ = this.transactionsFormService.getApprovedCurrency();
  }

  ngOnDestroy(): void {
    this.visibilitySvc.setVisiblityProjectHeader(true);
    this.subscriptions.unsubscribe();
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
    this.subscriptions.add(subscription);
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
        mergeMap((_res) => {
          return this.getTransactionsDetail(this.projectBucketId);
        }),
        tap((data) => {
          this.getAvailableNumbersSuccess(data.availableNumbers$);
          this.initComponentsFormSuccess(data.components$);
          this.isLoading = false;
        })
      )
      .subscribe(
        () => {},
        () => {
          if (this.canActivate) {
            this.transactionsFormService.showErrorToast(
              'TRANSACTION.LOAD_INFO_ERROR'
            );
          }
          this.isLoading = false;
        }
      );
    this.subscriptions.add(subscription);
  }

  getCurrentLang(): void {
    const sub = this.storePreferences
      .select('preferences')
      .subscribe((data) => {
        if (data.preferences) {
          this.selectedLanguage = data.preferences.preferredLanguage;
        }
      });
    this.subscriptions.add(sub);
  }

  getAvailableNumbersSuccess(availableNumbers: AvailableNumbers): void {
    this.availableNumbers = availableNumbers;

    this.requestDetailsForm.setValue({
      partNumber: availableNumbers.partNumber,
      requestNumber: availableNumbers.requestNumber,
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
    const bidSubscription = this.bidControl.valueChanges.subscribe((value) => {
      this.componentsForm.markAllAsTouched();

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

    const counterpartSubscription =
      this.counterpartControl.valueChanges.subscribe((value) => {
        this.amountsToAssign.distributeLocalCounterpart = value;
        if (!isReadonly) {
          this.updateComponentTotals(this.componentsArray.value);
        }
      });

    const cofinancingSubscription =
      this.cofinancingControl.valueChanges.subscribe((value) => {
        this.amountsToAssign.distributeCofinancing = value;
        if (!isReadonly) {
          this.updateComponentTotals(this.componentsArray.value);
        }
      });

    this.subscriptions.add(counterpartSubscription);
    this.subscriptions.add(bidSubscription);
    this.subscriptions.add(cofinancingSubscription);
  }

  updateTotalsAtInput(): void {
    const subscription = this.componentsArray.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(() => {
        this.updateComponentTotals(this.componentsArray.value);
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

  getTransactionsDetail(projectBucketId: string) {
    const availableNumbers$ =
      this.transactionsFormService.availableRequestAndPartNumber(
        projectBucketId
      );

    const components$ = this.transactionsFormService.getTransactionComponents$(
      projectBucketId,
      this.type
    );

    return forkJoin({
      availableNumbers$,
      components$,
    });
  }

  submitSave(redirect = false, launchWorkflow = false): void {
    this.form.markAsPristine();
    this.partNumberLoading = true;
    const sub = this.transactionsFormService
      .checkPartNumbers(
        this.projectBucketId,
        this.requestDetailsForm.get('requestNumber').value,
        this.requestDetailsForm.get('partNumber').value,
        this.transactionId,
        this.requestDetailsForm,
        'requestNumber'
      )
      .pipe(
        tap((_) => (this.partNumberLoading = false)),
        mergeMap((_) => {
          if (this.form.valid) {
            this.isLoading = true;

            const requestAmountForm: AmountsJustificationForm =
              this.requestAmountsForm.getRawValue();

            const newTransactionAnjTypeRequest: AnjTransactionRequest = {
              requestDetails: this.requestDetailsForm.value,
              requestAmounts: {
                bid: requestAmountForm.bid,
                cofinancing:
                  requestAmountForm.cofinancing === null
                    ? 0
                    : requestAmountForm.cofinancing,
                localCounterpart:
                  requestAmountForm.localCounterpart === null
                    ? 0
                    : requestAmountForm.localCounterpart,
              },
              components: this.componentsArray.value,
            };

            if (
              (this.transactionId && this.transactionNumber) ||
              launchWorkflow === true
            ) {
              return this.checkWorkflowComment(
                newTransactionAnjTypeRequest,
                redirect,
                launchWorkflow
              );
            } else {
              return this.saveTransaction(newTransactionAnjTypeRequest);
            }
          }
        })
      )
      .subscribe(
        () => this.transactionsApi.resetTransactions(),
        () => (this.partNumberLoading = false)
      );

    this.subscriptions.add(sub);
  }

  saveTransaction(
    savedTransaction: AnjTransactionRequest
  ): Observable<TransactionSaveResponse | ErrorResponse> {
    return this.transactionsApi
      .saveAnjTransaction(this.projectBucketId, savedTransaction)
      .pipe(
        catchError((_) => this.displayError()),
        tap((response: TransactionSaveResponse) => {
          this.saveTransactionSuccess(response);
        }),
        exhaustMap((_) => this.transactionAddDocumentGroup())
      );
  }

  saveTransactionSuccess(response: TransactionSaveResponse): void {
    this.secondStep = true;

    this.transactionId = response.id;

    this.form.markAsUntouched();
    this.form.markAsPristine();
    this.transactionNumber = response.transactionNumbers[0];
    this.transactionNumberPrefixed = `${TransactionAnjComponent.TRANSACTION_PREFIX}${this.transactionNumber}`;
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
      this.type,
      this.transactionNumberPrefixed
    );
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

  checkWorkflowComment(
    savedTransaction: AnjTransactionRequest,
    redirect = false,
    launchWorkflow = false
  ): Observable<unknown | ErrorResponse> {
    return (launchWorkflow ? this.openModalWorkflowComment() : of('')).pipe(
      mergeMap((comment) =>
        this.updateTransaction(
          savedTransaction,
          redirect,
          launchWorkflow,
          comment
        )
      ),
      finalize(() => {
        this.isLoading = false;
      })
    );
  }

  updateTransaction(
    savedTransaction: AnjTransactionRequest,
    redirect: boolean,
    launchWorkflow: boolean,
    comment = ''
  ): Observable<unknown | ErrorResponse> {
    return this.transactionsApi
      .updateAnjTransaction(
        this.projectBucketId,
        this.transactionId,
        savedTransaction
      )
      .pipe(
        catchError((_) => this.displayError()),
        tap((_) => {
          this.updateTransactionSuccess(redirect, launchWorkflow, comment);
          this.isLoading = false;
        }),
        exhaustMap((_) => this.transactionAddDocumentGroup())
      );
  }

  transactionAddDocumentGroup(): Observable<unknown> {
    return this.transactionsApi
      .transactionAddDocumentGroup(this.transactionId, this.type, [])
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
      );
  }

  private displayError(): Observable<any> {
    this.transactionsFormService.showErrorToast('TRANSACTION.SAVE_ERROR');
    this.isLoading = false;
    return throwError(String());
  }

  updateTransactionSuccess(
    redirect = false,
    launchWorkflow = false,
    comment = ''
  ): void {
    this.secondStep = true;
    this.transactionNumberPrefixed = `${TransactionAnjComponent.TRANSACTION_PREFIX}${this.transactionNumber}`;

    if (launchWorkflow) {
      this.launchWorkflow(comment);
    }

    this.transactionsFormService.showTransacctionSuccessToast(
      'TRANSACTION.SAVE_SUCCESS',
      this.type,
      this.transactionNumberPrefixed
    );

    if (redirect) {
      this.cancelOrBack();
    }
  }

  visibilityServices(): void {
    this.visibilitySvc.setVisiblityProjectHeader(false);
    this.visibilitySvc.breadcrumbService.set('@anj', 'ANJ');
    this.visibilitySvc.breadcrumbService.set(
      '@transactions',
      'BREADCRUMB.FINALCIAL_TRANSACTIONS'
    );
  }

  cancelOrBack(): void {
    const path = this.activatedRoute.snapshot.params.id ? '../../' : '../';
    this.router.navigate([path], {
      relativeTo: this.activatedRoute,
    });
  }

  getTransactionById(transactionId: number): void {
    this.isLoadingById = true;

    const sub = this.projectStore
      .selectedProject()
      .pipe(
        filter((res: SelectedProjectState) => res.selectedProject !== null),
        mergeMap((res) =>
          this.transactionsApi.getAnjTransactionById(
            res.selectedProject.projectBucketId,
            transactionId
          )
        ),
        tap((data: TransactionAnjGetResponse) =>
          this.populateTransaction(data)
        ),
        mergeMap(() =>
          this.transactionsFormService.loadWorkflowActions(
            this.transactionId,
            this.selectedProject,
            this.type
          )
        )
      )
      .subscribe(
        () => (this.isLoadingById = false),
        () => {
          this.transactionsFormService.showErrorToast(
            'TRANSACTION.LOAD_INFO_ERROR'
          );
          this.isLoadingById = false;
        }
      );

    this.subscriptions.add(sub);
  }

  populateTransaction(data: TransactionAnjGetResponse): void {
    this.isEditMode = data.canEdit;
    this.secondStep = true;

    // DETAIL
    this.transactionNumberPrefixed = `${TransactionAnjComponent.TRANSACTION_PREFIX}${data.requestDetail.transactionNumber}`;
    this.transactionTitle = this.transactionNumberPrefixed;
    this.transactionStatusCode = data.requestDetail.status;
    this.transactionStatusService.transactionStatusId.next(
      data.requestDetail.statusId
    );
    this.transactionNumber = data.requestDetail.transactionNumber;
    this.transactionNumberId = data.requestDetail.statusId;

    this.initRequestAmountsForm(this.balances);

    this.availableNumbers.requestNumber = data.requestDetail.requestNumber;
    this.availableNumbers.partNumber = data.requestDetail.partNumber;
    this.updateTotalsAtInput();

    if (data && this.isEditMode) {
      this.amountsToAssign = {
        distributeIbd: data.requestAmount.bid,
        distributeCofinancing: data.requestAmount.cofinancing,
        distributeLocalCounterpart: data.requestAmount.localCounterpart,
      };
      this.initRequestAmountsFormListeners();
      this.updateAmountsToAssign(this.amountsToAssign);
    } else {
      const sortedComponents =
        this.transactionsFormService.sortComponentsByCodeAsc(data.components);
      const totalRow: Totals =
        this.transactionsFormService.getComponentTotals(sortedComponents);
      this.updateTotalRow(totalRow);
      this.initRequestAmountsFormListeners(true);

      this.form.disable();
    }

    this.setPermissions(data.canEdit);

    // COMPONENTS
    const sortedComponents =
      this.transactionsFormService.sortComponentsByCodeAsc(data.components);
    this.components = sortedComponents;
    this.componentsForm.get('components').patchValue(sortedComponents);

    // DETAIL
    this.requestDetailsForm.setValue({
      partNumber: data.requestDetail.partNumber,
      requestNumber: data.requestDetail.requestNumber,
    });

    // AMOUNTS
    this.requestAmountsForm.patchValue({
      bid: data.requestAmount.bid,
      localCounterpart: data.requestAmount.localCounterpart,
      cofinancing: data.requestAmount.cofinancing,
    });

    this.isLoadingById = false;
  }

  launchWorkflow(comment: string): void {
    this.partNumberLoading = true;
    const sub = this.transactionsFormService
      .checkPartNumbers(
        this.projectBucketId,
        this.requestDetailsForm.get('requestNumber').value,
        this.requestDetailsForm.get('partNumber').value,
        this.transactionId,
        this.requestDetailsForm,
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
              this.type,
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
          this.cancelOrBack();
        },
        () => (this.isLoading = false)
      );
    this.subscriptions.add(sub);
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
      this.form.disable();
    }
  }

  onOneDocumentValidation(event: boolean): void {
    this.hasMinimumDocs = event;
  }

  detailFormValueChanges(): void {
    const subPartNumber = this.requestDetailsForm
      .get('partNumber')
      .valueChanges.pipe(distinctUntilChanged())
      .subscribe(() => {
        this.requestDetailsForm
          .get('requestNumber')
          .updateValueAndValidity({ emitEvent: false });
      });

    this.subscriptions.add(subPartNumber);
  }

  canActivateTransaction(res: SelectedProjectState) {
    if (this.transactionId) {
      return of(String());
    } else {
      return this.transactionsFormService
        .canActivateTransaction(res.selectedProject.projectBucketId, this.type)
        .pipe(
          tap((res) => {
            this.canActivate = res.canActivate;
            if (!res.canActivate) {
              this.transactionsFormService.showErrorToast(res.errorMsg);
              this.cancelOrBack();
            }
          }),
          catchError((_) => {
            this.canActivate = false;
            this.transactionsFormService.showErrorToast(
              'TRANSACTION.ERRORS.GET_CARDS_VALIDATION'
            );
            this.cancelOrBack();
            return throwError(String());
          })
        );
    }
  }

  canDeactivate(): boolean | Observable<boolean | Observable<boolean>> {
    return this.canDeactivateFromGuard.openModalLogic(this.form);
  }
}
