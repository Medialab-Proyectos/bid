import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { BidderForm, EmailForm, UBOForm } from '@core/models/ubo.model';

export function generateUBOForm(): FormGroup<UBOForm> {
  return new FormGroup<UBOForm>({
    bidders: new FormArray<FormGroup<BidderForm>>([]),
  });
}

export function createBidder(
  name: string,
  bidderId: string
): FormGroup<BidderForm> {
  return new FormGroup<BidderForm>({
    name: new FormControl<string>(name, [Validators.required]),
    emails: new FormArray<FormGroup<EmailForm>>([], [Validators.minLength(1)]),
    bidderId: new FormControl<string>(bidderId, [Validators.required]),
  });
}

export function createEmail(): FormGroup<EmailForm> {
  return new FormGroup<EmailForm>({
    email: new FormControl<string>('', [
      Validators.required,
      Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
    ]),
    fullName: new FormControl<string>('', [Validators.required]),
  });
}
