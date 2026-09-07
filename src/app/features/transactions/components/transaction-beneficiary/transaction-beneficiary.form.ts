import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';

export function transactionBeneficiaryForm() {
  return new UntypedFormGroup({
    bankFlowId: new UntypedFormControl(''),
    country: new UntypedFormControl(''),
    acronym: new UntypedFormControl(''),
    institutionName: new UntypedFormControl(''),
    numberId: new UntypedFormControl(''),
  });
}
