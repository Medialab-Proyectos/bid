import { UntypedFormGroup } from '@angular/forms';
import { createAmountsJustificationForm } from '../../components/amounts-justification/amounts-justification.form';
import { createTransactionComponentsForm } from '../../components/transaction-components/transaction-components.form';
import { transactionDetailForm } from '../../components/transaction-detail/transaction-detail.form';

export function createAnjForm(): UntypedFormGroup {
  return new UntypedFormGroup({
    requestDetailsForm: transactionDetailForm(),
    requestAmountsForm: createAmountsJustificationForm(),
    componentsForm: createTransactionComponentsForm(),
  });
}
