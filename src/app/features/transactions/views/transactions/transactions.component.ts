import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { VisibilityService } from '@core/services/view';
import {
  EnumsStoreService,
  ProjectStoreService,
} from '@core/services/store-services';
import {
  TransactionEventEmitter,
  Transaction,
  TransactionGetResponse,
} from '../../models';
import { TransactionAction, TransactionsStatus } from '../../enums';
import {
  FiTransactionsApiService,
  TransactionsFormService,
} from '../../services';
import { map, filter, switchMap, tap } from 'rxjs/operators';
import {
  AppState,
  AppStateWithActivitiesSelectedProject,
  AppStateWithSelectedProject,
  SelectedProjectState,
} from '@core/store';
import {
  Contact,
  DialogResponse,
  Enumerator,
  ModalOptions,
  Project,
} from '@core/models';
import { DialogReturn, ModalService } from '@fiduciary-interface/app/shared';
import { PermissionActions, PermissionEnum } from '@core/enums';
import { WorkflowODApiService } from '@fiduciary-interface/app/features/workflow/services';
import { WorkflowConfig } from '@fiduciary-interface/app/features/workflow/models';
import { TranslateService } from '@ngx-translate/core';
import { TranslateEnumPipe } from '@fiduciary-interface/app/shared/pipes/translate-enum.pipe';
import { WorkflowStoreService } from '@fiduciary-interface/app/features/workflow/store/services/workflow-store.service';
import { ActionsService } from '@core/services/app/actions/actions.service';
import { IFDatePipe } from '@fiduciary-interface/app/shared/pipes/if-date-pipe.pipe';
import { MaskingStatusPipe } from '../../pipes/masking-status.pipe';
import { Store } from '@ngrx/store';
import * as selectedProjectActions from '@core/store/selectedProject/actions/selectedProject.actions';
import * as activitiesSelectedProjectActions from '@core/store/activitiesSelectedProject/actions/activitiesSelectedProject.actions';
import { PermissionService } from '@core/services/app/permission/permission.service';

@Component({
  selector: 'fi-transactions',
  templateUrl: './transactions.component.html',
})
export class TransactionsComponent implements OnInit, OnDestroy {
  readonly subscriptionsCollection: Subscription[] = [];

  transactions: Transaction[] = [];
  projectCode: number;
  projectBucketId: string;

  startActionPermission = [PermissionActions.WORKFLOW_PERMISSION];
  displayTransactionListPermission = [
    PermissionEnum.TRANSACTION_MANAGEMENT,
    PermissionEnum.VIEW_DISBURSEMENT_INFORMATION,
  ];
  isStartTransactionDisabled = true;
  transactionButtonDisabled = false;
  isWorkflowLoading = false;
  isLoading = true;
  contract: Contact;

  enumTransactionStatus: Enumerator[];
  projectCollection: Project[] = [];
  hasPermissionDisplayTransaction: boolean = false;

  constructor(
    readonly transactionsFormService: TransactionsFormService,
    readonly fiTransactionsApiService: FiTransactionsApiService,
    private readonly workflowStoreService: WorkflowStoreService,
    private readonly actionsService: ActionsService,
    private readonly visibilitySvc: VisibilityService,
    readonly workflowODApiService: WorkflowODApiService,
    private readonly translateEnum: TranslateEnumPipe,
    private readonly maskingStatus: MaskingStatusPipe,
    readonly projectStoreSvc: ProjectStoreService,
    readonly enumsStoreService: EnumsStoreService,
    private readonly activeRoute: ActivatedRoute,
    private readonly ifdatePipe: IFDatePipe,
    readonly translate: TranslateService,
    readonly fiModalSvc: ModalService,
    readonly router: Router,
    readonly storeProject: ProjectStoreService,
    readonly activatedRoute: ActivatedRoute,
    readonly store: Store<AppState>,
    readonly storeSelectedProject: Store<AppStateWithSelectedProject>,
    readonly storeActivitiesSelectedProject: Store<AppStateWithActivitiesSelectedProject>,
    readonly permissionSvc: PermissionService
  ) {
    const contractSubscription = this.workflowStoreService
      .getCurrentUser()
      .subscribe((user) => {
        this.contract = user.contact;
      });
    const readOnlySubscription = this.actionsService.readOnly$.subscribe(
      (readOnly) => {
        this.transactionButtonDisabled = !readOnly;
      }
    );
    this.subscriptionsCollection.push(contractSubscription);
    this.subscriptionsCollection.push(readOnlySubscription);
  }

  ngOnInit(): void {
    this.getEnums();
    this.loadTransactionsTable();
    this.visibilityServices();
    this.verifySelectedProjectPermissions();
  }

