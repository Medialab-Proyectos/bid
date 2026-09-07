import { UntypedFormArray, UntypedFormControl, UntypedFormGroup } from '@angular/forms';

export function createContractAmountForm(): UntypedFormArray {
  return new UntypedFormArray([createAmendmentCurrencyGroup()]);
}

export function createAmendmentCurrencyGroup(): UntypedFormGroup {
  return new UntypedFormGroup({
    totalAmount: new UntypedFormControl(''),
    usdEquivalentAmount: new UntypedFormControl(''),
  });
}
