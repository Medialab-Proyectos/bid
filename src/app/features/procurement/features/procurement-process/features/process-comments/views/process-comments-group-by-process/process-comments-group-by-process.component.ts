import { Component, OnDestroy, OnInit } from '@angular/core';
import { Enumerator } from '@core/models';
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
import { Subscription, delay, filter, take, tap } from 'rxjs';
import { ProcurementCommentsService } from '../../services/procurement-comments.service';
import { CommentsEventBussService } from '../../services/comments-event-buss.service';
import {
  CommentsDomain,
  ProcuremenProcessCommentsByProcessesResponse,
  ProcuremenProcessCommentsResponse,
  ProcessCommentsByProcessesResponse,
  ProcurementComment,
} from '@fiduciary-interface/app/shared/components/dialog-comments/models';
import { ProcurementCommentViewType } from '@core/enums';
import { CommentsRequest } from '../../models';
import { FormArray, FormGroup } from '@angular/forms';
import {
  CommentProcurementFormGroup,
  FormProcurementComments,
} from '@fiduciary-interface/app/shared/components/dialog-comments/models/commentsForm.model';
import { CommentFormService } from '@fiduciary-interface/app/shared/components/dialog-comments/services/comment-form.service';

@Component({
  selector: 'fi-process-comments-group-by-process',
  templateUrl: './process-comments-group-by-process.component.html',
})
export class ProcessCommentsGroupByProcessComponent
  implements OnInit, OnDestroy
{
  private readonly subscriptions = new Subscription();
  form: FormGroup<FormProcurementComments>[] = [];
  expandedDetailKeys: string[] = [];
  selectedProcess: string[] = [];

  loading = false;
  public commentVisibilitiesEnum: Enumerator[];

  disabledByProperty: [] = [];
  load = false;
  gridView: GridDataResult;
  pageSize = 10;
  skip = 0;
  data: any[] = [];

  totalResults: number;
  public state: State = {
    skip: 0,
    take: this.pageSize,
    group: [],
  };
  public gridData: any = process(this.data, this.state);
  commentsRequestBody: CommentsRequest = {
    filters: {
      user: null,
      visibility: null,
      dateRange: { initialDate: null, endDate: null },
      processId: null,
      processName: null,
      marked: false,
    },
    page: 0,
    size: this.pageSize,
  };
  userEmail: string;
  parentId: string;
  procurementPlanId: string;
  marked: boolean[] = [];
  refreshingTable: boolean;

  constructor(
    private readonly enumStoreSvc: EnumsStoreService,
    readonly storeContact: Store<AppStateWithContact>,
    private procurementCommentsService: ProcurementCommentsService,
    private commentBusSvc: CommentsEventBussService,
    private readonly biddingProcessStore: BiddingProcessPlanStoreService,
    private readonly commentsFormSvc: CommentFormService
  ) {}
  ngOnDestroy(): void {
    this.commentBusSvc.resetConsts();
    this.subscriptions.unsubscribe();
  }

  ngOnInit(): void {
    this.getEmailData();
    this.subscriptions.add(
      this.commentBusSvc.currentFormValue$.subscribe((data) => {
        this.commentsRequestBody.filters = data;
        this.getComments();
      })
    );
    this.getBiddingProcessPlan();
    this.setProcurementId();
    this.populateEnums();
    this.commentBusSvc.selectCommentsMode$.subscribe((data) => {
      if (data) {
        this.selectedProcess = [...this.expandedDetailKeys];
      }
    });
  }

  public expandDetailsBy = (dataItem: any): number => {
    return dataItem.processCode;
  };

  setProcurementId(): void {
    this.subscriptions.add(
      this.biddingProcessStore
        .biddingProcessPlan()
        .pipe(
          filter((data) => {
            return data.biddingProcessPlan !== null;
          })
        )
        .pipe(take(1))
        .subscribe((state) => {
          this.procurementPlanId = state.biddingProcessPlan.id;
          this.getComments();
        })
    );
  }
  getBiddingProcessPlan(): void {
    const sub = this.biddingProcessStore
      .getOrLoadBiddingProcessPlan()
      .subscribe();
    this.subscriptions.add(sub);
  }
  getComments(state?: DataStateChangeEvent) {
    if (this.procurementPlanId) {
      this.load = true;
      this.loading = true;
      this.refreshingTable = true;
      this.procurementCommentsService
        .getCommentsByProcess(
          this.procurementPlanId,
          CommentsDomain.BIDDINGPROCESSPROCUREMENTPROCESS,
          ProcurementCommentViewType.DRAFT_COMPLETE,
          this.commentsRequestBody.size,
          this.commentsRequestBody.page,
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
            const mappedData = this.mapCommentsByProcesses(data);

            this.data = mappedData.commentsByProcesses;
            this.totalResults = mappedData.paginate.count;

            this.data.forEach((c, index) => {
              this.form[index] = new FormGroup<FormProcurementComments>({
                comments: new FormArray<FormGroup<CommentProcurementFormGroup>>(
                  []
                ),
              });
              c.commentsDraft.forEach((cc) => {
                const aux: ProcurementComment = {
                  id: cc.id,
                  text: cc.text,
                  visibility: cc.visibility,
                  source: cc.source,
                  status: cc.status,
                  created: new Date(cc.created),
                  createdBy: cc.createdBy,
                  actual: cc?.actual,
                  modifiedBy: cc?.modifiedBy,
                  edited: cc?.edited,
                  editedBy: cc?.editedBy,
                  userNameCreated: cc?.userNameCreated,
                  userNameEdited: cc?.userNameEdited,
                  marked: cc?.marked,
                };
                this.commentsFormSvc.addCommentProcurement(
                  this.form[index],
                  aux
                );
              });
            });
            this.checkAnyMarked();
            this.groupAndSort(state);
            this.load = false;
          },
          () => {
            this.data = [];
            this.loading = false;
            this.refreshingTable = false;
          }
        );
    }
  }

  getEmailData(): void {
    this.subscriptions.add(
      this.storeContact.subscribe((data) => {
        this.userEmail = data.contact?.contact?.email;
      })
    );
  }
  populateEnums(): void {
    this.subscriptions.add(
      this.enumStoreSvc.selectEnums().subscribe((data) => {
        if (data.commentVisibilities) {
          this.commentVisibilitiesEnum = data.commentVisibilities;
        }
      })
    );
  }

  groupAndSort(state?: DataStateChangeEvent): void {
    if (!state) {
      this.gridView = {
        data: this.data,
        total: this.totalResults,
      };
    } else {
      state.skip = 0;
      this.state = state;

      this.gridData = process(this.data, this.state);

      this.gridView = { data: this.gridData.data, total: this.totalResults };
    }
    let array: boolean[] = [];
    for (let i = 0; i < this.data.length; i++) {
      array.push(null);
    }
    this.commentBusSvc.processActiveCommentDraft = array;
    this.loading = false;
  }

  public dataStateChange(state?: DataStateChangeEvent): void {
    if (state.skip === this.skip) {
      this.groupAndSort(state);
    } else {
      this.skip = state.skip;
      this.commentsRequestBody.page = state.skip / state.take;
      this.getComments(state);
    }
  }

  mapCommentsByProcesses(
    procurementComments: ProcuremenProcessCommentsResponse
  ): ProcuremenProcessCommentsByProcessesResponse {
    const response: ProcuremenProcessCommentsByProcessesResponse = {
      commentsByProcesses: [],
      paginate: procurementComments.paginate,
      planStatus: procurementComments.planStatus,
    };

    let resp: ProcessCommentsByProcessesResponse;

    procurementComments.commentsByProcess.forEach((commentsByProcess) => {
      resp = {
        processCode: '',
        processName: '',
        commentsDraft: [],
        commentsComplete: [],
        parentId: null,
        processStatus: commentsByProcess.processStatus,
      };
      commentsByProcess.commentsByPlanVersion.forEach(
        (commentByPlanVersion) => {
          resp.processCode = commentsByProcess.processCode;
          resp.processName = commentsByProcess.processName;
          resp.parentId = commentsByProcess.processId;

          resp.commentsDraft.push(
            ...JSON.parse(JSON.stringify(commentByPlanVersion.commentsDraft))
          );
          resp.commentsComplete.push(
            ...JSON.parse(JSON.stringify(commentByPlanVersion.commentsComplete))
          );

          if (resp.commentsComplete.length > 0) {
            resp.commentsComplete[0].planVersion =
              commentByPlanVersion.planVersion
                ? commentByPlanVersion.planVersion
                : null;
          }
        }
      );
      response.commentsByProcesses.push(resp);
    });
    return response;
  }

  checkAnyMarked(): void {
    this.marked = [];
    this.form.forEach((f, index) => {
      const draftMarked =
        f?.controls.comments.controls?.filter((fc) => {
          return fc.controls?.marked.value;
        }).length > 0;
      const completedMarked =
        this.data[index]?.commentsComplete.filter((c) => {
          return c?.marked;
        }).length > 0;
      this.marked[index] = draftMarked || completedMarked;
    });
  }
}