  ngOnDestroy(): void {
    this.subscriptionsCollection.forEach((el) => {
      el.unsubscribe();
    });
  }

  startTransaction(): void {
    this.router.navigate(['new-transaction'], {
      relativeTo: this.activeRoute,
    });
  }

  loadTransactionsTable(): void {
    const sub = this.projectStoreSvc
      .projects()
      .pipe(
        filter((data) => data.projects !== null && data.projects.length > 0)
      )
      .subscribe(() => {
        this.setSelectedProject();
      });

    const subs = this.projectStoreSvc
      .selectedProject()
      .pipe(filter((data) => data.selectedProject !== null))
      .subscribe(() => this.processSelectedProject());

    this.subscriptionsCollection.push(sub);
    this.subscriptionsCollection.push(subs);
  }

  setSelectedProject(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('code');
    const contract = this.activatedRoute.snapshot.paramMap
      .get('contract')
      .replace('%2F', '/');

    const sub = this.storeProject.projects().subscribe((res) => {
      this.isLoading = res.loading;
      if (res && res.projects) {
        this.projectCollection = res.projects.filter((el) => {
          return el.operationNumber === id && el.contract === contract;
        });
        if (this.projectCollection && this.projectCollection.length > 0) {
          this.store.dispatch(
            selectedProjectActions.setSelectedProjectSuccess({
              SelectedProject: this.projectCollection[0],
            })
          );
          this.storeActivitiesSelectedProject.dispatch(
            activitiesSelectedProjectActions.setActivitiesSelectedProjectBucketId(
              {
                ActivitiesSelectedProjectBucketId:
                  this.projectCollection[0].projectBucketId,
              }
            )
          );
        }
      }
    });

    this.subscriptionsCollection.push(sub);
  }

  processSelectedProject(): void {
    const sub = this.projectStoreSvc
      .selectedProject()
      .pipe(
        filter((res: SelectedProjectState) => res.selectedProject !== null),
        switchMap((res: SelectedProjectState) => {
          this.projectBucketId = res.selectedProject.projectBucketId;
          return this.fiTransactionsApiService
            .getProjectTransactions(res.selectedProject.projectBucketId)
            .pipe(map((data: TransactionGetResponse) => data.transactions));
        }),
        map((transaction) => this.mapTransactionData(transaction)),
        switchMap((transaction) => this.mapTransactionActions(transaction))
      )
      .subscribe({
        next: (transaction) => {
          this.transactions = transaction;
          this.isLoading = false;
        },
        error: () => {
          this.transactionsFormService.showErrorToast(
            'TRANSACTION.ERRORS.LIST'
          );
          this.isLoading = false;
        },
      });

    this.subscriptionsCollection.push(sub);
  }

  mapTransactionData(transactions: Transaction[]): Transaction[] {
    transactions = transactions.map((transaction) => {
      transaction.approvalDateFormatted = this.ifdatePipe.transform(
        transaction.approvalDate
      );
      transaction.lastUpdateFormatted = this.ifdatePipe.transform(
        transaction.lastUpdate
      );
      transaction.valueDateFormatted = this.ifdatePipe.transform(
        transaction.valueDate
      );

      transaction.statusEnum = this.translateEnum.getEnumByNumber(
        this.maskingStatus.transform(transaction.transactionStatusId),
        this.enumTransactionStatus
      );
      transaction.transactionStatusTranslated = this.translate.instant(
        transaction.statusEnum.name
      );

      const translatedTransaction = this.translate.instant(
        transaction.transactionTypeCode
      );
      transaction.transactionTypeFormatted = `${translatedTransaction} (${transaction.transactionTypeCode})`;

      if (transaction.transactionNumber.charAt(0) !== 'O') {
        transaction.transactionNumber = `OD${transaction.transactionNumber}`;
      }

      return transaction;
    });

    return transactions;
  }

  mapTransactionActions(transactions: Transaction[]) {
    this.isLoading = true;
    return this.checkworkFlowConfig(this.projectBucketId)
      .pipe(
        tap(() => {
          this.isLoading = false;
        })
      )
      .pipe(
        map((isExistsInWorkflow) => {
          const mapData = transactions.map((transaction) => {
            const actions = [...transaction.transactionActions];

            const mapActions = actions
              .map((action) => {
                switch (action.value) {
                  case TransactionAction.DELETE:
                    if (
                      transaction.transactionStatusId ===
                        TransactionsStatus.COMPLETED ||
                      isExistsInWorkflow === false
                    ) {
                      action.permissions = [
                        PermissionActions.WORKFLOW_MANAGEMENT,
                      ];
                      return action;
                    } else {
                      action.permissions = [
                        PermissionActions.WORKFLOW_PERMISSION,
                      ];
                      return action;
                    }
                  default:
                    return action;
                }
              })
              .map((action) => {
                if (
                  action?.permissions?.includes(
                    PermissionActions.WORKFLOW_MANAGEMENT
                  )
                ) {
                  return null;
                } else {
                  return action;
                }
              })
              .filter((action) => action !== null);

            return { ...transaction, transactionActions: mapActions };
          });

          return mapData;
        })
      );
  }

