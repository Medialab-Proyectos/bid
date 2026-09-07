import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

export function transactionDetailForm() {
  return new UntypedFormGroup({
    requestNumber: new UntypedFormControl('', [Validators.required]),
    partNumber: new UntypedFormControl('', [Validators.required]),
  });
}
