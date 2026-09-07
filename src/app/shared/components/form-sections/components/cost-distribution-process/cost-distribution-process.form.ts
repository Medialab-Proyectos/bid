import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';

export function createCostDistributionForm(): UntypedFormGroup {
  return new UntypedFormGroup({
    contractTotalAmount: new UntypedFormControl(0),
    bidAmount: new UntypedFormControl(null, [Validators.required]),
    bidAmountPercentage: new UntypedFormControl(null, [Validators.required]),
    localCounterpartAmount: new UntypedFormControl(null, [Validators.required]),
    localCounterpartAmountPercentage: new UntypedFormControl(null, [
      Validators.required,
    ]),
    cofinancingAmount: new UntypedFormControl(null, [Validators.required]),
    cofinancingAmountPercentage: new UntypedFormControl(null, [
      Validators.required,
    ]),
    justification: new UntypedFormControl(''),
    maxAmount: new UntypedFormControl(''),
    maxThresholdExceed: new UntypedFormControl(''),
    maxThresholdExceedDirectContract: new UntypedFormControl(''),
    totalAmountPercentage: new UntypedFormControl(null),
    minTotalAmount: new UntypedFormControl(null),
  });
}

export interface CostDistributionData {
  contractTotalAmount: number;
  bidAmount: number;
  localCounterpartAmount: number;
  cofinancingAmount: number;
  justification?: string;
  maxAmount?: string;
}
