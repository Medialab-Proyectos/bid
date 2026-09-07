import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

export function createAmountsJustificationForm() {
  return new UntypedFormGroup({
    bid: new UntypedFormControl(0, [Validators.min(1), Validators.required]),
    localCounterpart: new UntypedFormControl(0),
    cofinancing: new UntypedFormControl(0),
    amountPendingJustification: new UntypedFormControl(0, Validators.min(0)),
  });
}

export interface BidAmountError {
  bidAmountError: boolean;
}

export interface AmountsJustificationForm {
  bid: number;
  localCounterpart: number;
  cofinancing: number;
  amountPendingJustification: number;
}
