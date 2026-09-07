import { UntypedFormControl } from '@angular/forms';
import { FiduciaryProcessDocumentGroup } from '@core/models';

export function createDocumentSectionForm() {
  return new UntypedFormControl([]);
}

export function validateDocumentMandatory(
  group: FiduciaryProcessDocumentGroup[],
  form: UntypedFormControl
): void {
  const hasRequiredGroupWithoutDocuments = group.some(
    (group) => group.isMandatory && group.fiduciaryProcessDocuments.length === 0
  );
  if (hasRequiredGroupWithoutDocuments) {
    form.setErrors({ requiredDocumentError: true });
  }
}
