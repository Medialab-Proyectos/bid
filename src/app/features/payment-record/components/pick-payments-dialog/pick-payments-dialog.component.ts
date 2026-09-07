import { Component, OnInit } from '@angular/core';
import {
  DialogContentBase,
  DialogRef,
  DialogService,
} from '@progress/kendo-angular-dialog';
import { FileRestrictions, SelectEvent } from '@progress/kendo-angular-upload';
import { TranslateService } from '@ngx-translate/core';
import {
  AddPaymentsSource,
  Commitment,
  CommitmentPayment,
  CurrencyCeiling,
  ImportValidationResult,
  ManualPaymentRequest,
  PaymentRecordError,
  PaymentRecordStatus,
  ProjectComponent,
} from '../../models/payment-record.model';
import { PaymentRecordApiService } from '../../services/payment-record-api.service';
import { paymentStatusClass } from '../../utils/payment-status';
// Opened directly with Kendo's own `DialogService` rather than through
// `PaymentRecordDialogService`, which is what opens this dialog in the first
// place -- routing back through it here would import each of these two files
// into the other.
import { UpdatePaymentDialogComponent } from '../update-payment-dialog/update-payment-dialog.component';

interface SelectablePayment extends CommitmentPayment {
  selected: boolean;
}

/** One of the three ways a payment gets into a direct-payment request. */
interface SourceOption {
  value: AddPaymentsSource;
  inputId: string;
  icon: string;
  titleKey: string;
  descriptionKey: string;
}

const ACCEPTED_EXTENSIONS = ['.xlsx', '.xls', '.csv'];
const MAX_FILE_SIZE_MB = 10;

/**
 * "Seleccionar o anadir pagos" for a direct payment to a third party.
 *
 * A justification or a reimbursement sweeps what was already paid, so it never
 * needs this. A direct payment is the other way round: the Bank has not paid
 * anyone yet, so the agency points at the payments it wants the Bank to make,
 * and those may still be sitting in the schedule.
 *
 * Unlike the commitment-scoped "Anadir pagos", this reads and writes at loan
 * level -- the payment schedule pull already sweeps every commitment. Typing
 * one in or importing a file still has to land on one commitment's own budget
 * and currency ceilings, so those two modes ask which commitment first, then
 * hand off to the same registration the commitment screen uses. Once a
 * payment exists this way it is not auto-added to the request: it shows up in
 * the schedule list like any other, and the agency ticks it from there, the
 * same confirmation step every source ends at.
 */
