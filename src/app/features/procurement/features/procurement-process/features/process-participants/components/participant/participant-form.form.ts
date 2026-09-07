import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Bidder } from '@core/models';

export function newParticipantForm() {
  return new UntypedFormGroup({
    bidder: new UntypedFormControl(null, [bidderRequiredValidator]),
    nationality: new UntypedFormControl({ value: null, disabled: true }),
    weighedTechScore: new UntypedFormControl(null),
    weighedFinancialScore: new UntypedFormControl(null),
    totalScore: new UntypedFormControl('', Validators.max(100)),
    participantAmount: new UntypedFormControl(null),
    amountUsd: new UntypedFormControl(null),
    result: new UntypedFormControl(null, [Validators.required]),
    rejectedReasons: new UntypedFormControl([]),
    justificationEligibility: new UntypedFormControl(''),
  });
}

function bidderRequiredValidator(control: AbstractControl) {
  const bidder = control.value as Bidder;
  if (!bidder || !bidder?.id) {
    return {
      bidderRequired: true,
    };
  }

  return null;
}
