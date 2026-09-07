import { FormArray, FormControl, FormGroup } from '@angular/forms';

export interface CommentPlanFormGroup {
  id: FormControl<string>;
  visibility: FormControl<string>;
  source: FormControl<number>;
  status: FormControl<number>;
  text: FormControl<string>;
  created: FormControl<Date>;
  createdBy: FormControl<string>;
}

export interface FormDialogComments {
  comments: FormArray<FormGroup<CommentPlanFormGroup>>;
}
export interface CommentProcurementFormGroup extends CommentPlanFormGroup {
  modifiedBy: FormControl<string>;
  edited: FormControl<string>;
  editedBy: FormControl<string>;
  oldVisibility: FormControl<string>;
  oldText: FormControl<string>;
  selected: FormControl<boolean>;
  userNameCreated: FormControl<string>;
  userNameEdited: FormControl<string>;
  marked: FormControl<boolean>;
}
export interface FormProcurementComments {
  comments: FormArray<FormGroup<CommentProcurementFormGroup>>;
}
