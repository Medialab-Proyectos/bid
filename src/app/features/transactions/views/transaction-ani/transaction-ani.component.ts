import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PermissionActions, PermissionEnum } from '@core/enums';
import { CanDeactivateFromGuard } from '@core/guards/canDeactivateForm.guard';
import { Enums, Project, ErrorResponse } from '@core/models';
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
  distinctUntilChanged,
  filter,
  mergeMap,
  switchMap,
  tap,
  exhaustMap,
  finalize,
  concatMap,
} from 'rxjs/operators';
import { TransactionsTypes } from '../../enums';
import {
  AniHeaderDetail,
  AvailableNumbers,
  Beneficiary,
  BeneficiaryAntRequest,
  BeneficiaryDetails,
  BeneficiaryEmmiter,
  TransactionByIdGetResponse,
  TransactionRequest,
  TransactionSaveResponse,
} from '../../models';
import {
  FiTransactionsApiService,
  TransactionsFormService,
  TransactionStatusService,
} from '../../services';
import { PersistTransactionEditService } from '../../services/persist-transaction-edit/persist-transaction-edit.service';
import { createAntForm } from '../transaction-ant/transaction-ant.form';
import { ModalService } from '@fiduciary-interface/app/shared';

@Component({
  selector: 'fi-transaction-ani',
  templateUrl: './transaction-ani.component.html',
})
export class TransactionAniComponent
  implements OnInit, OnDestroy, AfterViewChecked
{
  private readonly subscription: Subscription = new Subscription();
  private readonly TRANSACTION_PREFIX = 'OD';

  transactionForm: UntypedFormGroup;

  enums = Enums;
  transactionId =
    this.activatedRoute.snapshot.params.id ||
    this.persistTransaction.getTransactionId;
  projectBucketId: string;
  selectedLanguage: string;
  selectedProject: Project;
  transactionTitle = 'BREADCRUMB.ANI';
  transactionType = TransactionsTypes.ANI;

  // DETAIL
  transactionNumber: string;
  transactionNumberWithPrefix: string;
  availableNumbers: AvailableNumbers = null;
  aniHeaderDetail: AniHeaderDetail;

  // AMOUNTS
  approvedCurrency$: Observable<string>;

  // BENEFICIARIES
  currencyBeneficiary: string;
  beneficiaries: Beneficiary[];
  isInvalidBeneficiary = false;
  beneficiaryEmmiter: BeneficiaryEmmiter;
  buttonReload = new Subject();

  hasMinimumDocs = false;
  isLoading = true;
  isEditMode = true;
  secondStep = false;
  isLoadingApiData = true;
  workFlowLoading: boolean;
  partNumberLoading: boolean;
  canActivate: boolean;
  skipModalLogic = false;

  displayTransactionListPermission: PermissionEnum[] = [
    PermissionEnum.TRANSACTION_MANAGEMENT,
    PermissionEnum.VIEW_DISBURSEMENT_INFORMATION,
  ];

  displayTransactionListActions: PermissionActions[] = [
    PermissionActions.TRANSACTION_ACTION,
    PermissionActions.VIEW_DISBURSEMENT_ACTION,
  ];

  get detailForm(): UntypedFormGroup {
    return this.transactionForm.get('detailForm') as UntypedFormGroup;
  }

  get amountsForm(): UntypedFormGroup {
    return this.transactionForm.get('ammountsForm') as UntypedFormGroup;
  }

  get beneficiaryForm(): UntypedFormGroup {
    return this.transactionForm.get('beneficiaryForm') as UntypedFormGroup;
  }

  get bankFlowIdControl(): UntypedFormControl {
    return this.beneficiaryForm.get('bankFlowId') as UntypedFormControl;
  }

  constructor(
    private readonly storePreferences: Store<AppStateWithUsrPreferences>,
    readonly persistTransaction: PersistTransactionEditService,
    readonly transactionsFormService: TransactionsFormService,
    private readonly changeDectector: ChangeDetectorRef,
    private readonly permissionActions: ActionsService,
    readonly transactionsSvc: FiTransactionsApiService,
    private readonly visibilitySvc: VisibilityService,
    readonly projectStoreSvc: ProjectStoreService,
    readonly activatedRoute: ActivatedRoute,
    readonly router: Router,
    private readonly canDeactivateFromGuard: CanDeactivateFromGuard,
    public readonly transactionStatusService: TransactionStatusService,
    readonly fiModalSvc: ModalService
  ) {
    const sub = router.events.subscribe(() => {
      this.persistTransaction._transactionId = 0;
    });
    this.subscription.add(sub);
  }

  ngOnInit(): void {
    this.transactionStatusService.transactionStatusId.next(0);
    this.transactionForm = createAntForm();

    this.getCurrentLang();
    this.visibilityServices();
    this.loadSelectedProject();

    this.amountsValueChanges();
    this.detailFormValueChanges();

    this.approvedCurrency$ = this.transactionsFormService.getApprovedCurrency();

    this.transactionId = this.persistTransaction.verifityTransactionId(
      this.transactionId
    );

    if (this.transactionId) {
      this.persistTransaction.setTransactionId(this.transactionId);
      this.displayTransactionListActions.push(PermissionActions.IS_EDIT);
    } else {
      this.isLoadingApiData = false;
      this.displayTransactionListActions.push(PermissionActions.IS_CREATE);
    }

    this.setReadOnly();
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
    this.visibilitySvc.breadcrumbService.set('@ani', 'ANI');
    this.visibilitySvc.breadcrumbService.set(
      '@transactions',
      'BREADCRUMB.FINALCIAL_TRANSACTIONS'
    );
  }

  getCurrentLang(): void {
    const sub = this.storePreferences
      .select('preferences')
      .subscribe((data) => {
        if (data && data.preferences.preferredLanguage) {
          this.selectedLanguage = data.preferences.preferredLanguage;
        }
      });
    this.subscription.add(sub);
  }

  cancelOrBackTransaction(skipModalLogic = false): void {
    const path = this.activatedRoute.snapshot.params.id ? '../../' : '../';
    this.router
      .navigate([path], {
        relativeTo: this.activatedRoute,
      })
      .then(() => {
        if (skipModalLogic) {
          this.skipModalLogic = false;
        }
      });
  }

  loadSelectedProject(): void {
    this.isLoading = true;
    const subscription = this.projectStoreSvc
      .selectedProject()
      .pipe(
        filter((res) => res.selectedProject !== null),
        mergeMap((res) => {
          this.projectBucketId = res.selectedProject.projectBucketId;
          this.selectedProject = res.selectedProject;
          return this.canActivateTransaction(res);
        }),
        mergeMap((_res) => {
          return this.getTransactionsDetail(this.projectBucketId);
        }),
        tap((data) => {
          this.beneficiaries = data.beneficiaries$;
          this.aniHeaderDetail = data.aniHeaderDetail$;
          this.getAvailableNumbersSuccess(data.availableNumbers$);
        }),
        mergeMap(() => {
          if (this.transactionId) {
            this.isLoadingApiData = true;

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
          this.transactionsFormService.showErrorToast(
            'TRANSACTION.LOAD_INFO_ERROR'
          );
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
    const beneficiaries$ =
      this.transactionsFormService.getBeneficiaries$(projectBucketId);

    const aniHeaderDetail$ = this.transactionsSvc.getAniHeaderDetail(
      projectBucketId,
      this.transactionType
    );

    return forkJoin({
      availableNumbers$,
      beneficiaries$,
      aniHeaderDetail$,
    });
  }

  getAvailableNumbersSuccess(availableNumbers: AvailableNumbers): void {
    this.availableNumbers = availableNumbers;

    this.detailForm.setValue({
      partNumber: this.aniHeaderDetail.requestAntDetails.partNumber + 1,
      requestNumber: this.aniHeaderDetail.requestAntDetails.requestNumber,
    });
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

  setBeneficiaryCountry(projectBucketId: string, bankFlowId: string): void {
    this.transactionsSvc
      .getBeneficiaryDetail(projectBucketId, bankFlowId)
      .subscribe((data: BeneficiaryDetails) =>
        this.beneficiaryForm
          .get('country')
          .setValue(data?.beneficiaryBasicData?.country)
      );
  }

  amountsValueChanges(): void {
    const sub = this.amountsForm
      .get('requestedCurrency')
      .valueChanges.subscribe(() =>
        this.onBeneficiaryChange(this.beneficiaryEmmiter)
      );
    this.subscription.add(sub);
  }

  detailFormValueChanges(): void {
    const subPartNumber = this.detailForm
      .get('partNumber')
      .valueChanges.pipe(distinctUntilChanged())
      .subscribe(() =>
        this.detailForm
          .get('requestNumber')
          .updateValueAndValidity({ emitEvent: false })
      );
    this.subscription.add(subPartNumber);
  }

  onOneDocumentValidation(event: boolean): void {
    this.hasMinimumDocs = event;
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

  submitSave(redirect: boolean, launchWorkflow = false): void {
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
          if (this.transactionForm.valid) {
            this.isLoading = true;

            const requestDetails = this.detailForm.getRawValue();
            const {
              requestedCurrency,
              requestedAmount,
              equivalentApprovedCurrency,
            } = this.amountsForm.getRawValue();

            const beneficiary = this.setBeneficiaryRequest();

            const transactionRequest: TransactionRequest = {
              requestDetails: {
                partNumber: requestDetails.partNumber,
                requestNumber: requestDetails.requestNumber,
                numberDaysFinancialPlanning:
                  this.aniHeaderDetail.requestAntDetails
                    .numberDaysFinancialPlanning,
              },
              requestAntAmounts: {
                equivalentApprovedCurrency,
                requestedCurrency: requestedCurrency.currency,
                requiredAmount: requestedAmount,
              },
              beneficiary,
              requestJustAmounts: null,
              requestTotalsAmount: null,
              components: null,
              requestAntAndJustDetail: null,
              documents: this.aniHeaderDetail.documents,
            };

            if (this.transactionId || launchWorkflow === true) {
              return this.updateTransaction(
                transactionRequest,
                redirect,
                launchWorkflow
              );
            } else {
              return this.saveTransaction(transactionRequest);
            }
          }
        })
      )
      .subscribe(
        () => this.transactionsSvc.resetTransactions(),
        () => (this.partNumberLoading = false)
      );
    this.subscription.add(sub);
  }

  setBeneficiaryRequest(): BeneficiaryAntRequest {
    return {
      numberId: this.beneficiaryForm.get('numberId')?.value,
      bankFlowId: this.beneficiaryForm.get('bankFlowId')?.value,
      country: this.beneficiaryForm.get('country')?.value,
      acronym: this.beneficiaryForm.get('acronym')?.value,
      institutionName: this.beneficiaryForm.get('institutionName')?.value,
    };
  }

  saveTransaction(
    savedTransaction: TransactionRequest
  ): Observable<TransactionSaveResponse | ErrorResponse> {
    return this.transactionsSvc
      .postTransactionById(
        this.projectBucketId,
        this.transactionType,
        savedTransaction
      )
      .pipe(
        catchError((_) => {
          this.transactionsFormService.showErrorToast('TRANSACTION.SAVE_ERROR');
          this.isLoading = false;
          return throwError(String());
        }),
        tap((response: TransactionSaveResponse) =>
          this.saveTransactionSuccess(response)
        ),
        exhaustMap((_) => this.transactionAddDocumentGroup())
      );
  }

  saveTransactionSuccess(response: TransactionSaveResponse): void {
    this.isLoading = false;

    this.secondStep = true;
    this.transactionId = response.id;
    this.transactionNumber = response.transactionNumbers[0];
    this.transactionNumberWithPrefix = `${this.TRANSACTION_PREFIX}${this.transactionNumber}`;

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
      this.transactionNumberWithPrefix
    );
  }

  updateTransaction(
    savedTransaction: TransactionRequest,
    redirect: boolean,
    launchWorkflow = false
  ): Observable<unknown> {
    return this.openModalWorkflowComment().pipe(
      mergeMap((comment) => {
        return this.transactionsSvc
          .updateTransactionById(
            this.projectBucketId,
            this.transactionId,
            this.transactionType,
            savedTransaction
          )
          .pipe(
            catchError((_) => {
              this.transactionsFormService.showErrorToast(
                'TRANSACTION.SAVE_ERROR'
              );
              this.isLoading = false;
              return throwError(String());
            }),
            exhaustMap((_) => this.transactionAddDocumentGroup()),
            tap((_) => {
              this.updateTransactionSuccess(redirect, launchWorkflow, comment);
              this.isLoading = false;
            })
          );
      }),
      finalize(() => {
        this.isLoading = false;
      })
    );
  }

  transactionAddDocumentGroup(): Observable<unknown> {
    return this.transactionsSvc
      .transactionAddDocumentGroup(
        this.transactionId,
        this.transactionType,
        this.aniHeaderDetail.documents
      )
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
      this.transactionNumberWithPrefix
    );

    if (launchWorkflow === false && redirect) {
      this.cancelOrBackTransaction();
    }
  }

  launchWorkflow(comment: string): void {
    this.partNumberLoading = true;
    this.skipModalLogic = true;
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
          }
        })
      )
      .subscribe(
        () => {
          this.isLoading = false;
          this.cancelOrBackTransaction(true);
        },
        () => (this.isLoading = false)
      );
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

  setReadOnly(): void {
    const subscription = this.permissionActions.readOnly$.subscribe(
      (readOnly) => {
        if (readOnly && this.transactionForm.disabled === false) {
          this.isEditMode = false;
          this.detailForm.disable();
          this.beneficiaryForm.disable();
        }
      }
    );
    this.subscription.add(subscription);
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
          this.transactionId = response.transactionId;

          this.isEditMode = response.canEdit;
          this.secondStep = true;

          this.setPermissions(response.canEdit);
          this.setDetailsFormSection(response);
          this.setAntAmountsSection(response);

          if (response.beneficiary.bankFlowId) {
            this.setBeneficiaryFormSection(response);
          }

          if (!this.isEditMode) {
            this.transactionForm.disable();
            this.beneficiaries = [response.beneficiary];
          }
          this.isLoadingApiData = false;
        }),
        catchError((_) => {
          this.isLoadingApiData = false;
          return throwError(String());
        })
      );
  }

  setDetailsFormSection(response: TransactionByIdGetResponse): void {
    this.transactionStatusService.transactionStatusId.next(
      response.requestDetail.statusId
    );
    this.transactionNumber = response.transactionNumber;
    this.transactionNumberWithPrefix = `${this.TRANSACTION_PREFIX}${response.transactionNumber}`;
    this.transactionTitle = this.transactionNumberWithPrefix;
    this.availableNumbers.requestNumber = response.requestDetail.requestNumber;
    this.availableNumbers.partNumber = response.requestDetail.partNumber;

    this.detailForm.setValue({
      partNumber: response.requestDetail.partNumber,
      requestNumber: response.requestDetail.requestNumber,
    });
  }

  setBeneficiaryFormSection(response: TransactionByIdGetResponse): void {
    this.beneficiaryForm.patchValue({
      bankFlowId: response.beneficiary.bankFlowId,
      acronym: response.beneficiary.acronym,
      institutionName: response.beneficiary.institutionName,
      numberId: response.beneficiary.beneficiaryId,
    });

    this.setBeneficiaryCountry(
      this.projectBucketId,
      response.beneficiary.bankFlowId
    );
  }

  setAntAmountsSection(response: TransactionByIdGetResponse): void {
    this.amountsForm.patchValue({
      requestedCurrency: response.requestAntAmount.requestedCurrency,
      requestedAmount: response.requestAntAmount.requiredAmount,
      equivalentApprovedCurrency:
        response.requestAntAmount.equivalentApprovedCurrency,
    });
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
      .subscribe((beneficiary) => (this.beneficiaries = beneficiary));
  }

  canDeactivate(): boolean | Observable<boolean | Observable<boolean>> {
    return this.canDeactivateFromGuard.openModalLogic(
      this.transactionForm,
      this.skipModalLogic
    );
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
}
