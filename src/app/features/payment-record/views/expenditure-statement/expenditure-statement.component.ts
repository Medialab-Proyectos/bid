import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, filter, take } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ProjectStoreService } from '@core/services/store-services';
import { VisibilityService } from '@core/services/view';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared/services/notification-global.service';
import {
  CommitmentPayment,
  ExpenditureStatementType,
  FinancingBreakdown,
  GeneratedStatement,
  PaymentTotal,
  PreviousStatement,
  ProjectComponent,
  StatementComponentDetail,
  StatementDraft,
  StatementRow,
  StatementRowKind,
  STATEMENT_NEEDS_ACCOUNT,
  STATEMENT_PICKS_PAYMENTS,
  STATEMENT_TYPE_UNAVAILABLE,
} from '../../models/payment-record.model';
import { PaymentRecordApiService } from '../../services/payment-record-api.service';
import { PaymentRecordDialogService } from '../../services/payment-record-dialog.service';
import { PaymentConfirmService } from '../../services/payment-confirm.service';
import { paymentStatusClass } from '../../utils/payment-status';

/**
 * Second step of the payment record: build the statement of expenditures that
 * goes to the Bank.
 *
 * Two shapes, decided by the transaction type. A justification or a
 * reimbursement sweeps a date range across every commitment of the loan and
 * shows the result grouped by component. A direct payment has nothing to
 * sweep -- the Bank has not paid the third party yet -- so the user picks the
 * payments by hand and they are listed one by one.
 */
@Component({
  selector: 'fi-expenditure-statement',
  templateUrl: './expenditure-statement.component.html',
  styleUrls: ['../../payment-record.shared.scss'],
})
export class ExpenditureStatementComponent implements OnInit, OnDestroy {
  private readonly subscriptions = new Subscription();

  readonly statementTypes = [
    ExpenditureStatementType.ATJ,
    ExpenditureStatementType.ANJ,
    ExpenditureStatementType.DPB,
    ExpenditureStatementType.DPS,
  ];

  projectBucketId: string;
  // Nothing picked yet -- the date range, the search button and the direct
  // payment action all depend on knowing which transaction type first, so
  // defaulting to one silently would build a statement of a type the agency
  // never chose.
  transactionType: ExpenditureStatementType = null;
  dateFrom: Date;
  dateTo: Date;

  /** "Actual" or "Anteriores". */
  tab: 'current' | 'previous' = 'current';

  draft: StatementDraft;
  previous: PreviousStatement[] = [];
  /** Only fetched for a direct payment, to open a picked row for editing. */
  components: ProjectComponent[] = [];

  loading = false;
  saving = false;
  generating = false;
  generated: GeneratedStatement;

