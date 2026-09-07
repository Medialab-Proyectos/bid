import { UntypedFormGroup } from '@angular/forms';
import { createAmountReimbursementForm } from '../../components/amounts-reimbursement/amounts-reimbursement.form';
import { transactionBeneficiaryForm } from '../../components/transaction-beneficiary/transaction-beneficiary.form';
import { createTransactionComponentsForm } from '../../components/transaction-components/transaction-components.form';
import { transactionDetailForm } from '../../components/transaction-detail/transaction-detail.form';

export function createDpbForm(): UntypedFormGroup {
  return new UntypedFormGroup({
    detailForm: transactionDetailForm(),
    amountsForm: createAmountReimbursementForm(),
    componentsForm: createTransactionComponentsForm(),
    beneficiaryForm: transactionBeneficiaryForm(),
  });
}
