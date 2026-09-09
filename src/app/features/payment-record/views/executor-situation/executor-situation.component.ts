import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, filter, forkJoin, switchMap, take } from 'rxjs';
import { ProjectStoreService } from '@core/services/store-services';
import { VisibilityService } from '@core/services/view';
import { TransactionHeaderBalances } from '@fiduciary-interface/app/features/transactions/models';
import { FiTransactionsApiService } from '@fiduciary-interface/app/features/transactions/services/fi-transactions-api/fi-transactions-api.service';
import {
  ExecutorSituation,
  PaymentRecordSummary,
  SituationBlocker,
  SituationDeadline,
  SituationFigure,
} from '../../models/payment-record.model';
import { PaymentRecordApiService } from '../../services/payment-record-api.service';

/**
 * Alternative view of the payment record: the agency's own position.
 *
 * The module as built asks for data and hands nothing back, even though it
 * knows more about the agency's situation than the agency does. This screen is
 * the other direction. It adds no new data: the same payments, read as a
 * position rather than as a ledger.
 *
 * It exists to test one claim -- that an agency which can see what it is able
 * to claim, and what is stopping it, acts on that before the Bank has to.
 */
@Component({
  selector: 'fi-executor-situation',
  templateUrl: './executor-situation.component.html',
  styleUrls: ['../../payment-record.shared.scss'],
})
export class ExecutorSituationComponent implements OnInit, OnDestroy {
  private readonly subscriptions = new Subscription();

  projectBucketId: string;
  contract: string;
  summary: PaymentRecordSummary;
  balances: TransactionHeaderBalances;
  situation: ExecutorSituation;
  loading = true;

  constructor(
    private readonly api: PaymentRecordApiService,
    // Owner of the balances endpoint; reused instead of duplicating the call,
    // same as the list screen this one sits beside.
    private readonly transactionsApi: FiTransactionsApiService,
    private readonly projectStore: ProjectStoreService,
    private readonly visibilitySvc: VisibilityService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // This screen carries its own project card, same reason the list screen
    // hides the shell's generic one -- otherwise the operation's identity
    // shows up twice, or on this screen not at all.
    this.visibilitySvc.setVisiblityProjectHeader(false);
    this.visibilitySvc.breadcrumbService.set(
      '@executorSituation',
      'PAYMENT_RECORD.SITUATION.TITLE'
    );

    const sub = this.projectStore
      .selectedProject()
      .pipe(
        filter((state) => !!state && !!state.selectedProject),
        take(1),
        switchMap((state) => {
          this.projectBucketId = state.selectedProject.projectBucketId;
          this.contract = state.selectedProject.contract;
          return forkJoin({
            summary: this.api.getSummary(this.projectBucketId),
            situation: this.api.getSituation(this.projectBucketId),
          });
        })
      )
      .subscribe({
        next: ({ summary, situation }) => {
          this.summary = summary;
          this.situation = this.normalize(situation);
          this.loading = false;
          this.loadBalances();
        },
        error: () => {
          this.situation = null;
          this.loading = false;
        },
      });
    this.subscriptions.add(sub);
  }

  private loadBalances(): void {
    const sub = this.transactionsApi
      .getProjectBalances(this.projectBucketId)
      .subscribe({
        next: (balances) => {
          this.balances = balances as TransactionHeaderBalances;
        },
        error: () => {
          this.balances = null;
        },
      });
    this.subscriptions.add(sub);
  }

  /**
   * Fills in whatever the response left out with a zero/empty reading rather
   * than nothing at all. A payload the Bank's side has not finished wiring up
   * yet still answers as "nothing to report" instead of blanking the screen
   * below the header the moment the template reaches the first missing field.
   */
  private normalize(situation: ExecutorSituation): ExecutorSituation {
    const emptyFigure = (): SituationFigure => ({ amount: 0, payments: 0 });
    return {
      approvalCurrency: situation?.approvalCurrency ?? '',
      readyToJustify: situation?.readyToJustify ?? emptyFigure(),
      inProgress: situation?.inProgress ?? emptyFigure(),
      awaitingBank: situation?.awaitingBank ?? emptyFigure(),
      blocked: situation?.blocked ?? emptyFigure(),
      blockers: situation?.blockers ?? [],
      deadlines: situation?.deadlines ?? [],
      cycle: situation?.cycle ?? {
        medianDaysToTravel: 0,
        longestWaitDays: 0,
        travelledPercent: 0,
      },
    };
  }

  ngOnDestroy(): void {
    this.visibilitySvc.setVisiblityProjectHeader(true);
    this.subscriptions.unsubscribe();
  }

  // ------------------------------------------------------------ reading it

  /** Days the oldest free payment has been sitting unclaimed. */
  daysWaiting(date: string): number {
    if (!date) {
      return 0;
    }
    const day = 24 * 60 * 60 * 1000;
    return Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / day));
  }

  /**
   * The three position figures, added back up. Shown next to them so the
   * agency can check the three cards actually account for everything it
   * registered, instead of having to take that on faith.
   */
  get totalPayments(): number {
    if (!this.situation) {
      return 0;
    }
    return (
      (this.situation.readyToJustify?.payments ?? 0) +
      (this.situation.awaitingBank?.payments ?? 0) +
      (this.situation.blocked?.payments ?? 0)
    );
  }

  get hasSomethingToClaim(): boolean {
    return (this.situation?.readyToJustify?.payments ?? 0) > 0;
  }

  get hasBlockers(): boolean {
    return (this.situation?.blockers?.length ?? 0) > 0;
  }

  /**
   * How urgent a deadline is. A contract past its term is a different problem
   * from one merely closing, and both differ from one where the money is
   * lagging the calendar.
   */
  deadlineTone(deadline: SituationDeadline): 'expired' | 'closing' | 'behind' | 'ok' {
    if (deadline.daysRemaining < 0) {
      return 'expired';
    }
    if (deadline.daysRemaining <= 30) {
      return 'closing';
    }
    if (deadline.elapsedPercent - deadline.paidPercent >= 25) {
      return 'behind';
    }
    return 'ok';
  }

  blockerLabel(blocker: SituationBlocker): string {
    return 'PAYMENT_RECORD.SITUATION.BLOCKER.' + blocker.reason;
  }

  blockerFix(blocker: SituationBlocker): string {
    return 'PAYMENT_RECORD.SITUATION.FIX.' + blocker.reason;
  }

  trackBlocker(_index: number, blocker: SituationBlocker): string {
    return blocker.reason;
  }

  trackDeadline(_index: number, deadline: SituationDeadline): string {
    return deadline.commitmentId;
  }

  // ------------------------------------------------------------ acting on it

  /** Straight to building the statement with what is already free. */
  goToStatement(): void {
    this.router.navigate(['../expenditure-statement'], {
      relativeTo: this.route,
    });
  }

  goToCommitment(commitmentId: string): void {
    if (!commitmentId) {
      this.goToRecord();
      return;
    }
    this.router.navigate(['..', commitmentId], { relativeTo: this.route });
  }

  /**
   * Opens a commitment already narrowed to the payments this blocker holds,
   * and carries the reason so the screen can say why the agency is there.
   * Arriving at a full list of forty payments with no clue which four were the
   * problem is what made this confusing.
   */
  goToBlocked(blocker: SituationBlocker, commitmentId: string): void {
    this.router.navigate(['..', commitmentId], {
      relativeTo: this.route,
      queryParams: { blocked: blocker.reason },
    });
  }

  goToRecord(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
