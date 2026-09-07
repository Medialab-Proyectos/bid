import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormArray } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import {
  ContractAmountData,
  Currency,
  ExchangeRateResponse,
} from '@core/models';
import { AppStateWithCurrencies } from '@core/store';
import { ModeAmendmentEnum } from '@core/enums';
import {
  createAmendmentCurrencyGroup,
  createContractAmountForm,
} from './contract-amount.form';
import { FillFormService } from '../../services/fill-form.service';
import { ExchangeRateApiService } from '@core/services/apis';

@Component({
  selector: 'fi-contract-amount',
  templateUrl: './contract-amount.component.html',
})
export class ContractAmountComponent implements OnInit, OnDestroy {
  public readonly subscriptions = new Subscription();

  @Input() form: UntypedFormArray = createContractAmountForm();
  @Input() number: string | number = '';
  @Input() amendmentInfo: ContractAmountData[] = [];
  @Input() readOnly: boolean;
  @Input() mode: string;

  storeCurrencies: Currency[];
  minAmount = 0;
  exchangeRateFromAPI: number[] = [];
  loadingEchangeRate: boolean[] = [];

  constructor(
    private readonly store: Store<AppStateWithCurrencies>,
    readonly fillFormSvc: FillFormService,
    readonly exchangeRateApi: ExchangeRateApiService
  ) {}

  ngOnInit(): void {
    if (
      this.mode === ModeAmendmentEnum.CREATE ||
      this.mode === ModeAmendmentEnum.UPDATE
    ) {
      this.minAmount = null;
    }
    this.getCurrencies();
    this.amendmentInfo.forEach(() => {
      this.addContractAmount();
      this.removeContractAmount(this.amendmentInfo.length);
    });
    this.amountsObject(this.amendmentInfo);

    this.subscriptions.add(
      this.form.valueChanges.subscribe((data) => {
        data.forEach((el, i) => {
          if (el.amount === null) {
            this.form.controls[i].get('usdEquivalentAmount').setValue(null, {
              emitEvent: false,
            });
          }
        });
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  calculateUsdEquivalent(totalAmount: number, index: number): void {
    let exchangeRate: number;

    if (
      this.amendmentInfo[index].usdEquivalentAmount &&
      this.amendmentInfo[index].totalAmount
    ) {
      exchangeRate =
        this.amendmentInfo[index].usdEquivalentAmount /
        this.amendmentInfo[index].totalAmount;
    } else {
      if (
        !exchangeRate &&
        !this.exchangeRateFromAPI[index] &&
        !this.loadingEchangeRate[index]
      ) {
        this.loadingEchangeRate[index] = true;
        this.getExchangeRate(this.amendmentInfo[index].currency, index);
        return;
      }
    }
    let usdEquivalentAmount: number;
    if (exchangeRate) {
      usdEquivalentAmount = totalAmount * exchangeRate;
    } else {
      usdEquivalentAmount = Number(
        (totalAmount / this.exchangeRateFromAPI[index]).toFixed(2)
      );
    }

    this.form
      .at(index)
      .get('usdEquivalentAmount')
      .setValue(usdEquivalentAmount);
  }

  getExchangeRate(idCurrency: string, index: number): void {
    if (this.loadingEchangeRate[index]) {
      this.exchangeRateApi
        .convert(idCurrency)
        .subscribe((response: ExchangeRateResponse) => {
          this.loadingEchangeRate[index] = false;
          this.exchangeRateFromAPI[index] = response.exchangeRate;
          this.calculateUsdEquivalent(
            this.form.controls[index].get('totalAmount').value,
            index
          );
        });
    }
  }

  getNumberOfDecimals(currency: string): number {
    const found = this.storeCurrencies.find((elem) => {
      return elem.currency === currency;
    });

    return found ? found.numberOfDecimals : 2;
  }

  getCurrencies(): void {
    const subscription = this.store.select('currencies').subscribe((data) => {
      this.storeCurrencies = data.currencies;
    });
    this.subscriptions.add(subscription);
  }

  addContractAmount(): void {
    this.form.push(createAmendmentCurrencyGroup());
  }

  removeContractAmount(index: number): void {
    this.form.removeAt(index);
  }

  amountsObject(data: ContractAmountData[]): void {
    if (this.mode !== ModeAmendmentEnum.CREATE) {
      const contractAmountForm = this.fillFormSvc.amountsObject(data);
      this.form.patchValue(contractAmountForm);
    }
  }
}
