import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormControl,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  forkJoin,
  Observable,
  Subject,
  of,
  Subscription,
  throwError,
  timer,
} from 'rxjs';
import { VisibilityService } from '@core/services/view';
import {
  FiTransactionsApiService,
  TransactionsFormService,
  TransactionStatusService,
} from '../../services';
import { ProjectStoreService } from '@core/services/store-services';
import { TransactionsTypes } from '../../enums';
import {
  Beneficiary,
  BeneficiaryAntRequest,
  AntTransactionRequest,
  TransactionAntResponse,
  TransactionSaveResponse,
  BeneficiaryDetails,
  BeneficiaryEmmiter,
  AvailableNumbers,
} from '../../models';
import {
  catchError,
  concatMap,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  mergeMap,
  switchMap,
  tap,
} from 'rxjs/operators';
import { AppStateWithUsrPreferences, SelectedProjectState } from '@core/store';
import { createAntForm } from './transaction-ant.form';
import { PermissionActions, PermissionEnum } from '@core/enums';
import { Enums } from '@core/models/responses/get-enums-response';
import { Store } from '@ngrx/store';
import { Project } from '@core/models';
import { ActionsService } from '@core/services/app/actions/actions.service';
import { PersistTransactionEditService } from '../../services/persist-transaction-edit/persist-transaction-edit.service';
import { CanDeactivateFromGuard } from '@core/guards/canDeactivateForm.guard';
import { ModalService } from '@fiduciary-interface/app/shared';

@Component({
  selector: 'fi-transaction-ant',
  templateUrl: './transaction-ant.component.html',
})
export class TransactionAntComponent implements OnInit, OnDestroy {
  private readonly subscription: Subscription = new Subscription();
  private static readonly TRANSACTION_PREFIX = 'OD';

  transactionForm: UntypedFormGroup;

  enums = Enums;
  transactionId: number;
  projectBucketId: string;
  transactionTitle: string;
  selectedLanguage: string;
  selectedProject: Project;
  transactionType = TransactionsTypes.ANT;

  // DETAIL
  transactionNumber: string;
  transactionStatusCode: string;
  transactionNumberWithPrefix: string;
  availableNumbers: AvailableNumbers = null;

  // AMOUNTS
  approvedCurrency$: Observable<string>;
  approvedCurrency: string;

  // BENEFICIARIES
  currencyBeneficiary: string;
  beneficiaries: Beneficiary[];
  currentBeneficiaries: Beneficiary;
  isInvalidBeneficiary = false;
  beneficiaryEmmiter: BeneficiaryEmmiter;
  buttonReload = new Subject();

  hasMinimumDocs = false;
  isLoading = true;
  isEditMode = true;
  secondStep = false;
  canActivate = true;
  isLoadingApiData = true;
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
    readonly persistTransaction: PersistTransactionEditService,
    readonly transactionsFormService: TransactionsFormService,
    private readonly permissionActions: ActionsService,
    readonly transactionsSvc: FiTransactionsApiService,
    readonly projectStoreSvc: ProjectStoreService,
    readonly changeDectector: ChangeDetectorRef,
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

  get transaction(): UntypedFormGroup {
    return this.transactionForm;
  }

  get detail(): UntypedFormGroup {
    return this.transactionForm.get('detailForm') as UntypedFormGroup;
  }

  get amounts(): UntypedFormGroup {
    return this.transactionForm.get('ammountsForm') as UntypedFormGroup;
  }

  get beneficiary(): UntypedFormGroup {
    return this.transactionForm.get('beneficiaryForm') as UntypedFormGroup;
  }

  get bankFlowIdControl(): UntypedFormControl {
    return this.beneficiary.get('bankFlowId') as UntypedFormControl;
  }