  getEnums(): void {
    const sub = this.enumsStoreService
      .selectEnums()
      .subscribe(
        (state) => (this.enumTransactionStatus = state?.TransactionStatuses)
      );
    this.subscriptionsCollection.push(sub);
  }

  handleTransactionActions(event: TransactionEventEmitter): void {
    switch (event.action.value) {
      case TransactionAction.SHOW_AUDIT_TRAIL:
        this.showAuditTrailCase(event.transaction);
        break;
      case TransactionAction.DELETE:
        this.deleteTransactionModalLogic(event.transaction);
        break;
      default:
        break;
    }
  }

  showAuditTrailCase(transaction: Transaction): void {
    if (transaction.parentId) {
      this.router.navigate([`${transaction.parentId}/audit-trail`], {
        relativeTo: this.activeRoute,
      });
    } else {
      this.router.navigate([`${transaction.id}/audit-trail`], {
        relativeTo: this.activeRoute,
      });
    }
  }

  visibilityServices(): void {
    this.visibilitySvc.setVisiblityProjectHeader(false);
    this.visibilitySvc.breadcrumbService.set(
      '@transactions',
      'BREADCRUMB.FINALCIAL_TRANSACTIONS'
    );
  }

  deleteTransactionModal(): Observable<DialogReturn> {
    return this.fiModalSvc.open(
      'TRANSACTION.MODAL.DELETE.TITLE',
      [
        { text: 'TRANSACTION.MODAL.OPTION.NO' },
        {
          text: 'TRANSACTION.MODAL.OPTION.YES',
          cssClass: 'k-primary',
        },
      ],
      [
        {
          key: 'TRANSACTION.MODAL.DELETE.CONTENT',
          bold: false,
        },
      ]
    );
  }

  deleteTransactionModalLogic(transaction: Transaction) {
    this.deleteTransactionModal().subscribe((data: DialogResponse) => {
      if (data.result === ModalOptions.ACCEPT) {
        this.deleteTransaction(this.projectBucketId, transaction);
      }
    });
  }

  deleteTransaction(projectBucketId: string, transaction: Transaction): void {
    this.isLoading = true;
    this.fiTransactionsApiService
      .deleteTransaction(projectBucketId, transaction.id)
      .subscribe(
        () => {
          this.transactions = this.transactions.filter((t) => {
            if (t.parentId === null && transaction.parentId === null) {
              return t.id !== transaction.id;
            } else {
              return (
                t.id !== transaction.id &&
                t.id !== transaction.parentId &&
                t.parentId !== transaction.parentId
              );
            }
          });
          this.fiTransactionsApiService.resetTransactions();
          this.fiTransactionsApiService.resetTransactionsTypes();
          this.transactionsFormService.showSuccessToast(
            'TRANSACTION.ACTION.DELETE'
          );
        },
        () =>
          this.transactionsFormService.showErrorToast(
            'TRANSACTION.MODAL.DELETE.ERRORR'
          )
      )
      .add(() => (this.isLoading = false));
  }

  checkworkFlowConfig(projectBucketId: string): Observable<boolean> {
    return this.workflowODApiService.getWorkflow(projectBucketId).pipe(
      map((wfConfig) => {
        let isExistsInWorkflow = this.actionsService.isCurrentUserHasPermission(
          wfConfig.workFlowConfig,
          this.contract.email
        );

        this.checkworkFlowConfigSuccess(wfConfig);
        return isExistsInWorkflow;
      })
    );
  }

  checkworkFlowConfigSuccess(wfConfig: WorkflowConfig): void {
    if (wfConfig.workFlowConfig.length === 0) {
      this.isStartTransactionDisabled = true;
    } else {
      this.isStartTransactionDisabled = wfConfig?.workFlowConfig?.some(
        (wf) => wf.assignedUsers.length === 0
      );
    }
  }

  verifySelectedProjectPermissions(): void {
    const subPermissions = this.store.select('permissions');
    const subSelectedProjects = this.store.select('selectedProject');
    const subPermissionsSelectedProject = combineLatest([
      subPermissions,
      subSelectedProjects,
    ]).subscribe((data) => {
      if (!!data[1].selectedProject) {
        this.hasPermissionDisplayTransaction =
          this.permissionSvc.haveSomePermissions(
            this.displayTransactionListPermission
          );
      }
    });
    this.subscriptionsCollection.push(subPermissionsSelectedProject);
  }
}
