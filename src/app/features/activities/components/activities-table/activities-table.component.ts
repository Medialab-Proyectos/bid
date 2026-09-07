import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  GroupDescriptor,
  process,
  SortDescriptor,
  State,
} from '@progress/kendo-data-query';
import {
  ActivitiesActiveObject,
  ActivitiesActiveResponse,
  ActivitiesRequest,
  ItemAction,
} from '@core/models';
import { ProcessActions } from '@core/enums';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import {
  DataBindingDirective,
  GridDataResult,
} from '@progress/kendo-angular-grid';
import { BehaviorSubject, Observable, Subscription, combineLatest } from 'rxjs';
import { DatePipe } from '@angular/common';
import { ActivitiesApiService } from '@core/services/apis';
import { Store } from '@ngrx/store';
import {
  AppStateWithContact,
  AppStateWithActivitiesSelectedProject,
} from '@core/store';
import { TranslateService } from '@ngx-translate/core';
import { PageChangeEvent } from '@progress/kendo-angular-pager';
import { ProjectStoreService } from '@core/services/store-services';
import { WorkflowStoreService } from '@fiduciary-interface/app/features/workflow/store/services/workflow-store.service';
import { TranslateEnumPipe } from '@fiduciary-interface/app/shared/pipes/translate-enum.pipe';
import { Enums } from '@core/models';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'fi-activities-table',
  templateUrl: './activities-table.component.html',
})
export class ActivitiesTableComponent implements OnChanges, OnDestroy {
  private readonly subscriptions = new Subscription();

  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
  @ViewChild(TooltipDirective) tooltipDir: TooltipDirective;

  @Input() category: string;

  @Output() actionitemID: EventEmitter<ItemAction<ProcessActions>> =
    new EventEmitter();

  filterObs$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public gridView: GridDataResult;
  gridData: any[];
  gridPaginate: any;
  IS_INTERNAL: boolean;
  public projectBuckets: string[] = [];
  public activitiesRequest: ActivitiesRequest;
  public skip = 0;
  public pageSize = 10;
  highlightValue: string;
  isLoading = true;
  displayMessage = 'ACTIVITIES.MESSAGES.NO_RECORDS';
  categoryActive: boolean;
  public sort: SortDescriptor[] = [
    {
      field: 'startDate',
      dir: 'desc',
    },
  ];
  public taskStep: any[] = [];
  public groups: GroupDescriptor[];
  public enumTypeWorkflowType: string;
  public enum = Enums;
  enumSteps: string;
  enumODSteps: string;
  public hashFieldToApiField = {
    workflowCode: 'idActivity',
    contractNumber: 'operationProject',
    ActivityType: 'flowType',
    workflowStatus: 'state',
    createdAt: 'startDate',
    lastExecution: 'endDate',
    pendingActionTranslated: 'pendingAction',
  };
  selectedProjectId: string;
  public state: State = {
    skip: 0,
    take: 10,
  };
  public sizes = [10, 20, 50];
  constructor(
    readonly router: Router,
    private readonly datePipe: DatePipe,
    readonly activitiesApi: ActivitiesApiService,
    readonly storeContact: Store<AppStateWithContact>,
    readonly storeProject: ProjectStoreService,
    private readonly serviceTranslate: TranslateService,
    private readonly workflowStoreService: WorkflowStoreService,
    private readonly translateEnum: TranslateEnumPipe,
    readonly storeActivitiesSelectedProject: Store<AppStateWithActivitiesSelectedProject>,
    private readonly activatedRoute: ActivatedRoute
  ) {
    this.subscriptions.add(
      this.storeContact.select('contact').subscribe((data) => {
        if (data.contact) {
          this.IS_INTERNAL = data.contact.is_internal;
        }
      })
    );
    this.initProjects();
    this.getLiteralworkflowType();
    this.subscriptions.add(
      this.activitiesApi.groups$.subscribe((groups: GroupDescriptor[]) => {
        this.groups = groups;
      })
    );
  }

