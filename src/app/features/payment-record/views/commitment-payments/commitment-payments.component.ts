import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, filter, take } from 'rxjs';
import { ProjectStoreService } from '@core/services/store-services';
import { VisibilityService } from '@core/services/view';
import {
  BlockingReason,
  CommitmentDetail,
  CommitmentPayment,
  PaymentRecordStatus,
  PaymentTotal,
  ProjectComponent,
} from '../../models/payment-record.model';
import { PaymentRecordApiService } from '../../services/payment-record-api.service';
import { PaymentRecordDialogService } from '../../services/payment-record-dialog.service';
import { blockerReasonFor } from '../../services/payment-record-situation.builder';
import { paymentStatusClass } from '../../utils/payment-status';

@Component({
  selector: 'fi-commitment-payments',
  templateUrl: './commitment-payments.component.html',
  styleUrls: ['../../payment-record.shared.scss'],
})
export class CommitmentPaymentsComponent implements OnInit, OnDestroy {
  private readonly subscriptions = new Subscription();

  commitmentId: string;
  projectBucketId: string;
  commitment: CommitmentDetail;
  payments: CommitmentPayment[] = [];
  filteredPayments: CommitmentPayment[] = [];
  totals: PaymentTotal[] = [];
  components: ProjectComponent[] = [];
  searchTerm = '';
  loading = true;

  /**
   * Set when this screen is opened from a blocker on "Tu situación" -- the
   * `?blocked=` the agency was sent to look at, not something they typed.
   * Narrows the grid to just those payments instead of handing back the same
   * full table they already left, with no sign of what they were sent for.
   */
  blockedReason: BlockingReason | null = null;
  blockedCount = 0;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly api: PaymentRecordApiService,
    private readonly dialogs: PaymentRecordDialogService,
    private readonly projectStore: ProjectStoreService,
    private readonly visibilitySvc: VisibilityService
  ) {}

  ngOnInit(): void {
    this.visibilitySvc.setVisiblityProjectHeader(false);
    this.commitmentId = this.route.snapshot.paramMap.get('commitmentId');

    const projectSub = this.projectStore
      .selectedProject()
      .pipe(
        filter((state) => !!state && !!state.selectedProject),
        take(1)
      )
      .subscribe((state) => {
        this.projectBucketId = state.selectedProject.projectBucketId;
        this.loadComponents();
      });
    this.subscriptions.add(projectSub);

    const querySub = this.route.queryParamMap.subscribe((params) => {
      const reason = params.get('blocked') as BlockingReason;
      const known = Object.values(BlockingReason).includes(reason);
      this.blockedReason = known ? reason : null;
      this.applyFilter();
    });
    this.subscriptions.add(querySub);

    this.loadCommitment();
    this.loadPayments();
  }

  ngOnDestroy(): void {
    this.visibilitySvc.setVisiblityProjectHeader(true);
    this.subscriptions.unsubscribe();
  }

  private loadComponents(): void {
    const sub = this.api.getComponents(this.projectBucketId).subscribe({
      next: (components) => {
        this.components = components;
      },
      error: () => {
        this.components = [];
      },
    });
    this.subscriptions.add(sub);
  }

  private loadCommitment(): void {
    const sub = this.api.getCommitment(this.commitmentId).subscribe({
      next: (commitment) => {
        this.commitment = commitment;
      },
      error: () => {
        this.commitment = null;
      },
    });
    this.subscriptions.add(sub);
  }

  private loadPayments(): void {
    this.loading = true;
    const sub = this.api.getPayments(this.commitmentId).subscribe({
      next: (response) => {
        this.payments = response.payments;
        this.totals = response.totals;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
    this.subscriptions.add(sub);
  }

  onSearch(term: string): void {
    this.searchTerm = (term ?? '').toLocaleLowerCase().trim();
    this.applyFilter();
  }

  private applyFilter(): void {
    const scoped = this.blockedReason
      ? this.payments.filter(
          (payment) => blockerReasonFor(payment) === this.blockedReason
        )
      : this.payments;
    this.blockedCount = this.blockedReason ? scoped.length : 0;

    if (!this.searchTerm) {
      this.filteredPayments = [...scoped];
      return;
    }

    this.filteredPayments = scoped.filter((payment) =>
      [payment.id, payment.concept, payment.accountingVoucher]
        .join(' ')
        .toLocaleLowerCase()
        .includes(this.searchTerm)
    );
  }

  blockedReasonLabel(): string {
    return 'PAYMENT_RECORD.SITUATION.BLOCKER.' + this.blockedReason;
  }

  blockedReasonFix(): string {
    return 'PAYMENT_RECORD.SITUATION.FIX.' + this.blockedReason;
  }

  /** Drops the narrowing without leaving the commitment. */
  showAllPayments(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { blocked: null },
      queryParamsHandling: 'merge',
    });
  }

  statusClass(status: PaymentRecordStatus): string {
    return paymentStatusClass(status);
  }

  /** One number instead of one per currency -- an approval-currency total
   *  is meaningful to add across currencies, unlike the amounts themselves. */
  get totalsEquivalentSum(): number {
    return this.totals.reduce((sum, total) => sum + total.equivalentAmount, 0);
  }

  /** Back to the report list this commitment was opened from. */
  goBack(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  openAddPayments(): void {
    const sub = this.dialogs
      .openAddPayments(
        this.commitmentId,
        this.components,
        this.commitment?.approvalCurrency
      )
      .subscribe(() => this.reload());
    this.subscriptions.add(sub);
  }

  openExchangeRates(): void {
    const sub = this.dialogs
      .openExchangeRates(this.projectBucketId)
      .subscribe(() => this.reload());
    this.subscriptions.add(sub);
  }

  openPaymentMechanism(): void {
    const sub = this.dialogs
      .openPaymentMechanism(this.commitmentId)
      .subscribe(() => this.reload());
    this.subscriptions.add(sub);
  }

  openPayment(payment: CommitmentPayment): void {
    const position = this.payments.findIndex((p) => p.id === payment.id) + 1;
    const sub = this.dialogs
      .openUpdatePayment(payment, position, this.payments.length, true)
      .subscribe(() => this.reload());
    this.subscriptions.add(sub);
  }

  private reload(): void {
    this.loadCommitment();
    this.loadPayments();
  }
}
