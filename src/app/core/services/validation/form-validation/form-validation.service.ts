import { Injectable } from '@angular/core';
import {
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
  ValidationErrors,
} from '@angular/forms';
import { FormErrorTranslateKey } from './formErrorTranslateKey.model';

@Injectable({
  providedIn: 'root',
})
export class FormValidationService {
  public errorList: FormErrorTranslateKey[] = [];

  public validateFormGroupFields(
    formGroup: UntypedFormGroup,
    index?: string
  ): FormErrorTranslateKey[] {
    if (
      (formGroup.status === 'INVALID' || formGroup.disabled) &&
      formGroup.errors === null
    ) {
      Object.keys(formGroup.controls).forEach((field) => {
        const control = formGroup.get(field);
        this.validateInstance(control, field, index);
      });
    } else {
      if (formGroup.status === 'INVALID' && formGroup.errors !== null) {
        this.errorList.push(this.createErrorArray(index, formGroup.errors));
      }
    }
    return this.errorList;
  }

  private validateInstance(control, field, index?) {
    if (control instanceof UntypedFormGroup) {
      this.validateFormGroupFields(control, index);
    } else {
      if (control instanceof UntypedFormControl) {
        control.markAsTouched();
      }
      if (control.errors !== null) {
        this.errorList.push(
          this.createErrorArray(field, control.errors, index)
        );
      }
    }
    if (control instanceof UntypedFormArray) {
      this.validateFormArrayFields(control);
    }
  }

  public validateFormArrayFields(formArray: UntypedFormArray): void {
    if (formArray.status === 'INVALID') {
      Object.keys(formArray.controls).forEach((field) => {
        const control = formArray.get(field);
        if (control instanceof UntypedFormArray) {
          this.validateFormArrayFields(control);
        } else {
          if (control instanceof UntypedFormControl) {
            control.markAsTouched();
          }
        }
        if (control instanceof UntypedFormGroup) {
          this.validateFormGroupFields(control, field);
        }
      });
    }
  }

  private createErrorArray(
    field: string,
    errors: ValidationErrors,
    index?: string
  ): FormErrorTranslateKey {
    const error = Object.keys(errors)[0];
    let newFormErrorKey: FormErrorTranslateKey;
    let newkey = null;
    if (index === undefined) {
      if (!isNaN(Number(field))) {
        newkey = `x-${error}`;
        newFormErrorKey = {
          error: newkey,
          index: Number(field) + 1,
        };
      } else {
        newkey = `${field}-${error}`;
        newFormErrorKey = {
          error: newkey,
        };
      }
    } else {
      newkey = `x-${field}-${error}`;
      newFormErrorKey = {
        error: newkey,
        index: Number(index) + 1,
      };
    }

    return newFormErrorKey;
  }

  public getKeyErrors(
    keys: FormErrorTranslateKey[],
    errorObject: any
  ): FormErrorTranslateKey[] {
    this.errorList = [];
    keys.forEach((el) => {
      if (errorObject[el.error]) {
        if (el.index) {
          this.errorList.push({
            error: el.error,
            key: errorObject[el.error],
            index: el.index,
          });
        } else {
          this.errorList.push({
            error: el.error,
            key: errorObject[el.error],
          });
        }
      } else {
        this.errorList.push({
          error: el.error,
          key: el.error,
        });
      }
    });
    return this.errorList;
  }

  public validateForm(
    form: UntypedFormGroup,
    errorDefinitions: any
  ): FormErrorTranslateKey[] {
    this.errorList = [];
    const errorKeys = this.validateFormGroupFields(form);
    return this.getKeyErrors(errorKeys, errorDefinitions);
  }
}
