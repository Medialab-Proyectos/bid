import { PaymentRecordStatus } from '../models/payment-record.model';

/**
 * Colour of the status chip.
 *
 * One place, because the same five states are shown on the commitment grid, in
 * the statement and in three dialogs, and a payment that reads green in one
 * screen and grey in the next is worse than no colour at all.
 */
export function paymentStatusClass(status: PaymentRecordStatus | string): string {
  switch (status) {
    case PaymentRecordStatus.JUSTIFIED:
      return 'c-status-label__blue';
    case PaymentRecordStatus.PENDING_JUSTIFICATION:
      return 'c-status-label__light-blue';
    case PaymentRecordStatus.ACCUMULATED:
      return 'c-status-label__grey';
    case PaymentRecordStatus.PAID:
      return 'c-status-label__green';
    default:
      // Scheduled: planned, not yet executed.
      return 'c-status-label__orange-yellow';
  }
}
