import { Component, OnInit } from '@angular/core';
import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';
import { TranslateService } from '@ngx-translate/core';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared/services/notification-global.service';
import {
  ExchangeRatePayment,
  PaymentExchangeRate,
} from '../../models/payment-record.model';
import { PaymentRecordApiService } from '../../services/payment-record-api.service';
import { PaymentConfirmService } from '../../services/payment-confirm.service';
import { paymentStatusClass } from '../../utils/payment-status';

/**
 * "Ajustar tasa de cambio": a two-step dialog. Step 1 picks which payments of
 * the loan the new rate should touch -- every payment except a `JUSTIFIED`
 * one, whose amount the Bank has already approved and can no longer be
 * reopened. Step 2 sets the rate for each currency actually present among
 * the payments picked, and saving recalculates those payments only.
 */
@Component({
  selector: 'fi-exchange-rate-dialog',
  templateUrl: './exchange-rate-dialog.component.html',
  styleUrls: ['../../payment-record.shared.scss'],
})
export class ExchangeRateDialogComponent
  extends DialogContentBase
  implements OnInit
{
  projectBucketId: string;

  step: 'payments' | 'rates' = 'payments';

  // ---------- step 1: which payments ----------
  payments: ExchangeRatePayment[] = [];
  selection: { [id: string]: boolean } = {};
  filterText = '';
  loading = true;

  // ---------- step 2: the rates ----------
  rates: PaymentExchangeRate[] = [];
  readonly availableCurrencies = [
    'COP',
    'EUR',
    'INR',
    'BRL',
    'MXN',
    'PEN',
    'ARS',
  ];
  lastUpdate: string;
  saving = false;

  constructor(
    dialog: DialogRef,
    private readonly api: PaymentRecordApiService,
    private readonly confirmService: PaymentConfirmService,
    private readonly translate: TranslateService,
    private readonly notificationSvc: NotificationGlobalService
  ) {
    super(dialog);
  }

  ngOnInit(): void {
    this.api.getExchangeRatePayments(this.projectBucketId).subscribe({
      next: (payments) => {
        this.payments = payments;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
    this.api.getExchangeRates(this.projectBucketId).subscribe({
      next: (settings) => {
        this.lastUpdate = settings.lastUpdate;
      },
    });
  }

  // ---------- step 1 ----------

  get filteredPayments(): ExchangeRatePayment[] {
    const term = this.filterText.trim().toLowerCase();
    if (!term) {
      return this.payments;
    }
    return this.payments.filter(
      (payment) =>
        payment.commitmentNumber.toLowerCase().includes(term) ||
        payment.concept?.toLowerCase().includes(term) ||
        payment.beneficiaryName?.toLowerCase().includes(term)
    );
  }

  onSearch(term: string): void {
    this.filterText = term ?? '';
  }

  trackPayment(_index: number, payment: ExchangeRatePayment): string {
    return payment.id;
  }

  statusClass(status: string): string {
    return paymentStatusClass(status);
  }

  get selectedPayments(): ExchangeRatePayment[] {
    return this.payments.filter((payment) => this.selection[payment.id]);
  }

  get selectedCount(): number {
    return this.selectedPayments.length;
  }

  get allSelected(): boolean {
    const visible = this.filteredPayments;
    return visible.length > 0 && visible.every((payment) => this.selection[payment.id]);
  }

  toggleAll(): void {
    const next = !this.allSelected;
    this.filteredPayments.forEach((payment) => {
      this.selection[payment.id] = next;
    });
  }

  /** Every currency actually present among the payments picked, in order. */
  get selectedCurrencies(): string[] {
    const seen: string[] = [];
    this.selectedPayments.forEach((payment) => {
      if (!seen.includes(payment.currency)) {
        seen.push(payment.currency);
      }
    });
    return seen;
  }

  /** Step 1 -> step 2: one rate row per currency actually picked, carrying
   *  over whatever the loan's current rate for it already is. */
  next(): void {
    const current = new Map(this.rates.map((rate) => [rate.currency, rate]));
    this.rates = this.selectedCurrencies.map(
      (currency) =>
        current.get(currency) ?? { currency, rate: 1, equivalentUsd: 1 }
    );
    this.step = 'rates';
  }

  // ---------- step 2 ----------

  back(): void {
    this.step = 'payments';
  }

  /** Only the currencies not already taken by another row, plus the row's own. */
  currenciesFor(rate: PaymentExchangeRate): string[] {
    const used = this.rates
      .filter((other) => other !== rate)
      .map((other) => other.currency);
    return this.availableCurrencies.filter(
      (currency) => !used.includes(currency)
    );
  }

  get canAddCurrency(): boolean {
    return this.rates.length < this.availableCurrencies.length;
  }

  /** Says which rows came pre-filled from the payments picked in step 1. */
  isSelectedCurrency(currency: string): boolean {
    return this.selectedCurrencies.includes(currency);
  }

  addCurrency(): void {
    const used = this.rates.map((rate) => rate.currency);
    const next = this.availableCurrencies.find(
      (currency) => !used.includes(currency)
    );
    if (!next) {
      return;
    }
    this.rates = [...this.rates, { currency: next, rate: 1, equivalentUsd: 1 }];
  }

  removeCurrency(index: number): void {
    this.rates = this.rates.filter((_rate, position) => position !== index);
  }

  /** The equivalent column is the inverse of the rate, shown for reference. */
  onRateChange(rate: PaymentExchangeRate): void {
    rate.equivalentUsd = rate.rate ? 1 / rate.rate : 0;
  }

  cancel(): void {
    this.dialog.close();
  }

  save(): void {
    this.confirmService
      .ask({
        titleKey: 'PAYMENT_RECORD.CONFIRM.RATES_TITLE',
        messageKey: 'PAYMENT_RECORD.CONFIRM.RATES_MESSAGE',
        consequenceKey: 'PAYMENT_RECORD.CONFIRM.RATES_CONSEQUENCE',
        confirmKey: 'PAYMENT_RECORD.EXCHANGE_RATE.SAVE',
        params: { rates: this.rates.length, payments: this.selectedCount },
      })
      .subscribe(() => this.doSave());
  }

  private doSave(): void {
    this.saving = true;
    const paymentIds = this.selectedPayments.map((payment) => payment.id);
    this.api
      .saveExchangeRates(this.projectBucketId, this.rates, paymentIds)
      .subscribe({
        next: () => {
          this.saving = false;
          this.notificationSvc.showSuccess(
            this.translate.instant('PAYMENT_RECORD.EXCHANGE_RATE.SAVE_SUCCESS')
          );
          this.dialog.close({ saved: true });
        },
        error: () => {
          this.saving = false;
        },
      });
  }
}
