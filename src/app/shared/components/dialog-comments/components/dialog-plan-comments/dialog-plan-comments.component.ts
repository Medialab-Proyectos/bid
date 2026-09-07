import { Component, Input, OnInit } from '@angular/core';
import {
  FormArray,
  FormGroup,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Enumerator } from '@core/models';
import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';
import { ProcurementComment } from '../../models';
import {
  CommentPlanFormGroup,
  FormDialogComments,
} from '../../models/commentsForm.model';
import { CommentFormService } from '../../services/comment-form.service';
import { BiddingProcessPlanStatus, CommentStatusEnum } from '@core/enums';
@Component({
  selector: 'fi-dialog-plan-comments',
  templateUrl: './dialog-plan-comments.component.html',
})
export class DialogPlanCommentsComponent
  extends DialogContentBase
  implements OnInit
{
  completedComments: ProcurementComment[] = [];
  draftComments: ProcurementComment[] = [];
  @Input() set displayVisbility(visibility) {
    this.displayVisibilityOptions = visibility;
    this.formGroup = this.createFormGroup(visibility);
  }
  @Input() set commentList(comments: ProcurementComment[]) {
    this.completedComments = comments.filter(
      (c) => c.status === +CommentStatusEnum.COMPLETED
    );
    this.draftComments = comments.filter(
      (c) => c.status !== +CommentStatusEnum.COMPLETED
    );
    this.disabledByProperty = [];
    this.draftComments.forEach((c) => {
      this.disabledByProperty.push(c.createdBy !== this.userEmail);
      this.addComment(c);
    });
  }
  @Input() formGroup: UntypedFormGroup = this.createFormGroup();
  @Input() text = String();
  @Input() visibility: Enumerator[];
  @Input() userEmail: string;
  @Input() set planStatus(value: BiddingProcessPlanStatus) {
    if (value !== undefined && value !== BiddingProcessPlanStatus.IN_SYNC) {
      this.showComments = true;
    } else {
      this.showComments = false;
    }
  }

  showComments: boolean;
  newFormGroup: UntypedFormGroup;
  generalForm: FormGroup<FormDialogComments>;
  loading = false;
  email: string;
  disabledByProperty: boolean[];

  public displayVisibilityOptions = true;

  constructor(
    public dialog: DialogRef,
    private readonly fb: UntypedFormBuilder,
    private readonly commentsFormSvc: CommentFormService
  ) {
    super(dialog);
    this.generalForm = new FormGroup<FormDialogComments>({
      comments: new FormArray<FormGroup<CommentPlanFormGroup>>([]),
    });
  }

  ngOnInit(): void {
    this.newFormGroup = new UntypedFormGroup({
      draftComments: new UntypedFormArray([]),
    });
  }

  addComment(comment?: ProcurementComment): void {
    this.commentsFormSvc.addComment(this.generalForm, comment);
    this.disableCommentsByProperty();
  }

  disableCommentsByProperty(): void {
    this.disabledByProperty.forEach((e, index) => {
      if (e) {
        this.generalForm.controls.comments.controls[
          index
        ].controls.text.disable();
      }
    });
  }

  createFormGroup(visibilityRequired = true): UntypedFormGroup {
    const group = this.fb.group({
      visibility: [''],
      text: [this.text, Validators.required],
    });

    if (visibilityRequired) {
      group.get('visibility').setValidators(Validators.required);
    }

    return group;
  }
}
