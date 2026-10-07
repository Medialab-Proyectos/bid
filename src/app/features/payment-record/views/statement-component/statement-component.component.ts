import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, filter, switchMap, take } from 'rxjs';
import { ProjectStoreService } from '@core/services/store-services';
import { VisibilityService } from '@core/services/view';
import { TranslateService } from '@ngx-translate/core';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared/services/notification-global.service';
import {
  CommitmentPayment,
  FinancingBreakdown,
  StatementComponentDetail,
} from '../../models/payment-record.model';
import { PaymentRecordApiService } from '../../services/payment-record-api.service';

/**
 * Drill-down of one component of the statement.
 *
 * The statement offers every payment of the loan that falls in the period. Not
 * all of them have to travel: an agency may hold one back because the invoice
 * is under review, or because it wants to send it in the next batch. This is
 * where that choice is made, and saving recalculates the amount the component
 * contributes.
 */
@Component({
  selector: 'fi-statement-component',
  templateUrl: './statement-component.component.html',
  styleUrls: ['../../payment-record.shared.scss'],
})
export class StatementComponentComponent implements OnInit, OnDestroy {
  private readonly subscriptions = new Subscription();

  projectBucketId: string;
  componentCode: string;
  detail: StatementComponentDetail;

  /** Payment id -> travels in the statement. */
  selection: { [paymentId: string]: boolean } = {};

  searchTerm = '';
  filteredPayments: CommitmentPayment[] = [];
  loading = true;
  saving = false;
  saved = false;

  constructor(
    private readonly api: PaymentRecordApiService,
    private readonly projectStore: ProjectStoreService,
    private readonly visibilitySvc: VisibilityService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly translate: TranslateService,
    private readonly notificationSvc: NotificationGlobalService
  ) {}

  ngOnInit(): void {
    // Reached from the amounts table, already two levels into the statement
    // flow -- the generic shell header would be a third repeat of the same
    // project identity this deep in.
    this.visibilitySvc.setVisiblityProjectHeader(false);
    // Without this the crumb falls back to the url segment, and the trail
    // reads "payment-record > expenditure-statement".
    this.visibilitySvc.breadcrumbService.set(
      '@statementComponent',
      'PAYMENT_RECORD.STATEMENT.COMPONENT_TITLE'
    );
    this.componentCode = this.route.snapshot.paramMap.get('componentCode');

    const sub = this.projectStore
      .selectedProject()
      .pipe(
        filter((state) => !!state && !!state.selectedProject),
        take(1),
        switchMap((state) => {
          this.projectBucketId = state.selectedProject.projectBucketId;
          return this.api.getStatementComponent(
            this.projectBucketId,
            this.componentCode
          );
        })
      )
      .subscribe({
        next: (detail) => this.apply(detail),
        error: () => {
          this.detail = null;
          this.loading = false;
        },
      });
    this.subscriptions.add(sub);
  }

  ngOnDestroy(): void {
    this.visibilitySvc.setVisiblityProjectHeader(true);
    this.subscriptions.unsubscribe();
  }

  private apply(detail: StatementComponentDetail): void {
    this.detail = detail;
    this.selection = {};
    detail.selectedPaymentIds.forEach((id) => {
      this.selection[id] = true;
    });
    this.applyFilter();
    this.loading = false;
  }

  // ---------------------------------------------------------------- filter

  onSearch(term: string): void {
    this.searchTerm = (term ?? '').toLocaleLowerCase().trim();
    this.applyFilter();
  }

  private applyFilter(): void {
    const payments = this.detail ? this.detail.payments : [];
    if (!this.searchTerm) {
      this.filteredPayments = [...payments];
      return;
    }

    this.filteredPayments = payments.filter((payment) =>
      [
        payment.id,
        payment.commitmentId,
        payment.concept,
        payment.beneficiaryName,
        payment.accountingVoucher,
      ]
        .join(' ')
        .toLocaleLowerCase()
        .includes(this.searchTerm)
    );
  }

  // ---------------------------------------------------------------- selection

  get selectedIds(): string[] {
    return Object.keys(this.selection).filter((id) => this.selection[id]);
  }

