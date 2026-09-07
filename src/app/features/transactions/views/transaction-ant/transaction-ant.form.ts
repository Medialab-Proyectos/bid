import { UntypedFormGroup } from '@angular/forms';
import { amountsDisbursementForm } from '../../components/amounts-disbursement/amounts-disbursement.form';
import { transactionBeneficiaryForm } from '../../components/transaction-beneficiary/transaction-beneficiary.form';
import { transactionDetailForm } from '../../components/transaction-detail/transaction-detail.form';

export function createAntForm(): UntypedFormGroup {
  return new UntypedFormGroup({
    detailForm: transactionDetailForm(),
    ammountsForm: amountsDisbursementForm(),
    beneficiaryForm: transactionBeneficiaryForm(),
  });
}
