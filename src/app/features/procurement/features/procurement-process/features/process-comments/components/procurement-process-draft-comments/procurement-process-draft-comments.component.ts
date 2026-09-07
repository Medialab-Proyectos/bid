import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ChangeDetectorRef,
} from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import {
  BiddingProcessPlanStatus,
  BiddingProcessProcurementProcessStatuses,
  CommentsSelectionAction,
  PermissionEnum,
  ProcurementCommentTypeEnum,
} from '@core/enums';
import { Enumerator } from '@core/models';
import { PermissionService } from '@core/services/app/permission/permission.service';
import {
  CommentsDomain,
  ProcurementComment,
} from '@fiduciary-interface/app/shared/components/dialog-comments/models';
import {
  CommentProcurementFormGroup,
  FormProcurementComments,
} from '@fiduciary-interface/app/shared/components/dialog-comments/models/commentsForm.model';
import { CommentFormService } from '@fiduciary-interface/app/shared/components/dialog-comments/services/comment-form.service';
import {
  Subscription,
  debounceTime,
  distinctUntilChanged,
  filter,
  take,
} from 'rxjs';
import { ProcurementCommentsService } from '../../services/procurement-comments.service';
import { CommentsEventBussService } from '../../services/comments-event-buss.service';
import {
  PostCommentResponse,
  UpdateCommentsResponse,
} from '@core/models/responses/procurement-comments-response.model';
import { AppState, AppStateWithContact } from '@core/store';
import { Store } from '@ngrx/store';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'fi-process-draft-comments',
  templateUrl: './procurement-process-draft-comments.component.html',
})
export class ProcurementDraftCommentsComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @Input() userEmail: string;
  @Input() draftComments: ProcurementComment[] = [];
  @Input() set commentVisibilitiesEnum(visibilityEnum: Enumerator[]) {
    this.visibility = visibilityEnum;
  }
  @Input() commentType: ProcurementCommentTypeEnum;
  @Input() processIndex: number = 0;
  @Input() parentId: string;
  @Input() planStatus: number;
  @Input() processStatus: number;
  @Input() expandedProcessCodes: string[] = [];
  @Input() processCode: string = '';

  @Output() reCallAPI: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() checkMarked: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input() form: FormGroup<FormProcurementComments>;

  private readonly subscriptions = new Subscription();
  visibility: Enumerator[];
  generalForm: FormGroup<FormProcurementComments>;

  disabledByProperty: boolean[];
  modifiedComments: boolean[] = [];
  isInternal: boolean;
  addNewCommentOption: boolean;
  editOption: boolean;
  isIDisabledByPermissiopn: boolean;

  editionMode: boolean = false;
  selectCommentsMode = false;
  selectedComments: string[] = [];
  loading = true;
  public visibilityPermissionExternal: PermissionEnum[] = [
    PermissionEnum.VIEW_PROCUREMENT_INFORMATION,
  ];
  public visibilityPermissionInternal: PermissionEnum[] = [
    PermissionEnum.VIEW_PROCUREMENT_INFORMATION,
  ];
  hasPermissionsChangeVisibility: boolean = false;

  showCheckbox: boolean[] = [];

  constructor(
    private readonly commentsFormSvc: CommentFormService,
    private readonly permissionSvc: PermissionService,
    readonly procurementCommentsService: ProcurementCommentsService,
    private readonly commentsBusSvc: CommentsEventBussService,
    readonly storeContact: Store<AppStateWithContact>,
    readonly store: Store<AppState>,
    readonly cd: ChangeDetectorRef,
    private readonly notificationGlobalService: NotificationGlobalService,
    private readonly translate: TranslateService
  ) {
    this.subToChanges();
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.disableCommentsByProperty();
      this.loading = false;
      this.subscriptions.add(
        this.commentsBusSvc.selectCommentsMode$.subscribe((data) => {
          this.selectCommentsMode = data;
          this.form.controls.comments.controls.forEach((c, index) => {
            setTimeout(() => {
              const value =
                this.expandedProcessCodes.includes(this.processCode) &&
                !this.disableComment(index);
              c.controls.selected.setValue(value);
              let event = {
                target: {
                  checked: value,
                },
              };
              this.onCheckboxChange(event, c);
            }, 100);
          });
          if (!this.loading) {
            this.disableChekbox();
            this.disabledByProperty = [];
            for (
              let i = 0;
              i < this.generalForm.controls.comments.length;
              i++
            ) {
              this.disabledByProperty.push(
                this.generalForm.controls.comments.controls[i].controls
                  .createdBy.value !== this.userEmail || this.disableByStatus()
              );
              this.modifiedComments[i] = false;
            }
            this.disableCommentsByProperty();
          }
        })
      );
    });
    this.generalForm.controls.comments.controls.forEach((c, index) => {
      const subVisivility = c.controls.visibility.valueChanges;
      const subText = c.controls.text.valueChanges;

      this.subscriptions.add(
        subVisivility.pipe(distinctUntilChanged()).subscribe(() => {
          this.onChangesLogic(index);
        })
      );
      this.subscriptions.add(
        subText.pipe(debounceTime(300)).subscribe(() => {
          this.onChangesLogic(index);
        })
      );
    });
    this.cd.detectChanges();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.commentsBusSvc.selectedComments = {};
    this.commentsBusSvc.commentsUpdateVisibility = null;
  }

  ngOnInit(): void {
    this.getEmailData();
    this.checkIsInternal();
    this.subChangeAllVisibilityBtn();
    this.addNewCommentOption = this.showAddCommentOption(
      this.processStatus,
      this.planStatus
    );
    this.editOption = this.showEditOption(this.processStatus, this.planStatus);

    this.isIDisabledByPermissiopn = this.checkDisabledCommentPermission();
  }

  disableByStatus(): boolean {
    if (this.commentType === ProcurementCommentTypeEnum.PLAN) {
      return this.planStatus === BiddingProcessPlanStatus.IN_SYNC;
    }
    const internalUserDomain = 'iadb.org';
    const userEmailDomain = this.userEmail.split('@')[1].toLocaleLowerCase();
    const statusesCantEdit = [
      BiddingProcessProcurementProcessStatuses.DELETED,
      BiddingProcessProcurementProcessStatuses.CANCELLED,
      BiddingProcessProcurementProcessStatuses.UNSUCCESFUL_PROCESS,
      BiddingProcessProcurementProcessStatuses.PROCUREMENT_INELIGIBLE,
      BiddingProcessProcurementProcessStatuses.REJECTION_BIDS,
      BiddingProcessProcurementProcessStatuses.CONTRACT_TERMINATED,
    ];
    const extenalRestriction = [
      BiddingProcessProcurementProcessStatuses.UNDER_REVIEW,
      BiddingProcessProcurementProcessStatuses.UNDER_REVIEW_MODIFIED,
      BiddingProcessProcurementProcessStatuses.PROCUREMENT_COMPLETE,
    ];
    const internalRestriction = [
      BiddingProcessProcurementProcessStatuses.DRAFT,
    ];

    let disable = false;
    if (userEmailDomain === internalUserDomain) {
      disable =
        statusesCantEdit.includes(this.processStatus) ||
        internalRestriction.includes(this.processStatus);
    } else {
      disable =
        statusesCantEdit.includes(this.processStatus) ||
        extenalRestriction.includes(this.processStatus);
    }

    return this.planStatus === BiddingProcessPlanStatus.IN_SYNC || disable;
  }

  getEmailData(): void {
    this.subscriptions.add(
      this.storeContact
        .pipe(
          filter((data) => {
            return (
              data.contact.contact.email !== null &&
              data.contact.contact.email !== undefined
            );
          })
        )
        .pipe(take(1))
        .subscribe((data) => {
          this.userEmail = data.contact?.contact?.email;
          this.setFormLogic();
        })
    );
  }

  setFormLogic(): void {
    if (this.form) {
      this.generalForm = this.form;

      this.disabledByProperty = [];

      for (let i = 0; i < this.generalForm.controls.comments.length; i++) {
        this.disabledByProperty.push(
          this.generalForm.controls.comments.controls[i].controls.createdBy
            .value !== this.userEmail || this.disableByStatus()
        );
        this.modifiedComments[i] = false;
      }
    }
  }

  onChangesLogic(index: number): void {
    this.modifiedComments[index] = !this.checkChanges(index);

    this.eventBusLogic();
  }

  disableCommentsByProperty(): void {
    this.disabledByProperty.forEach((e, index) => {
      this.disableVisibility(index);
      if (e || this.selectCommentsMode) {
        this.generalForm?.controls?.comments.controls[
          index
        ].controls.text.disable();
      } else {
        this.generalForm?.controls?.comments.controls[
          index
        ].controls.text.enable();
      }
    });
  }

  get comments(): FormArray<FormGroup<CommentProcurementFormGroup>> {
    return this.generalForm?.controls?.comments;
  }

  checkPermission(index: number): boolean {
    const createdBy =
      this.generalForm.controls.comments.controls[index]?.controls?.createdBy
        ?.value;
    const internalUserDomain = 'iadb.org';
    const userEmailDomain = this.userEmail.split('@')[1].toLocaleLowerCase();
    const commentEmailDomain = createdBy?.split('@')[1]?.toLocaleLowerCase();

    //SPECIAL CASE FOR createdBy WITHOUT DOMAIN
    if (commentEmailDomain === undefined && createdBy !== null) {
      return false;
    }
    const hasExternalPermission = this.permissionSvc.haveSomePermissions(
      this.visibilityPermissionExternal
    );
    const hasInternalPermission = this.permissionSvc.haveSomePermissions(
      this.visibilityPermissionInternal
    );
    this.hasPermissionsChangeVisibility =
      hasInternalPermission || hasExternalPermission;
    if (createdBy === null) {
      return hasExternalPermission || hasInternalPermission;
    } else if (
      hasExternalPermission &&
      userEmailDomain !== internalUserDomain &&
      commentEmailDomain !== internalUserDomain
    ) {
      return true;
    } else if (
      hasInternalPermission &&
      userEmailDomain === internalUserDomain &&
      commentEmailDomain === internalUserDomain
    ) {
      return true;
    }
    return false;
  }

  deleteComment(index: number): void {
    const commentId =
      this.generalForm?.controls.comments.controls[index].controls.id.value;

    if (!commentId) {
      this.deleteCommentLogic(index);
      return;
    } else {
      this.commentsBusSvc.loading = true;
      this.procurementCommentsService
        .deleteComment(
          commentId,
          this.commentType === ProcurementCommentTypeEnum.PROCESS ||
            this.commentType === ProcurementCommentTypeEnum.PROCESS_DETAIL
            ? CommentsDomain.BIDDINGPROCESSPROCUREMENTPROCESS
            : CommentsDomain.BIDDINGPROCESSPLAN
        )
        .subscribe(
          () => {
            this.deleteCommentLogic(index);
            this.commentsBusSvc.loading = false;
            const msg = this.translate.instant(
              'PROCUREMENT.COMMENTS.DELETE_SUCCESSFUL'
            );
            this.notificationGlobalService.showSuccess(msg);
            this.checkMarked.emit(true);
          },
          () => {
            this.commentsBusSvc.loading = false;
            const msg = this.translate.instant(
              'PROCUREMENT.COMMENTS.DELETE_ERROR'
            );
            this.notificationGlobalService.showError(msg);
          }
        );
    }
  }

  deleteCommentLogic(index: number): void {
    this.generalForm?.controls?.comments.removeAt(index);
    this.modifiedComments.splice(index, 1);
    this.disabledByProperty.splice(index, 1);

    this.eventBusLogic();
    if (
      this.commentType === ProcurementCommentTypeEnum.PROCESS &&
      this.generalForm?.controls?.comments.length === 0
    ) {
      this.reCallAPI.emit(true);
    }
  }

  saveComment(index: number): void {
    if (this.generalForm.controls.comments.controls[index].invalid) {
      this.generalForm.controls.comments.controls[index].markAsDirty();
      this.generalForm.controls.comments.controls[index].markAllAsTouched();
      return;
    }
    this.commentsBusSvc.loading = true;

    const domain =
      this.commentType === ProcurementCommentTypeEnum.PROCESS ||
      this.commentType === ProcurementCommentTypeEnum.PROCESS_DETAIL
        ? CommentsDomain.BIDDINGPROCESSPROCUREMENTPROCESS
        : CommentsDomain.BIDDINGPROCESSPLAN;

    const commentId =
      this.generalForm.controls.comments.controls[index].controls.id.value;

    if (!!commentId) {
      const commentRequest = this.procurementCommentsService.mapUpdateComments(
        this.generalForm.controls.comments.controls[index],
        this.parentId
      );
      this.procurementCommentsService
        .updateComments(domain, commentRequest)
        .subscribe(
          (data: UpdateCommentsResponse) => {
            this.generalForm.controls.comments.controls[index].patchValue({
              oldText: data.commentsParent[0].comment.text,
              oldVisibility: String(data.commentsParent[0].comment.visibility),
              editedBy: data.commentsParent[0].comment.editedBy,
              edited: data.commentsParent[0].comment.edited,
              userNameCreated: data.commentsParent[0].comment.userNameCreated,
              userNameEdited: data.commentsParent[0].comment.userNameEdited,
            });

            this.modifiedComments[index] = false;
            this.commentsBusSvc.loading = false;
            const msg = this.translate.instant(
              'PROCUREMENT.COMMENTS.UPDATE_SUCCESSFUL'
            );
            this.onChangesLogic(index);
            this.notificationGlobalService.showSuccess(msg);
          },
          () => {
            this.commentsBusSvc.loading = false;
            const msg = this.translate.instant(
              'PROCUREMENT.COMMENTS.UPDATE_ERROR'
            );
            this.notificationGlobalService.showError(msg);
          }
        );
    } else {
      const commentRequest = this.procurementCommentsService.mapPostComments(
        this.generalForm.controls.comments.controls[index]
      );
      this.procurementCommentsService
        .saveComment(domain, this.parentId, commentRequest)
        .subscribe(
          (data: PostCommentResponse) => {
            const timezoneOffset = new Date(
              data.comment.created
            ).getTimezoneOffset();
            this.generalForm.controls.comments.controls[index].patchValue({
              oldText:
                this.generalForm.controls.comments.controls[index].controls.text
                  .value,
              oldVisibility:
                this.generalForm.controls.comments.controls[index].controls
                  .visibility.value,
              createdBy: data.comment.createdBy,
              created: new Date(
                new Date(data.comment.created).getTime() +
                  timezoneOffset * 60 * 1000
              ),
              id: data.comment.id,
              userNameCreated: data.comment.userNameCreated,
              userNameEdited: data.comment.userNameEdited,
            });
            this.modifiedComments[index] = false;
            this.commentsBusSvc.loading = false;
            const msg = this.translate.instant(
              'PROCUREMENT.COMMENTS.SAVE_SUCCESSFUL'
            );
            const subVisivility =
              this.generalForm.controls.comments.controls[index]?.controls
                ?.visibility.valueChanges;

            const subText =
              this.generalForm.controls.comments.controls[index]?.controls?.text
                .valueChanges;

            this.subscriptions.add(
              subVisivility.pipe(distinctUntilChanged()).subscribe(() => {
                this.onChangesLogic(index);
              })
            );
            this.subscriptions.add(
              subText.pipe(debounceTime(300)).subscribe(() => {
                this.onChangesLogic(index);
              })
            );
            this.onChangesLogic(index);
            this.disableVisibility(index);
            this.notificationGlobalService.showSuccess(msg);
          },
          () => {
            this.commentsBusSvc.loading = false;
            const msg = this.translate.instant(
              'PROCUREMENT.COMMENTS.SAVE_ERROR'
            );
            this.notificationGlobalService.showError(msg);
          }
        );
    }
  }

  disableVisibility(index: number): void {
    if (this.selectCommentsMode || this.disableByStatus()) {
      this.generalForm.controls.comments.controls[
        index
      ]?.controls.visibility.disable();
      return;
    }

    if (!this.checkPermission(index)) {
      this.generalForm.controls.comments.controls[
        index
      ]?.controls.visibility.disable();
    } else {
      this.generalForm.controls.comments.controls[
        index
      ]?.controls.visibility.enable();
    }
  }

  disableChekbox(): void {
    this.generalForm.controls.comments.controls.forEach((c, index) => {
      if (this.disableComment(index)) {
        c?.controls.selected.disable();
        this.showCheckbox[index] = false;
      } else {
        c?.controls.selected.enable();
        this.showCheckbox[index] = true;
      }
    });
  }

  disableComment(commentIndex: number): boolean {
    return !this.checkPermission(commentIndex) || this.disableByStatus();
  }

  addNewCommentFormGroup(): void {
    this.commentsFormSvc.addCommentProcurement(this.generalForm);
    this.modifiedComments.push(true);
    this.disableVisibility(
      this.generalForm.controls.comments.controls.length - 1
    );

    this.eventBusLogic();

    this.subscriptions.add(
      this.generalForm.controls.comments.controls[
        this.generalForm.controls.comments.controls.length - 1
      ].valueChanges.subscribe(() => {
        this.modifiedComments[
          this.generalForm.controls.comments.controls.length - 1
        ] = !this.checkChanges(
          this.generalForm.controls.comments.controls.length - 1
        );
      })
    );
  }

  checkChanges(index: number): boolean {
    if (
      this.generalForm.controls.comments?.controls[index]?.controls?.id
        .value === null
    ) {
      if (
        this.generalForm.controls.comments?.controls[index]?.controls?.text
          .value === '' ||
        null
      ) {
        return true;
      }
      return false;
    }
    return (
      this.generalForm.controls.comments?.controls[index]?.controls?.text
        .value ===
        this.generalForm.controls.comments?.controls[index]?.controls?.oldText
          .value &&
      this.generalForm.controls.comments?.controls[index]?.controls?.visibility
        .value ===
        this.generalForm.controls.comments?.controls[index]?.controls
          ?.oldVisibility.value
    );
  }

  onCheckboxChange(
    event: any,
    commentFormControl: FormGroup<CommentProcurementFormGroup>
  ): void {
    const id = commentFormControl.get('id').value;
    if (event.target.checked) {
      this.selectedComments.push(id);
      this.commentsBusSvc.updateCommentOnSelection(
        this.parentId,
        commentFormControl,
        CommentsSelectionAction.ADD
      );
    } else {
      const index = this.selectedComments.indexOf(id);
      if (index !== -1) {
        this.selectedComments.splice(index, 1);
        this.commentsBusSvc.updateCommentOnSelection(
          this.parentId,
          commentFormControl,
          CommentsSelectionAction.REMOVE
        );
      }
    }
  }

  eventBusLogic(): void {
    this.editionMode = this.modifiedComments.some((valor) => valor);
    this.commentsBusSvc.commentDraftEditing = this.editionMode;
    this.commentsBusSvc.setprocessActiveCommentValue(
      this.processIndex,
      this.editionMode
    );
  }

  subChangeAllVisibilityBtn(): void {
    const sub = this.commentsBusSvc.changeAllCommentsVisibility$.subscribe(
      (data) => {
        this.changesSelectedCommentsVisibilities(data);
      }
    );
    this.subscriptions.add(sub);
  }

  subToChanges(): void {
    this.subscriptions.add(
      this.commentsBusSvc.commentsUpdateVisibility$
        .pipe(filter((data) => data !== null))
        .subscribe((data) => {
          data.commentsParent.forEach((c) => {
            this.generalForm?.controls.comments.controls.forEach(
              (formComment, index) => {
                if (formComment.controls.id.value === c.comment.id) {
                  this.generalForm.controls.comments.controls[index].patchValue(
                    {
                      visibility: String(c.comment.visibility),
                      text: c.comment.text,
                      oldText: c.comment.text,
                      oldVisibility: String(c.comment.visibility),
                      editedBy: c.comment.editedBy,
                      edited: c.comment.edited,
                      selected: false,
                    }
                  );
                }
                this.commentsBusSvc.selectCommentsMode = false;
                this.selectedComments = [];
                this.modifiedComments[index] = false;
                this.commentsBusSvc.loading = false;
              }
            );
          });
        })
    );
  }

  changesSelectedCommentsVisibilities(visi: string): void {
    if (visi === null || this.selectedComments.length === 0) {
      return;
    }
    this.commentsBusSvc.loading = true;

    const domain =
      this.commentType === ProcurementCommentTypeEnum.PROCESS ||
      this.commentType === ProcurementCommentTypeEnum.PROCESS_DETAIL
        ? CommentsDomain.BIDDINGPROCESSPROCUREMENTPROCESS
        : CommentsDomain.BIDDINGPROCESSPLAN;

    const commentRequest =
      this.procurementCommentsService.mapUpdateCommentsVisibilities(
        this.generalForm.controls.comments,
        this.selectedComments,
        this.parentId,
        visi
      );

    this.procurementCommentsService
      .updateComments(domain, commentRequest)
      .subscribe({
        next: (data: UpdateCommentsResponse) => {
          data.commentsParent.forEach((c) => {
            this.generalForm.controls.comments.controls.forEach(
              (formComment, index) => {
                if (formComment.controls.id.value === c.comment.id) {
                  this.generalForm.controls.comments.controls[index].patchValue(
                    {
                      visibility: String(c.comment.visibility),
                      text: c.comment.text,
                      oldText: c.comment.text,
                      oldVisibility: String(c.comment.visibility),
                      editedBy: c.comment.editedBy,
                      edited: c.comment.edited,
                      selected: false,
                    }
                  );
                }
                this.commentsBusSvc.selectCommentsMode = false;
                this.selectedComments = [];
                this.modifiedComments[index] = false;
                this.commentsBusSvc.loading = false;
              }
            );
          });
        },
        error: () => {
          this.commentsBusSvc.loading = false;
        },
      });
  }

  showAddCommentOption(
    processStatus: number,
    planStatus: BiddingProcessPlanStatus
  ): boolean {
    if (this.commentType === ProcurementCommentTypeEnum.PLAN) {
      return planStatus !== BiddingProcessPlanStatus.IN_SYNC;
    }
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
    return false;
  }

  checkIsInternal(): void {
    const sub = this.store.select('contact').subscribe((data) => {
      this.isInternal = data.contact.is_internal;
    });
    this.subscriptions.add(sub);
  }

  checkDisabledCommentPermission(): boolean {
    const enterCommentPermission = this.permissionSvc.hasPermission(
      PermissionEnum.ENTERPROCUREMENTCOMMENTS
    );
    const enterUpdateProcurementInformation = this.permissionSvc.hasPermission(
      PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION
    );
    return !(enterCommentPermission || enterUpdateProcurementInformation);
  }
}
