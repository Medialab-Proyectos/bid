import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CommitmentPayment } from '../models/payment-record.model';

/**
 * Names a payment in the grids.
 *
 * Most rows carry a concept the agency typed. An accumulated report does not:
 * it is one line the system creates for a whole contract, so its name belongs
 * to the interface and has to follow the language of the user rather than sit
 * frozen in the record.
 */
@Pipe({ name: 'paymentConcept' })
export class PaymentConceptPipe implements PipeTransform {
  constructor(private readonly translate: TranslateService) {}

  transform(payment: CommitmentPayment): string {
    if (!payment) {
      return '';
    }
    return payment.accumulated
      ? this.translate.instant('PAYMENT_RECORD.ACCUMULATED.CONCEPT')
      : payment.concept;
  }
}
