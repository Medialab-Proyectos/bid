import { Component } from '@angular/core';
import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';

/**
 * Asks before an action that is expensive to undo.
 *
 * The data in this module is what the agency reports to the Bank, so a few of
 * its actions are worth a second look: deleting a reported payment, changing a
 * rate that recalculates every payment of the loan, reclassifying how expenses
 * were funded, and generating the transaction that goes to the Bank. Editing a
 * single payment is not one of them -- it is visible and can be edited again.
 */
@Component({
  selector: 'fi-payment-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['../../payment-record.shared.scss'],
})
export class ConfirmDialogComponent extends DialogContentBase {
  messageKey: string;
  /** Interpolation values for the message. */
  params: { [key: string]: string | number } = {};
  /** What the action cannot undo, said plainly. */
  consequenceKey: string;
  confirmKey = 'PAYMENT_RECORD.CONFIRM.CONTINUE';
  /** Paints the confirm button as destructive. */
  danger = false;

  constructor(dialog: DialogRef) {
    super(dialog);
  }

  cancel(): void {
    this.dialog.close({ confirmed: false });
  }

  confirm(): void {
    this.dialog.close({ confirmed: true });
  }
}
