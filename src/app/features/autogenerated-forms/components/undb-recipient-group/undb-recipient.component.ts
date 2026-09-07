import { Component, OnDestroy, Input } from '@angular/core';
import { RecipientFormData } from '../../models/recipient-form.model';
import { Subject } from 'rxjs';
import { FormType } from '@core/utils';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'fi-undb-recipient-group',
  templateUrl: './undb-recipient.component.html',
  styleUrls: ['./undb-recipient.component.scss'],
  providers: [],
})
export class UndbRecipientComponentGroup implements OnDestroy {
  private _isSubmitted: boolean = false;

  @Input() recipientFormGroup: FormType<RecipientFormData> = recipientForm();
  @Input() set isSubmitted(submitted: boolean) {
    this._isSubmitted = submitted;
    if (submitted) {
      this.recipientFormGroup.markAllAsTouched();
    }
  }

  get isSubmitted(): boolean {
    return this._isSubmitted;
  }

  destroyed$ = new Subject<void>();

  onBlur() {
    this.recipientFormGroup.markAsTouched();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}

export function recipientForm(): FormType<RecipientFormData> {
  return new FormGroup({
    address: new FormControl(null, [Validators.required]),
    email: new FormControl(null, [Validators.required, Validators.email]),
    executingAgency: new FormControl(null, [Validators.required]),
    phone: new FormControl(null, [Validators.required]),
    responsible: new FormControl(null, [Validators.required]),
    website: new FormControl(null, [Validators.required]),
  });
}