  ngOnInit(): void {
    this.transactionId =
      this.activatedRoute.snapshot.params.id ||
      this.persistTransaction.getTransactionId;
    this.transactionStatusService.transactionStatusId.next(0);

    this.transactionForm = createAntForm();
    this.detail.addControl(
      'numberDaysFinancialPlanning',
      new UntypedFormControl(180, Validators.required)
    );

    this.visibilityServices();
    this.loadSelectedProject();
    this.getCurrentLang();
    this.amountsValueChanges();
    this.detailFormValueChanges();

    this.approvedCurrency$ = this.transactionsFormService
      .getApprovedCurrency()
      .pipe(map((currency) => (this.approvedCurrency = currency)));

    this.transactionId = this.persistTransaction.verifityTransactionId(
      this.transactionId
    );

    if (this.transactionId) {
      this.persistTransaction.setTransactionId(this.transactionId);

      this.getTransactionById(this.transactionId);
      this.displayTransactionListActions.push(PermissionActions.IS_EDIT);
    } else {
      this.isLoadingApiData = false;
      this.transactionTitle = 'BREADCRUMB.ANT';
      this.displayTransactionListActions.push(PermissionActions.IS_CREATE);
    }

    this.reloadLogic();
  }

  ngAfterViewChecked(): void {
    this.changeDectector.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  visibilityServices(): void {
    this.visibilitySvc.setVisiblityProjectHeader(false);
    this.visibilitySvc.breadcrumbService.set('@ant', 'ANT');
    this.visibilitySvc.breadcrumbService.set(
      '@transactions',
      'BREADCRUMB.FINALCIAL_TRANSACTIONS'
    );
  }

  loadSelectedProject(): void {
    this.isLoading = true;
    const subscription = this.projectStoreSvc
      .selectedProject()
      .pipe(
        filter((res: SelectedProjectState) => res.selectedProject !== null),
        mergeMap((res) => {
          this.selectedProject = res.selectedProject;
          return this.canActivateTransaction(res);
        }),
        mergeMap((_res) => {
          return this.getTransactionsDetail(
            this.selectedProject.projectBucketId
          );
        }),
        tap((data) => {
          this.getAvailableNumbersSuccess(data.availableNumbers$);
          this.beneficiaries = data.beneficiaries$;
        })
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
    this.projectBucketId = projectBucketId;

    const availableNumbers$ =
      this.transactionsFormService.availableRequestAndPartNumber(
        projectBucketId
      );
    const beneficiaries$ =
      this.transactionsFormService.getBeneficiaries$(projectBucketId);

    return forkJoin({
      availableNumbers$,
      beneficiaries$,
    });
  }

  getAvailableNumbersSuccess(availableNumbers: AvailableNumbers): void {
    this.availableNumbers = availableNumbers;

    this.detail.patchValue({
      partNumber: availableNumbers.partNumber,
      requestNumber: availableNumbers.requestNumber,
    });
  }

  getTransactionById(transactionId: number): void {
    this.isLoading = true;
    const sub = this.projectStoreSvc
      .selectedProject()
      .pipe(
        filter((res: SelectedProjectState) => res.selectedProject !== null),
        mergeMap((res) => {
          this.projectBucketId = res.selectedProject.projectBucketId;

          return this.transactionsSvc.getAntTransactionById(
            res.selectedProject.projectBucketId,
            transactionId
          );
        }),
        tap((data: TransactionAntResponse) => {
          this.populateTransaction(data);
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
        () => {
          this.isLoading = false;
          this.isLoadingApiData = false;
        },
        () => {
          this.transactionsFormService.showErrorToast(
            'TRANSACTION.LOAD_INFO_ERROR'
          );
          this.isLoading = false;
          this.isLoadingApiData = false;
        }
      );
    this.subscription.add(sub);
  }

  populateTransaction(data: TransactionAntResponse): void {
    this.isEditMode = data.canEdit;
    this.secondStep = true;

    this.transactionNumber = data.requestDetail.transactionNumber;
    this.transactionNumberWithPrefix = `${TransactionAntComponent.TRANSACTION_PREFIX}${data.requestDetail.transactionNumber}`;
    this.transactionStatusCode = data.requestDetail.status;
    this.transactionStatusService.transactionStatusId.next(
      data.requestDetail.statusId
    );
    this.transactionTitle = this.transactionNumberWithPrefix;

    this.availableNumbers.requestNumber = data.requestDetail.requestNumber;
    this.availableNumbers.partNumber = data.requestDetail.partNumber;

    this.setPermissions(data.canEdit);

    this.detail.setValue({
      partNumber: data.requestDetail.partNumber,
      requestNumber: data.requestDetail.requestNumber,
      numberDaysFinancialPlanning:
        data.requestDetail.numberDaysFinancialPlanning,
    });

    this.amounts.setValue({
      requestedCurrency: data.requestAmount.requestedCurrency,
      requestedAmount: data.requestAmount.requiredAmount,
      equivalentApprovedCurrency: data.requestAmount.equivalentApprovedCurrency,
      expectedBalance: data.requestAmount.availableBalance,
    });

    if (data.beneficiary.bankFlowId) {
      this.currentBeneficiaries = data.beneficiary;
      this.beneficiary.patchValue({
        bankFlowId: data.beneficiary.bankFlowId,
        numberId: data.beneficiary.beneficiaryId,
      });
      this.setBeneficiaryCountry(
        this.projectBucketId,
        data.beneficiary.bankFlowId
      );
    }

    if (!this.isEditMode) {
      this.transactionForm.disable();
      this.beneficiaries = [data.beneficiary];
    }

    this.isLoadingApiData = false;
  }

  cancelOrBackTransaction(): void {
    const path = this.activatedRoute.snapshot.params.id ? '../../' : '../';
    this.router.navigate([path], {
      relativeTo: this.activatedRoute,
    });
  }

  submitSave(redirect = false, launchWorkflow = false): void {
    this.transactionForm.markAsPristine();
    this.partNumberLoading = true;
    this.transactionsFormService
      .checkPartNumbers(
        this.projectBucketId,
        this.detail.get('requestNumber').value,
        this.detail.get('partNumber').value,
        this.transactionId,
        this.detail,
        'requestNumber'
      )
      .subscribe(
        () => {
          this.partNumberLoading = false;

          if (this.transactionForm.valid) {
            this.isLoading = true;

            const {
              requestedCurrency,
              requestedAmount,
              equivalentApprovedCurrency,
            } = this.amounts.getRawValue();

            const requestAmounts = {
              requestedCurrency: requestedCurrency.currency,
              requiredAmount: requestedAmount,
              equivalentApprovedCurrency,
            };

            const beneficiary: BeneficiaryAntRequest = {
              numberId: this.beneficiary.get('numberId')?.value,
              bankFlowId: this.beneficiary.get('bankFlowId')?.value,
              country: this.beneficiary.get('country')?.value,
            };
            const savedTransaction: AntTransactionRequest = {
              requestDetails: {
                partNumber: this.detail.get('partNumber')?.value,
                requestNumber: this.detail.get('requestNumber')?.value,
                numberDaysFinancialPlanning: this.detail.get(
                  'numberDaysFinancialPlanning'
                )?.value,
              },
              requestAmounts,
              beneficiary,
            };

            if (
              (this.transactionId && this.transactionNumber) ||
              launchWorkflow === true
            ) {
              this.checkWorkflowComment(
                savedTransaction,
                redirect,
                launchWorkflow
              );
            } else {
              this.saveTransaction(savedTransaction);
            }
          }
        },
        () => (this.partNumberLoading = false)
      );
  }

  saveTransaction(savedTransaction: AntTransactionRequest): void {
    const sub = this.transactionsSvc
      .saveNewAntTransaction(this.projectBucketId, savedTransaction)
      .subscribe(
        (response: TransactionSaveResponse) => {
          this.saveTransactionSuccess(response);
          this.transactionAddDocumentGroup();
        },
        () => {
          this.transactionsFormService.showErrorToast('TRANSACTION.SAVE_ERROR');
        }
      )
      .add(() => (this.isLoading = false));
    this.subscription.add(sub);
  }

  saveTransactionSuccess(response: TransactionSaveResponse): void {
    this.transactionForm.markAsUntouched();
    this.transactionForm.markAsPristine();

    this.secondStep = true;
    this.transactionId = response.id;
    this.transactionNumber = response.transactionNumbers[0];
    this.transactionNumberWithPrefix = `${TransactionAntComponent.TRANSACTION_PREFIX}${this.transactionNumber}`;
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
    this.transactionsSvc.resetTransactions();
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
    savedTransaction: AntTransactionRequest,
    redirect = false,
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
    savedTransaction: AntTransactionRequest,
    redirect = false,
    launchWorkflow = false,
    comment = ''
  ): void {
    this.transactionsSvc
      .updateAntTransaction(
        this.projectBucketId,
        this.transactionId,
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
    redirect = false,
    launchWorkflow = false,
    comment = ''
  ): void {
    this.transactionForm.markAsUntouched();
    this.transactionForm.markAsPristine();
    this.secondStep = true;

    this.transactionNumberWithPrefix = `${TransactionAntComponent.TRANSACTION_PREFIX}${this.transactionNumber}`;

    if (launchWorkflow) {
      this.launchWorkflow(comment);
    }

    this.transactionsFormService.showTransacctionSuccessToast(
      'TRANSACTION.SAVE_SUCCESS',
      this.transactionType,
      this.transactionNumber
    );

    if (redirect) {
      this.cancelOrBackTransaction();
    }
    this.transactionsSvc.resetTransactions();
  }

  transactionAddDocumentGroup(): void {
    this.transactionsSvc
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

  onBeneficiaryChange(emmiter: BeneficiaryEmmiter): void {
    if (!emmiter) {
      const accountCurrency =
        this.amounts.get('requestedCurrency').value.currency;
      const bankFlowId = this.bankFlowIdControl.value;

      emmiter = {
        accountCurrency,
        bankFlowId,
      };
    }

    this.beneficiaryEmmiter = emmiter;
  }

  setBeneficiaryCountry(projectBucketId: string, bankFlowId: string): void {
    this.transactionsSvc
      .getBeneficiaryDetail(projectBucketId, bankFlowId)
      .subscribe((data: BeneficiaryDetails) =>
        this.beneficiary
          .get('country')
          .setValue(data?.beneficiaryBasicData?.country)
      );
  }

  amountsValueChanges(): void {
    const sub = this.amounts
      .get('requestedCurrency')
      .valueChanges.subscribe(() => {
        this.onBeneficiaryChange(this.beneficiaryEmmiter);
      });
    this.subscription.add(sub);
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
    if (readOnly && this.transactionForm.disabled === false) {
      this.isEditMode = false;
      this.detail.disable();
      this.beneficiary.disable();
    }
  }

  launchWorkflow(comment: string): void {
    this.partNumberLoading = true;
    const sub = this.transactionsFormService
      .checkPartNumbers(
        this.projectBucketId,
        this.detail.get('requestNumber').value,
        this.detail.get('partNumber').value,
        this.transactionId,
        this.detail,
        'requestNumber'
      )
      .pipe(
        tap((_) => (this.partNumberLoading = false)),
        mergeMap((_) => {
          if (this.transactionForm.valid) {
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
          this.cancelOrBackTransaction();
        },
        () => (this.isLoading = false)
      );
    this.subscription.add(sub);
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
    this.subscription.add(sub);
  }

  detailFormValueChanges(): void {
    const subPartNumber = this.detail
      .get('partNumber')
      .valueChanges.pipe(distinctUntilChanged())
      .subscribe(() => {
        this.detail
          .get('requestNumber')
          .updateValueAndValidity({ emitEvent: false });
      });

    this.subscription.add(subPartNumber);
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
              this.cancelOrBackTransaction();
            }
          }),
          catchError((_) => {
            this.canActivate = false;
            this.transactionsFormService.showErrorToast(
              'TRANSACTION.ERRORS.GET_CARDS_VALIDATION'
            );
            this.cancelOrBackTransaction();
            return throwError(String());
          })
        );
    }
  }

  canDeactivate(): boolean | Observable<boolean | Observable<boolean>> {
    return this.canDeactivateFromGuard.openModalLogic(this.transactionForm);
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
          this.beneficiary.patchValue({
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
