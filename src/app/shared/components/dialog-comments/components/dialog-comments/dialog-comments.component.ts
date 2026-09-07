import { Component, Input } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';
import { ProcurementComment } from '../../models';

@Component({
  selector: 'fi-dialog-comments',
  templateUrl: './dialog-comments.component.html',
})
export class DialogCommentsComponent extends DialogContentBase {
  @Input() set displayVisbility(visibility) {
    this.displayVisibilityOptions = visibility;
    this.formGroup = this.createFormGroup(visibility);
  }
  @Input() commentList: ProcurementComment[] = [];
  @Input() formGroup: UntypedFormGroup = this.createFormGroup();
  @Input() text = String();

  public displayVisibilityOptions = true;

  constructor(
    public dialog: DialogRef,
    private readonly fb: UntypedFormBuilder
  ) {
    super(dialog);
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
