import {
  Component,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import { IfNumberPipe } from '@fiduciary-interface/app/shared/pipes/if-number.pipe';
import { Observable, Subscription, combineLatest, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AppStateWithUsrPreferences,
  BiddingProcessPlanState,
  AppState,
} from '@core/store';
import {
  ItemAction,
  BiddingProcesses,
  Enumerator,
  BiddingProcessPlan,
  DialogResponse,
  ModalOptions,
  Project,
  KeyValueInput,
  GetBiddingProcessPlanResponseV3,
  Enums,
  BiddingProcessProcurementProcess,
  ProcurementPreferences,
  PreferencesModel,
  DelayedMilestoneEmitter,
} from '@core/models';
import { VisibilityService } from '@core/services/view';
import {
  BiddingProcessPlanStoreService,
  EnumsStoreService,
  ProjectStoreService,
} from '@core/services/store-services/';
import { PermissionEnum } from '@core/enums/permission.enum';
import {
  DialogReturn,
  ModalService,
} from '@fiduciary-interface/app/shared/services/modal.service';
import { PermissionService } from '@core/services/app/permission/permission.service';
import {
  BiddingProcessPlanStatus,
  BiddingProcessProcurementProcessStatuses,
  DelayedMilestoneTableTypeEnum,
  ProcessActions,
  WorkflowIdEntityType,
} from '@core/enums';
import { TranslateEnumPipe } from '@fiduciary-interface/app/shared/pipes/translate-enum.pipe';
import { ProcessConfiguration } from '@core/services/process-configuration.service';
import {
  CommentsDomain,
  ProcurementComment,
  ProcurementCommentRequest,
} from '@fiduciary-interface/app/shared/components/dialog-comments/models';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import { TranslateService } from '@ngx-translate/core';
import { CommentsService } from '@fiduciary-interface/app/shared/components/dialog-comments/services/comments.service';
import { BiddingProcessPlanService } from '@core/services/apis';
import { filter, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { WorkflowSharedService } from '@fiduciary-interface/app/shared/components/flows-sticky-footer/services';
import { Store } from '@ngrx/store';
import { SelectEvent } from '@progress/kendo-angular-layout';
import * as actions from '@core/store/procurement-process-header/actions/procurementProcessHeader.actions';
import * as preferencesAction from '@core/store/preferences/actions/preferences.actions';
import { PopupNotificationService } from '@fiduciary-interface/app/shared/services/popup.service';
import { NotificationsService } from '@fiduciary-interface/app/shared/services/notifications.service';
import { ProcurementDownloadService } from '../../../../services/procurement-download.service';
import { FileSaverService } from 'ngx-filesaver';
import { DelayedMilestoneEventBusService } from '../../../../services/delayed-milestone-event-bus.service';
import { FilteredProcurementProcessService } from '../../../../services/filtered-procurement-process.service';
import { DialogRef } from '@progress/kendo-angular-dialog';

@Component({
  selector: 'fi-process-monitoring',
  templateUrl: './process-monitoring.component.html',
  styleUrls: ['./process-monitoring.component.scss'],
})
export class ProcessMonitoringComponent
  implements OnInit, OnChanges, OnDestroy
{
  public SUPERVISION_METHOD_EXANTE_ID = 0;

  subscriptionCollection: Subscription[] = [];
  public width: number;
  public height: number;
  mobileView: boolean;

  delayedMilestones: number = 0;
  enumProcessStatuses: Enumerator[];
  enumProcessPlanStatuses: Enumerator[];
  enumProcessCategories: Enumerator[];
  enumProcessSupervisionMethods: Enumerator[];
  enumProcessProcurementMethods: Enumerator[];
  processPlan: BiddingProcessPlan;
  processPlanStatus: number;
  processPlanStatusEnum = BiddingProcessPlanStatus;

  anyProcessAsDraftOrModified = false;
  isProcessLoading = true;

  projectSelected: Project;
  countryCodeProject: string;
  public procurementId: string;
  public procurementPlanCollection: BiddingProcesses[];

  attributesSettings: KeyValueInput[] = [];
  commentsList: ProcurementComment[] = [];
  actionLoaded = false;

  tabEvents: SelectEvent[] = [];
  reloadPlans = true;
  enums = Enums;
  planStatus: BiddingProcessPlanStatus;
  planStatuses = Enums.biddingProcessPlanStatuses;

  public commentVisibilities: Enumerator[];
  public milestonesCodes: Enumerator[];

  public createProcessButtonPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  public requestApprovalButtonPermission: PermissionEnum[] = [
    PermissionEnum.SEND_OFFICIAL_PROCUREMENT_COMUNICATIONS,
  ];
  // public procurementSendNotificationButtonPermission: PermissionEnum[] = [
  //   PermissionEnum.SEND_INTERNAL_NOTIFICATIONS,
  // ];
  public requestOfficialReviewButtonPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  public procurementProcessTablePermission: PermissionEnum[] = [
    PermissionEnum.VIEW_PROCUREMENT_INFORMATION,
  ];
  public goToTopButtonPermission: PermissionEnum[] = [
    PermissionEnum.VIEW_PROCUREMENT_INFORMATION,
  ];
  public addCommentPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
    PermissionEnum.ENTERPROCUREMENTCOMMENTS,
  ];

  selectedLanguage: string;
  isInternal: boolean;

  downloadingRawData: boolean;
  contractNumber: string;
  isLoading = true;

  delayedMilestonesTablePreferences: ProcurementPreferences = {
    projectBucketId: '',
    process: false,
    contracts: false,
    amendments: false,
  };
  preferences: PreferencesModel;

  delayedMilestoneTableTypeEnum = DelayedMilestoneTableTypeEnum;
  switchAllProcess = false;
  expandedProcess: boolean;
  expandedContracts: boolean;
  expandedAmendments: boolean;

  constructor(
    private readonly visibilitySvc: VisibilityService,
    readonly route: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly translateEnum: TranslateEnumPipe,
    readonly notificationGlobalSvc: NotificationGlobalService,
    private readonly permissionSvc: PermissionService,
    readonly configSvc: ProcessConfiguration,
    readonly translate: TranslateService,
    readonly biddingProcessPlanStore: BiddingProcessPlanStoreService,
    readonly biddingProcessPlanSvc: BiddingProcessPlanService,
    readonly fiModalSvc: ModalService,
    readonly workflowSharedSvc: WorkflowSharedService,
    readonly commentsSvc: CommentsService,
    readonly storeProject: ProjectStoreService,
    readonly storePreferences: Store<AppStateWithUsrPreferences>,
    private readonly ifNumberPipe: IfNumberPipe,
    readonly store: Store<AppState>,
    private readonly enumStoreSvc: EnumsStoreService,
    readonly procurementDownload: ProcurementDownloadService,
    readonly fileSaverService: FileSaverService,
    readonly popupService: PopupNotificationService,
    readonly notificationService: NotificationsService,
    readonly delayedMilestoneEventBusService: DelayedMilestoneEventBusService,
    private filteredProcessSvc: FilteredProcurementProcessService
  ) {}

  ngOnInit(): void {
    this.getCurrentLang();
    this.visibilitySvc.setVisiblityProjectHeader(true);
    this.initMobileConditionals();
    this.loadWorkflowActions();
    this.checkIsInternal();
    this.init();
    this.populateEnums();
    this.checkSelectedProjectLoaded();
    this.subDelayedMilestoneSelectedOption();
  }

  checkSelectedProjectLoaded(): void {
    const selectedProject$ = this.store
      .select('selectedProject')
      .pipe(
        filter(({ loaded, selectedProject }) => loaded && !!selectedProject)
      );

    const procurementPreferences$ = this.store.select('preferences').pipe(
      tap((data) => (this.preferences = data.preferences)),
      map(({ preferences }) => preferences.procurementPreferences)
    );

    const subscription = combineLatest([
      selectedProject$,
      procurementPreferences$,
    ]).subscribe(([selectedProjectData, preferences]) => {
      const { projectBucketId } = selectedProjectData.selectedProject;

      const projectPreference = preferences?.find(
        (preference) => preference.projectBucketId === projectBucketId
      );

      let newProjectsPreferences = { ...projectPreference };

      if (newProjectsPreferences) {
        this.expandedProcess = newProjectsPreferences.process;
        this.expandedContracts = newProjectsPreferences.contracts;
        this.expandedAmendments = newProjectsPreferences.amendments;
        this.delayedMilestonesTablePreferences = {
          projectBucketId,
          amendments: this.expandedAmendments,
          contracts: this.expandedContracts,
          process: this.expandedProcess,
        };
      } else {
        this.expandedProcess = false;
        this.expandedContracts = false;
        this.expandedAmendments = false;
        this.delayedMilestonesTablePreferences = {
          projectBucketId,
          amendments: false,
          contracts: false,
          process: false,
        };
      }

      this.isLoading = false;
    });

    this.subscriptionCollection.push(subscription);
  }

  updatePreferences(): void {
    this.store.dispatch(
      preferencesAction.changePreferedProcurementProcessTable({
        preferences: this.delayedMilestonesTablePreferences,
        actualPreferences: this.preferences,
      })
    );
  }

  changeTablePreference(event): void {
    const { typeTable, show } = event;
    switch (typeTable) {
      case DelayedMilestoneTableTypeEnum.AMENDMENTS:
        this.delayedMilestonesTablePreferences.amendments = show;
        break;
      case DelayedMilestoneTableTypeEnum.CONTRACTS:
        this.delayedMilestonesTablePreferences.contracts = show;
        break;
      case DelayedMilestoneTableTypeEnum.PROCESS:
        this.delayedMilestonesTablePreferences.process = show;
        break;
      default:
        break;
    }
    this.updatePreferences();
  }

  getDelayedMilestones(biddingProcess: BiddingProcessProcurementProcess[]) {
    this.delayedMilestones = biddingProcess.filter(
      (p) => p.advanceMilestone.delayed
    ).length;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.procurementPlanCollection && changes.countryCode) {
      let procPlan: BiddingProcesses[] =
        changes.procurementPlanCollection.currentValue;
      this.delayedMilestones = procPlan.filter(
        (e) => e.advanceMilestone.delayed
      ).length;
    }
  }

  ngOnDestroy(): void {
    this.subscriptionCollection.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }

  checkIsInternal(): void {
    const sub = this.store.select('contact').subscribe((data) => {
      this.isInternal = data.contact.is_internal;
    });
    this.subscriptionCollection.push(sub);
  }

  getProcesses() {
    return this.biddingProcessPlanStore.getOrLoadBiddingProcessPlan().pipe(
      filter((data) => data.biddingPlanState.biddingProcessPlan !== null),
      filter((data) => data.biddingPlanState.processScreenLoaded),
      tap((data) => {
        this.procurementId = data.biddingPlanState.biddingProcessPlan.id;
      }),
      switchMap((data) => {
        return of(data).pipe(
          map((biddingData) => ({
            biddingData,
          }))
        );
      })
    );
  }

  init(): void {
    this.isProcessLoading = true;
    const subscription = this.getProcesses().subscribe((state) => {
      this.planStatus =
        state.biddingData?.biddingPlanState?.biddingProcessPlan?.status;
      const enumState = state.biddingData.enumState;
      const biddingPlanState = state.biddingData.biddingPlanState;

      this.projectSelected = state.biddingData.projectState.selectedProject;
      this.countryCodeProject = this.projectSelected?.countryCode;

      this.enumProcessStatuses =
        enumState.biddingProcessProcurementProcessStatuses;
      this.enumProcessPlanStatuses = enumState.biddingProcessPlanStatuses;
      this.enumProcessCategories =
        enumState.biddingProcessProcurementProcessCategories;
      this.enumProcessSupervisionMethods =
        enumState.biddingProcessProcurementProcessSupervisionMethods;
      this.enumProcessProcurementMethods =
        enumState.biddingProcessProcurementProcessProcurementMethods;
      this.isProcessLoading =
        biddingPlanState.processScreenLoading ||
        biddingPlanState.loading ||
        biddingPlanState.loadingProcess;
      this.setBiddingPlan(biddingPlanState);
    });
    this.subscriptionCollection.push(subscription);
  }

  setBiddingPlan(biddingPlanState: BiddingProcessPlanState): void {
    if (
      biddingPlanState &&
      biddingPlanState.biddingProcessPlan &&
      biddingPlanState.biddingProcessProcurementProcesses
    ) {
      let processes: BiddingProcessProcurementProcess[];
      if (
        biddingPlanState.selectedFilterForBiddingProcess === null ||
        biddingPlanState.selectedFilterForBiddingProcess.selectedTableType ===
          null
      ) {
        processes = biddingPlanState.biddingProcessProcurementProcesses;
      } else {
        processes = biddingPlanState.filteredBiddingProcessProcurementProcesses;
      }
      this.procurementPlanCollection = [];
      this.procurementId = biddingPlanState.biddingProcessPlan.id;
      this.processPlan = biddingPlanState.biddingProcessPlan;

      this.getDelayedMilestones(processes);

      this.processPlanStatus = biddingPlanState.biddingProcessPlan.status;

      this.procurementPlanCollection = processes.map((biddingProcess) => {
        const newBidding = new BiddingProcesses();
        newBidding.id = biddingProcess.id;
        newBidding.isMigrated = biddingProcess.isMigrated;
        newBidding.packagesUnderReview = biddingProcess.packagesUnderReview;
        newBidding.isUpdated = biddingProcess.isUpdated;
        newBidding.name = biddingProcess.name;
        newBidding.manualId = biddingProcess.manualId;
        newBidding.sustainabilityDescription =
          biddingProcess.sustainabilityDescription;
        newBidding.deliverables = [];
        newBidding.code = biddingProcess.code;
        newBidding.advanceMilestone = biddingProcess.advanceMilestone;
        newBidding.justification = biddingProcess.justification;
        newBidding.subExecutor = biddingProcess.subExecutor;
        newBidding.projectAmount = biddingProcess.projectAmount;
        newBidding.totalAcumulatedAmount = biddingProcess.totalAcumulatedAmount;
        newBidding.estimatedAmountString = this.ifNumberPipe.transform(
          biddingProcess.projectAmount.estimatedAmount
        );
        newBidding.componentName = biddingProcess.componentName;
        newBidding.status = biddingProcess.status;
        newBidding.totalComments = biddingProcess.totalComments;

        newBidding.statusEnum = this.translateEnum.getEnumByNumber(
          newBidding.status,
          this.enumProcessStatuses
        );

        this.checkAnyProcessAsDraftOrModified(newBidding.status);
        newBidding.crudActions = this.setCurdActions(
          biddingProcess,
          biddingPlanState.biddingProcessPlan.status
        );

        newBidding.categoryEnum = this.translateEnum.getEnumByNumber(
          biddingProcess.category.id,
          this.enumProcessCategories
        );

        newBidding.procurementMethodEnum = this.translateEnum.getEnumByNumber(
          biddingProcess.procurementMethod.id,
          this.enumProcessProcurementMethods
        );

        newBidding.supervisionMethodEnum = this.translateEnum.getEnumByNumber(
          biddingProcess.supervisionMethod.id,
          this.enumProcessSupervisionMethods
        );

        newBidding.supervisionMethod = biddingProcess.supervisionMethod;
        newBidding.category = biddingProcess.category;
        newBidding.procurementMethod = biddingProcess.procurementMethod;
        newBidding.isNotExante =
          biddingProcess.supervisionMethod.id !==
          this.SUPERVISION_METHOD_EXANTE_ID;
        newBidding.statusTranslation = this.translate.instant(
          newBidding.statusEnum.name
        );
        newBidding.milestonesDelayed = biddingProcess.advanceMilestone.delayed
          ? this.translate.instant('PROCUREMENT.DELAYED_MILESTONES')
          : this.translate.instant(
              'PROCUREMENT.TOOLTIP.DELAYED_MILESTONES_NEGATIVE'
            );
        newBidding.categoryTranslation = this.translate.instant(
          newBidding.categoryEnum.name
        );
        newBidding.procurementMethodTranslation = this.translate.instant(
          newBidding.procurementMethodEnum.name
        );
        newBidding.supervisionMethodTranslation = this.translate.instant(
          newBidding.supervisionMethodEnum.name
        );

        newBidding.currentMilestone = this.translate.instant(
          `PROCUREMENT.MILESTONES.${this.translateEnum.transform(
            newBidding.advanceMilestone.currentMilestone?.code,
            this.enums.biddingProcessMilestoneCodes
          )}`
        );
        newBidding.order = biddingProcess.order;
        return newBidding;
      });

      this.delayedMilestones = this.procurementPlanCollection.filter(
        (e) => e.advanceMilestone.delayed
      ).length;
      this.procurementPlanCollection = this.sortProcurementPlanByCode(
        this.procurementPlanCollection
      );
      this.isProcessLoading = false;
    }
  }

  subDelayedMilestoneSelectedOption(): void {
    const sub = this.delayedMilestoneEventBusService.selectedOption$
      .pipe(filter((data) => !!data))
      .subscribe((data) => {
        this.filtedProcesses(data);
      });
    this.subscriptionCollection.push(sub);
  }

  clearSelection(): void {
    const newValue: DelayedMilestoneEmitter = {
      processIds: [],
      selectedFilterForBiddingProcess: {
        selectedRow: null,
        selectedCol: null,
        selectedTableType: null,
      },
    };
    this.filtedProcesses(newValue, true);
  }

  // Aplica filtros sobre procesos y actualiza el store feature
  filtedProcesses(obj: DelayedMilestoneEmitter, reset = false): void {
    this.isProcessLoading = true;
    if (reset) {
      this.delayedMilestoneEventBusService.selectedOption = null;
      this.biddingProcessPlanStore.setFilteredProcess(
        [],
        obj.selectedFilterForBiddingProcess
      );
    } else {
      const processesIdsWithoutDuplicates = Array.from(new Set(obj.processIds));
      this.subscriptionCollection.push(
        this.filteredProcessSvc
          .getFilteredProcurementProcess(
            this.procurementId,
            processesIdsWithoutDuplicates
          )
          .subscribe((data) => {
            this.biddingProcessPlanStore.setFilteredProcess(
              data,
              obj.selectedFilterForBiddingProcess
            );
          })
      );
    }
  }

  navigateToCreateProcessForm(): void {
    this.route.navigate([this.procurementId, 'process', 'create'], {
      relativeTo: this.activatedRoute.parent,
    });
  }

  navigateToUpdateForm(processId: string): void {
    this.route.navigate([this.procurementId, 'process', processId, 'edit'], {
      relativeTo: this.activatedRoute.parent,
    });
  }

  navigateToReplicateForm(processId: string): void {
    this.route.navigate(
      [this.procurementId, 'process', processId, 'replicate'],
      {
        relativeTo: this.activatedRoute.parent,
      }
    );
  }

  actionitemID(item: ItemAction<ProcessActions>): void {
    switch (item.action) {
      case ProcessActions.addComment:
        this.store.dispatch(actions.setFocusComments({ FocusComments: true }));
      case ProcessActions.edit:
        this.navigateToUpdateForm(item.id);
        break;
      case ProcessActions.replicate:
        this.navigateToReplicateForm(item.id);
        break;
      case ProcessActions.cancel:
        this.dialogWithCommentsModal(
          'PROCUREMENT.PROCESS.MODAL_CANCEL.TITLE',
          'PROCUREMENT.PROCESS.MODAL_CANCEL.CANCEL_PROCUREMENT',
          'PROCUREMENT.PROCESS.MODAL_CANCEL.CANCEL',
          'PROCUREMENT.PROCESS.MODAL_CANCEL.CONTENT1',
          'PROCUREMENT.UNSUCCESSFUL.CONTENT2'
        ).subscribe((response: DialogResponse) => {
          if (response.result === ModalOptions.ACCEPT) {
            this.biddingProcessPlanStore.cancelProcessAction(
              item.id,
              response['comments'].comment.trim()
            );
          }
        });
        break;
      case ProcessActions.delete:
        this.biddingProcessPlanStore.removeProcessAction(item.id);
        break;
      case ProcessActions.ineligibility:
        this.dialogWithCommentsModal(
          'PROCUREMENT.INELIGIBILITY.TITLE',
          'PROCUREMENT.INELIGIBILITY.SUBMIT',
          'PROCUREMENT.INELIGIBILITY.CANCEL',
          'PROCUREMENT.INELIGIBILITY.CONTENT1',
          'PROCUREMENT.INELIGIBILITY.CONTENT2'
        ).subscribe((response: DialogResponse) => {
          if (response.result === ModalOptions.ACCEPT) {
            this.biddingProcessPlanStore.ineligibilityProcessAction(
              response['comments'].comment.trim(),
              item.id
            );
          }
        });
        break;
      case ProcessActions.unsuccessful:
        this.dialogWithCommentsModal(
          'PROCUREMENT.UNSUCCESSFUL.TITLE',
          'PROCUREMENT.UNSUCCESSFUL.SUBMIT',
          'PROCUREMENT.UNSUCCESSFUL.CANCEL',
          'PROCUREMENT.UNSUCCESSFUL.CONTENT1',
          'PROCUREMENT.UNSUCCESSFUL.CONTENT2'
        ).subscribe((response: DialogResponse) => {
          if (response.result === ModalOptions.ACCEPT) {
            setTimeout(() => {
              this.unsuccessfulConfirmationModal(
                item.id,
                response['comments'].comment.trim()
              );
            }, 100);
          }
        });
        break;
    }
  }

  unsuccessfulConfirmationModal(itemId: string, comment: string): void {
    this.fiModalSvc
      .open(
        'PROCUREMENT.UNSUCCESSFUL.CONFIRMATION.TITTLE',
        [
          {
            text: 'PROCUREMENT.UNSUCCESSFUL.CONFIRMATION.CANCEL',
          },
          {
            text: 'PROCUREMENT.UNSUCCESSFUL.CONFIRMATION.CONFIRM',
            cssClass: 'k-primary',
          },
        ],
        [
          {
            key: 'PROCUREMENT.UNSUCCESSFUL.CONFIRMATION.CONTENT1',
            bold: false,
          },
        ]
      )
      .subscribe((data: DialogResponse) => {
        if (data.result === ModalOptions.ACCEPT) {
          this.biddingProcessPlanStore.declareUnsuccessfulProcessAction(
            comment,
            itemId
          );
        }
      });
  }

  dialogWithCommentsModal(
    tittle: string,
    submitBtn: string,
    cancelBtn: string,
    content1: string,
    content2: string
  ): Observable<DialogReturn> {
    return this.fiModalSvc.openDialogWithComments(
      tittle,
      [
        { text: cancelBtn },
        {
          text: submitBtn,
          cssClass: 'k-primary k-align-text submit-button-modal',
        },
      ],
      [
        { key: content1, bold: false },
        { key: content2, bold: false },
      ]
    );
  }

  initMobileConditionals(): void {
    this.subscriptionCollection.push(
      this.visibilitySvc.sizeWindow().subscribe((data) => {
        this.mobileView = data.mobileView;
        if (this.mobileView) {
          this.width = 328;
          this.height = 303;
        } else {
          this.width = 720;
          this.height = 303;
        }
      })
    );
  }

  getCurrentLang(): void {
    const sub = this.storePreferences
      .select('preferences')
      .subscribe((data) => {
        if (data.preferences.preferredLanguage) {
          this.selectedLanguage = data.preferences.preferredLanguage;
        }
      });
    this.subscriptionCollection.push(sub);
  }

  private dialogRef: DialogRef;
  private storeSubscription: Subscription;
  public sendingProcurementForApproval = false;

  newRequestApproval(procurementApprovalActions: TemplateRef<unknown>): void {
    this.dialogRef = this.fiModalSvc.openCustomWorkFlowCommentsModal(
      'WORKFLOWS.COMMENTS_MODAL.PROCUREMENT.PLAN.TITLE',
      [
        {
          key: 'WORKFLOWS.COMMENTS_MODAL.PROCUREMENT.PLAN.TEXT',
          bold: false,
        },
      ],
      procurementApprovalActions
    );
  }

  unsubscribeFromStore() {
    if (this.storeSubscription) this.storeSubscription.unsubscribe();
  }

  closeWorkflowCommentsModal() {
    this.unsubscribeFromStore();
    if (this.dialogRef) this.dialogRef.close();
  }

  requestOfficialReview(): void {
    this.fiModalSvc
      .open(
        'PROCUREMENT.OFFICIAL_REVIEW.TITLE',
        [
          { text: 'PROCUREMENT.CANCEL' },
          { text: 'PROCUREMENT.SEND', cssClass: 'k-primary' },
        ],
        [
          { key: 'PROCUREMENT.OFFICIAL_REVIEW.CONTENT_1', bold: false },
          { key: 'PROCUREMENT.OFFICIAL_REVIEW.CONTENT_2', bold: true },
          { key: 'PROCUREMENT.OFFICIAL_REVIEW.CONTENT_3', bold: false },
        ]
      )
      .subscribe((data: DialogResponse) => {
        if (data.result === ModalOptions.ACCEPT) {
          console.log('requestOfficialReview');
        }
      });
  }

  showAddCommentOption(
    processStatus: number,
    planStatus: BiddingProcessPlanStatus
  ): boolean {
    if (planStatus !== BiddingProcessPlanStatus.IN_SYNC) {
      const statusesNotShowAddCommentOption = [
        BiddingProcessProcurementProcessStatuses.DELETED,
        BiddingProcessProcurementProcessStatuses.DRAFT,
        BiddingProcessProcurementProcessStatuses.CANCELLED,
        BiddingProcessProcurementProcessStatuses.UNSUCCESFUL_PROCESS,
        BiddingProcessProcurementProcessStatuses.PROCUREMENT_INELIGIBLE,
        BiddingProcessProcurementProcessStatuses.REJECTION_BIDS,
        BiddingProcessProcurementProcessStatuses.CONTRACT_TERMINATED,
      ];
      const externalRestriction = [
        BiddingProcessProcurementProcessStatuses.UNDER_REVIEW,
        BiddingProcessProcurementProcessStatuses.UNDER_REVIEW_MODIFIED,
        BiddingProcessProcurementProcessStatuses.PROCUREMENT_COMPLETE,
      ];
      if (this.isInternal) {
        return !statusesNotShowAddCommentOption.includes(processStatus);
      } else {
        return !(
          statusesNotShowAddCommentOption.includes(processStatus) ||
          externalRestriction.includes(processStatus)
        );
      }
    }
  }

  showEditOption(
    processstatus: number,
    planStatus: BiddingProcessPlanStatus
  ): boolean {
    if (planStatus !== BiddingProcessPlanStatus.IN_SYNC) {
      if (this.isInternal) {
        return false;
      } else {
        const statusesNotShowEditOption = [
          BiddingProcessProcurementProcessStatuses.UNDER_REVIEW,
          BiddingProcessProcurementProcessStatuses.UNDER_REVIEW_MODIFIED,
          BiddingProcessProcurementProcessStatuses.DELETED,
          BiddingProcessProcurementProcessStatuses.CANCELLED,
          BiddingProcessProcurementProcessStatuses.UNSUCCESFUL_PROCESS,
          BiddingProcessProcurementProcessStatuses.PROCUREMENT_INELIGIBLE,
          BiddingProcessProcurementProcessStatuses.REJECTION_BIDS,
          BiddingProcessProcurementProcessStatuses.CONTRACT_TERMINATED,
          BiddingProcessProcurementProcessStatuses.PROCUREMENT_COMPLETE,
        ];

        if (!statusesNotShowEditOption.includes(processstatus)) {
          return true;
        }
        return false;
      }
    }
  }

  setCurdActions(
    process: BiddingProcessProcurementProcess,
    planStatus: BiddingProcessPlanStatus
  ): ProcessActions[] {
    const output: ProcessActions[] = [];
    const canEditUpdate = this.permissionSvc.hasPermission(
      PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION
    );
    const canReplicate = this.permissionSvc.hasPermission(
      PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION
    );

    const canEditProcurementComments = this.permissionSvc.hasPermission(
      PermissionEnum.ENTERPROCUREMENTCOMMENTS
    );

    const canEditByPermission = canEditUpdate || canEditProcurementComments;

    const canDelete = this.permissionSvc.hasPermission(
      PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION
    );
    const canCancel = this.permissionSvc.hasPermission(
      PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION
    );
    const canDeclareUnsuccessful = this.permissionSvc.hasPermission(
      PermissionEnum.SEND_OFFICIAL_PROCUREMENT_COMUNICATIONS
    );

    const editOption = ProcessActions.edit;
    const replicateOption = ProcessActions.replicate;
    const deleteOption = ProcessActions.delete;
    const cancelOption = ProcessActions.cancel;
    const addCommentOption = ProcessActions.addComment;
    const declareUnsuccessfulOption = ProcessActions.unsuccessful;

    switch (process.status) {
      case BiddingProcessProcurementProcessStatuses.DRAFT:
        if (canDelete && planStatus !== BiddingProcessPlanStatus.IN_SYNC) {
          output.push(deleteOption);
        }
        break;
      case BiddingProcessProcurementProcessStatuses.EXPECTED:
      case BiddingProcessProcurementProcessStatuses.MODIFIED:
      case BiddingProcessProcurementProcessStatuses.PROCESS_ONGOING:
      case BiddingProcessProcurementProcessStatuses.TECHNICAL_EVALUATION_OF_BIDS_PROPOSALS:
      case BiddingProcessProcurementProcessStatuses.EVAL_BID_PROPOSAL:
        if (
          canCancel &&
          !process.packagesUnderReview &&
          planStatus !== BiddingProcessPlanStatus.IN_SYNC
        ) {
          output.push(cancelOption);
        }
        break;
      case BiddingProcessProcurementProcessStatuses.CONTRACT_UNDER_EXECUTION:
      case BiddingProcessProcurementProcessStatuses.CONTRACT_SIGNED:
        break;
    }

    if (
      this.showAddCommentOption(process.status, planStatus) &&
      canEditByPermission
    ) {
      output.push(addCommentOption);
    }
    if (
      this.showEditOption(process.status, planStatus) &&
      canEditByPermission
    ) {
      output.push(editOption);
    }
    if (canReplicate && planStatus !== BiddingProcessPlanStatus.IN_SYNC) {
      output.push(replicateOption);
    }

    if (
      canDeclareUnsuccessful &&
      !process.packagesUnderReview &&
      this.planStatus !== BiddingProcessPlanStatus.IN_SYNC &&
      (process.status ==
        BiddingProcessProcurementProcessStatuses.PROCESS_ONGOING ||
        process.status ==
          BiddingProcessProcurementProcessStatuses.TECHNICAL_EVALUATION_OF_BIDS_PROPOSALS ||
        process.status ==
          BiddingProcessProcurementProcessStatuses.EVAL_BID_PROPOSAL)
    ) {
      output.push(declareUnsuccessfulOption);
    }
    return output;
  }

  checkAnyProcessAsDraftOrModified(status: number): void {
    if (
      status === BiddingProcessProcurementProcessStatuses.DRAFT ||
      status === BiddingProcessProcurementProcessStatuses.MODIFIED ||
      status === BiddingProcessProcurementProcessStatuses.PENDING_CANCELLATION
    ) {
      this.anyProcessAsDraftOrModified = true;
    }
  }

  populateEnums(): void {
    this.subscriptionCollection.push(
      this.enumStoreSvc.selectEnums().subscribe((data) => {
        if (data.biddingProcessMilestoneCodes) {
          this.milestonesCodes = data.biddingProcessMilestoneCodes;
        }
        if (data.commentVisibilities) {
          this.commentVisibilities = data.commentVisibilities;
        }
      })
    );
  }

  goToComments(): void {
    this.route.navigate([`comments/plan/active`], {
      relativeTo: this.activatedRoute,
    });
  }

  openCommentsModal(
    planStatus: BiddingProcessPlanStatus
  ): Observable<DialogReturn> {
    return this.fiModalSvc.openPlansComments(
      planStatus,
      'COMMENTS.TITLE',
      [
        { text: 'COMMENTS.CANCEL' },
        {
          text: 'COMMENTS.SAVE_COMMENT',
          cssClass: 'k-primary',
        },
      ],
      this.commentsList,
      this.commentVisibilities
    );
  }

  showErrorMsg(string: string): void {
    const message = this.translate.instant(string);
    this.notificationGlobalSvc.showError(message);
  }

  showSuccessMsg(): void {
    const message = this.translate.instant('COMMENTS.ADD_SUCCESS');
    this.notificationGlobalSvc.showSuccess(message);
  }

  sortCommentsByDate(commentsList: ProcurementComment[]): ProcurementComment[] {
    const aux = [...commentsList];
    return aux.sort((a, b) => {
      return new Date(a.created).getTime() - new Date(b.created).getTime();
    });
  }

  sortProcurementPlanByCode(
    procurementPlanCollection: BiddingProcesses[]
  ): BiddingProcesses[] {
    const aux = [...procurementPlanCollection];
    return aux.sort((a, b) => {
      return a.order < b.order ? -1 : 1;
    });
  }

  postComment(comments: ProcurementCommentRequest[]): void {
    this.commentsSvc
      .postComments(
        this.processPlan.id,
        CommentsDomain.BIDDINGPROCESSPLAN,
        comments
      )
      .subscribe(
        () => {
          this.showSuccessMsg();
        },
        () => {
          const message = this.translate.instant('COMMENTS.ERROR_POST_COMMENT');
          this.showErrorMsg(message);
        }
      );
  }

  loadWorkflowActions(): void {
    this.subscriptionCollection.push(
      this.storeProject
        .selectedProject()
        .pipe(
          filter((data) => !!data.selectedProject),
          mergeMap((data) =>
            this.biddingProcessPlanSvc
              .getBiddingProcessPlan(data.selectedProject.projectBucketId)
              .pipe(
                map((resp: GetBiddingProcessPlanResponseV3) => {
                  return {
                    projectPlan: resp,
                    selectedProject: data.selectedProject,
                  };
                })
              )
          )
        )
        .subscribe((data) => {
          if (!!data && !!data.selectedProject && !!data.projectPlan) {
            this.workflowSharedSvc.loadActions({
              body: {
                entityTypeId: data.projectPlan.id,
                projectBucketId: data.selectedProject.projectBucketId,
                idEntityType: WorkflowIdEntityType.PROCUREMENT_PLAN,
              },
              projectContractId: data.selectedProject.contract,
              instAcronym: data.selectedProject.executorAcronym,
            });
          }
        })
    );
  }
}
