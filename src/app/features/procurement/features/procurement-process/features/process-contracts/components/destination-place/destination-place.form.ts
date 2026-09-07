import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

export function createDestinationPlaceForm(): UntypedFormGroup {
  return new UntypedFormGroup({
    id: new UntypedFormControl(null),
    address: new UntypedFormControl('', [Validators.required]),
    zipCode: new UntypedFormControl('', [Validators.required]),
    country: new UntypedFormControl('', [Validators.required]),
  });
}
