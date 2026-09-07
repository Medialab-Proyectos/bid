import {
  Component,
  Input,
  OnChanges,
  OnInit,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ExchangeRateResponse } from '@core/models';
import { ExchangeRateApiService } from '@core/services/apis';
import { Subscription } from 'rxjs';
import { TransactionHeaderBalances } from '../../models';

@Component({
  selector: 'fi-equivalent-amount',
  templateUrl: './equivalent-amount.component.html',
})
export class EquivalentAmountComponent implements OnInit, OnChanges, OnDestroy {
  private readonly subscriptions = new Subscription();
  readonly CURRENCY_USD = 'USD';

  @Input() form: UntypedFormGroup;
  @Input() rowIndex: number;
  @Input() readonly = false;
  @Input() currency: UntypedFormControl;
  @Input() balances: TransactionHeaderBalances;

  format = 'n2';
  decimals = 2;
  isLoading: boolean;
  exchangeRate: number;
  valueToBidRow: number;

  constructor(readonly exchangeRateApi: ExchangeRateApiService) {}

  get requestedAmount(): UntypedFormControl {
    return this.form.get('requestedAmount') as UntypedFormControl;
  }

  get expectedBalances(): UntypedFormControl {
    return this.form.get('expectedBalances') as UntypedFormControl;
  }

  get equivalentCurrency(): UntypedFormControl {
    return this.form.get('equivalentCurrency') as UntypedFormControl;
  }

