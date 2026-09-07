import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Currency } from '@core/models';

const usd: Currency = {
  currency: 'USD',
  isBorrowing: false,
  isHard: true,
  numberOfDecimals: 2,
};

export function amountsDisbursementForm() {
  return new UntypedFormGroup({
    requestedCurrency: new UntypedFormControl(usd, [Validators.required]),
    requestedAmount: new UntypedFormControl('', [
      Validators.required,
      Validators.min(1),
    ]),
    equivalentApprovedCurrency: new UntypedFormControl('', [
      Validators.required,
      Validators.min(1),
    ]),
    expectedBalance: new UntypedFormControl('', Validators.min(0)),
  });
}
