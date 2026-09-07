import {
  AbstractControl,
  UntypedFormControl,
  UntypedFormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

export function createDateUpdateForm() {
  return new UntypedFormGroup({
    startDate: new UntypedFormControl(),
    endDate: new UntypedFormControl(),
    signatureDate: new UntypedFormControl(),
  });
}

export function endDateLowerThanStartDate(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const startDate = control.get('startDate').value;
    const endDate = control.get('endDate').value;
    if (endDate < startDate) {
      return { endDateLowerThanStartDate: true };
    }
    return null;
  };
}
