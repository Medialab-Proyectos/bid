import { Component, OnInit } from '@angular/core';
import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';
import { TranslateService } from '@ngx-translate/core';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared/services/notification-global.service';
import { CommitmentPayment, PaymentRecordStatus } from '../../models/payment-record.model';
import { PaymentRecordApiService } from '../../services/payment-record-api.service';
import { PaymentConfirmService } from '../../services/payment-confirm.service';

/**
 * "Actualiza pago": turns a scheduled payment into a reported one.
 *
 * The equivalent amount is always derived from amount x rate, never typed, so
 * the figure the Bank reads back can be reconciled with the two inputs above it.
 *
 * Identity (receptor, país) and the funding split (BID, aporte local,
 * cofinanciamiento) are set elsewhere in the flow -- this dialog reports what
 * was actually paid, not who it went to or how it is funded, so those show as
 * read-only values rather than editable fields.
 *
 * Deleting a payment and declaring it reimbursable are only meaningful when
 * this dialog is managing the commitment's own ledger directly (opened from
 * "Pagos del compromiso"); a direct-payment request or a statement of
 * expenditures neither owns nor removes payments, it only reports on them,
 * so both stay off by default and this dialog's other openers never set them.
 */
@Component({
  selector: 'fi-update-payment-dialog',
  templateUrl: './update-payment-dialog.component.html',
  styleUrls: ['../../payment-record.shared.scss'],
})
export class UpdatePaymentDialogComponent
  extends DialogContentBase
  implements OnInit
{
  payment: CommitmentPayment;
  position = 1;
  total = 1;
  allowDelete = false;
  showReimbursable = false;
  /** Currency the equivalent amount converts into. Empty when the opener
   *  does not know it (e.g. a schedule row that could belong to any
   *  commitment) -- the rate then stays editable either way. */
  contractCurrency = '';

  form: CommitmentPayment;
  /** The Kendo date picker works with Date, the API with an ISO string. */
  paymentDate: Date;
  readonly currencies = ['USD', 'COP', 'EUR', 'BRL', 'MXN', 'PEN'];
  // The Bank's 26 borrowing member countries. Kept local rather than pulled
  // from the app-wide master-data store (which this module reaches for
  // nowhere else) -- codes match `country`, whatever the API returns, so the
  // dropdown can show the full name without changing what gets saved back.
  readonly countries = [
    { code: 'AR', name: 'Argentina' },
    { code: 'BS', name: 'Bahamas' },
    { code: 'BB', name: 'Barbados' },
    { code: 'BZ', name: 'Belize' },
    { code: 'BO', name: 'Bolivia' },
    { code: 'BR', name: 'Brasil' },
    { code: 'CL', name: 'Chile' },
    { code: 'CO', name: 'Colombia' },
    { code: 'CR', name: 'Costa Rica' },
    { code: 'DO', name: 'República Dominicana' },
    { code: 'EC', name: 'Ecuador' },
    { code: 'SV', name: 'El Salvador' },
    { code: 'GT', name: 'Guatemala' },
    { code: 'GY', name: 'Guyana' },
    { code: 'HT', name: 'Haití' },
    { code: 'HN', name: 'Honduras' },
    { code: 'JM', name: 'Jamaica' },
    { code: 'MX', name: 'México' },
    { code: 'NI', name: 'Nicaragua' },
    { code: 'PA', name: 'Panamá' },
    { code: 'PY', name: 'Paraguay' },
    { code: 'PE', name: 'Perú' },
    { code: 'SR', name: 'Surinam' },
    { code: 'TT', name: 'Trinidad y Tobago' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'VE', name: 'Venezuela' },
  ];
  saving = false;

  constructor(
    dialog: DialogRef,
    private readonly api: PaymentRecordApiService,
    private readonly translate: TranslateService,
    private readonly notificationSvc: NotificationGlobalService,
    private readonly confirmService: PaymentConfirmService
  ) {
    super(dialog);
  }

  ngOnInit(): void {
    this.form = { ...this.payment };
    this.paymentDate = this.form.paymentDate
      ? new Date(this.form.paymentDate)
      : null;
    this.onCurrencyChange();
  }

  /**
   * A payment the Bank already approved is history: editing its amounts would
   * desync the report from what was justified, so the form is read only.
   */
  get readOnly(): boolean {
    return this.form?.status === PaymentRecordStatus.JUSTIFIED;
  }

  /**
   * The rate is units of the payment's own currency per one dollar (e.g.
   * 4000 COP = 1 USD), the same convention the contract's own exchange-rate
   * table uses -- so converting to the contract currency divides by it,
   * never multiplies.
   */
  recalculateEquivalent(): void {
    const rate = this.form.exchangeRate || 0;
    this.form.equivalentAmount = rate > 0 ? (this.form.amount || 0) / rate : 0;
  }

  /**
   * No conversion to ask for when the payment is already in the contract's
   * own currency -- the rate can only ever be 1, so the field locks instead
   * of leaving a number there that looks editable but never actually does
   * anything.
   */
  get rateLocked(): boolean {
    return Boolean(this.contractCurrency) && this.form?.currency === this.contractCurrency;
  }

  onCurrencyChange(): void {
    if (this.rateLocked) {
      this.form.exchangeRate = 1;
    }
    this.recalculateEquivalent();
  }

  /**
   * A scheduled payment only ever held estimates -- the planned rate came
   * from the contract's signing date, not the day the payment actually went
   * out. Marking one paid is the moment those estimates become real, so
   * checking this asks for them explicitly instead of letting a still-planned
   * amount pass for what was actually reported.
   *
   * It is its own checkbox rather than a second button: not every visit to a
   * scheduled payment is the one that closes it out. Editing something and
   * leaving it Programado for later is just as valid a save, so ticking this
   * is what turns "guardar" into "guardar y marcar como pagado" -- it never
   * gates the save on its own.
   */
  markAsPaid = false;

  get isScheduled(): boolean {
    return this.form?.status === PaymentRecordStatus.SCHEDULED;
  }

  get missingToMarkPaid(): string[] {
    if (!this.markAsPaid) {
      return [];
    }
    const missing: string[] = [];
    if (!this.form.accountingVoucher) {
      missing.push('PAYMENT_RECORD.UPDATE_PAYMENT.VOUCHER');
    }
    if (!this.form.concept) {
      missing.push('PAYMENT_RECORD.UPDATE_PAYMENT.CONCEPT');
    }
    if (!this.paymentDate) {
      missing.push('PAYMENT_RECORD.UPDATE_PAYMENT.PAYMENT_DATE');
    }
    if (!(this.form.exchangeRate > 0)) {
      missing.push('PAYMENT_RECORD.UPDATE_PAYMENT.EXCHANGE_RATE');
    }
    return missing;
  }

  get missingFieldNames(): string {
    return this.missingToMarkPaid
      .map((key) => this.translate.instant(key).toLocaleLowerCase())
      .join(', ');
  }

  get canMarkPaid(): boolean {
    return this.missingToMarkPaid.length === 0;
  }

  onReimbursableChange(): void {
    if (!this.form.reimbursable) {
      this.form.reimbursementAmount = 0;
    }
  }

  cancel(): void {
    this.dialog.close();
  }

  confirm(): void {
    this.saving = true;
    this.form.paymentDate = this.paymentDate
      ? this.paymentDate.toISOString()
      : null;
    this.api.updatePayment(this.form).subscribe({
      next: () => {
        this.saving = false;
        this.notificationSvc.showSuccess(
          this.translate.instant('PAYMENT_RECORD.STATEMENT.SAVE_SUCCESS')
        );
        this.dialog.close({ saved: true });
      },
      error: () => {
        this.saving = false;
      },
    });
  }

  /**
   * A reported payment is what the agency told the Bank it spent, so removing
   * one is worth a question first. Only reachable when `allowDelete` is set --
   * managing the commitment's own ledger, not building a request or a
   * statement on top of it.
   */
  remove(): void {
    this.confirmService
      .ask({
        titleKey: 'PAYMENT_RECORD.CONFIRM.DELETE_TITLE',
        messageKey: 'PAYMENT_RECORD.CONFIRM.DELETE_MESSAGE',
        consequenceKey: 'PAYMENT_RECORD.CONFIRM.DELETE_CONSEQUENCE',
        confirmKey: 'PAYMENT_RECORD.CONFIRM.DELETE_ACTION',
        params: { id: this.form.id, concept: this.form.concept },
        danger: true,
      })
      .subscribe(() => this.doRemove());
  }

  private doRemove(): void {
    this.saving = true;
    this.api.deletePayment(this.form.id).subscribe({
      next: () => {
        this.saving = false;
        this.dialog.close({ saved: true });
      },
      error: () => {
        this.saving = false;
      },
    });
  }
}
