import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { DataBindingDirective } from '@progress/kendo-angular-grid';
import { Subscription } from 'rxjs';
import { TaskRowResponse } from '../../../../models/activities.model';
import { Store } from '@ngrx/store';
import { AppStateWithContact } from '@core/store';
import { Enums } from '@core/models';
import { TranslateService } from '@ngx-translate/core';
import { WorkflowTypeEnum } from '@core/enums';

@Component({
  selector: 'fi-activity-detail-task-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './activity-detail-task-table.component.html',
})
export class ActivityTaskTableComponent implements OnChanges, OnDestroy {
  private readonly subscriptions = new Subscription();

  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
  @ViewChild(TooltipDirective) tooltipDir: TooltipDirective;

  gridView: any[];
  gridData: any[];

  @Input() activityTaskRows: TaskRowResponse[];
  _codeWorkflow: number;

  @Input() set codeWorkflow(value: number) {
    this._codeWorkflow = value;
    this.getLiteralStep(this._codeWorkflow);
  }

  public IS_INTERNAL: boolean;
  public enumType: string;
  public enum = Enums;

  constructor(
    readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    readonly storeContact: Store<AppStateWithContact>,
    private readonly serviceTranslate: TranslateService
  ) {
    this.getVisibilityUser();
  }

  getVisibilityUser() {
    this.subscriptions.add(
      this.storeContact.select('contact').subscribe((data) => {
        if (data.contact) {
          this.IS_INTERNAL = data.contact.is_internal;
        }
      })
    );
  }
  ngOnChanges(changes): void {
    if (changes && changes.activityTaskRows) {
      this.formatDataGrid(changes.activityTaskRows.currentValue);
      this.gridData = changes.activityTaskRows.currentValue;
      this.gridView = this.gridData;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  formatDataGrid(data: TaskRowResponse[]): void {
    data.forEach((item: TaskRowResponse) => {
      if (item.linkTaskAction) {
        item.action = this.serviceTranslate.instant('ACTIVITIES.IN_PROGRESS');
      }
      item.users = item.user.join(',');
    });
  }

  redirectInProgress(dataItem: any): void {
    if (dataItem.linkTaskAction) {
      this.router.navigate(['../' + dataItem.linkTaskAction], {
        relativeTo: this.activatedRoute,
      });
    }
  }

  getGeneralAction(dataItem: any): string {
    return dataItem.actionTranslate? dataItem.actionTranslate : dataItem.action;
  }

  getLiteralStep(typeWorkflow: number): void {
    if (this.isWorkflowOD(typeWorkflow)) {
      this.enumType = this.enum.onlineDisburmentWorkflowSteps;
    } else {
      this.enumType = this.enum.workflowSteps;
    }
  }

  isWorkflowOD(typeWorkflow: number): boolean {
    return (
      !this.IS_INTERNAL &&
      typeWorkflow === WorkflowTypeEnum.FINANCIAL_TRANSACTION
    );
  }
}
