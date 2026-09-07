import { UntypedFormGroup } from '@angular/forms';
import { createDocumentSectionForm } from '@fiduciary-interface/app/shared/components/documents/components/document-group-section/document-group-section.form';
import { createCostDistributionForm } from '@fiduciary-interface/app/shared/components/form-sections/components/cost-distribution/cost-distribution.form';
import { createAditionalInformationForm } from '../aditional-information/aditional-information.form';
import { createContractGeneralInformationForm } from '../contract-general-information/contract-general-information.form';
import { createContractLotsForm } from '../contract-lots/contract-lots.form';
import { createDestinationPlaceForm } from '../destination-place/destination-place.form';
import { createWinnerInformationForm } from '../winner-information/winner-information-form.form';

/**
 * Create contracts form
 */
export function createContractsForm(): UntypedFormGroup {
  const winnerInformationForm = createWinnerInformationForm();
  const generalInformationForm = createContractGeneralInformationForm();
  const costDistributionForm = createCostDistributionForm();
  const lotsForm = createContractLotsForm();
  const destinationPlaceForm = createDestinationPlaceForm();
  const aditionalInformationForm = createAditionalInformationForm();
  const attachmentsForm = createDocumentSectionForm();

  return new UntypedFormGroup({
    winnerInformation: winnerInformationForm,
    generalInformation: generalInformationForm,
    costDistribution: costDistributionForm,
    lots: lotsForm,
    destinationPlace: destinationPlaceForm,
    aditionalInformation: aditionalInformationForm,
    attachments: attachmentsForm,
  });
}
