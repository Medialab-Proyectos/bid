import { Component, OnInit } from '@angular/core';
import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';
import {
  CommitmentFundingTotals,
  CommitmentPayment,
  PaymentMechanism,
  PaymentRecordError,
  PaymentRecordStatus,
} from '../../models/payment-record.model';
import { PaymentRecordApiService } from '../../services/payment-record-api.service';
import { PaymentConfirmService } from '../../services/payment-confirm.service';

/**
 * "Cambio de mecanismo de pago del contrato para reembolso".
 *
 * Reclassifies in bulk how the expenses of a commitment were funded. Answering
 * "own funds" is what turns those payments into candidates for a reimbursement
 * instead of a justification, so this is the same switch as the per-payment
 * question, applied to many rows at once.
 */
@Component({
  selector: 'fi-payment-mechanism-dialog',
  templateUrl: './payment-mechanism-dialog.component.html',
  styleUrls: ['../../payment-record.shared.scss'],
})
export class PaymentMechanismDialogComponent
  extends DialogContentBase
  implements OnInit
{
  commitmentId: string;

  readonly mechanisms = PaymentMechanism;
  mechanism: PaymentMechanism = PaymentMechanism.BANK_FUNDS;

  totals: CommitmentFundingTotals;
  /** Only reported payments can be reclassified; justified ones are closed. */
  payments: CommitmentPayment[] = [];
  selection: { [paymentId: string]: boolean } = {};
  /** Business rule the API rejected the last attempt with. */
  failure: PaymentRecordError;

  loading = true;
  saving = false;

  constructor(
    dialog: DialogRef,
    private readonly api: PaymentRecordApiService,
    private readonly confirmService: PaymentConfirmService
  ) {
    super(dialog);
  }

  ngOnInit(): void {
    this.api.getFundingTotals(this.commitmentId).subscribe({
      next: (totals) => {
        this.totals = totals;
      },
      error: () => {
        this.totals = null;
      },
    });

    this.api.getPayments(this.commitmentId).subscribe({
      next: (response) => {
        this.payments = response.payments.filter(
          (payment) => payment.status === PaymentRecordStatus.PAID
        );
        // Nothing ticked to begin with. This screen rewrites how an expense
        // was funded, which decides whether it can travel in a reimbursement,
        // so it should never apply to rows the user did not point at.
        this.selection = {};
        // The commitment already leans one way if its payments do.
        this.mechanism = this.payments.some((payment) => payment.reimbursable)
          ? PaymentMechanism.OWN_FUNDS
          : PaymentMechanism.BANK_FUNDS;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  get ownFunds(): boolean {
    return this.mechanism === PaymentMechanism.OWN_FUNDS;
  }

  get selectedPaymentIds(): string[] {
    return this.payments
      .filter((payment) => this.selection[payment.id])
      .map((payment) => payment.id);
  }

  get allSelected(): boolean {
    return (
      this.payments.length > 0 &&
      this.payments.every((payment) => this.selection[payment.id])
    );
  }

  get selectedCount(): number {
    return this.selectedPaymentIds.length;
  }

  /** What the agency would claim back, derived from what is ticked. */
  get selectedTotal(): number {
    return this.reimbursementAmount;
  }

  get reimbursementAmount(): number {
    return this.payments
      .filter((payment) => this.selection[payment.id])
      .reduce((total, payment) => total + payment.equivalentAmount, 0);
  }

  toggleAll(): void {
    const select = !this.allSelected;
    this.payments.forEach((payment) => {
      this.selection[payment.id] = select;
    });
  }

  cancel(): void {
    this.dialog.close();
  }

  save(): void {
    if (this.selectedCount === 0) {
      return;
    }

    this.confirmService
      .ask({
        titleKey: 'PAYMENT_RECORD.CONFIRM.MECHANISM_TITLE',
        messageKey: 'PAYMENT_RECORD.CONFIRM.MECHANISM_MESSAGE',
        consequenceKey: this.ownFunds
          ? 'PAYMENT_RECORD.CONFIRM.MECHANISM_TO_OWN'
          : 'PAYMENT_RECORD.CONFIRM.MECHANISM_TO_BANK',
        confirmKey: 'PAYMENT_RECORD.MECHANISM.SAVE',
        params: { count: this.selectedCount },
      })
      .subscribe(() => this.doSave());
  }

  private doSave(): void {
    this.saving = true;
    this.failure = null;
    this.api
      .savePaymentMechanism(this.commitmentId, {
        mechanism: this.mechanism,
        // Both directions apply to what is ticked. Sending every payment when
        // the answer happened to be "bank funds" reclassified rows the user
        // had deliberately left out.
        paymentIds: this.selectedPaymentIds,
      })
      .subscribe({
        next: () => {
          this.saving = false;
          this.dialog.close({ saved: true });
        },
        error: (response) => {
          this.saving = false;
          this.failure = response?.error;
        },
      });
  }
}
