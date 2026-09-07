import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  BiddingProcessPlanStatus,
  ProcurementCommentTypeEnum,
  ProcurementCommentViewType,
} from '@core/enums';
import { Enumerator } from '@core/models';
import { ProcurementCommentResponse } from '@core/models/responses/procurement-comments-response.model';
import {
  BiddingProcessPlanStoreService,
  EnumsStoreService,
} from '@core/services/store-services';
import { AppStateWithContact } from '@core/store';
import { Store } from '@ngrx/store';
import { Subscription, filter, map, take } from 'rxjs';
import { ProcurementCommentsService } from '../../services/procurement-comments.service';
import { ProcurementDraftCommentsComponent } from '../../components/procurement-process-draft-comments/procurement-process-draft-comments.component';
import { CommentsEventBussService } from '../../services/comments-event-buss.service';
import {
  CommentProcurementFormGroup,
  FormProcurementComments,
} from '@fiduciary-interface/app/shared/components/dialog-comments/models/commentsForm.model';
import { FormArray, FormGroup } from '@angular/forms';
import { CommentFormService } from '@fiduciary-interface/app/shared/components/dialog-comments/services/comment-form.service';
import { ProcurementComment } from '@fiduciary-interface/app/shared/components/dialog-comments/models';
import { FilterComment } from '../../models/filtercomment.model';

@Component({
  selector: 'fi-plan-comments-active-view',
  templateUrl: './plan-comments-active-view.component.html',
})
export class PlanCommentsActiveViewComponent implements OnInit, OnDestroy {
  form: FormGroup<FormProcurementComments> =
    new FormGroup<FormProcurementComments>({
      comments: new FormArray<FormGroup<CommentProcurementFormGroup>>([]),
    });
  @ViewChild(ProcurementDraftCommentsComponent)
  draftComments: ProcurementDraftCommentsComponent;
  private readonly subscriptions = new Subscription();

  comments: ProcurementCommentResponse[] = [];
  commentVisibilitiesEnum: Enumerator[] = [];
  userEmail: string;
  commentType = ProcurementCommentTypeEnum.PLAN;
  parentId: string;
  procurementPlanId: string;
  loading = false;
  planStatus: BiddingProcessPlanStatus;

  filters: FilterComment = {
    user: null,
    visibility: null,
    dateRange: { initialDate: null, endDate: null },
    processId: null,
    processName: null,
    marked: false,
  };
  constructor(
    private readonly enumStoreSvc: EnumsStoreService,
    readonly storeContact: Store<AppStateWithContact>,
    private procurementCommentsService: ProcurementCommentsService,
    private commentBusSvc: CommentsEventBussService,
    private readonly commentsFormSvc: CommentFormService,
    private biddingProcessPlanStore: BiddingProcessPlanStoreService
  ) {}

  ngOnInit(): void {
    this.commentBusSvc.commenType = ProcurementCommentTypeEnum.PLAN;

    this.populateEnums();
    this.getEmailData();
    this.getParentId();
    this.subscriptions.add(
      this.commentBusSvc.currentFormValue$.subscribe((data) => {
        this.filters = data;
        this.getComments();
      })
    );
    this.subscriptions.add(
      this.biddingProcessPlanStore
        .getOrLoadBiddingProcessPlan()
        .pipe(
          filter((data) => data.biddingPlanState.biddingProcessPlan !== null),
          map((data) => {
            return {
              planId: data.biddingPlanState.biddingProcessPlan.id,
              planStatus: data.biddingPlanState.biddingProcessPlan.status,
            };
          }),
          take(1)
        )
        .subscribe((data) => {
          this.procurementPlanId = data.planId;
          this.planStatus = data.planStatus;
        })
    );
  }

  setProcurementId() {
    return this.procurementCommentsService
      .getCommentsByPlan(ProcurementCommentViewType.DRAFT, this.filters)
      .pipe(
        map((data) =>
          data.commentsByPlanVersion.map((data) => data.commentsDraft)
        )
      )
      .pipe(map((data) => data[0]));
  }

  getComments(): void {
    this.loading = true;
    this.setProcurementId().subscribe(
      (data) => {
        this.comments = data;

        this.form = new FormGroup<FormProcurementComments>({
          comments: new FormArray<FormGroup<CommentProcurementFormGroup>>([]),
        });
        this.comments.forEach((c) => {
          const aux: ProcurementComment = {
            id: c.id,
            text: c.text,
            visibility: c.visibility,
            source: c.source,
            status: c.status,
            created: new Date(c.created),
            createdBy: c.createdBy,
            actual: c?.actual,
            modifiedBy: c?.modifiedBy,
            edited: c?.edited,
            editedBy: c?.editedBy,
            userNameCreated: c?.userNameCreated,
            userNameEdited: c?.userNameEdited,
          };
          this.commentsFormSvc.addCommentProcurement(this.form, aux);
        });

        this.commentBusSvc.processActiveCommentDraft = [null];
        this.loading = false;
      },
      () => {
        this.comments = [];
        this.form = new FormGroup<FormProcurementComments>({
          comments: new FormArray<FormGroup<CommentProcurementFormGroup>>([]),
        });
        this.loading = false;
      }
    );
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
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.commentBusSvc.resetConsts();
    this.commentBusSvc.commenType = null;
  }

  getParentId() {
    this.biddingProcessPlanStore
      .getOrLoadBiddingProcessPlan()
      .pipe(
        filter((data) => data.biddingPlanState.biddingProcessPlan !== null),
        map((data) => data.biddingPlanState.biddingProcessPlan.id)
      )
      .subscribe((data) => (this.parentId = data));
  }
}
