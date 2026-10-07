import { Component, OnInit } from '@angular/core';
import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';
import { TranslateService } from '@ngx-translate/core';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared/services/notification-global.service';
import {
  BlockingReason,
  CommitmentPayment,
  PaymentRecordStatus,
  ProjectComponent,
} from '../../models/payment-record.model';
import { PaymentRecordApiService } from '../../services/payment-record-api.service';
import { PaymentConfirmService } from '../../services/payment-confirm.service';

/**
 * "Actualiza pago": turns a scheduled payment into a reported one.
 *
 * The equivalent amount is always derived, never typed directly: it is the
 * sum of the three funding sources below it (BID, aporte local,
 * cofinanciamiento), which are themselves already in the contract's
 * currency -- not amount x rate, which only converts the payment's own
 * currency and says nothing about how that total is funded.
 *
 * Identity (receptor, país) is set elsewhere in the flow -- this dialog
 * reports what was actually paid and how it is funded, not who it went to.
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

  /** For the Component/Product pickers below -- same list "Añadir pagos" uses. */
  components: ProjectComponent[] = [];

  /**
   * Set only when this dialog was opened from a blocker on "Tu situación":
   * the exact reason the agency was sent here for. Drives which field gets
   * called out below, so landing here from "Ir a resolver" doesn't leave the
   * agency staring at an ordinary-looking form with no sign of what to do.
   */
  blockedReason: BlockingReason | null = null;

  /**
   * Only true from "Estado de gastos" -> DPS (the only transaction type
   * that opens a payment one by one from a statement): the Bank has not
   * paid the third party yet, so there is nothing to mark as paid, and the
   * rate is an estimate, not a real one, until that payment happens.
   */
  isDirectPayment = false;

  form: CommitmentPayment;
  /** The Kendo date picker works with Date, the API with an ISO string. */
  paymentDate: Date;
  /**
   * What the payment actually splits into, in its own currency -- the same
   * three fields "Añadir pagos" asks for. Never saved on their own (only
   * their contract-currency equivalents are), so `initRawSplit()`
   * reconstructs them once, on open, from the payment already loaded.
   */
  rawIdbAmount: number = null;
  rawLocalAmount: number = null;
  rawCofinancingAmount: number = null;
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
    this.initRawSplit();
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
   * The three raw amounts (BID, aporte local, cofinanciamiento, in the
   * payment's own currency) were never saved on their own -- only their
   * contract-currency equivalents were. Reconstructed here from those
   * equivalents' *proportions*, scaled back up so they sum to exactly
   * `form.amount` -- the one number that must never silently change just
   * from opening this dialog. Falls back to 100% BID when the payment never
   * had a split at all, same as "Añadir pagos" does for a new one.
   */
  private initRawSplit(): void {
    const amount = this.form.amount || 0;
    const totalEquivalent =
      (this.form.idbFinancingAmount || 0) +
      (this.form.localFinancingAmount || 0) +
      (this.form.cofinancingAmount || 0);

    if (totalEquivalent > 0) {
      this.rawIdbAmount =
        Math.round(((amount * (this.form.idbFinancingAmount || 0)) / totalEquivalent) * 100) /
        100;
      this.rawLocalAmount =
        Math.round(((amount * (this.form.localFinancingAmount || 0)) / totalEquivalent) * 100) /
        100;
    } else {
      this.rawIdbAmount = amount;
      this.rawLocalAmount = 0;
    }
    // The remainder, not its own proportion: rounding the three shares
    // independently could land a cent off `amount`, and that total is the
    // one thing here that has to reconcile exactly. `|| 0` folds the
    // occasional `-0` (amount and the other two shares landing a
    // floating-point hair apart) back to a normal zero -- otherwise it
    // displays as "-0.00".
    this.rawCofinancingAmount =
      Math.round((amount - this.rawIdbAmount - this.rawLocalAmount) * 100) / 100 || 0;
  }

  /**
   * `form.amount` and the three "Equivalent ..." fields are derived, never
   * typed into: the total is BID + aporte local + cofinanciamiento (in the
   * payment's own currency), and each Equivalent is that same source
   * converted with the rate below -- the same "units of {{payment}} per 1
   * {{contract}}" convention "Añadir pagos" uses, so this divides by the
   * rate, never multiplies.
   */
  recalculateAmounts(): void {
    const rate = this.form.exchangeRate || 0;
    this.form.amount =
      (this.rawIdbAmount || 0) + (this.rawLocalAmount || 0) + (this.rawCofinancingAmount || 0);
    this.form.idbFinancingAmount =
      rate > 0 ? Math.round(((this.rawIdbAmount || 0) / rate) * 100) / 100 : 0;
    this.form.localFinancingAmount =
      rate > 0 ? Math.round(((this.rawLocalAmount || 0) / rate) * 100) / 100 : 0;
    this.form.cofinancingAmount =
      rate > 0 ? Math.round(((this.rawCofinancingAmount || 0) / rate) * 100) / 100 : 0;
    this.form.equivalentAmount =
      (this.form.idbFinancingAmount || 0) +
      (this.form.localFinancingAmount || 0) +
      (this.form.cofinancingAmount || 0);
    this.syncReimbursementAmount();
  }

  /**
   * DPS only: the request is what the agency wants the Bank to pay in each
   * source, already in the contract's currency -- so here the Equivalent
   * fields are what gets typed into, and BID/aporte local/cofinanciamiento
   * (the payment's own currency) become the derived ones, the opposite
   * direction `recalculateAmounts()` uses everywhere else. Same rate, same
   * "divide to convert, multiply to convert back" pair.
   */
  recalculateFromEquivalents(): void {
    const rate = this.form.exchangeRate || 0;
    this.rawIdbAmount = Math.round((this.form.idbFinancingAmount || 0) * rate * 100) / 100;
    this.rawLocalAmount = Math.round((this.form.localFinancingAmount || 0) * rate * 100) / 100;
    this.rawCofinancingAmount =
      Math.round((this.form.cofinancingAmount || 0) * rate * 100) / 100;
    this.form.amount =
      (this.rawIdbAmount || 0) + (this.rawLocalAmount || 0) + (this.rawCofinancingAmount || 0);
    this.form.equivalentAmount =
      (this.form.idbFinancingAmount || 0) +
      (this.form.localFinancingAmount || 0) +
      (this.form.cofinancingAmount || 0);
    this.syncReimbursementAmount();
  }

  /**
   * What the Bank reimburses is exactly the BID share of this payment,
   * already in the contract's currency -- the same "Equivalent IDB
   * financing amount" shown above, never its own number to type and never
   * out of sync with the split that feeds it.
   */
  private syncReimbursementAmount(): void {
    if (this.form.reimbursable) {
      this.form.reimbursementAmount = this.form.idbFinancingAmount || 0;
    }
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
    if (this.isDirectPayment) {
      this.recalculateFromEquivalents();
    } else {
      this.recalculateAmounts();
    }
  }

  /**
   * Which component this payment is charged to was originally decided once,
   * in "Añadir pagos", and never touched again here. But a payment that
   * already exists without one has no "add" step to go back to -- fixing it
   * here is the only way, so the field opens editable, the same dropdown
   * "Añadir pagos" uses, instead of a value nobody can change.
   */
  get availableProducts(): Array<{ code: string; name: string }> {
    return (
      this.components.find((item) => item.code === this.form?.componentCode)
        ?.products ?? []
    );
  }

  onComponentChange(): void {
    const component = this.components.find(
      (item) => item.code === this.form.componentCode
    );
    this.form.componentName = component ? component.name : '';
    this.form.productCode = '';
    this.form.productName = '';
  }

  onProductChange(): void {
    const product = this.availableProducts.find(
      (item) => item.code === this.form.productCode
    );
    this.form.productName = product ? product.name : '';
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
   * Clears itself the moment the field it is calling out gets a value --
   * same as any other validation state here, so picking a component is what
   * makes the warning go away, not just closing the dialog and hoping.
   */
  get componentFlagged(): boolean {
    return (
      this.blockedReason === BlockingReason.NO_COMPONENT &&
      !this.form?.componentCode
    );
  }

  get voucherFlagged(): boolean {
    return (
      this.blockedReason === BlockingReason.NO_VOUCHER &&
      !this.form?.accountingVoucher
    );
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
    if (this.form.reimbursable) {
      this.syncReimbursementAmount();
    } else {
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
