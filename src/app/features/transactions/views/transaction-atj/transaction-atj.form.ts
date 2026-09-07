import { UntypedFormGroup } from '@angular/forms';
import { createAmountsJustificationForm } from '../../components/amounts-justification/amounts-justification.form';
import { amountsDisbursementForm } from '../../components/amounts-disbursement/amounts-disbursement.form';
import { transactionBeneficiaryForm } from '../../components/transaction-beneficiary/transaction-beneficiary.form';
import { createTransactionComponentsForm } from '../../components/transaction-components/transaction-components.form';
import { transactionDetailAtjForm } from '../../components/transaction-detail-atj/transaction-detail-atj.form';

export function createAtjForm(): UntypedFormGroup {
  return new UntypedFormGroup({
    requestDetailsForm: transactionDetailAtjForm(),
    requestAmountsForm: createAmountsJustificationForm(),
    componentsForm: createTransactionComponentsForm(),
    ammountsForm: amountsDisbursementForm(),
    beneficiaryForm: transactionBeneficiaryForm(),
  });
}
