import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { TransactionsStoreService } from '../../store/services/transactions-store.service';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { ExchangeRateApiService } from '@core/services/apis';
import { TransactionsFormService } from '../../services';
import { Currency, ExchangeRateResponse } from '@core/models';
import { TransactionHeaderBalances } from '../../models';
import { TransactionsStatus } from '../../enums';
import { TransactionStatusService} from '../../services/transaction-status/transaction-status.service'
@Component({
  selector: 'fi-amounts-disbursement',
  templateUrl: './amounts-disbursement.component.html',
})
export class AmountsDisbursementComponent implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription = new Subscription();
  readonly CURRENCY_USD = 'USD';

  @Input() number = 2;
  @Input() isEditMode = true;
  @Input() amountsForm: UntypedFormGroup;
  @Input() approvedCurrency: Observable<string>;
  
  isLoading: boolean;
  isHardCurrency: boolean;

  currencyList: Observable<Currency[]>;

  format: string;
  decimals: number;
  exchangeRate = 1;
  projectedAvailableBalance: number;
  balances: TransactionHeaderBalances;

  constructor(
    private readonly transactionFormService: TransactionsFormService,
    private readonly transactionStoreSvc: TransactionsStoreService,
    private readonly exchangeRateApi: ExchangeRateApiService,
    private readonly transactionStatusService: TransactionStatusService
  ) {}

  get requestedCurrency() {
    return this.amountsForm.get('requestedCurrency') as UntypedFormControl;
  }

  get requestedAmount() {
    return this.amountsForm.get('requestedAmount') as UntypedFormControl;
  }

  get equivalentApprovedCurrency() {
    return this.amountsForm.get('equivalentApprovedCurrency') as UntypedFormControl;
  }

  get expectedBalance() {
    return this.amountsForm.get('expectedBalance') as UntypedFormControl;
  }

  ngOnInit(): void {
    this.loadProjectBalances();
    this.currencyList = this.transactionFormService.loadCurrencies();

    if (this.requestedCurrency.value) {
      this.requestedCurrencySetValues(this.requestedCurrency.value);
    }
    this.requestedCurrencyValueChanges();
    this.initFormListeners();
    this.amountsFormInitialConfig();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadProjectBalances(): void {
    const sub = this.transactionStoreSvc.projectBalances().subscribe((data) => {
      if (data.projectBalances) {
        this.balances = data.projectBalances;
        if (data.projectBalances.budgetContributionProjectedAvailableBalance) {
          this.projectedAvailableBalance =
            data.projectBalances.budgetContributionProjectedAvailableBalance;

          this.expectedBalanceCalc();
        } else {
          this.projectedAvailableBalance =
            data.projectBalances.projectedAvailableBalance;
          this.expectedBalanceCalc();
        }
      }
    });
    this.subscriptions.add(sub);
  }

  requestedCurrencySetValues(value: Currency): void {
    this.isHardCurrency = value.isHard;

    if (value.isHard) {
      this.loadCurrencyExchangeRate();
    }

    if (value.numberOfDecimals === 0) {
      this.format = 'n0';
      this.decimals = 0;
    } else {
      this.format = 'n2';
      this.decimals = 2;
    }
  }

  expectedBalanceCalc(): void {
    if (this.amountsForm.enabled) {
      if (this.isHardCurrency) {
        if (this.requestedCurrency.value.currency !== this.CURRENCY_USD) {
          let fivePercent =
            (this.requestedAmount.value * 1.05) / this.exchangeRate;
          fivePercent = Number(fivePercent.toFixed(2));

          if (fivePercent > this.projectedAvailableBalance) {
            this.equivalentApprovedCurrency.setValue(fivePercent, {
              emitEvent: false,
            });
          } else {
            let threePercent =
              (this.requestedAmount.value * 1.03) / this.exchangeRate;
            threePercent = Number(threePercent.toFixed(2));
            this.equivalentApprovedCurrency.setValue(threePercent, {
              emitEvent: false,
            });
          }
        } else {
          this.equivalentApprovedCurrency.setValue(this.requestedAmount.value, {
            emitEvent: false,
          });
        }
      } else {
        this.equivalentApprovedCurrency.enable({ emitEvent: false });
      }
    }

    this.expectedBalance.setValue(
      this.isExpectedBalanceSameProjectedBalance() ? this.projectedAvailableBalance :  this.projectedAvailableBalance - this.equivalentApprovedCurrency.value,
      { emitEvent: false }
    );
  }

  initFormListeners(): void {
    this.requestedAmountValueChanges();
    this.equivalentApprovedCurrencyValueChanges();
    this.requestedCurrencyValueChanges();
  }

  requestedCurrencyValueChanges(): void {
    const sub = this.requestedCurrency.valueChanges.subscribe((value) => {
      this.requestedCurrencySetValues(value);

      this.requestedAmount.reset();
      this.requestedAmount.enable({
        emitEvent: false,
      });
      this.equivalentApprovedCurrency.reset();
      this.equivalentApprovedCurrency.enable({
        emitEvent: false,
      });
    });
    this.subscriptions.add(sub);
  }

  requestedAmountValueChanges(): void {
    const requestedAmountSubscription =
      this.requestedAmount.valueChanges.subscribe((value) => {
        this.expectedBalanceCalc();
        if (this.isHardCurrency) {
          if (value !== null) {
            this.equivalentApprovedCurrency.disable({ emitEvent: false });
          } else {
            this.equivalentApprovedCurrency.enable({ emitEvent: false });
          }
        }
      });
    this.subscriptions.add(requestedAmountSubscription);
  }

  equivalentApprovedCurrencyValueChanges(): void {
    const equivalentApprovedCurrencySubscription =
      this.equivalentApprovedCurrency.valueChanges.subscribe((value) => {
        if (this.isHardCurrency) {
          if (value !== null) {
            this.requestedAmount.disable({ emitEvent: false });
            this.requestedAmount.setValue(0, { emitEvent: false });
          } else {
            this.requestedAmount.enable({ emitEvent: false });
            this.requestedAmount.setValue(null, { emitEvent: false });
          }
        }

        this.expectedBalance.setValue(this.projectedAvailableBalance - value, {
          emitEvent: false,
        });
      });
    this.subscriptions.add(equivalentApprovedCurrencySubscription);
  }

  amountsFormInitialConfig(): void {
    if (this.amountsForm) {
      if (this.requestedAmount.value && this.isHardCurrency) {
        this.equivalentApprovedCurrency.disable({ emitEvent: false });
      } else if (
        this.equivalentApprovedCurrency.value !== null &&
        this.requestedAmount.value === 0
      ) {
        this.requestedAmount.disable({ emitEvent: false });
      }
  
      if (this.equivalentApprovedCurrency.value) {
        this.expectedBalance.setValue(
          this.isExpectedBalanceSameProjectedBalance() ? this.projectedAvailableBalance :  this.projectedAvailableBalance - this.equivalentApprovedCurrency.value,
          {
            emitEvent: false,
          }
        );
      } else {
        this.expectedBalance.setValue(
          this.isExpectedBalanceSameProjectedBalance() ? this.projectedAvailableBalance :  this.projectedAvailableBalance - this.equivalentApprovedCurrency.value,
          { emitEvent: false }
        );
      }
    }
  }

  async loadCurrencyExchangeRate(): Promise<void> {
    this.isLoading = true;
    try {
      const response = (await this.exchangeRateApi
        .convert(this.requestedCurrency.value.currency)
        .toPromise()) as ExchangeRateResponse;
      this.exchangeRate = response.exchangeRate;
    } catch (exception) {
      console.log(exception);
    } finally {
      this.isLoading = false;
    }
  }
  
  isExpectedBalanceSameProjectedBalance(): boolean {
    let transactionStatusCodeId: Number = Number(this.transactionStatusService.transactionStatusId.value);
    return (transactionStatusCodeId == TransactionsStatus.COMPLETED || transactionStatusCodeId == TransactionsStatus.PVD);
  }
}
