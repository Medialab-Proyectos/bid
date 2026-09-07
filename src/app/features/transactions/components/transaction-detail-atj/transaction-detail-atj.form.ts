import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

export function transactionDetailAtjForm() {
  return new UntypedFormGroup({
    requestNumberJustification: new UntypedFormControl('', [Validators.required]),
    partNumberJustification: new UntypedFormControl('', [Validators.required]),
    requestNumberAdvanceOfFunds: new UntypedFormControl('', [Validators.required]),
    partNumberAdvanceOfFunds: new UntypedFormControl('', [Validators.required]),
    numberDaysFinancialPlanning: new UntypedFormControl(180, [Validators.required]),
  });
}
