import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Amount, TransactionComponent } from '../../models';
import { TransactionsComponents } from '../../enums/transactions-components.enum';

export function createTransactionComponentsForm(): UntypedFormGroup {
  return new UntypedFormGroup(
    {
      amountsToAssign: createAmountsGroup(amountsToAssignValidation),
      components: new UntypedFormArray([]),
      totals: createTotalsGroup(),
    },
    [componentTotalsAmountToDistributeValidation]
  );
}

export function createTransactionComponentGroup(): UntypedFormGroup {
  return new UntypedFormGroup(
    {
      id: new UntypedFormControl(null),
      code: new UntypedFormControl(''),
      name: new UntypedFormControl(''),
      amountsDistribute: createAmountsGroup(),
      amountsProjectedAvailable: createAmountsGroup(),
      readOnly: new UntypedFormControl(false),
      type: new UntypedFormControl(''),
    },
    [componentAmountToDistributeValidation]
  );
}

export function createAmountsGroup(validatorOrOpts?): UntypedFormGroup {
  return new UntypedFormGroup(
    {
      distributeIbd: new UntypedFormControl(0, Validators.required),
      distributeLocalCounterpart: new UntypedFormControl(
        0,
        Validators.required
      ),
      distributeCofinancing: new UntypedFormControl(0, Validators.required),
    },
    validatorOrOpts
  );
}

export function createTotalsGroup(): UntypedFormGroup {
  return new UntypedFormGroup({
    amountsDistribute: createAmountsGroup(),
    amountsProjectedAvailable: createAmountsGroup(),
  });
}

export function setTransactionComponentsFormValue(
  form: UntypedFormGroup,
  formValue: TransactionComponentsForm
): void {
  form.get('amountsToAssign').setValue(formValue.amountsToAssign);
  const componentsArray = form.get('components') as UntypedFormArray;
  for (const component of formValue.components) {
    const group = createTransactionComponentGroup();
    group.patchValue(component);
    componentsArray.push(group);
  }
  form.get('totals').setValue(formValue.totals);
}

export interface TransactionComponentsForm {
  amountsToAssign: Amount;
  components: TransactionComponent[];
  totals: Totals;
}

export interface Totals {
  amountsDistribute: Amount;
  amountsProjectedAvailable: Amount;
}

export function componentAmountToDistributeValidation(
  control: AbstractControl
) {
  if (componentRowValidation(control.value)) {
    return {
      amountToDistribute: true,
    };
  }

  return null;
}

export function componentTotalsAmountToDistributeValidation(
  control: AbstractControl
) {
  const amountsToAssign = control.value.amountsToAssign as Amount;

  if (amountsToAssign) {
    const isBidGreater = amountsToAssign.distributeIbd;
    const isLocalCounterpartGreater =
      amountsToAssign.distributeLocalCounterpart;
    const isCofinancingGreater = amountsToAssign.distributeCofinancing;

    if (
      isBidGreater > 0 ||
      isLocalCounterpartGreater > 0 ||
      isCofinancingGreater > 0
    ) {
      return {
        totalsAmountToDistributeHigherLower: true,
      };
    } else if (
      isBidGreater < 0 ||
      isLocalCounterpartGreater < 0 ||
      isCofinancingGreater < 0
    ) {
      return {
        totalsAmountToDistributeHigher: true,
      };
    }
  }

  return null;
}

function componentRowValidation(component: TransactionComponent): boolean {
  if (component.code === 86) {
    const isIdbValid = component.amountsProjectedAvailable.distributeIbd <= 0;

    if (!isIdbValid) {
      return true;
    }

    return false;
  }

  if (component.code !== TransactionsComponents.CAPITALIZATION_CHARGE) {
    return !(component.amountsProjectedAvailable.distributeIbd >= 0);
  }
}

function amountsToAssignValidation(amount: Amount): boolean {
  const { distributeCofinancing, distributeIbd, distributeLocalCounterpart } =
    amount;
  if (
    distributeCofinancing !== 0 ||
    distributeIbd !== 0 ||
    distributeLocalCounterpart !== 0
  ) {
    return false;
  }

  return true;
}
