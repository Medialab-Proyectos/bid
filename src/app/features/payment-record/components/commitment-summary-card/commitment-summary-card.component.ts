import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommitmentDetail } from '../../models/payment-record.model';

/** Collapsible header of the commitment detail screen. */
@Component({
  selector: 'fi-payment-record-commitment-card',
  templateUrl: './commitment-summary-card.component.html',
  styleUrls: ['../../payment-record.shared.scss'],
})
export class CommitmentSummaryCardComponent {
  @Input() commitment: CommitmentDetail;

  expanded = true;

  constructor(private readonly router: Router) {}

  toggle(): void {
    this.expanded = !this.expanded;
  }

  /**
   * Opens the contract this commitment came from, in the procurement module.
   *
   * Built from the current url rather than by counting route levels: the two
   * modules sit under the same project shell, and a relative `..` from inside
   * a lazily loaded feature is easy to get wrong and lands on the dashboard.
   */
  openCommitment(): void {
    const origin = this.commitment?.procurement;
    if (!origin) {
      return;
    }

    const url = this.router.url;
    const projectPath = url.slice(0, url.indexOf('/payment-record'));
    this.router.navigateByUrl(
      `${projectPath}/procurement/${origin.procurementId}` +
        `/process/${origin.processId}/contracts`
    );
  }

  /** Share of the bar taken by the first of the two amounts, as a percentage. */
  share(first: number, second: number): number {
    const total = (first || 0) + (second || 0);
    return total === 0 ? 0 : ((first || 0) / total) * 100;
  }

  /** Days left before the contract stops being executable. */
  get daysRemaining(): number {
    if (!this.commitment?.effectiveEndDate) {
      return null;
    }
    const end = new Date(this.commitment.effectiveEndDate).getTime();
    return Math.ceil((end - Date.now()) / (24 * 60 * 60 * 1000));
  }

  /** How much of the contract term has gone by, as a percentage. */
  get elapsedPercent(): number {
    const start = new Date(this.commitment?.effectiveStartDate).getTime();
    const end = new Date(this.commitment?.effectiveEndDate).getTime();
    if (!start || !end || end <= start) {
      return null;
    }
    const ratio = (Date.now() - start) / (end - start);
    return Math.max(0, Math.min(100, Math.round(ratio * 100)));
  }

  get paidPercent(): number {
    return Math.round(
      this.share(this.commitment?.paidAmount, this.commitment?.pendingAmount)
    );
  }

  /**
   * The proxy the team asked for: time gone by against money paid. A contract
   * halfway through its term with 40% paid is healthy; one at 80% of its term
   * with 5% paid is the case worth surfacing.
   */
  get executionAlert(): 'expired' | 'closing' | 'behind' | null {
    const days = this.daysRemaining;
    const elapsed = this.elapsedPercent;

    if (days !== null && days < 0) {
      return 'expired';
    }
    if (days !== null && days <= 30) {
      return 'closing';
    }
    if (elapsed !== null && elapsed - this.paidPercent >= 25) {
      return 'behind';
    }
    return null;
  }

  /** 'expired' is the one case actually blocking something; 'closing' and
   *  'behind' are still just worth a look. */
  get executionAlertType(): 'error' | 'warning' {
    return this.executionAlert === 'expired' ? 'error' : 'warning';
  }
}
