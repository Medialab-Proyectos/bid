import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BiddingProcessPlanStoreService } from '@core/services/store-services';
import { ItemAction, BiddingProcesses, Enums } from '@core/models';
import {
  BiddingProcessPlanStatus,
  BiddingProcessProcurementProcessStatuses,
  PermissionEnum,
  ProcessActions,
} from '@core/enums';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { DataBindingDirective } from '@progress/kendo-angular-grid';
import { of, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { GridSettings } from '@fiduciary-interface/app/shared/services/localStorage/models/grid-settings.model';
import { LocalStorageService } from '@fiduciary-interface/app/shared/services';
import { process, State } from '@progress/kendo-data-query';
import { ProcurementColumnName } from '../../enums';
import { AppStateWithProcurementProcessHeader } from '@core/store/procurement-process-header/reducers/procurementProcessHeader.reducer';
import { Store } from '@ngrx/store';
import * as actions from '@core/store/procurement-process-header/actions/procurementProcessHeader.actions';
import { ProcessChangesService } from '../../services/process-changes.service';
import { ProcurementProcessVersion } from '../../models';
import { ModalService } from '@fiduciary-interface/app/shared';
import { exhaustMap, filter, switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'fi-table-aggregates',
  templateUrl: './table-aggregates.component.html',
})
export class TableAggregatesComponent implements OnInit, OnChanges, OnDestroy {
  private readonly subscriptions = new Subscription();
  ProcurementColumnName = ProcurementColumnName;

  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
  @ViewChild(TooltipDirective) tooltipDir: TooltipDirective;

  @Input() set procurementPlanCollection(value: BiddingProcesses[]) {
    if (value) {
      this._procurementPlanCollection = value;
      this.gridData = value;
    }
    this.gridView = this.gridData;
  }
  @Input() countryCode: string;
  @Input() isLoading: boolean;

  @Output() actionitemID: EventEmitter<ItemAction<ProcessActions>> =
    new EventEmitter();

  gridView: BiddingProcesses[] = [];
  gridData: BiddingProcesses[] = [];
  procurementProcessStatuses = BiddingProcessProcurementProcessStatuses;
  _procurementPlanCollection: BiddingProcesses[] = [];

  enum = Enums;

  highlightValue: string;
  procurementId: string;
  biddingProcessPlanInSync = false;

  public procurementProcessStatusPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  constructor(
    readonly router: Router,
    private readonly activeRoute: ActivatedRoute,
    private readonly biddingProcessStore: BiddingProcessPlanStoreService,
    private readonly translateService: TranslateService,
    readonly persistingService: LocalStorageService,
    private readonly store: Store<AppStateWithProcurementProcessHeader>,
    private readonly processChangeSvc: ProcessChangesService,
    private readonly modalSvc: ModalService
  ) {}

