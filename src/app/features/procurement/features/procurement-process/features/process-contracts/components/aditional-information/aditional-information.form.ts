import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

export function createAditionalInformationForm(): UntypedFormGroup {
  return new UntypedFormGroup({
    securityList: new UntypedFormArray([]),
    damagesList: new UntypedFormArray([]),
    bonusList: new UntypedFormArray([]),
  });
}

export function createSecurityGroup(): UntypedFormGroup {
  return new UntypedFormGroup({
    id: new UntypedFormControl(null),
    securityType: new UntypedFormControl('', [Validators.required]),
    currency: new UntypedFormControl('', [Validators.required]),
    amount: new UntypedFormControl('', [Validators.required]),
    usdEquivalentAmount: new UntypedFormControl(''),
    expirationDate: new UntypedFormControl('', [Validators.required]),
  });
}

export function createDamagesGroup(): UntypedFormGroup {
  return new UntypedFormGroup({
    damagesType: new UntypedFormControl('', [Validators.required]),
    damagesPercentage: new UntypedFormControl('', [Validators.required]),
    damagesPaymentFrequency: new UntypedFormControl('', [Validators.required]),
    damagesMaxPercentage: new UntypedFormControl('', [Validators.required]),
  });
}

export function createBonusGroup(): UntypedFormGroup {
  return new UntypedFormGroup({
    bonusType: new UntypedFormControl('', [Validators.required]),
    bonusPercentage: new UntypedFormControl('', [Validators.required]),
    bonusPaymentFrequency: new UntypedFormControl('', [Validators.required]),
    bonusMaxPercentage: new UntypedFormControl('', [Validators.required]),
  });
}
