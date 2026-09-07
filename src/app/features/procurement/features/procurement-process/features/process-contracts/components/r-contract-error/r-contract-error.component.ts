import { Component, Input } from '@angular/core';

export interface TranslatableError {
  translationKey: string;
  params: Record<string, any>;
  subErrors?: Array<{
    translationKey: string;
    params: Record<string, any>;
  }>;
}

@Component({
  selector: 'fi-r-contract-error',
  templateUrl: './r-contract-error.component.html',
  styleUrls: ['./r-contract-error.component.scss'],
})
export class RContractErrorComponent {
  @Input() title: string = 'R.CONTRACT.VALIDATION.PAYMENT_SCHEDULE.TITLE';
  @Input() errors: TranslatableError[] = [];

  get hasErrors(): boolean {
    return this.errors && this.errors.length > 0;
  }
}
