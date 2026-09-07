import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { createAmountsJustificationForm } from './amounts-justification.form';

@Component({
  selector: 'fi-amounts-justification',
  templateUrl: './amounts-justification.component.html',
})
export class AmountsJustificationComponent implements OnInit {
  private readonly subscriptions: Subscription = new Subscription();

  @Input() form = createAmountsJustificationForm();
  @Input() number = 2;
  @Input() approvedCurrency: Observable<string>;

  decimals = 2;
  format = 'n2';

  ngOnInit(): void {
    this.formValueChanges();
  }

  get bidControl(): AbstractControl {
    return this.form.get('bid');
  }

  get amountPendingJustificationControl(): AbstractControl {
    return this.form.get('amountPendingJustification');
  }

  formValueChanges(): void {
    const sub = this.form.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(() => {
        if (this.amountPendingJustificationControl.invalid) {
          this.bidControl.setErrors(
            {
              exceedAmountError: true,
            },
            { emitEvent: false }
          );
        }
      });
    this.subscriptions.add(sub);
  }
}