  constructor(
    private readonly api: PaymentRecordApiService,
    private readonly projectStore: ProjectStoreService,
    private readonly visibilitySvc: VisibilityService,
    private readonly dialogs: PaymentRecordDialogService,
    private readonly confirmService: PaymentConfirmService,
    private readonly translate: TranslateService,
    private readonly notificationSvc: NotificationGlobalService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Reached straight from the sidebar, not through the payment record list
    // -- it reads as its own destination, not a page nested three levels
    // deep, so neither the generic project header nor the "payment-record"
    // crumb above it belongs here.
    this.visibilitySvc.setVisiblityProjectHeader(false);
    this.visibilitySvc.breadcrumbService.set('@paymentRecord', { skip: true });
    // Without this the crumb falls back to the url segment, and the trail
    // reads "payment-record > expenditure-statement".
    this.visibilitySvc.breadcrumbService.set(
      '@expenditureStatement',
      'PAYMENT_RECORD.STATEMENT.TITLE'
    );

    const sub = this.projectStore
      .selectedProject()
      .pipe(
        filter((state) => !!state && !!state.selectedProject),
        take(1)
      )
      .subscribe((state) => {
        this.projectBucketId = state.selectedProject.projectBucketId;
        this.loadPrevious();
        this.restoreDraft();
        this.loadComponents();
      });
    this.subscriptions.add(sub);
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

  ngOnDestroy(): void {
    this.visibilitySvc.setVisiblityProjectHeader(true);
    this.subscriptions.unsubscribe();
  }

  // ---------------------------------------------------------------- type

  isUnavailable(type: ExpenditureStatementType): boolean {
    return Boolean(STATEMENT_TYPE_UNAVAILABLE[type]);
  }

  /**
   * Kendo hands this a wrapper around the item, and calls it detached from the
   * component, so it has to be a bound arrow rather than a method.
   */
  readonly itemDisabled = (itemArgs: {
    dataItem: ExpenditureStatementType;
    index: number;
  }): boolean => this.isUnavailable(itemArgs.dataItem);

  get picksPayments(): boolean {
    return STATEMENT_PICKS_PAYMENTS[this.transactionType];
  }

  get needsAccount(): boolean {
    return STATEMENT_NEEDS_ACCOUNT[this.transactionType];
  }

  /** Changing the type invalidates whatever was on screen. */
  onTypeChange(): void {
    this.draft = null;
    this.generated = null;
  }

  // ---------------------------------------------------------------- build

  get canSearch(): boolean {
    return Boolean(
      this.dateFrom &&
        this.dateTo &&
        this.dateFrom <= this.dateTo &&
        !this.isUnavailable(this.transactionType)
    );
  }

  /** Manual search: starts a new statement, so any previous result is gone. */
  search(): void {
    this.generated = null;
    this.loadDraft();
  }

  /**
   * Picks the statement back up.
   *
   * Opening the detail of a component is a real navigation, so the screen is
   * rebuilt on the way back. The statement itself lives on the server, and
   * losing it here would throw away the payments the user just curated.
   */
  private restoreDraft(): void {
    const sub = this.api
      .getCurrentStatementDraft(this.projectBucketId)
      .subscribe({
        next: (draft) => {
          if (!draft) {
            return;
          }
          this.draft = draft;
          this.transactionType = draft.transactionType;
          this.dateFrom = draft.dateFrom ? new Date(draft.dateFrom) : null;
          this.dateTo = draft.dateTo ? new Date(draft.dateTo) : null;
        },
        // No statement in progress is the normal case, not a failure.
        error: () => undefined,
      });
    this.subscriptions.add(sub);
  }

  private loadDraft(): void {
    if (!this.canSearch) {
      return;
    }

    this.loading = true;
    const sub = this.api
      .getStatementDraft(
        this.projectBucketId,
        this.transactionType,
        this.dateFrom.toISOString(),
        this.dateTo.toISOString()
      )
      .subscribe({
        next: (draft) => {
          this.draft = draft;
          this.loading = false;
        },
        error: () => {
          this.draft = null;
          this.loading = false;
        },
      });
    this.subscriptions.add(sub);
  }

  /**
   * Direct payments: the same dialog the commitment screen uses, so the agency
   * can pull them from the schedule, type one in or import a file.
   */
  pickPayments(): void {
    const sub = this.dialogs
      .openPickStatementPayments(this.projectBucketId)
      .subscribe((paymentIds) => this.setPayments(paymentIds));
    this.subscriptions.add(sub);
  }

  private setPayments(paymentIds: string[]): void {
    this.loading = true;
    const sub = this.api
      .setStatementPayments(
        this.projectBucketId,
        this.transactionType,
        paymentIds
      )
      .subscribe({
        next: (draft) => {
          this.draft = draft;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
    this.subscriptions.add(sub);
  }

  /** A picked payment is still just a payment -- the same dialog opens it. */
  openPayment(payment: CommitmentPayment): void {
    const position =
      this.draft.payments.findIndex((p) => p.id === payment.id) + 1;
    const sub = this.dialogs
      .openUpdatePayment(
        payment,
        position,
        this.draft.payments.length,
        false,
        this.draft?.approvalCurrency
      )
      .subscribe((changed) => {
        if (changed) {
          this.setPayments(this.draft.payments.map((p) => p.id));
        }
      });
    this.subscriptions.add(sub);
  }

  // ---------------------------------------------------------------- table

  get hasRows(): boolean {
    return Boolean(
      this.draft &&
        this.draft.rows.some((row) => row.kind === StatementRowKind.COMPONENT)
    );
  }

  /** Only the component breakdown -- the advance and pending-to-send lines
   *  the backend includes alongside it summarize the statement as a whole,
   *  not any one component, and don't belong in a table of components. */
  get componentRows(): StatementRow[] {
    return this.draft
      ? this.draft.rows.filter((row) => row.kind === StatementRowKind.COMPONENT)
      : [];
  }

  isOpenable(row: StatementRow): boolean {
    return row.kind === StatementRowKind.COMPONENT;
  }

  rowLabel(row: StatementRow): string {
    return row.componentName;
  }

  /** Same shape, same grouping-by-currency the totals under "Pagos del
   *  compromiso" already use -- a direct payment's picked list is its own
   *  version of the same question, "how much, in what currency". */
  get paymentTotals(): PaymentTotal[] {
    const byCurrency = new Map<string, PaymentTotal>();
    (this.draft?.payments ?? []).forEach((payment) => {
      const current = byCurrency.get(payment.currency) ?? {
        currency: payment.currency,
        amount: 0,
        equivalentAmount: 0,
      };
      byCurrency.set(payment.currency, {
        currency: payment.currency,
        amount: current.amount + payment.amount,
        equivalentAmount: current.equivalentAmount + payment.equivalentAmount,
      });
    });
    return [...byCurrency.values()];
  }

  /** One number instead of one per currency -- an approval-currency total
   *  is meaningful to add across currencies, unlike the amounts themselves. */
  get paymentEquivalentTotal(): number {
    return this.paymentTotals.reduce(
      (sum, total) => sum + total.equivalentAmount,
      0
    );
  }

  openComponent(row: StatementRow): void {
    if (!this.isOpenable(row)) {
      return;
    }
    this.router.navigate(['components', row.componentCode], {
      relativeTo: this.route,
    });
  }

  trackRow(_index: number, row: StatementRow): string {
    return row.kind + row.componentCode + row.rowNumber;
  }

  trackPayment(_index: number, payment: CommitmentPayment): string {
    return payment.id;
  }

  // ---------------------------------------------------------------- save

  /** Keeps the statement without sending it, so it can be picked up later. */
  saveDraft(): void {
    this.saving = true;
    const sub = this.api.saveStatementDraft(this.projectBucketId).subscribe({
      next: (draft) => {
        this.draft = draft;
        this.saving = false;
        this.notificationSvc.showSuccess(
          this.translate.instant('PAYMENT_RECORD.STATEMENT.SAVE_SUCCESS')
        );
      },
      error: () => {
        this.saving = false;
      },
    });
    this.subscriptions.add(sub);
  }

  cancel(): void {
    this.draft = null;
    this.generated = null;
  }

  get canGenerate(): boolean {
    return Boolean(this.draft) && this.draft.paymentsSelected > 0;
  }

  generate(): void {
    if (!this.canGenerate) {
      return;
    }

    this.confirmService
      .ask({
        titleKey: 'PAYMENT_RECORD.CONFIRM.GENERATE_TITLE',
        messageKey: 'PAYMENT_RECORD.CONFIRM.GENERATE_MESSAGE',
        consequenceKey: 'PAYMENT_RECORD.CONFIRM.GENERATE_CONSEQUENCE',
        confirmKey: 'PAYMENT_RECORD.STATEMENT.GENERATE',
        params: {
          count: this.draft.paymentsSelected,
          type: this.translate.instant(
            'PAYMENT_RECORD.STATEMENT.TYPES.' + this.transactionType
          ),
        },
      })
      .subscribe(() => this.doGenerate());
  }

  private doGenerate(): void {
    this.generating = true;
    const sub = this.api
      .generateStatement(this.projectBucketId, {
        transactionType: this.transactionType,
        dateFrom: this.dateFrom ? this.dateFrom.toISOString() : '',
        dateTo: this.dateTo ? this.dateTo.toISOString() : '',
        paymentIds: [],
      })
      .subscribe({
        next: (statement) => {
          this.generated = statement;
          this.generating = false;
          this.draft = null;
          this.loadPrevious();
          this.notificationSvc.showSuccess(
            this.translate.instant('PAYMENT_RECORD.STATEMENT.GENERATE_SUCCESS')
          );
        },
        error: () => {
          this.generating = false;
        },
      });
    this.subscriptions.add(sub);
  }

  // ---------------------------------------------------------------- previous

  private loadPrevious(): void {
    const sub = this.api.getPreviousStatements(this.projectBucketId).subscribe({
      next: (statements) => {
        this.previous = statements;
      },
      error: () => {
        this.previous = [];
      },
    });
    this.subscriptions.add(sub);
  }

  /** Chip of a payment listed in a direct payment. */
  paymentStatusClass(status: string): string {
    return paymentStatusClass(status);
  }

  /** Chip of a statement already sent. */
  statusClass(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'c-status-label__green';
      case 'PENDING_IDB':
        return 'c-status-label__light-blue';
      default:
        return 'c-status-label__grey';
    }
  }

  // ---------------------------------------------------------------- export

  /**
   * Downloads the statement as a spreadsheet.
   *
   * This is the sheet the agency has been building by hand outside the portal:
   * once the payments are registered here, the portal produces it. Separator
   * and byte order mark are the ones Excel expects for a Spanish locale.
   */
  downloadStatement(): void {
    const sub = this.api
      .getStatementPayments(this.projectBucketId)
      .subscribe((components) => this.writeCsv(components));
    this.subscriptions.add(sub);
  }

  private writeCsv(components: StatementComponentDetail[]): void {
    const t = (key: string) => this.translate.instant(key);
    const currency = this.draft ? this.draft.approvalCurrency : '';
    const header = [
      t('PAYMENT_RECORD.COLUMNS.COMPONENT'),
      t('PAYMENT_RECORD.STATEMENT.COLUMNS.COMMITMENT'),
      t('PAYMENT_RECORD.DETAIL.COLUMNS.ID'),
      t('PAYMENT_RECORD.DETAIL.COLUMNS.CONCEPT'),
      t('PAYMENT_RECORD.DETAIL.COLUMNS.VOUCHER'),
      t('PAYMENT_RECORD.DETAIL.COLUMNS.DATE'),
      t('PAYMENT_RECORD.DETAIL.COLUMNS.CURRENCY'),
      t('PAYMENT_RECORD.DETAIL.COLUMNS.AMOUNT'),
      t('PAYMENT_RECORD.DETAIL.COLUMNS.RATE'),
      t('PAYMENT_RECORD.STATEMENT.COLUMNS.EQUIVALENT'),
    ];

    const rows: string[][] = [];
    components.forEach((component) => {
      let total = 0;
      component.payments.forEach((payment) => {
        total += payment.equivalentAmount;
        rows.push([
          component.componentName,
          payment.commitmentId,
          payment.id,
          payment.concept,
          payment.accountingVoucher,
          payment.paymentDate,
          payment.currency,
          String(payment.amount),
          String(payment.exchangeRate),
          String(payment.equivalentAmount),
        ]);
      });
      rows.push([]);
      rows.push([
        component.componentName,
        t('PAYMENT_RECORD.STATEMENT.TOTAL'),
        '',
        '',
        '',
        '',
        currency,
        '',
        '',
        String(Math.round(total * 100) / 100),
      ]);
      rows.push([]);
    });

    const separators = /[";\r\n]/;
    const escape = (cell: string) =>
      cell && separators.test(cell)
        ? '"' + cell.replace(/"/g, '""') + '"'
        : cell;
    const lines = [header, ...rows]
      .map((row) => row.map(escape).join(';'))
      .join(String.fromCharCode(13, 10));

    // The BOM is what makes Excel read the accents correctly.
    const blob = new Blob([String.fromCharCode(0xfeff) + lines], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `estado-de-gastos-${this.transactionType}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // ---------------------------------------------------------------- helpers

  breakdownTotal(value: FinancingBreakdown): number {
    return value.idb + value.localContribution + value.cofinancing;
  }
}
