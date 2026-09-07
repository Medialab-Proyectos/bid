import {
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { textRequired } from '@fiduciary-interface/app/shared/components/dialog-comments/services/comment-form.service';

export function ProcurementProcess() {
  return new UntypedFormGroup({
    name: new UntypedFormControl('', [Validators.required]),
    description: new UntypedFormControl('', [Validators.required]),
    manualId: new UntypedFormControl(''),
    subExecutor: new UntypedFormControl(''),
    category: new UntypedFormControl('', [Validators.required]),
    procurementMethod: new UntypedFormControl('', [Validators.required]),
    supervisionType: new UntypedFormControl('', [Validators.required]),
    justification: new UntypedFormControl(''),
  });
}

export function CostDistribution() {
  return new UntypedFormGroup({
    estimatedLocalCounterpartAmount: new UntypedFormControl('', [
      Validators.required,
    ]),
    estimatedProcessAmount: new UntypedFormControl('', [Validators.required]),
    estimatedCofinancingAmount: new UntypedFormControl('', [
      Validators.required,
    ]),
    estimatedBidAmount: new UntypedFormControl('', [Validators.required]),
  });
}

export function ProcessOutputs(): UntypedFormGroup {
  return new UntypedFormGroup({
    component: new UntypedFormControl('', [Validators.required]),
    outputsAsigned: new UntypedFormArray([], [Validators.minLength(1)]),
  });
}

export function createProcessOutputs(): UntypedFormGroup {
  return new UntypedFormGroup({
    id: new UntypedFormControl('', [Validators.required]),
    percentage: new UntypedFormControl('', [Validators.required]),
  });
}

export function AdditionalInformation() {
  return new UntypedFormGroup({
    lots: new UntypedFormControl(''),
    sepaPlecaId: new UntypedFormControl(''),
    bafo: new UntypedFormControl(null),
    goodsReference: new UntypedFormControl(''),
  });
}

export function Comments(): UntypedFormGroup {
  return new UntypedFormGroup({
    commentsList: new UntypedFormArray([]),
  });
}

/**
 * @var status It always is 0 ('Draft')
 */
export function createComments(): UntypedFormGroup {
  return new UntypedFormGroup({
    id: new UntypedFormControl(''),
    text: new UntypedFormControl('', [Validators.required, textRequired()]),
    visibility: new UntypedFormControl(''),
    status: new UntypedFormControl(0),
    createdBy: new UntypedFormControl(''),
  });
}

export function Milestones(): UntypedFormGroup {
  return new UntypedFormGroup({
    milestoneCollection: new UntypedFormArray([]),
  });
}

export function createMilestones(): UntypedFormGroup {
  return new UntypedFormGroup({
    initialEstimationDate: new UntypedFormControl('', [Validators.required]),
    reEstimateDate: new UntypedFormControl(''),
    actualDate: new UntypedFormControl(''),
    order: new UntypedFormControl(''),
    code: new UntypedFormControl(''),
    name: new UntypedFormControl(''),
    tooltip: new UntypedFormControl(''),
  });
}

export function sustainabilityForm(): UntypedFormGroup {
  return new UntypedFormGroup({
    sustainability: new UntypedFormControl(''),
    sustainabilityDescription: new UntypedFormControl(''),
  });
}
