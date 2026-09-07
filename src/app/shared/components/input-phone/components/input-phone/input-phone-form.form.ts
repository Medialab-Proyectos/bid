import {
  AbstractControl,
  UntypedFormControl,
  UntypedFormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

export function inputPhone(): UntypedFormGroup {
  return new UntypedFormGroup({
    dialCode: new UntypedFormControl(''),
    number: new UntypedFormControl(''),
  });
}

export function phoneNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const number = control.value?.number;
    const dialCode = control.value?.dialCode;

    const lengthPhone = dialCode + number;
    if (typeof lengthPhone !== 'string') {
      return null;
    }

    const numberValidation = lengthPhone
      ?.replace(/\s+/g, '')
      .replace('+', '')
      .replace('(', '')
      .replace(')', '')
      .replace(' ', '');

    if (!isNumeric(numberValidation)) {
      return { invalidLength: true };
    }

    if (number.length >= 8 && number.length <= 12) {
      return null;
    } else {
      return { invalidLength: true };
    }
  };

  function isNumeric(value) {
    return /^\d+$/.test(value);
  }
}
