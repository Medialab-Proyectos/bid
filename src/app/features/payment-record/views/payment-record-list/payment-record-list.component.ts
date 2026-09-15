import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, filter, switchMap, take } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ProjectStoreService } from '@core/services/store-services';
import { VisibilityService } from '@core/services/view';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared/services/notification-global.service';
import { TransactionHeaderBalances } from '@fiduciary-interface/app/features/transactions/models';
import { FiTransactionsApiService } from '@fiduciary-interface/app/features/transactions/services/fi-transactions-api/fi-transactions-api.service';
import {
  Commitment,
  PaymentRecordSummary,
} from '../../models/payment-record.model';
import { PaymentRecordApiService } from '../../services/payment-record-api.service';
import { PaymentRecordDialogService } from '../../services/payment-record-dialog.service';

@Component({
  selector: 'fi-payment-record-list',
  templateUrl: './payment-record-list.component.html',
  styleUrls: ['../../payment-record.shared.scss'],
})
export class PaymentRecordListComponent implements OnInit, OnDestroy {
  private readonly subscriptions = new Subscription();

  projectBucketId: string;
  contract: string;
  summary: PaymentRecordSummary;
  balances: TransactionHeaderBalances;
  commitments: Commitment[] = [];
  filteredCommitments: Commitment[] = [];
  searchTerm = '';
  loading = true;

  constructor(
    private readonly projectStore: ProjectStoreService,
    private readonly visibilitySvc: VisibilityService,
    private readonly paymentRecordApi: PaymentRecordApiService,
    // Owner of the balances endpoint; reused instead of duplicating the call.
    private readonly transactionsApi: FiTransactionsApiService,
    private readonly dialogs: PaymentRecordDialogService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly translate: TranslateService,
    private readonly notificationSvc: NotificationGlobalService
  ) {}

  ngOnInit(): void {
    // This screen carries its own project card, so the generic project header
    // of the shell would be a second copy of the same identity strip.
    this.visibilitySvc.setVisiblityProjectHeader(false);
    // Without this the crumb falls back to the url segment, and the trail
    // reads "payment-record > expenditure-statement".
    this.visibilitySvc.breadcrumbService.set('@paymentRecord', 'PAYMENT_RECORD.TITLE');

    const sub = this.projectStore
      .selectedProject()
      .pipe(
        filter((state) => !!state && !!state.selectedProject),
        take(1),
        switchMap((state) => {
          this.projectBucketId = state.selectedProject.projectBucketId;
          this.contract = state.selectedProject.contract;
          return this.paymentRecordApi.getSummary(this.projectBucketId);
        })
      )
      .subscribe({
        next: (summary) => {
          this.summary = summary;
          this.commitments = summary.commitments;
          this.applyFilter();
          this.loading = false;
          this.loadBalances();
        },
        error: () => {
          this.loading = false;
        },
      });

    this.subscriptions.add(sub);
  }

  ngOnDestroy(): void {
    this.visibilitySvc.setVisiblityProjectHeader(true);
    this.subscriptions.unsubscribe();
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

  onSearch(term: string): void {
    this.searchTerm = (term ?? '').toLocaleLowerCase().trim();
    this.applyFilter();
  }

  private applyFilter(): void {
    if (!this.searchTerm) {
      this.filteredCommitments = [...this.commitments];
      return;
    }

    this.filteredCommitments = this.commitments.filter((commitment) =>
      [
        commitment.commitmentNumber,
        commitment.componentName,
        commitment.beneficiaryName,
      ]
        .join(' ')
        .toLocaleLowerCase()
        .includes(this.searchTerm)
    );
  }

  /** Second step of the flow: build the statement that goes to the Bank. */
  openStatement(): void {
    this.router.navigate(['expenditure-statement'], {
      relativeTo: this.route,
    });
  }

  /** Same payments, read as the agency's position instead of as a ledger. */
  goToSituation(): void {
    this.router.navigate(['situation'], { relativeTo: this.route });
  }

  openCommitment(commitment: Commitment): void {
    this.router.navigate([commitment.id], { relativeTo: this.route });
  }

  openExchangeRates(): void {
    const sub = this.dialogs
      .openExchangeRates(this.projectBucketId)
      .subscribe(() => this.reloadSummary());
    this.subscriptions.add(sub);
  }

  /**
   * The list has no commitment of its own -- it shows every commitment of the
   * loan -- so this is the loan-wide import: template and upload straight
   * away, no "which commitment?" step first. A row of the file decides which
   * commitment it belongs to, the same way "Añadir pagos" decides it inside
   * one commitment.
   */
  importCommitmentPayments(): void {
    const sub = this.dialogs
      .openImportLoanPayments(this.projectBucketId)
      .subscribe(() => {
        this.notificationSvc.showSuccess(
          this.translate.instant('PAYMENT_RECORD.ADD_PAYMENTS.SAVE_SUCCESS')
        );
        this.reloadSummary();
      });
    this.subscriptions.add(sub);
  }

  private reloadSummary(): void {
    const sub = this.paymentRecordApi
      .getSummary(this.projectBucketId)
      .subscribe((summary) => {
        this.summary = summary;
        this.commitments = summary.commitments;
        this.applyFilter();
      });
    this.subscriptions.add(sub);
  }
}
