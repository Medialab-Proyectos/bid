import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

export function createContractLotsForm(): UntypedFormArray {
  return new UntypedFormArray([createLotGroup()]);
}

export function createLotGroup(): UntypedFormGroup {
  return new UntypedFormGroup({
    id: new UntypedFormControl(null),
    name: new UntypedFormControl('', [Validators.required]),
    units: new UntypedFormControl(''),
    amount: new UntypedFormControl('', [Validators.required]),
  });
}

