import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Currency } from '@core/models';

const usd: Currency = {
  currency: 'USD',
  isBorrowing: false,
  isHard: true,
  numberOfDecimals: 2,
};

export function createAmountReimbursementForm(): UntypedFormGroup {
  return new UntypedFormGroup({
    selectedRequestedCurrency: new UntypedFormControl(usd, Validators.required),
    totalItems: new UntypedFormArray([]),
  });
}

export function addTotalItemsGroup(
  source: string,
  sourceType: number,
  balances: number,
  requestedAmount?: number,
  equivalentCurrency?: number
): UntypedFormGroup {
  return new UntypedFormGroup({
    source: new UntypedFormControl(source, Validators.required),
    sourceType: new UntypedFormControl(sourceType, Validators.required),
    requestedAmount: new UntypedFormControl(requestedAmount ? requestedAmount : 0, []),
    equivalentCurrency: new UntypedFormControl(
      equivalentCurrency ? equivalentCurrency : 0,
      []
    ),
    expectedBalances: new UntypedFormControl(balances, Validators.required),
  });
}