@Component({
  selector: 'fi-pick-payments-dialog',
  templateUrl: './pick-payments-dialog.component.html',
  styleUrls: ['../../payment-record.shared.scss'],
})
export class PickPaymentsDialogComponent
  extends DialogContentBase
  implements OnInit
{
  projectBucketId: string;

  readonly sources = AddPaymentsSource;

  // Titles reuse the exact words "Añadir pagos" already uses for the same
  // three ideas -- only the descriptions change, since what each one means
  // for a loan-wide direct payment differs from what it means for one
  // commitment's own report.
  readonly sourceOptions: SourceOption[] = [
    {
      value: AddPaymentsSource.SCHEDULE,
      inputId: 'Rad_PickPayments_Schedule',
      icon: 'fa-calendar-alt',
      titleKey: 'PAYMENT_RECORD.ADD_PAYMENTS.SOURCE_SCHEDULE',
      descriptionKey: 'PAYMENT_RECORD.PICK_PAYMENTS.SOURCE_SCHEDULE_HELP',
    },
    {
      value: AddPaymentsSource.MANUAL,
      inputId: 'Rad_PickPayments_Manual',
      icon: 'fa-pen',
      titleKey: 'PAYMENT_RECORD.ADD_PAYMENTS.SOURCE_MANUAL',
      descriptionKey: 'PAYMENT_RECORD.PICK_PAYMENTS.SOURCE_MANUAL_HELP',
    },
    {
      value: AddPaymentsSource.FILE,
      inputId: 'Rad_PickPayments_File',
      icon: 'fa-file-upload',
      titleKey: 'PAYMENT_RECORD.ADD_PAYMENTS.SOURCE_FILE',
      descriptionKey: 'PAYMENT_RECORD.PICK_PAYMENTS.SOURCE_FILE_HELP',
    },
  ];

  /** Schedule is the only source that already has something to show. */
  source: AddPaymentsSource = AddPaymentsSource.SCHEDULE;

  payments: SelectablePayment[] = [];
  filtered: SelectablePayment[] = [];
  searchTerm = '';
  loading = true;

  /** Ten at a time -- the loan-wide pull can run long, unlike a single
   *  commitment's own schedule. */
  readonly pageSize = 10;
  page = 1;

  // ---- typing one in or importing a file both need a commitment first
  commitments: Commitment[] = [];
  selectedCommitmentId = '';
  components: ProjectComponent[] = [];
  ceilings: CurrencyCeiling[] = [];
  failure: PaymentRecordError;
  saving = false;

  // ---- manual entry
  readonly today = new Date();
  manual: ManualPaymentRequest = {
    componentCode: '',
    componentName: '',
    productCode: '',
    productName: '',
    concept: '',
    accountingVoucher: '',
    paymentDate: '',
    currency: '',
    amount: null,
    exchangeRate: 1,
    reimbursable: false,
  };
  manualDate: Date;

  // ---- file import
  readonly acceptedFormats = ACCEPTED_EXTENSIONS.join(', ');
  readonly maxFileSizeMb = MAX_FILE_SIZE_MB;
  readonly fileRestrictions: FileRestrictions = {
    allowedExtensions: ACCEPTED_EXTENSIONS,
    maxFileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
  };
  uploading = false;
  importResult: ImportValidationResult;

  constructor(
    dialog: DialogRef,
    private readonly api: PaymentRecordApiService,
    private readonly translate: TranslateService,
    private readonly dialogService: DialogService
  ) {
    super(dialog);
  }

  ngOnInit(): void {
    this.loadSchedule();

    this.api.getSummary(this.projectBucketId).subscribe({
      next: (summary) => {
        this.commitments = summary.commitments;
      },
      error: () => {
        this.commitments = [];
      },
    });

    this.api.getComponents(this.projectBucketId).subscribe({
      next: (components) => {
        this.components = components;
      },
      error: () => {
        this.components = [];
      },
    });
  }

  private loadSchedule(): void {
    this.loading = true;
    this.api.getPickablePayments(this.projectBucketId).subscribe({
      next: (payments) => {
        // A direct payment is one the Bank has not paid yet -- anything
        // already reported (paid, pending justification, justified,
        // accumulated) has moved past the point a schedule pull should ever
        // resurface it here.
        this.payments = payments
          .filter((payment) => payment.status === PaymentRecordStatus.SCHEDULED)
          .map((payment) => ({ ...payment, selected: false }));
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.payments = [];
        this.filtered = [];
        this.loading = false;
      },
    });
  }

  onSearch(term: string): void {
    this.searchTerm = (term ?? '').toLocaleLowerCase().trim();
    this.applyFilter();
  }

  private applyFilter(): void {
    if (!this.searchTerm) {
      this.filtered = [...this.payments];
    } else {
      this.filtered = this.payments.filter((payment) =>
        [payment.id, payment.concept, payment.commitmentId, payment.beneficiaryName]
          .join(' ')
          .toLocaleLowerCase()
          .includes(this.searchTerm)
      );
    }
    // A new search result starts back at its own first page, not wherever
    // the previous, longer list happened to be scrolled to.
    this.page = 1;
  }

  get pageCount(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
  }

  get pagedPayments(): SelectablePayment[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    this.page = Math.min(Math.max(1, page), this.pageCount);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.pageCount }, (_, index) => index + 1);
  }

  get selectedCount(): number {
    return this.payments.filter((payment) => payment.selected).length;
  }

  /**
   * One total per currency. The loan holds contracts signed in different
   * currencies, so a single figure adding pesos to dollars was a number that
   * meant nothing.
   */
  get selectedTotals(): Array<{ currency: string; amount: number }> {
    const byCurrency = new Map<string, number>();
    this.payments
      .filter((payment) => payment.selected)
      .forEach((payment) => {
        const current = byCurrency.get(payment.currency) ?? 0;
        byCurrency.set(payment.currency, current + payment.amount);
      });
    return [...byCurrency.entries()].map(([currency, amount]) => ({
      currency,
      amount,
    }));
  }

  get allSelected(): boolean {
    return this.filtered.length > 0 && this.filtered.every((p) => p.selected);
  }

  toggleAll(): void {
    const select = !this.allSelected;
    this.filtered.forEach((payment) => (payment.selected = select));
  }

  statusClass(status: string): string {
    return paymentStatusClass(status);
  }

  trackPayment(_index: number, payment: SelectablePayment): string {
    return payment.id;
  }

  /**
   * The same "Actualizar pago" dialog the commitment screen opens, stacked on
   * top of this one -- checking or fixing a detail here should not mean
   * losing the source, the search term and everything already ticked to back
   * out and re-open this dialog from scratch.
   */
  openPayment(payment: SelectablePayment): void {
    const position = this.payments.findIndex((p) => p.id === payment.id) + 1;

    const dialog = this.dialogService.open({
      title: this.translate.instant('PAYMENT_RECORD.UPDATE_PAYMENT.TITLE'),
      content: UpdatePaymentDialogComponent,
      cssClass: 'pr-modal',
      width: 1040,
    });

    const instance = dialog.content.instance as UpdatePaymentDialogComponent;
    instance.payment = payment;
    instance.position = position;
    instance.total = this.payments.length;

    dialog.result.subscribe((outcome: { saved?: boolean }) => {
      if (outcome?.saved) {
        this.loadSchedule();
      }
    });
  }

  // ------------------------------------------------------- which commitment

  onCommitmentChange(): void {
    this.manual.componentCode = '';
    this.manual.componentName = '';
    this.manual.productCode = '';
    this.manual.productName = '';
    this.ceilings = [];
    if (!this.selectedCommitmentId) {
      return;
    }
    this.api.getCurrencyCeilings(this.selectedCommitmentId).subscribe({
      next: (ceilings) => {
        this.ceilings = ceilings;
        this.manual.currency = ceilings[0]?.currency ?? '';
      },
      error: () => {
        this.ceilings = [];
      },
    });
  }

  get currencies(): string[] {
    return this.ceilings.map((ceiling) => ceiling.currency);
  }

  availableIn(currency: string): number {
    return (
      this.ceilings.find((ceiling) => ceiling.currency === currency)
        ?.available ?? 0
    );
  }

  // ------------------------------------------------------------- manual

  get manualProducts(): Array<{ code: string; name: string }> {
    return (
      this.components.find(
        (component) => component.code === this.manual.componentCode
      )?.products ?? []
    );
  }

  onManualComponentChange(): void {
    const component = this.components.find(
      (item) => item.code === this.manual.componentCode
    );
    this.manual.componentName = component ? component.name : '';
    this.manual.productCode = '';
    this.manual.productName = '';
  }

  onManualProductChange(): void {
    const product = this.manualProducts.find(
      (item) => item.code === this.manual.productCode
    );
    this.manual.productName = product ? product.name : '';
  }

  get componentPlaceholder(): { code: string; name: string } {
    return {
      code: '',
      name: this.translate.instant('PAYMENT_RECORD.MANUAL.COMPONENT_PLACEHOLDER'),
    };
  }

  get productPlaceholder(): { code: string; name: string } {
    return {
      code: '',
      name: this.translate.instant('PAYMENT_RECORD.MANUAL.PRODUCT_PLACEHOLDER'),
    };
  }

  /**
   * The rate is units of the payment's own currency per one dollar (e.g.
   * 4000 COP = 1 USD) -- the same convention "Ajustar tasa de cambio" uses,
   * where the equivalent column is `1 / rate` -- so converting to the
   * contract currency divides by it, never multiplies.
   */
  get manualEquivalent(): number {
    const rate = this.manual.exchangeRate || 0;
    return rate > 0 ? (this.manual.amount || 0) / rate : 0;
  }

  get manualExceedsCeiling(): boolean {
    return (this.manual.amount || 0) > this.availableIn(this.manual.currency);
  }

  get manualIsComplete(): boolean {
    return Boolean(
      this.selectedCommitmentId &&
        this.manual.componentCode &&
        this.manual.concept &&
        this.manualDate &&
        this.manual.currency &&
        this.manual.amount > 0
    );
  }

  get missingFieldNames(): string {
    const missing: string[] = [];
    if (!this.selectedCommitmentId) {
      missing.push('PAYMENT_RECORD.PICK_PAYMENTS.COMMITMENT');
    }
    if (!this.manual.componentCode) {
      missing.push('PAYMENT_RECORD.COLUMNS.COMPONENT');
    }
    if (!this.manual.concept) {
      missing.push('PAYMENT_RECORD.DETAIL.COLUMNS.CONCEPT');
    }
    if (!this.manualDate) {
      missing.push('PAYMENT_RECORD.DETAIL.COLUMNS.DATE');
    }
    if (!(this.manual.amount > 0)) {
      missing.push('PAYMENT_RECORD.DETAIL.COLUMNS.AMOUNT');
    }
    return missing
      .map((key) => this.translate.instant(key).toLocaleLowerCase())
      .join(', ');
  }

  private submitManual(): void {
    this.saving = true;
    this.manual.paymentDate = this.manualDate.toISOString();
    const existingIds = new Set(this.payments.map((payment) => payment.id));

    this.api.addManualPayment(this.selectedCommitmentId, this.manual).subscribe({
      next: () => {
        this.saving = false;
        this.closeWithNewlyRegistered(existingIds);
      },
      error: (response) => {
        this.saving = false;
        this.failure = response?.error;
      },
    });
  }

  // -------------------------------------------------------------- import

  downloadTemplate(): void {
    this.api.downloadImportTemplate(this.selectedCommitmentId).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payment-import-template-${this.selectedCommitmentId}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    });
  }

  onFileSelected(event: SelectEvent): void {
    const file = event.files[0]?.rawFile;
    if (!file) {
      return;
    }

    this.uploading = true;
    this.importResult = null;
    this.api.importPayments(this.selectedCommitmentId, file).subscribe({
      next: (result) => {
        this.importResult = result;
        this.uploading = false;
      },
      error: () => {
        this.uploading = false;
      },
    });
  }

  retryUpload(): void {
    this.importResult = null;
  }

  get hasImportErrors(): boolean {
    return (this.importResult?.errors?.length ?? 0) > 0;
  }

  get importAccepted(): boolean {
    return Boolean(this.importResult) && !this.hasImportErrors;
  }

  /** Every row blocked on something, once each -- one row can fail more than
   *  one check, and the chips are meant to be scanned, not counted twice. */
  get blockingRowNumbers(): number[] {
    const rows = new Set<number>();
    for (const error of this.importResult?.errors ?? []) {
      for (const row of error.rows) {
        rows.add(row.rowNumber);
      }
    }
    return [...rows].sort((a, b) => a - b);
  }

  /**
   * A CSV built from what the dialog already has -- no endpoint of its own --
   * so the agency can hand the row/problem list to whoever fixes the file
   * without re-reading every card on screen.
   */
  downloadErrorReport(): void {
    const rowHeader = this.translate.instant('PAYMENT_RECORD.IMPORT.COLUMNS.ROW');
    const issueHeader = this.translate.instant('PAYMENT_RECORD.IMPORT.RULES_TITLE');
    const lines = [`${rowHeader};${issueHeader}`];

    for (const error of this.importResult?.errors ?? []) {
      const message = this.translate.instant(error.message);
      for (const row of error.rows) {
        lines.push(`${row.rowNumber};${message}`);
      }
    }
    for (const row of this.importResult?.duplicateRows ?? []) {
      const duplicateLabel = this.translate.instant(
        'PAYMENT_RECORD.IMPORT.DUPLICATE_ROWS'
      );
      lines.push(`${row};${duplicateLabel}`);
    }

    const blob = new Blob([lines.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.importResult?.fileName ?? 'import'}-errores.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private submitImport(): void {
    this.saving = true;
    const rowNumbers = this.importResult.rows.map((row) => row.rowNumber);
    const existingIds = new Set(this.payments.map((payment) => payment.id));
    this.api
      .confirmImportedPayments(this.selectedCommitmentId, rowNumbers)
      .subscribe({
        next: () => {
          this.saving = false;
          this.importResult = null;
          this.closeWithNewlyRegistered(existingIds);
        },
        error: (response) => {
          this.saving = false;
          this.failure = response?.error;
        },
      });
  }

  /**
   * Typing one in or confirming a file both register a real payment against
   * the commitment -- but "Continuar y ajustar" is the button that finishes
   * this dialog everywhere else (ticking the schedule and confirming), so a
   * payment just registered here closes it the same way instead of bouncing
   * back to the schedule for a second click: it re-pulls the schedule (the
   * only place that knows the new payment's id), diffs it against what was
   * there before to find what just got created, and hands both that and
   * whatever was already ticked in the schedule back to the caller.
   */
  private closeWithNewlyRegistered(existingIds: Set<string>): void {
    const previouslySelected = this.payments
      .filter((payment) => payment.selected)
      .map((payment) => payment.id);

    this.api.getPickablePayments(this.projectBucketId).subscribe({
      next: (payments) => {
        const newIds = payments
          .filter((payment) => payment.status === PaymentRecordStatus.SCHEDULED)
          .map((payment) => payment.id)
          .filter((id) => !existingIds.has(id));
        this.dialog.close({
          paymentIds: [...new Set([...previouslySelected, ...newIds])],
        });
      },
      error: () => {
        // Registered either way -- close with what was already ticked
        // rather than strand the agency mid-dialog over a refresh failure.
        this.dialog.close({ paymentIds: previouslySelected });
      },
    });
  }

  // ---------------------------------------------------------------- footer

  get activeOption(): SourceOption {
    return (
      this.sourceOptions.find((option) => option.value === this.source) ??
      this.sourceOptions[0]
    );
  }

  /** Why the confirm button is closed, as a translation key. */
  get blockingReason(): string {
    if (this.saving) {
      return 'PAYMENT_RECORD.ADD_PAYMENTS.BLOCKED_SAVING';
    }

    switch (this.source) {
      case AddPaymentsSource.MANUAL:
        if (this.manualExceedsCeiling) {
          return 'PAYMENT_RECORD.ADD_PAYMENTS.BLOCKED_CEILING';
        }
        return this.manualIsComplete
          ? ''
          : 'PAYMENT_RECORD.ADD_PAYMENTS.BLOCKED_MANUAL';
      case AddPaymentsSource.FILE:
        if (!this.selectedCommitmentId) {
          return 'PAYMENT_RECORD.PICK_PAYMENTS.BLOCKED_COMMITMENT';
        }
        if (this.hasImportErrors) {
          return 'PAYMENT_RECORD.ADD_PAYMENTS.BLOCKED_FILE_ERRORS';
        }
        return this.importAccepted
          ? ''
          : 'PAYMENT_RECORD.ADD_PAYMENTS.BLOCKED_FILE';
      default:
        return this.selectedCount === 0
          ? 'PAYMENT_RECORD.PICK_PAYMENTS.BLOCKED'
          : '';
    }
  }

  get readyMessage(): string {
    switch (this.source) {
      case AddPaymentsSource.MANUAL:
        return 'PAYMENT_RECORD.ADD_PAYMENTS.READY_MANUAL';
      case AddPaymentsSource.FILE:
        return 'PAYMENT_RECORD.ADD_PAYMENTS.READY_FILE';
      default:
        return 'PAYMENT_RECORD.PICK_PAYMENTS.READY';
    }
  }

  cancel(): void {
    this.dialog.close();
  }

  confirm(): void {
    this.failure = null;

    if (this.source === AddPaymentsSource.MANUAL) {
      this.submitManual();
      return;
    }

    if (this.source === AddPaymentsSource.FILE) {
      this.submitImport();
      return;
    }

    this.dialog.close({
      paymentIds: this.payments
        .filter((payment) => payment.selected)
        .map((payment) => payment.id),
    });
  }
}
