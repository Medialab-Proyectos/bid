import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

export function newBidderRegistrationForm() {
  return new UntypedFormGroup({
    name: new UntypedFormControl(null, [Validators.required]),
    type: new UntypedFormControl(null, [Validators.required]),
    nationality: new UntypedFormControl(null, [Validators.required]),
    legalRepresentative: new UntypedFormControl(null),
    economicSector: new UntypedFormControl(null),
    beneficiaryOwner: new UntypedFormControl(null),
    address: new UntypedFormControl(null),
    zipCode: new UntypedFormControl(null),
    location: new UntypedFormControl(null),
    id: new UntypedFormControl(null),
  });
}
