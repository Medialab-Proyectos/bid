import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

export function commentForm(): UntypedFormGroup {
  return new UntypedFormGroup({
    type: new UntypedFormControl(0, [Validators.required]),
    comment: new UntypedFormControl('', [Validators.required]),
  });
}

export function dialogForm(): UntypedFormGroup {
  return new UntypedFormGroup({
    newComment: new UntypedFormControl('', [Validators.required]),
  });
}
