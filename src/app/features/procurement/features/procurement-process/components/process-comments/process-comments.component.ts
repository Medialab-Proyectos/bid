import { Component, Input, OnChanges, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import {
  CommentStatusEnum,
  PermissionEnum,
  BiddingProcessProcurementProcessStatuses,
} from '@core/enums';
import { Enumerator } from '@core/models';
import { PermissionService } from '@core/services/app/permission/permission.service';
import { AppState } from '@core/store';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { FormConfig } from '../../models/form-config.model';
import { Comments, createComments } from '../../procurement-process.form';
import { commentEnvironment } from '@fiduciary-interface/app/shared/components/dialog-comments/dialog-comment.environment';

@Component({
  selector: 'fi-process-comments',
  templateUrl: './process-comments.component.html',
})
export class ProcessCommentsComponent implements OnInit, OnChanges, OnDestroy {
  commentsDisabled: boolean[];
  commentsDisabledBy: boolean[];
  public commentsCount = 0;
  comments: any;
  public formCommentsList: UntypedFormArray;
  @Input() commentsProcess: UntypedFormGroup = Comments();
  @Input() number = 6;
  @Input() visibility: Enumerator[];
  @Input() readonly;
  @Input() formConfig: FormConfig;
  @Input() processStatus: number;

  canEnterNewCommentForInternal: boolean;
  private readonly subscription = new Subscription();

  dataEmail: string;
  hasPermission: boolean;

  constructor(
    readonly store: Store<AppState>,
    private readonly permissionSvc: PermissionService
  ) {}

  ngOnInit(): void {
    this.formCommentsList = this.commentsList;
    this.getEmail();
    this.compareEmailAndUser();
    this.hasPermission = this.checkPermission();
    this.checkIsInternal();
    if (this.readonly) {
      this.subscription.add(
        this.formCommentsList.valueChanges.subscribe(() => {
          this.checkDisableComments();
        })
      );
    }
  }

  ngOnChanges(): void {
    this.checkDisableComments();
  }

  checkDisableComments(): void {
    this.comments = this.commentsProcess.getRawValue().commentsList;
    this.commentsDisabled = [];
    this.comments.forEach((c) => {
      if (this.readonly) {
        this.commentsDisabled.push(true);
      } else {
        if (c.status === CommentStatusEnum.DRAFT) {
          this.commentsDisabled.push(false);
        } else {
          this.commentsDisabled.push(true);
        }
      }
    });
    this.compareEmailAndUser();
  }
  public addCommentPermission = [
    PermissionEnum.ENTERPROCUREMENTCOMMENTS,
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  public deleteCommentPermission = [
    PermissionEnum.ENTERPROCUREMENTCOMMENTS,
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];

  checkIsInternal(): void {
    const sub = this.store.select('contact').subscribe((data) => {
      this.checkEnterNewCommentVisbility(data.contact.is_internal);
    });
    this.subscription.add(sub);
  }

  checkEnterNewCommentVisbility(isInternal: boolean): void {
    if (isInternal) {
      const statusesNotDisplayBtn = [
        BiddingProcessProcurementProcessStatuses.DELETED,
        BiddingProcessProcurementProcessStatuses.DRAFT,
        BiddingProcessProcurementProcessStatuses.CANCELLED,
        BiddingProcessProcurementProcessStatuses.UNSUCCESFUL_PROCESS,
        BiddingProcessProcurementProcessStatuses.PROCUREMENT_INELIGIBLE,
        BiddingProcessProcurementProcessStatuses.REJECTION_BIDS,
        BiddingProcessProcurementProcessStatuses.CONTRACT_TERMINATED,
      ];
      if (statusesNotDisplayBtn.includes(this.processStatus)) {
        this.canEnterNewCommentForInternal = false;
      } else {
        this.canEnterNewCommentForInternal = true;
      }
    } else {
      this.canEnterNewCommentForInternal = true;
    }
  }

  get commentsList() {
    return this.commentsProcess.get('commentsList') as UntypedFormArray;
  }

  addNewCommentFormGroup(): void {
    this.commentsList.push(createComments());
    this.commentsCount++;
    this.commentsList.controls[this.commentsList.length - 1]
      .get('visibility')
      .setValue(commentEnvironment.DEFAULT_VISIBILITY.toString());
  }

  deleteComment(index: number): void {
    this.commentsList.removeAt(index);
    this.ngOnChanges();
  }

  getEmail(): void {
    const sub = this.store.select('contact').subscribe((data) => {
      this.dataEmail = data.contact.email;
    });
    this.subscription.add(sub);
  }

  checkPermission(): boolean {
    return this.permissionSvc.haveSomePermissions([
      PermissionEnum.SEND_OFFICIAL_PROCUREMENT_COMUNICATIONS,
      PermissionEnum.MANAGE_PROCUREMENT_COMMENTS,
    ]);
  }

  compareEmailAndUser(): void {
    this.commentsDisabledBy = [];
    this.comments.forEach((comment) => {
      if (this.readonly) {
        this.commentsDisabledBy.push(true);
      } else {
        if (this.dataEmail === comment.createdBy) {
          this.commentsDisabledBy.push(false);
        } else {
          this.commentsDisabledBy.push(true);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