  ngOnInit(): void {
    this.setProcurementId();
    this.store.dispatch(actions.setFocusComments({ FocusComments: false }));
    this.subscriptions.add(
      this.store
        .select('preferences')
        .pipe(
          filter((data) => data.loaded),
          take(1)
        )
        .pipe(
          switchMap((data) => {
            return this.translateService.getTranslation(
              data.preferences.preferredLanguage
                ? data.preferences.preferredLanguage
                : 'en'
            );
          })
        )
        .subscribe(() => {
          this.translateColumNames();
        })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.procurementPlanCollection && changes.countryCode) {
      this.gridData = changes.procurementPlanCollection.currentValue;
      this.gridView = this.gridData;

      const gridSettings: GridSettings = this.persistingService.get(
        'procurementtSettings'
      );

      if (gridSettings !== null) {
        this.gridSettings = this.mapGridSettings(gridSettings);
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  setProcurementId(): void {
    this.subscriptions.add(
      this.biddingProcessStore.biddingProcessPlan().subscribe((state) => {
        if (state.biddingProcessPlan) {
          this.procurementId = state.biddingProcessPlan.id;
          this.checkInSyncStatus(state.biddingProcessPlan.status);
        }
      })
    );
  }

  checkInSyncStatus(biddingProcessPlanStatus: number): void {
    this.biddingProcessPlanInSync =
      biddingProcessPlanStatus === BiddingProcessPlanStatus.IN_SYNC;
  }

  routeToProcessDocs(
    biddingProcess: BiddingProcesses,
    focusComments: boolean
  ): void {
    this.store.dispatch(
      actions.setFocusComments({ FocusComments: focusComments })
    );
    const processId = biddingProcess.id;
    if (
      biddingProcess.status === BiddingProcessProcurementProcessStatuses.DRAFT
    ) {
      this.router.navigate(
        [this.procurementId, 'process', processId, 'edit'],
        {
          relativeTo: this.activeRoute.parent,
        }
      );
    } else {
      this.router.navigate(
        [this.procurementId, 'process', processId, 'doc-packages'],
        {
          relativeTo: this.activeRoute.parent,
        }
      );
    }
  }

  onFilter(inputValue: string): void {
    this.highlightValue = inputValue;
    const lowerCase = inputValue.toLowerCase();
    this.gridView = this.gridData.filter(
      (approvedPlan: BiddingProcesses) =>
        approvedPlan.code?.toLowerCase().includes(lowerCase) ||
        approvedPlan.name?.toLowerCase().includes(lowerCase) ||
        approvedPlan.componentName?.toLowerCase().includes(lowerCase) ||
        approvedPlan.statusTranslation?.toLowerCase().includes(lowerCase) ||
        approvedPlan.projectAmount?.estimatedAmount
          ?.toString()
          .toLowerCase()
          .includes(lowerCase) ||
        approvedPlan.statusTranslation?.toLowerCase().includes(lowerCase) ||
        approvedPlan.categoryTranslation?.toLowerCase().includes(lowerCase) ||
        approvedPlan.procurementMethodTranslation
          ?.toLowerCase()
          .includes(lowerCase) ||
        approvedPlan.supervisionMethodTranslation
          ?.toLowerCase()
          .includes(lowerCase) ||
        this.removeSeparators(approvedPlan.estimatedAmountString)
          .toLowerCase()
          .includes(lowerCase) ||
        approvedPlan.estimatedAmountString.toLowerCase().includes(lowerCase)
    );
  }

  removeSeparators(value: string): string {
    return value.replace(',', '').replace('.', '');
  }

  actionItem(action: ProcessActions, id: string): void {
    const item: ItemAction<ProcessActions> = {
      id,
      action,
    };
    this.actionitemID.emit(item);
  }

  showTooltip(e: MouseEvent): void {
    const element = e.target as HTMLElement;

    if (
      element.classList.contains('has-ellipsis') &&
      (element.clientHeight < element.scrollHeight ||
        element.offsetWidth < element.scrollWidth)
    ) {
      this.tooltipDir.toggle(element);
    } else {
      this.tooltipDir.hide();
    }
  }

  procurementStyles(status: number): string {
    switch (status) {
      case BiddingProcessProcurementProcessStatuses.CANCELLED:
      case BiddingProcessProcurementProcessStatuses.PROCUREMENT_COMPLETE:
        return 'c-status-label__grey';

      case BiddingProcessProcurementProcessStatuses.CONTRACT_TERMINATED:
      case BiddingProcessProcurementProcessStatuses.REJECTION_BIDS:
      case BiddingProcessProcurementProcessStatuses.UNDER_REVIEW:
      case BiddingProcessProcurementProcessStatuses.UNDER_REVIEW_MODIFIED:
      case BiddingProcessProcurementProcessStatuses.UNSUCCESFUL_PROCESS:
      case BiddingProcessProcurementProcessStatuses.CANCELLATION_UNDER_REVIEW:
        return 'c-status-label__yellow';

      case BiddingProcessProcurementProcessStatuses.PROCUREMENT_INELIGIBLE:
      case BiddingProcessProcurementProcessStatuses.MODIFIED:
        return 'c-status-label__orange';

      case BiddingProcessProcurementProcessStatuses.DRAFT:
        return 'c-status-label__blue';

      case BiddingProcessProcurementProcessStatuses.CONTRACT_FINISHED:
      case BiddingProcessProcurementProcessStatuses.CONTRACT_UNDER_EXECUTION:
      case BiddingProcessProcurementProcessStatuses.EVAL_BID_PROPOSAL:
      case BiddingProcessProcurementProcessStatuses.EXPECTED:
      case BiddingProcessProcurementProcessStatuses.PROCESS_ONGOING:
      case BiddingProcessProcurementProcessStatuses.TECH_EVAL_PHASE_COMPLETED:
      case BiddingProcessProcurementProcessStatuses.DELETED:
      case BiddingProcessProcurementProcessStatuses.TECHNICAL_EVALUATION_OF_BIDS_PROPOSALS:
        return 'c-status-label__white';

      default:
        return 'c-status-label__white';
    }
  }

  public gridSettings: GridSettings = {
    state: {
      filter: {
        logic: 'and',
        filters: [],
      },
    },
    gridData: process(this._procurementPlanCollection, {
      filter: {
        logic: 'and',
        filters: [],
      },
    }),
    columnsConfig: [
      {
        field: ProcurementColumnName.code,
        title: this.translateService.instant('PROCUREMENT.TABLE.PROCESS_ID'),
        filterable: false,
        width: 132,
      },
      {
        field: ProcurementColumnName.name,
        title: this.translateService.instant('PROCUREMENT.TABLE.NAME'),
        filterable: false,
        width: 120,
      },
      {
        field: ProcurementColumnName.componentName,
        title: this.translateService.instant('PROCUREMENT.TABLE.COMPONENT'),
        filterable: false,
        width: 120,
      },
      {
        field: ProcurementColumnName.projectAmountEstimatedAmount,
        title: this.translateService.instant(
          'PROCUREMENT.TABLE.ESTIMATED_AMOUNT'
        ),
        width: 130,
        filterable: false,
      },
      {
        field: ProcurementColumnName.totalAcumulatedAmount,
        title: this.translateService.instant(
          'PROCUREMENT.PROCESS.ACTUAL_AMOUNT'
        ),
        width: 130,
        filterable: false,
        hidden: true,
      },
      {
        field: ProcurementColumnName.statusTranslation,
        title: this.translateService.instant('PROCUREMENT.TABLE.STATUS'),
        width: 120,
        filterable: false,
      },
      {
        field: ProcurementColumnName.currentMilestone,
        title: this.translateService.instant('PROCUREMENT.MILESTONE'),
        width: 100,
        filterable: false,
      },
      {
        field: ProcurementColumnName.advanceMilestoneTotalCompleted,
        title: this.translateService.instant('PROCUREMENT.TABLE.PROGRESS'),
        filterable: false,
        width: 85,
        hidden: true,
      },
      {
        field: ProcurementColumnName.categoryTranslation,
        title: this.translateService.instant('PROCUREMENT.CATEGORY'),
        filterable: false,
        width: 130,
      },
      {
        field: ProcurementColumnName.procurementMethodTranslation,
        title: this.translateService.instant('PROCUREMENT.ACQUISITION_METHOD'),
        filterable: false,
        width: 130,
      },
      {
        field: ProcurementColumnName.supervisionMethodTranslation,
        title: this.translateService.instant('PROCUREMENT.MONITORING_METHOD'),
        filterable: false,
        width: 130,
      },
      {
        field: ProcurementColumnName.totalComments,
        title: this.translateService.instant('PROCUREMENT.ADD_COMMENT'),
        filterable: false,
        width: 50,
      },
      {
        field: ProcurementColumnName.isMigrated,
        title: this.translateService.instant('PROCUREMENT.MIGRATED'),
        filterable: false,
        width: 40,
        hidden: true,
      },
      {
        field: ProcurementColumnName.packagesUnderReview,
        title: this.translateService.instant(
          'PROCUREMENT.PACKAGES_UNDER_REVIEW'
        ),
        filterable: false,
        width: 40,
        hidden: true,
      },
      {
        field: ProcurementColumnName.milestonesDelayed,
        title: this.translateService.instant('PROCUREMENT.MILESTONES_DELAYED'),
        filterable: false,
        width: 40,
        hidden: true,
      },
    ],
  };

  public dataStateChange(state: State): void {
    this.gridSettings.state = state;
    this.gridSettings.gridData = process(
      this._procurementPlanCollection,
      state
    );
    this.saveGrid();
  }

  public onReorder(e: any): void {
    const reorderedColumn = this.gridSettings.columnsConfig.splice(
      e.oldIndex,
      1
    );
    this.gridSettings.columnsConfig.splice(e.newIndex, 0, ...reorderedColumn);
    this.saveGrid();
  }

  public onResize(e: any): void {
    e.forEach((item) => {
      this.gridSettings.columnsConfig.find(
        (col) => col.field === item.column.field
      ).width = item.newWidth;
    });

    this.saveGrid();
  }

  viewHistoricChanges(process: BiddingProcesses): void {
    this.isLoading = true;

    this.processChangeSvc
      .getAllChanges(process.id)
      .pipe(
        exhaustMap((data: ProcurementProcessVersion) => {
          if (data) {
            return this.modalSvc.openModalHistoricChanges(data);
          } else {
            return of(null);
          }
        })
      )
      .subscribe(() => {
        this.isLoading = false;
      });
  }

  public onVisibilityChange(e: any): void {
    e.columns.forEach((column) => {
      this.gridSettings.columnsConfig.find(
        (col) => col.field === column.field
      ).hidden = column.hidden;
    });

    this.saveGrid();
  }

  public mapGridSettings(gridSettings: GridSettings): GridSettings {
    const state = gridSettings.state;

    return {
      state,
      columnsConfig: gridSettings.columnsConfig,
      gridData: process(this._procurementPlanCollection, state),
    };
  }

  private saveGrid(): void {
    const gridConfig = {
      columnsConfig: this.gridSettings.columnsConfig,
      state: this.gridSettings.state,
    };

    this.persistingService.set('procurementtSettings', gridConfig);
  }

  translateColumNames(): void {
    this.gridSettings.columnsConfig.forEach((colum) => {
      switch (colum.field) {
        case ProcurementColumnName.code:
          colum.title = this.translateService.instant(
            'PROCUREMENT.TABLE.PROCESS_ID'
          );
          break;
        case ProcurementColumnName.name:
          colum.title = this.translateService.instant('PROCUREMENT.TABLE.NAME');
          break;
        case ProcurementColumnName.componentName:
          colum.title = this.translateService.instant(
            'PROCUREMENT.TABLE.COMPONENT'
          );
          break;
        case ProcurementColumnName.projectAmountEstimatedAmount:
          colum.title = this.translateService.instant(
            'PROCUREMENT.TABLE.ESTIMATED_AMOUNT'
          );
          break;
        case ProcurementColumnName.totalAcumulatedAmount:
          colum.title = this.translateService.instant(
            'PROCUREMENT.PROCESS.ACTUAL_AMOUNT'
          );
          break;
        case ProcurementColumnName.statusTranslation:
          colum.title = this.translateService.instant(
            'PROCUREMENT.TABLE.STATUS'
          );
          break;
        case ProcurementColumnName.advanceMilestoneTotalCompleted:
          colum.title = this.translateService.instant(
            'PROCUREMENT.TABLE.PROGRESS'
          );
          break;
        case ProcurementColumnName.categoryTranslation:
          colum.title = this.translateService.instant('PROCUREMENT.CATEGORY');
          break;
        case ProcurementColumnName.procurementMethodTranslation:
          colum.title = this.translateService.instant(
            'PROCUREMENT.ACQUISITION_METHOD'
          );
          break;
        case ProcurementColumnName.supervisionMethodTranslation:
          colum.title = this.translateService.instant(
            'PROCUREMENT.MONITORING_METHOD'
          );
          break;
        case ProcurementColumnName.totalComments:
          colum.title = this.translateService.instant(
            'PROCUREMENT.ADD_COMMENT'
          );
          break;

        case ProcurementColumnName.isMigrated:
          colum.title = this.translateService.instant('PROCUREMENT.MIGRATED');
          break;

        case ProcurementColumnName.packagesUnderReview:
          colum.title = this.translateService.instant(
            'PROCUREMENT.PACKAGES_UNDER_REVIEW'
          );
          break;

        case ProcurementColumnName.milestonesDelayed:
          colum.title = this.translateService.instant(
            'PROCUREMENT.MILESTONES_DELAYED'
          );
          break;

        case ProcurementColumnName.currentMilestone:
          colum.title = this.translateService.instant('PROCUREMENT.MILESTONE');
          break;
        default:
          break;
      }
    });
  }
}
