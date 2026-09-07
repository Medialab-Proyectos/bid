import { UntypedFormGroup } from '@angular/forms';
import { createCostDistributionForm } from '@fiduciary-interface/app/shared/components/form-sections/components/cost-distribution-process/cost-distribution-process.form';
import {
  AdditionalInformation,
  Comments,
  Milestones,
  ProcessOutputs,
  ProcurementProcess,
  sustainabilityForm,
} from '../../procurement-process.form';

export function createProcurementForm() {
  return new UntypedFormGroup({
    processForm: ProcurementProcess(),
    componentsForm: ProcessOutputs(),
    milestonesForm: Milestones(),
    adittionalInfo: AdditionalInformation(),
    commentsProcess: Comments(),
    costDistributionForm: createCostDistributionForm(),
    sustainabilityForm: sustainabilityForm(),
  });
}