  initProjects(): void {
    this.subscriptions.add(
      this.storeProject.projects().subscribe((res) => {
        if (res && res.newProjects.length >= 1) {
          res.newProjects.forEach((item) => {
            this.projectBuckets.push(item.projectBucketId);
          });
        }
      })
    );
    this.subscriptions.add(
      this.storeActivitiesSelectedProject
        .select('activitiesSelectedProjectBucketId')
        .subscribe((data) => {
          this.selectedProjectId = data?.activitiesSelectedProjectBucketId;
        })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes &&
      changes.category &&
      changes.category.currentValue !== changes.category.previousValue
    ) {
      if (
        changes.category.currentValue ===
        this.serviceTranslate.instant('ACTIVITIES.ACTIVE')
      ) {
        this.categoryActive = true;
      } else {
        this.categoryActive = false;
      }
      this.sort = [
        {
          field: 'createdAt',
          dir: 'desc',
        },
      ];
      this.activitiesRequest = {
        isActive: this.categoryActive,
        projectBuckets: this.selectedProjectId
          ? [this.selectedProjectId]
          : this.projectBuckets,
      };
      this.skip = 0;
      this.searchAndFilter();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  showActivities(): Observable<ActivitiesActiveResponse> {
    this.isLoading = true;
    this.displayMessage = '';
    if (this.gridView) {
      this.gridView.data = [];
    }
    let page = this.skip;
    if (this.skip !== 0) {
      page = this.skip / this.pageSize;
    }

    return this.activitiesApi
      .getAllActivities(
        this.activitiesRequest,
        page,
        this.pageSize,
        this.hashFieldToApiField[this.sort[0].field],
        this.sort[0].dir
      )
      .pipe(
        filter(({data}: ActivitiesActiveResponse) => !!data)
      );
  }

  formatDataGrid(data: any): any {
    data.map((item: any) => {
      item.createdAt = this.datePipe.transform(item.createdAt, 'dd MMM yyyy');
      item.lastExecution = this.datePipe.transform(
        item.lastExecution,
        'dd MMM yyyy'
      );
      item.workflowStatus = this.serviceTranslate.instant(
        this.getState(item.workflowStatus)
      );
      if (item.pendingAction) {
        item.pendingActionTranslated = this.translateEnum.transform(
          item.pendingAction,
          this.enumSteps as Enums
        );
      }
      const task = item.task.find((task) => {
        return task.linkTaskAction !== null;
      });
      item.currentStep = task?.step;
      item.ActivityType = this.translateEnum.transform(
        item.entityType,
        this.enumTypeWorkflowType as Enums
      );
    });
    this.gridView = {
      data,
      total: this.gridPaginate,
    };
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.searchAndFilter();
  }

  public groupChange(groups?: GroupDescriptor[]): void {
    this.activitiesApi.setGroups(groups);
    if (groups) {
      this.groups = groups;
      this.gridView = process(this.gridData, { group: groups });
      this.gridView.total = this.gridPaginate;
    } else if (groups !== undefined && this.groups.length > 0) {
      this.gridView = process(this.gridData, { group: this.groups });
      this.gridView.total = this.gridPaginate;
    }
  }

  searchAndFilter() {
    combineLatest([this.showActivities(), this.filterObs$]).subscribe(
      ([activities, filter]) => {
        this.getLiteralStep();
        this.addPrefixTaskAction(activities.data);
        this.gridData = activities.data;
        this.gridPaginate = activities.totalItems;
        this.formatDataGrid(activities.data);
        this.isLoading = false;
        this.displayMessage = 'ACTIVITIES.MESSAGES.NO_RECORDS';
        this.groupChange(this.groups);
        if (filter !== '') {
          this.filterGrid(filter);
        }
      }
    );
  }
  filterGrid(inputValue: string): void {
    this.gridView = process(this.gridData, {
      filter: {
        logic: 'or',
        filters: [
          {
            field: 'workflowCode',
            operator: 'contains',
            value: inputValue,
          },
          {
            field: 'operationProject',
            operator: 'contains',
            value: inputValue,
          },
          {
            field: 'ActivityType',
            operator: 'contains',
            value: inputValue,
          },
          {
            field: 'activityCode',
            operator: 'contains',
            value: inputValue,
          },
          {
            field: 'workflowStatus',
            operator: 'contains',
            value: inputValue,
          },
          {
            field: 'createdAt',
            operator: 'contains',
            value: inputValue,
          },
          {
            field: 'lastExecution',
            operator: 'contains',
            value: inputValue,
          },
        ],
      },
    });
    if (this.dataBinding) {
      this.dataBinding.skip = 0;
    }
  }

  route(dataItem): void {
    console.log(dataItem);
  }

  showTooltip(event: any): void {
    console.log(event);
    //
  }

  validateDate(date: string): string {
    return !!date ? date : 'no existe';
  }

  getState(state: string): string {
    switch (state) {
      case 'Running':
        return this.serviceTranslate.instant('ACTIVITIES.STATE.RUNNING');
      case 'Finished':
        return this.serviceTranslate.instant('ACTIVITIES.STATE.FINISHED');
      case 'Suspended':
        return this.serviceTranslate.instant('ACTIVITIES.STATE.SUSPENDED');
      case 'Faulted':
        return this.serviceTranslate.instant('ACTIVITIES.STATE.FAULTED');
      case 'Cancelled':
        return this.serviceTranslate.instant('ACTIVITIES.STATE.CANCELLED');
      case 'Completed':
        return this.serviceTranslate.instant('ACTIVITIES.STATE.COMPLETED');
      default:
        return ' ';
    }
  }

  public pageChangeEvent(event: PageChangeEvent): void {
    if (event.take) {
      this.pageSize = event.take;
    }
    this.skip = event.skip;
    this.searchAndFilter();
  }

  onFilter(inputValue: string): void {
    this.filterObs$.next(inputValue);
  }

  addPrefix(key: string, showDetails: boolean): string {
    if (this.IS_INTERNAL) {
      if (showDetails) {
        return this.serviceTranslate.instant(
          `ACTIVITIES.WORKFLOW.TASK.ACTION.${key
            .replace(/\s/g, '')
            .trim()
            .toUpperCase()}`
        );
      }
      return this.serviceTranslate.instant(
        `ACTIVITIES.OD.WORKFLOW.TASK.ACTION.${key
          .replace(/\s/g, '')
          .trim()
          .toUpperCase()}`
      );
    } else {
      if (showDetails) {
        return this.serviceTranslate.instant(
          `ACTIVITIES.OD.WORKFLOW.TASK.ACTION.${key
            .replace(/\s/g, '')
            .trim()
            .toUpperCase()}`
        );
      }
      return this.serviceTranslate.instant(
        `ACTIVITIES.WORKFLOW.TASK.ACTION.${key
          .replace(/\s/g, '')
          .trim()
          .toUpperCase()}`
      );
    }
  }

  addPrefixTaskAction(activities: ActivitiesActiveObject[]): void {
    activities.forEach((act) => {
      this.checkTasks(act);
    });
  }

  checkTasks(act: ActivitiesActiveObject): void {
    act.task.forEach((_task) => {
      if (_task.action !== '' && !_task.actionTranslate) {
        _task.actionTranslate = this.addPrefix(_task.action, act.showDetails);
      }
      if (this.IS_INTERNAL && this.checkArray(_task.role)) {
        _task.roles = this.getRoles(_task.role, _task.roles);
      }
    });
  }

  getRoles(roles: string[], taskRole: string): string {
    roles.forEach((rol, index) => {
      if (/^\d+$/.test(rol)) {
        let code = parseInt(rol);
        this.subscriptions.add(
          this.workflowStoreService.getEnums().subscribe((enums) => {
            this.taskStep = [...enums.workflowRoles];
            const formatCode = this.translateEnum.translateEnum(
              code,
              this.taskStep
            );
            if (index === 0) {
              taskRole = formatCode;
            } else {
              taskRole = ` ${taskRole}, ${formatCode}`;
            }
          })
        );
      } else {
        switch (rol?.toLocaleLowerCase()) {
          case 'coordinator':
            taskRole = this.serviceTranslate.instant('ROLE.COORDINATOR');
            break;
          case 'disbursement specialist':
            taskRole = this.serviceTranslate.instant(
              'ROLE.FIDUCIARY_SPECIALIST'
            );
            break;
          default:
            taskRole = rol;
            break;
        }
      }
    });
    return taskRole;
  }

  checkArray(my_arr): boolean {
    return !my_arr.some((x) => x === '');
  }

  getLiteralworkflowType(): void {
    this.enumTypeWorkflowType = this.enum.workflowTypes;
  }

  getLiteralStep(): void {
    this.enumODSteps = this.enum.onlineDisburmentWorkflowSteps;
    this.enumSteps = this.enum.workflowSteps;
  }

  handleIfShowRedirectAction(dataItem): boolean {
    return dataItem.task.some((tk) => tk.linkTaskAction !== null);
  }

  redirectInProgress(currentStep: number, dataItem): void {
    let tasks = dataItem.task;

    for (let task of tasks) {
      if (task.step === currentStep) {
        this.router.navigate(['../' + task.linkTaskAction], {
          relativeTo: this.activatedRoute,
        });
      }
    }
  }

  checkVisibility(dataItem: any): boolean {
    return dataItem.showDetails;
  }
}
