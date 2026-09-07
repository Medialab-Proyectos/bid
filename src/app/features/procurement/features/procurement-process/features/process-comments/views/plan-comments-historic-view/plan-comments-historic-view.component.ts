import { Component, OnDestroy, OnInit } from '@angular/core';
import { Enumerator } from '@core/models';
import { ProcurementCommentResponse } from '@core/models/responses/procurement-comments-response.model';
import {
  BiddingProcessPlanStoreService,
  EnumsStoreService,
} from '@core/services/store-services';
import { AppStateWithContact } from '@core/store';
import { Store } from '@ngrx/store';
import {
  DataStateChangeEvent,
  GridDataResult,
} from '@progress/kendo-angular-grid';
import { State, process } from '@progress/kendo-data-query';
import { Subscription, delay, filter, map, take, tap } from 'rxjs';
import { ProcurementCommentsService } from '../../services/procurement-comments.service';
import { CommentsRequest } from '../../models';
import { CommentsEventBussService } from '../../services/comments-event-buss.service';
import { ProcurementCommentViewType } from '@core/enums';

@Component({
  selector: 'fi-plan-comments-historic-view',
  templateUrl: './plan-comments-historic-view.component.html',
})
export class PlanCommentsHistoricViewComponent implements OnInit, OnDestroy {
  private readonly subscriptions = new Subscription();

  loading = false;
  public commentVisibilitiesEnum: Enumerator[];

  disabledByProperty: [] = [];
  procurementPlanId: string;

  gridView: GridDataResult;
  pageSize = 10;
  skip = 0;
  comments: ProcurementCommentResponse[] = [];
  totalResults: number;
  public state: State = {
    skip: 0,
    take: this.pageSize,
    group: [],
  };
  public gridData: any = process(this.comments, this.state);
  commentsRequestBody: CommentsRequest = {
    filters: {
      user: null,
      visibility: null,
      dateRange: { initialDate: null, endDate: null },
      processId: null,
      processName: null,
      marked: false,
    },
    page: 1,
    size: this.pageSize,
  };
  public expandedDetailKeys: string[] = [];
  userEmail: string;
  refreshingTable: boolean;

  constructor(
    private readonly enumStoreSvc: EnumsStoreService,
    readonly storeContact: Store<AppStateWithContact>,
    private procurementCommentsService: ProcurementCommentsService,
    private commentBusSvc: CommentsEventBussService,
    private readonly biddingProcessStore: BiddingProcessPlanStoreService
  ) {}

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.commentBusSvc.currentFormValue$.subscribe((data) => {
        this.commentsRequestBody.filters = data;
        this.getComments();
      })
    );
    this.populateEnums();
    this.getEmailData();

    this.subscriptions.add(
      this.biddingProcessStore
        .getOrLoadBiddingProcessPlan()
        .pipe(
          filter((data) => data.biddingPlanState.biddingProcessPlan !== null),
          map((data) => data.biddingPlanState.biddingProcessPlan.id),
          take(1)
        )
        .subscribe((data) => {
          this.procurementPlanId = data;
        })
    );
  }

  getEmailData(): void {
    this.subscriptions.add(
      this.storeContact.subscribe((data) => {
        this.userEmail = data.contact?.contact?.email;
      })
    );
  }
  public expandDetailsBy = (dataItem): number => {
    return dataItem.planVersion;
  };
  populateEnums(): void {
    this.subscriptions.add(
      this.enumStoreSvc.selectEnums().subscribe((data) => {
        if (data.commentVisibilities) {
          this.commentVisibilitiesEnum = data.commentVisibilities;
        }
      })
    );
  }

  getComments(state?: DataStateChangeEvent): void {
    this.refreshingTable = true;
    this.procurementCommentsService
      .getCommentsByPlan(
        ProcurementCommentViewType.COMPLETE,
        this.commentsRequestBody.filters
      )
      .pipe(
        tap((data) => {
          this.expandedDetailKeys = [];
          this.refreshingTable = false;
          return data;
        }),
        delay(200)
      )
      .subscribe(
        (data) => {
          data.commentsByPlanVersion.forEach((element) => {
            if (!element.planVersion) {
              element.planVersion = '-';
            }
            element.commentsComplete[0].planVersion = element.planVersion;
            this.expandedDetailKeys = [
              ...this.expandedDetailKeys,
              element.planVersion,
            ];
            this.expandedDetailKeys = [];
          });
          this.comments = data.commentsByPlanVersion;
          this.totalResults = this.comments.length;
          this.groupAndSort(state);
        },
        () => {
          this.comments = [];
          this.loading = false;
          this.refreshingTable = false;
        }
      );
  }

  groupAndSort(state?: DataStateChangeEvent): void {
    if (!state) {
      this.gridData = process(this.comments, this.state);

      this.gridView = { data: this.gridData.data, total: this.totalResults };
    } else {
      this.state = state;

      this.gridData = process(this.comments, this.state);

      this.gridView = { data: this.gridData.data, total: this.totalResults };
    }
    this.loading = false;
  }

  public dataStateChange(state?: DataStateChangeEvent): void {
    if (state.skip === this.skip) {
      this.groupAndSort(state);
    } else {
      this.skip = state.skip;
      this.state.skip = this.skip;
      this.groupAndSort(state);
    }
  }
}
