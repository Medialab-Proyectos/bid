import { UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import { createCostDistributionForm } from '@fiduciary-interface/app/shared/components/form-sections/components/cost-distribution/cost-distribution.form';
import { createDateUpdateForm } from '../amendment-date-update/amendment-date-update.form';
import { createContractAmountForm } from '../contract-amount/contract-amount.form';
import { createContractLotsForm } from '../contract-lots/contract-lots.form';
import { createContractObjetiveForm } from '../contract-objetive/contract-objetive.form';
import { createDocumentSectionForm } from '@fiduciary-interface/app/shared/components/documents/components/document-group-section/document-group-section.form';

/**
 * Create add amendment form
 */
export function createAddAmendmentForm(): UntypedFormGroup {
  const dateUpdateForm = createDateUpdateForm();
  const contractAmountForm = createContractAmountForm();
  const costDistributionForm = createCostDistributionForm();
  const lotsForm = createContractLotsForm();
  const contractObjetiveForm = createContractObjetiveForm();
  const warrantyExtensionForm = new UntypedFormArray([]);
  const attachmentsForm = createDocumentSectionForm();

  return new UntypedFormGroup({
    dateUpdateForm,
    contractAmountForm,
    costDistributionForm,
    lotsForm,
    contractObjetiveForm,
    warrantyExtensionForm,
    attachments: attachmentsForm,
  });
}
