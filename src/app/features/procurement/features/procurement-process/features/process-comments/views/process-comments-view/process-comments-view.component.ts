import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Enumerator } from '@core/models';
import {
  CommentsByProcessResponse,
  ProcessCommentsResponse,
  ProcuremenProcessCommentsResponse,
} from '@core/models/responses/procurement-comments-response.model';
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
import { Subscription, filter } from 'rxjs';
import { ProcurementCommentsService } from '../../services/procurement-comments.service';
import { CommentsEventBussService } from '../../services/comments-event-buss.service';
import {
  ProcurementCommentTypeEnum,
  ProcurementCommentViewType,
  processCommentsTabEnum,
} from '@core/enums';
import { ProcurementComment } from '@fiduciary-interface/app/shared/components/dialog-comments/models';
import { delay, take, tap } from 'rxjs/operators';
import { CommentsRequest, FilterComment } from '../../models';
import { FormArray, FormGroup } from '@angular/forms';
import {
  CommentProcurementFormGroup,
  FormProcurementComments,
} from '@fiduciary-interface/app/shared/components/dialog-comments/models/commentsForm.model';
import { CommentFormService } from '@fiduciary-interface/app/shared/components/dialog-comments/services/comment-form.service';

@Component({
  selector: 'fi-process-comments-view',
  templateUrl: './process-comments-view.component.html',
})
export class ProcessCommentsViewComponent implements OnInit, OnDestroy {
  form: FormGroup<FormProcurementComments>[] = [];
  expandedDetailKeys: string[] = [];
  selectedProcess: string[] = [];

  private readonly subscriptions = new Subscription();

  loading = false;
  public commentVisibilitiesEnum: Enumerator[];

  disabledByProperty: [] = [];
  commentsFilter: FilterComment;

