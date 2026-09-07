import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

export function endDateLowerThanStartDate(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const startDate = control.get('startDate').value;
    const endDate = control.get('endDate').value;
    if (endDate < startDate) {
      return { endDateLowerThanStartDate: true };
    }
    return null;
  };
}

export function createContractGeneralInformationForm(): UntypedFormGroup {
  return new UntypedFormGroup(
    {
      name: new UntypedFormControl('', [
        Validators.required,
        Validators.maxLength(200),
      ]),
      objective: new UntypedFormControl('', [
        Validators.required,
        Validators.maxLength(500),
      ]),
      startDate: new UntypedFormControl('', [Validators.required]),
      endDate: new UntypedFormControl('', [Validators.required]),
      signatureDate: new UntypedFormControl('', [Validators.required]),
      currencyList: new UntypedFormArray(
        [createCurrencyGroup()],
        NotZeroAmounts()
      ),
      controlNumber: new UntypedFormControl(''),
      typeDesignation: new UntypedFormControl(''),
      contractType: new UntypedFormControl('', [Validators.required]),
      hasAdvancedPayment: new UntypedFormControl('', [Validators.required]),
      conflictResolutionMethod: new UntypedFormControl('', Validators.required),
      applicableLaw: new UntypedFormControl('', [Validators.required]),
      goodsSource: new UntypedFormControl(null),
    },
    [endDateLowerThanStartDate()]
  );
}

export function createCurrencyGroup(): UntypedFormGroup {
  return new UntypedFormGroup({
    id: new UntypedFormControl(null),
    currency: new UntypedFormControl('', [Validators.required]),
    totalAmount: new UntypedFormControl('', [Validators.required]),
    usdEquivalentAmount: new UntypedFormControl(''),
  });
}

export function NotZeroAmounts(): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    let total = 0;
    c.value.forEach((element) => {
      total = total + element.usdEquivalentAmount;
    });
    if (total !== 0) {
      return null;
    }
    return { NotZeroAmounts: true };
  };
}
