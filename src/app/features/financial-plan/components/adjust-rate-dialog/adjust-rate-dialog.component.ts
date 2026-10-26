import { Component } from '@angular/core';
import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';
import { TranslateService } from '@ngx-translate/core';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared/services/notification-global.service';
import { FinancialPlanExchangeRate } from '../../models/financial-plan.model';
import { FinancialPlanApiService } from '../../services/financial-plan-api.service';

/**
 * "Ajustar tasa de cambio", opened from the simulation step without leaving
 * it. Same editable table as the Información step, plus "Añadir moneda" for a
 * currency the plan's schedules don't carry yet -- the case raised on 25/10 of
 * a legacy contract in Canadian dollars, whose rate has to be set the first
 * time and is reused from then on.
 */
@Component({
  selector: 'fi-adjust-rate-dialog',
  templateUrl: './adjust-rate-dialog.component.html',
  styleUrls: ['../../financial-plan.shared.scss'],
})
export class AdjustRateDialogComponent extends DialogContentBase {
  projectBucketId: string;
  rates: FinancialPlanExchangeRate[] = [];
  lastUpdatedOn: string;

  saving = false;

  /** Currencies that can be added by hand; Canadian dollars first, the
   *  example the business used for a currency no schedule had yet. */
  readonly addableCurrencies = ['CAD', 'EUR', 'BRL', 'COP', 'MXN', 'PEN', 'ARS', 'CLP', 'GBP', 'INR'];
  /** Rows added in this dialog: only these get a currency picker and can be removed. */
  private readonly added = new Set<FinancialPlanExchangeRate>();

  constructor(
    dialog: DialogRef,
    private readonly api: FinancialPlanApiService,
    private readonly translate: TranslateService,
    private readonly notificationSvc: NotificationGlobalService
  ) {
    super(dialog);
  }

  isAdded(rate: FinancialPlanExchangeRate): boolean {
    return this.added.has(rate);
  }

  currenciesFor(rate: FinancialPlanExchangeRate): string[] {
    const used = this.rates.filter((other) => other !== rate).map((other) => other.currency);
    return this.addableCurrencies.filter((currency) => !used.includes(currency));
  }

  get canAddCurrency(): boolean {
    return this.addableCurrencies.some((currency) => !this.rates.some((rate) => rate.currency === currency));
  }

  addCurrency(): void {
    const next = this.addableCurrencies.find((currency) => !this.rates.some((rate) => rate.currency === currency));
    if (!next) {
      return;
    }
    const row: FinancialPlanExchangeRate = { currency: next, rateToUsd: null };
    this.added.add(row);
    this.rates = [...this.rates, row];
    // Straight into the new row's rate, the one thing left to type.
    const index = this.rates.length - 1;
    setTimeout(() =>
      (document.querySelector(`#Num_AdjustRate_${index} input`) as HTMLInputElement | null)?.focus()
    );
  }

  removeCurrency(index: number): void {
    this.added.delete(this.rates[index]);
    this.rates = this.rates.filter((_rate, position) => position !== index);
  }

  /** Every currency needs a rate above zero: an empty one would convert its
   *  payments to nothing and the plan would come out short without saying so. */
  get canSave(): boolean {
    return this.rates.length > 0 && this.rates.every((rate) => !!rate.rateToUsd && rate.rateToUsd > 0);
  }

  cancel(): void {
    this.dialog.close();
  }

  save(): void {
    if (!this.canSave) {
      return;
    }
    this.saving = true;
    this.api.saveExchangeRates(this.projectBucketId, this.rates).subscribe({
      next: () => {
        this.saving = false;
        this.notificationSvc.showSuccess(
          this.translate.instant('FINANCIAL_PLAN.SIMULATION.ADJUST_RATE.SAVE_SUCCESS')
        );
        this.dialog.close({ confirmed: true });
      },
      error: () => {
        this.saving = false;
      },
    });
  }
}
