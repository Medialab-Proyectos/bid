import { Component } from '@angular/core';
import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';
import { FinancialPlanMonth, ProcessPayment } from '../../models/financial-plan.model';

/**
 * "Detalle de pagos", opened from a process', a commitment's or a
 * non-procurement row's own "Desglose" button in the component drill-down --
 * the date/concept/amount breakdown, grouped by month, used to unfold
 * inline right under the row it belonged to. With six month columns
 * already on screen, that pushed everything else on the page down and made
 * the row it came from scroll out of view immediately, so this is a dialog
 * instead: the table it was reached from stays exactly where it was, and
 * the detail opens on top of it rather than inside it.
 *
 * Takes the row's own fields directly (`itemId`/`description`/`contractName`/
 * `totalAmount`/`payments`) instead of a whole `ProcessRow`, so a commitment
 * or a `NonProcurementRow` -- same shape, no commitments of their own -- can
 * open the exact same dialog instead of needing a second copy of it.
 * Commitments get their own row (and their own "Desglose" straight into this
 * dialog) in the main table now, so this never needs to nest a commitment's
 * own breakdown inside a process' -- the same level of detail is one click
 * away either way.
 */
@Component({
  selector: 'fi-process-payments-dialog',
  templateUrl: './process-payments-dialog.component.html',
  styleUrls: ['../../financial-plan.shared.scss'],
})
export class ProcessPaymentsDialogComponent extends DialogContentBase {
  itemId: string;
  /** A potential process: it was entered month by month, with no payment
   *  dates, so its breakdown is one line per month and no date column
   *  (26/10: "no tenemos fecha... solamente tenemos uno por mes"). */
  perMonth = false;
  description: string;
  contractName: string;
  totalAmount: number;
  payments: ProcessPayment[];
  months: FinancialPlanMonth[];
  periodStart: string;
  periodEnd: string;

  /** Which months currently hide their own payment rows -- expanded by
   *  default, same as the Figma reference's own "Monthly breakdown" dialog;
   *  this is purely about reading a long list more comfortably, not a
   *  decision that needs to survive reopening the dialog. */
  private readonly collapsedMonths = new Set<string>();

  /** `monthlyPayments()` is called from `*ngFor` in the template, so
   *  without caching its own result here, every single change-detection
   *  cycle would hand `*ngFor` a brand new array of brand new objects --
   *  it diffs by identity, not by value, so it would read that as "every
   *  month was removed, every month was re-added" on every tick and tear
   *  down and rebuild the whole table each time, instead of just
   *  rendering once. One dialog instance only ever groups one row's own
   *  `payments`, so this needs no cache key. */
  private groupedByMonth: { label: string; total: number; payments: ProcessPayment[] }[];

  private cachedMaxMonthlyTotal: number;

  constructor(dialog: DialogRef) {
    super(dialog);
  }

  close(): void {
    this.dialog.close();
  }

  /** "En enero se hicieron 4 pagos, en febrero 5..." -- grouped back under
   *  its own month instead of left as one opaque monthly total. Also what
   *  the header's own mini bar chart reads its six figures off. */
  monthlyPayments(): { label: string; total: number; payments: ProcessPayment[] }[] {
    if (this.groupedByMonth) {
      return this.groupedByMonth;
    }
    this.groupedByMonth = this.months
      .map((month) => {
        const monthDate = new Date(month.date);
        const monthPayments = this.payments.filter((payment) => {
          const paymentDate = new Date(payment.date);
          return (
            paymentDate.getFullYear() === monthDate.getFullYear() &&
            paymentDate.getMonth() === monthDate.getMonth()
          );
        });
        return {
          label: month.label,
          total: monthPayments.reduce((sum, payment) => sum + payment.amount, 0),
          payments: monthPayments,
        };
      })
      .filter((month) => month.payments.length > 0);
    return this.groupedByMonth;
  }

  /** What every bar's own width is a percentage of -- the heaviest month
   *  reads as a full-width bar, every other month as its own share of that.
   *  Floored at 1 so a row with no payments at all never divides by zero. */
  maxMonthlyTotal(): number {
    if (this.cachedMaxMonthlyTotal === undefined) {
      this.cachedMaxMonthlyTotal = Math.max(1, ...this.monthlyPayments().map((month) => month.total));
    }
    return this.cachedMaxMonthlyTotal;
  }

  isMonthCollapsed(label: string): boolean {
    return this.collapsedMonths.has(label);
  }

  toggleMonth(label: string): void {
    if (this.collapsedMonths.has(label)) {
      this.collapsedMonths.delete(label);
    } else {
      this.collapsedMonths.add(label);
    }
  }
}
