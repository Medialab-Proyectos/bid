import { Injectable } from '@angular/core';
import {
  FormControl,
  FormGroup,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { ProcurementComment } from '../models';
import {
  CommentPlanFormGroup,
  CommentProcurementFormGroup,
  FormDialogComments,
  FormProcurementComments,
} from '../models/commentsForm.model';
import { commentEnvironment } from '../dialog-comment.environment';

@Injectable({
  providedIn: 'root',
})
export class CommentFormService {
  constructor() {}

  public addComment(
    form: FormGroup<FormDialogComments>,
    comment?: ProcurementComment
  ): void {
    form.controls.comments.push(
      this.newCommentFormGroup(this.createNewComment(comment))
    );
  }

  public addCommentProcurement(
    form: FormGroup<FormProcurementComments>,
    comment?: ProcurementComment
  ): void {
    form.controls.comments.push(
      this.newCommentProcurementFormGroup(this.createNewComment(comment))
    );
  }

  public newCommentProcurementFormGroup(
    comment?: ProcurementComment
  ): FormGroup<CommentProcurementFormGroup> {
    return new FormGroup<CommentProcurementFormGroup>({
      id: new FormControl(comment.id),
      visibility: new FormControl<string>(String(comment.visibility)),
      source: new FormControl<number>(comment.source),
      status: new FormControl<number>(comment.status),
      text: new FormControl<string>(comment.text, textRequired()),
      created: new FormControl<Date>(comment.created),
      createdBy: new FormControl<string>(comment.createdBy),
      modifiedBy: new FormControl<string>(comment.modifiedBy),
      oldVisibility: new FormControl<string>(String(comment.visibility)),
      oldText: new FormControl<string>(comment.text),
      edited: new FormControl<string>(comment.edited),
      editedBy: new FormControl<string>(comment.editedBy),
      selected: new FormControl<boolean>(false),
      userNameCreated: new FormControl<string>(comment.userNameCreated),
      userNameEdited: new FormControl<string>(comment.userNameEdited),
      marked: new FormControl<boolean>(comment.marked),
    });
  }

  public newCommentFormGroup(
    comment?: ProcurementComment
  ): FormGroup<CommentPlanFormGroup> {
    return new FormGroup<CommentPlanFormGroup>({
      id: new FormControl(comment.id),
      visibility: new FormControl<string>(String(comment.visibility)),
      source: new FormControl<number>(comment.source),
      status: new FormControl<number>(comment.status),
      text: new FormControl<string>(comment.text, textRequired()),
      created: new FormControl<Date>(comment.created),
      createdBy: new FormControl<string>(comment.createdBy),
    });
  }

  public createNewComment(
    inputComment?: ProcurementComment
  ): ProcurementComment {
    return {
      id: inputComment === undefined ? null : inputComment.id,
      text: inputComment === undefined ? null : inputComment.text,
      visibility:
        inputComment === undefined
          ? commentEnvironment.DEFAULT_VISIBILITY
          : inputComment.visibility,
      source: inputComment === undefined ? null : inputComment.source,
      status: inputComment === undefined ? null : inputComment.status,
      created: inputComment === undefined ? null : inputComment.created,
      createdBy: inputComment === undefined ? null : inputComment.createdBy,
      modifiedBy: inputComment === undefined ? null : inputComment.modifiedBy,
      edited: inputComment === undefined ? null : inputComment.edited,
      editedBy: inputComment === undefined ? null : inputComment.editedBy,
      userNameCreated:
        inputComment === undefined ? null : inputComment.userNameCreated,
      userNameEdited:
        inputComment === undefined ? null : inputComment.userNameEdited,
      marked: inputComment === undefined ? null : inputComment.marked,
    };
  }
}

export function textRequired(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return control.value === '<p></p>' ||
      control.value === null ||
      control.value === ''
      ? { textRequired: true }
      : null;
  };
}
