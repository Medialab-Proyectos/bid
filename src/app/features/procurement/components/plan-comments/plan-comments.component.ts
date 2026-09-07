import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommentsByPlanService } from '../../services/comments-by-plan.service';
import { Comment, CommentsByPlan } from '@core/models/commentsByPlan.model';
import { TranslateService } from '@ngx-translate/core';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';

interface GridCommentsByProcess {
  biddingProcessProcurementProcessId: string;
  comments: Comment;
  processId: string;
}

@Component({
  selector: 'fi-plan-comments',
  templateUrl: './plan-comments.component.html',
})
export class PlanCommentsComponent implements OnInit, OnDestroy {
  constructor(
    private readonly commentsSvc: CommentsByPlanService,
    readonly translate: TranslateService,
    readonly notificationService: NotificationGlobalService
  ) {}
  dataGrid: any;

  @Input() planId: string;

  private unsubscribe$ = new Subject<void>();

  loading: boolean;
  public gridData: any[] = [];

  ngOnInit(): void {
    this.loading = true;
    this.commentsSvc
      .getCommentsByPlan(this.planId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (data) => {
          this.gridData = this.groupCommentsByProcess(data);
        },
        (error) => {
          this.showErrorToast(error);
        },
        () => {
          this.loading = false;
        }
      );
  }

  groupCommentsByProcess(comments: CommentsByPlan): GridCommentsByProcess[] {
    const obj = { ...comments };
    const groupedArray: GridCommentsByProcess[] = Object.values(
      obj.biddingProcurementProcessComments.reduce((acc, curr) => {
        if (!acc[curr.biddingProcessProcurementProcessId]) {
          acc[curr.biddingProcessProcurementProcessId] = {
            biddingProcessProcurementProcessId:
              curr.biddingProcessProcurementProcessId,
            comments: [],
            processId: curr.code,
          };
        }
        acc[curr.biddingProcessProcurementProcessId].comments.push(
          curr.comment
        );
        return acc;
      }, {})
    );
    return groupedArray;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  showErrorToast(msg: string): void {
    const message = this.translate.instant(msg);
    this.notificationService.showError(message);
  }
}
