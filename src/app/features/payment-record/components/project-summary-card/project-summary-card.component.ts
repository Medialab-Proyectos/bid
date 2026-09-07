import { Component, Input } from '@angular/core';
import { TransactionHeaderBalances } from '@fiduciary-interface/app/features/transactions/models';
import { PaymentRecordSummary } from '../../models/payment-record.model';

/**
 * Collapsible project card at the top of the payment record list: operation
 * identity plus the loan balances.
 */
@Component({
  selector: 'fi-payment-record-project-card',
  templateUrl: './project-summary-card.component.html',
  styleUrls: ['../../payment-record.shared.scss'],
})
export class ProjectSummaryCardComponent {
  @Input() contract: string;
  @Input() summary: PaymentRecordSummary;
  @Input() balances: TransactionHeaderBalances;
  @Input() loading = false;

  expanded = true;

  toggle(): void {
    this.expanded = !this.expanded;
  }
}