  ngOnInit(): void {
    this.controlsListener();
    this.loadSelectedCurrency();
    if (this.form.get('expectedBalances').value === 0) {
      this.form.get('expectedBalances').disable();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.balances) {
      this.valueToBidRow = this.balances
        .budgetContributionProjectedAvailableBalance
        ? this.balances.budgetContributionProjectedAvailableBalance
        : this.balances.projectedAvailableBalance;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public controlsListener(): void {
    if (!this.readonly) {
      const requestedAmountSub = this.requestedAmount.valueChanges.subscribe(
        (change) => {
          if (this.currency.value) {
            this.requestedAmountChange(change);
            if (this.form.get('sourceType').value === 0) {
              this.expectedBalanceCalc();
            }

            if (this.form.get('sourceType').value === 1) {
              this.expectedBalances.setValue(
                this.balances.localCounterpart - this.equivalentCurrency.value,
                { emitEvent: false }
              );
            }

            if (this.form.get('sourceType').value === 2) {
              this.expectedBalances.setValue(
                this.balances.cofinanced - this.equivalentCurrency.value,
                { emitEvent: false }
              );
            }
          }
        }
      );

      const equivalentCurrencySub =
        this.equivalentCurrency.valueChanges.subscribe((change) => {
          this.equivalentCurrencyChange(change);
        });

      const requestedCurrencySub = this.currency.valueChanges.subscribe(() => {
        this.currencieValueChange();
        this.requestedCurrencySetValues();
      });

      this.subscriptions.add(requestedAmountSub);
      this.subscriptions.add(equivalentCurrencySub);
      this.subscriptions.add(requestedCurrencySub);
    } else {
      this.form.disable();
    }
  }

  loadSelectedCurrency(): void {
    if (this.currency.value && this.currency.value.isHard) {
      this.loadCurrencyExchangeRate(this.currency.value.currency);
      if (this.requestedAmount.value !== 0) {
        this.equivalentCurrency.disable({ emitEvent: false });
      } else if (
        this.requestedAmount.value === 0 &&
        this.equivalentCurrency.value !== 0
      ) {
        this.requestedAmount.disable({ emitEvent: false });
      }
    }
  }

  public requestedAmountChange(change: number): void {
    if (this.form.get('sourceType').value === 0) {
      this.expectedBalanceCalc();
    }

    if (
      this.currency.value &&
      this.currency.value.isHard &&
      this.form.get('sourceType').value === 0
    ) {
      if (change) {
        this.equivalentCurrency.setValue(
          this.valueByExchangeRate(this.exchangeRate, change),
          { emitEvent: false }
        );
        this.equivalentCurrency.disable({ emitEvent: false });
      } else {
        if (this.form.get('expectedBalances').value !== 0) {
          this.equivalentCurrency.enable({ emitEvent: false });
        }
        this.equivalentCurrency.setValue(0, { emitEvent: false });
      }
    }
  }

  public equivalentCurrencyChange(change: number): void {
    if (
      this.currency.value &&
      this.currency.value.isHard &&
      !this.requestedAmount.value &&
      this.form.get('sourceType').value === 0
    ) {
      if (change) {
        this.requestedAmount.disable({ emitEvent: false });
      } else {
        if (this.form.get('expectedBalances').value !== 0) {
          this.requestedAmount.enable({ emitEvent: false });
        }
        this.requestedAmount.setValue(0, { emitEvent: false });
      }
    }

    this.expectedBalancesCalc();
  }

  public valueByExchangeRate(exchangeRate: number, value: number): number {
    return value / exchangeRate;
  }

  currencieValueChange(): void {
    if (
      this.form.get('sourceType').value !== 2 ||
      this.balances.cofinanced !== 0
    ) {
      this.requestedAmount.reset(0, { emitEvent: false });
      this.requestedAmount.enable({ emitEvent: false });
      this.equivalentCurrency.reset(0, { emitEvent: false });
      this.equivalentCurrency.enable({ emitEvent: false });
    }

    switch (this.form.get('sourceType').value) {
      case 0:
        this.expectedBalances.reset(this.valueToBidRow, { emitEvent: false });
        this.expectedBalances.enable({ emitEvent: false });
        break;
      case 1:
        this.expectedBalances.reset(this.balances.localCounterpart, {
          emitEvent: false,
        });
        this.expectedBalances.enable({ emitEvent: false });
        break;
      case 2:
        this.expectedBalances.reset(this.balances.cofinanced, {
          emitEvent: false,
        });
        this.expectedBalances.enable({ emitEvent: false });
        break;
    }
  }

  expectedBalanceCalc(): void {
    if (this.currency.value && this.currency.value.isHard) {
      if (this.currency.value.currency !== this.CURRENCY_USD) {
        let fivePercent =
          (this.requestedAmount.value * 1.05) / this.exchangeRate;
        fivePercent = Number(fivePercent.toFixed(2));

        if (fivePercent > this.balances.projectedAvailableBalance) {
          this.equivalentCurrency.setValue(fivePercent, {
            emitEvent: false,
          });
        } else {
          let threePercent =
            (this.requestedAmount.value * 1.03) / this.exchangeRate;
          threePercent = Number(threePercent.toFixed(2));
          this.equivalentCurrency.setValue(threePercent, {
            emitEvent: false,
          });
        }
      } else {
        this.equivalentCurrency.setValue(this.requestedAmount.value, {
          emitEvent: false,
        });
      }
    } else {
      this.equivalentCurrency.enable({ emitEvent: false });
    }

    this.expectedBalancesCalc();
  }

  async loadCurrencyExchangeRate(currency: string): Promise<void> {
    this.isLoading = true;
    try {
      const response = (await this.exchangeRateApi
        .convert(currency)
        .toPromise()) as ExchangeRateResponse;

      this.exchangeRate = response.exchangeRate;
    } catch (exception) {
      console.log(exception);
    } finally {
      this.isLoading = false;
    }
  }

  requestedCurrencySetValues(): void {
    if (this.currency.value && this.currency.value.isHard) {
      this.loadCurrencyExchangeRate(this.currency.value.currency);
    }

    if (this.currency.value.numberOfDecimals === 0) {
      this.format = 'n0';
      this.decimals = 0;
    } else {
      this.format = 'n2';
      this.decimals = 2;
    }
  }

  expectedBalancesCalc(): void {
    if (this.form.get('sourceType').value === 0) {
      this.expectedBalances.setValue(
        this.valueToBidRow - this.equivalentCurrency.value,
        { emitEvent: false }
      );
    }

    if (this.form.get('sourceType').value === 1) {
      this.expectedBalances.setValue(
        this.balances.localCounterpart - this.equivalentCurrency.value,
        { emitEvent: false }
      );
    }

    if (this.form.get('sourceType').value === 2) {
      this.expectedBalances.setValue(
        this.balances.cofinanced - this.equivalentCurrency.value,
        { emitEvent: false }
      );
    }
  }

  onBlur(event: any, formControlName: string): void {
    if (event === null) {
      this.form.get(formControlName).setValue(0, { emitEvent: false });
    }
  }
}
