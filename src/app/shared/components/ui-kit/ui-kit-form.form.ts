import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

export function createUIKITForm(): UntypedFormGroup {
  return new UntypedFormGroup({
    inputTextEnabled: new UntypedFormControl(),
    inputTextDisabled: new UntypedFormControl({ value: '', disabled: true }),
    inputTextRequired: new UntypedFormControl('', Validators.required),
    //Dropdowns
    dropwdownTextEnabled: new UntypedFormControl(),
    dropwdownTextDisabled: new UntypedFormControl({ value: '', disabled: true }),
    dropwdownTextRequired: new UntypedFormControl('', Validators.required),
    //Input numerics
    inputNumericTextEnabled: new UntypedFormControl(),
    inputNumericTextDisabled: new UntypedFormControl({ value: '', disabled: true }),
    inputNumericTextRequired: new UntypedFormControl('', Validators.required),
    inputNumericPercentageEnabled: new UntypedFormControl(),
    inputNumericPercentageDisabled: new UntypedFormControl({
      value: '',
      disabled: true,
    }),
    inputNumericPercentageRequired: new UntypedFormControl('', Validators.required),
    //Radios
    radioRequiredDefault: new UntypedFormControl({ value: false }, [
      Validators.required,
    ]),
    radioRequiredPressed: new UntypedFormControl({ value: true }, [
      Validators.required,
    ]),
    radioRequiredChecked: new UntypedFormControl(true, [Validators.required]),
    radioRequiredCheckedError: new UntypedFormControl(null, [Validators.required]),
    //Inputs currency
    inputCurrency: new UntypedFormControl(),
    inputCurrencyDisabled: new UntypedFormControl({ value: '', disabled: true }),
    inputCurrencyRequired: new UntypedFormControl('', Validators.required),
    inputNumeric: new UntypedFormControl(),
    inputNumericDisabled: new UntypedFormControl({ value: '', disabled: true }),
    inputNumericRequired: new UntypedFormControl('', Validators.required),
  });
}
