import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';

export function inputCurrency(): UntypedFormGroup {
  return new UntypedFormGroup({
    amount: new UntypedFormControl(''),
    currency: new UntypedFormControl(''),
  });
}
