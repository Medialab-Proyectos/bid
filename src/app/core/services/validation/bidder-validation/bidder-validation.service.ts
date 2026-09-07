import { Injectable } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class BidderValidationService {
  public errorList: string[] = [];
  public bidderCounter: number = null;
  readonly minimumBidders = 2;

  public validateAllFormFields(formGroup: UntypedFormGroup | UntypedFormArray): string[] {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      if (
        (control instanceof UntypedFormGroup || control instanceof UntypedFormArray) &&
        !control.errors
      ) {
        // recursively looks for FormControl instances to validate
        this.validateAllFormFields(control);

        // Bidders minimun amount validation
        this.validateBiddersCount(control);
      } else {
        // FomControl instances validation
        if (control.status === 'INVALID') {
          this.getFormErrors(
            field,
            Object.keys(control.errors).toString(),
            this.isArrayFormControl(control) ? this.bidderCounter : null
          );
        }
      }
    });

    return this.errorList;
  }

  validateBiddersCount(control: AbstractControl) {
    if (control instanceof UntypedFormGroup && this.isArrayFormControl(control)) {
      this.bidderCounter++;
    }
    if (
      control instanceof UntypedFormArray &&
      control.controls.length > 0 &&
      this.bidderCounter < this.minimumBidders
    ) {
      this.errorList.push(
        this.semanticErrorsBuilder('bidders', 'bidders', null)
      );
    }
  }

  isArrayFormControl(control: AbstractControl): boolean {
    let isArrayFormControl = false;
    let parent = control.parent;
    let count = 1;
    do {
      isArrayFormControl = parent instanceof UntypedFormArray;
      parent = parent.parent;
      count++;
    } while (!isArrayFormControl && parent !== undefined);
    // FormControl only comes under 2 FormGroup controls under ArrayForm: 3 parents
    return count > 2 ? isArrayFormControl : false;
  }

  getFormErrors(field: string, error: string, i: number) {
    error.split(',').forEach((el) => {
      this.errorList.push(this.semanticErrorsBuilder(field, el, i));
    });
  }

  semanticErrorsBuilder(field: string, error: string, index: number): string {
    switch (field) {
      case 'name':
        if (index === null) {
          return `Participant Name is ${error}`;
        } else {
          return `Joint Venture Bidder ${index + 1} Name is ${error}`;
        }
      case 'type':
        if (index === null) {
          return `Participant Type is ${error}`;
        } else {
          return `Joint Venture Bidder ${index + 1} Type is ${error}`;
        }
      case 'nationality':
        if (index === null) {
          return `Participant Nationality is ${error}`;
        } else {
          return (
            `Joint Venture Bidder ${index + 1} Nationality is ${error}`
          );
        }
      case 'bidders':
        return (`Joint Venture should contain at least ${ this.minimumBidders } bidders`);
      default:
        return '';
    }
  }
}