  get allSelected(): boolean {
    return (
      Boolean(this.detail) &&
      this.detail.payments.length > 0 &&
      this.detail.payments.every((payment) => this.selection[payment.id])
    );
  }

  toggleAll(): void {
    const select = !this.allSelected;
    this.detail.payments.forEach((payment) => {
      this.selection[payment.id] = select;
    });
    this.saved = false;
  }

  onToggle(): void {
    this.saved = false;
  }

  /** Amount the ticked payments add up to, in the currency of the loan. */
  get selectedTotal(): number {
    if (!this.detail) {
      return 0;
    }
    return this.detail.payments
      .filter((payment) => this.selection[payment.id])
      .reduce((total, payment) => total + payment.equivalentAmount, 0);
  }

  /**
   * `detail.toJustify` only ever reflects the selection the page loaded
   * with -- the server that built it has no idea what the agency is about
   * to tick or untick. Unticking a payment here is exactly the action this
   * screen exists for, so the "Component justified" summary above the
   * table has to recompute from the live `selection`, the same source the
   * checkboxes themselves write to, not repeat the snapshot `save()` will
   * eventually replace.
   */
  get liveToJustify(): FinancingBreakdown {
    const empty: FinancingBreakdown = { idb: 0, localContribution: 0, cofinancing: 0 };
    if (!this.detail) {
      return empty;
    }
    return this.detail.payments
      .filter((payment) => this.selection[payment.id])
      .reduce(
        (total, payment) => ({
          idb: total.idb + (payment.idbFinancingAmount || 0),
          localContribution:
            total.localContribution + (payment.localFinancingAmount || 0),
          cofinancing: total.cofinancing + (payment.cofinancingAmount || 0),
        }),
        empty
      );
  }

  /**
   * What is approved for the component never moves from unticking a
   * payment -- only how much of it this statement is about to claim does.
   * Reverse-derived from the snapshot's own two numbers (`toJustify` +
   * `availableBalance` = approved) rather than duplicated from the server,
   * so it can't drift from whatever baseline the snapshot actually used.
   */
  private get approved(): FinancingBreakdown {
    if (!this.detail) {
      return { idb: 0, localContribution: 0, cofinancing: 0 };
    }
    return {
      idb: this.detail.toJustify.idb + this.detail.availableBalance.idb,
      localContribution:
        this.detail.toJustify.localContribution +
        this.detail.availableBalance.localContribution,
      cofinancing:
        this.detail.toJustify.cofinancing + this.detail.availableBalance.cofinancing,
    };
  }

  /** Same live recompute as `liveToJustify`, for the "Pending to justify"
   *  summary right next to it -- otherwise the two panels stop adding up
   *  to the approved amount the moment one of them goes live and the
   *  other does not. */
  get liveAvailableBalance(): FinancingBreakdown {
    const approved = this.approved;
    const justify = this.liveToJustify;
    return {
      idb: approved.idb - justify.idb,
      localContribution: approved.localContribution - justify.localContribution,
      cofinancing: approved.cofinancing - justify.cofinancing,
    };
  }

  trackPayment(_index: number, payment: CommitmentPayment): string {
    return payment.id;
  }

  // ---------------------------------------------------------------- save

  save(): void {
    this.saving = true;
    const sub = this.api
      .saveStatementComponent(
        this.projectBucketId,
        this.componentCode,
        this.selectedIds
      )
      .subscribe({
        next: () => {
          this.saving = false;
          this.saved = true;
          this.notificationSvc.showSuccess(
            this.translate.instant('PAYMENT_RECORD.STATEMENT.SAVE_SUCCESS')
          );
          this.back();
        },
        error: () => {
          this.saving = false;
        },
      });
    this.subscriptions.add(sub);
  }

  back(): void {
    // The whole drill-down is one route, so a relative `..` would leave the
    // module altogether. Navigating from the parent is unambiguous.
    this.router.navigate(['expenditure-statement'], {
      relativeTo: this.route.parent,
    });
  }

  /** Same escape hatch the statement itself offers: back to the ledger. */
  goToRecord(): void {
    this.router.navigate([''], { relativeTo: this.route.parent });
  }
}
