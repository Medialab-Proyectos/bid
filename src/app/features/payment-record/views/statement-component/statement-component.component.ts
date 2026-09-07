import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, filter, switchMap, take } from 'rxjs';
import { ProjectStoreService } from '@core/services/store-services';
import { VisibilityService } from '@core/services/view';
import { TranslateService } from '@ngx-translate/core';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared/services/notification-global.service';
import {
  CommitmentPayment,
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