  gridView: GridDataResult;
  pageSize = 10;
  skip = 0;
  comments: ProcessCommentsResponse[] = [];
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
    page: 0,
    size: this.pageSize,
  };
  lastPage: number;

  userEmail: string;
  isHistoricTab: boolean =
    this.activatedRoute.snapshot.data.commentTypeUrl ===
    processCommentsTabEnum.PROCESS_HISTORIC;
  commentType = ProcurementCommentTypeEnum.PROCESS;
  procurementPlanId: string;
  planStatus: number;
  loadingApi = false;
  marked: boolean[] = [];
  refreshingTable: boolean;

  constructor(
    private readonly enumStoreSvc: EnumsStoreService,
    readonly storeContact: Store<AppStateWithContact>,
    private readonly activatedRoute: ActivatedRoute,
    private procurementCommentsService: ProcurementCommentsService,
    private commentBusSvc: CommentsEventBussService,
    private readonly biddingProcessStore: BiddingProcessPlanStoreService,
    private readonly commentsFormSvc: CommentFormService
  ) {}

  ngOnDestroy(): void {
    this.commentBusSvc.resetConsts();
    this.subscriptions.unsubscribe();
    this.commentBusSvc.commenType = null;
  }

  ngOnInit(): void {
    this.commentBusSvc.commenType = ProcurementCommentTypeEnum.PROCESS;
    this.setLoading();
    this.subscriptions.add(
      this.commentBusSvc.currentFormValue$.subscribe((data) => {
        this.commentsRequestBody.filters = data;
        if (this.procurementPlanId) {
          this.skip = 0;
          this.commentsRequestBody.page = 0;
          this.getComments();
        }
      })
    );
    this.getBiddingProcessPlan();
    this.setProcurementId();
    this.populateEnums();
    this.getEmailData();
    this.commentBusSvc.selectCommentsMode$.subscribe((data) => {
      if (data) {
        this.selectedProcess = [...this.expandedDetailKeys];
      }
    });
  }

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

  getComments(state?: DataStateChangeEvent): void {
    this.loading = true;
    this.refreshingTable = true;
    if (this.isHistoricTab) {
      this.procurementCommentsService
        .getCommentsProcess(
          this.procurementPlanId,
          ProcurementCommentViewType.COMPLETE,
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
          (x: ProcuremenProcessCommentsResponse) => {
            this.comments = this.mapData(
              x.commentsByProcess,
              ProcurementCommentViewType.COMPLETE
            );
            this.planStatus = x.planStatus;
            this.totalResults = x.paginate.count;
            this.checkAnyMarked();
            this.groupAndSort(state);
            this.loading = false;
          },
          () => {
            this.comments = [];
            this.form = [];
            this.loading = false;
            this.refreshingTable = false;
          }
        );
    } else {
      this.procurementCommentsService
        .getCommentsProcess(
          this.procurementPlanId,
          ProcurementCommentViewType.DRAFT,
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
          (x: ProcuremenProcessCommentsResponse) => {
            this.lastPage = x.paginate.pages;
            this.comments = this.mapData(
              x.commentsByProcess,
              ProcurementCommentViewType.DRAFT
            );
            this.comments.forEach((c, index) => {
              this.form[index] = new FormGroup<FormProcurementComments>({
                comments: new FormArray<FormGroup<CommentProcurementFormGroup>>(
                  []
                ),
              });
              c.comments.forEach((cc) => {
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
                  userNameCreated: cc.userNameCreated,
                  userNameEdited: cc.userNameEdited,
                  marked: cc?.marked,
                };
                this.commentsFormSvc.addCommentProcurement(
                  this.form[index],
                  aux
                );
              });
            });
            this.checkAnyMarked();
            this.planStatus = x.planStatus;
            this.totalResults = x.paginate.count;
            this.gridView = {
              data: [''],
              total: 0,
            };
            this.groupAndSort(state);
            this.loading = false;
          },
          () => {
            this.comments = [];
            this.form = [];
            this.loading = false;
            this.refreshingTable = false;
          }
        );
    }
  }

  mapData(
    data: CommentsByProcessResponse[],
    commentTypes: ProcurementCommentViewType
  ): ProcessCommentsResponse[] {
    const mappedData: ProcessCommentsResponse[] = [];

    data?.forEach((c) => {
      const aux = {
        processName: null,
        processCode: null,
        comments: [],
        parentId: null,
        processStatus: null,
      };
      aux.processCode = c.processCode;
      aux.processName = c.processName;
      aux.parentId = c.processId;
      aux.processStatus = c.processStatus;
      c.commentsByPlanVersion?.forEach((commentGroup) => {
        if (commentTypes === ProcurementCommentViewType.DRAFT) {
          aux.comments.push(
            ...JSON.parse(JSON.stringify(commentGroup.commentsDraft))
          );
          commentGroup.commentsDraft[0].planVersion = commentGroup?.planVersion;
        }
        if (commentTypes === ProcurementCommentViewType.COMPLETE) {
          commentGroup.commentsComplete[0].planVersion =
            commentGroup?.planVersion;
          aux.comments.push(
            ...JSON.parse(JSON.stringify(commentGroup?.commentsComplete))
          );
        }
      });

      mappedData.push(aux);
    });

    return mappedData;
  }

  groupAndSort(state?: DataStateChangeEvent): void {
    if (!state) {
      this.gridView = {
        data: this.comments,
        total: this.totalResults,
      };
    } else {
      state.skip = 0;
      this.state = state;

      this.gridData = process(this.comments, this.state);

      this.gridView = { data: this.gridData.data, total: this.totalResults };
    }
    let array: boolean[] = [];
    for (let i = 0; i < this.gridView.data.length; i++) {
      array.push(null);
    }
    this.commentBusSvc.processActiveCommentDraft = array;
  }

  public expandDetailsBy = (dataItem: any): number => {
    return dataItem.processCode;
  };

  public dataStateChange(state?: DataStateChangeEvent): void {
    if (state.skip === this.skip) {
      this.groupAndSort(state);
    } else {
      this.skip = state.skip;
      this.commentsRequestBody.page = state.skip / state.take;
      this.getComments(state);
    }
  }

  getLastIndexData(index: number): void {
    this.loading = true;
    this.gridView.data.splice(index, 1);
    this.form.splice(index, 1);
    if (this.lastPage === this.commentsRequestBody.page) {
      this.loading = false;
      return;
    }
    this.procurementCommentsService
      .getCommentsProcess(
        this.procurementPlanId,
        ProcurementCommentViewType.DRAFT,
        this.commentsRequestBody.size,
        this.commentsRequestBody.page,
        this.commentsRequestBody.filters
      )
      .subscribe(
        (data) => {
          const newData: CommentsByProcessResponse[] = [];
          newData.push(
            JSON.parse(
              JSON.stringify(
                data.commentsByProcess[data.commentsByProcess.length - 1]
              )
            )
          );

          const mappedData = this.mapData(
            [...newData],
            ProcurementCommentViewType.DRAFT
          );
          this.form[mappedData.length] = new FormGroup<FormProcurementComments>(
            {
              comments: new FormArray<FormGroup<CommentProcurementFormGroup>>(
                []
              ),
            }
          );
          mappedData[mappedData.length].comments.forEach((cc) => {
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
              userNameCreated: cc.userNameCreated,
              userNameEdited: cc.userNameEdited,
              marked: cc?.marked,
            };
            this.commentsFormSvc.addCommentProcurement(this.form[index], aux);
          });
          this.gridView.data.push(mappedData[0]);
          this.checkAnyMarked();

          this.loading = false;
        },
        () => {
          this.loading = false;
          this.refreshingTable = false;
        }
      );
  }
  setLoading(): void {
    this.subscriptions.add(
      this.commentBusSvc.loadingAPI$.subscribe((data) => {
        this.loadingApi = data;
      })
    );
  }

  checkAnyMarked(): void {
    this.marked = [];
    if (this.isHistoricTab) {
      this.comments.forEach((c, index) => {
        this.marked[index] = c.comments.filter((cc) => cc.marked).length > 0;
      });
    } else {
      this.form.forEach((f, index) => {
        this.marked[index] =
          f.controls.comments.controls.filter((fc) => fc.controls?.marked.value)
            .length > 0;
      });
    }
  }
}
