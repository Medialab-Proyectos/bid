import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { ModeAmendmentEnum, ModeEnum, PermissionEnum } from '@core/enums';
import { AbstractControl, UntypedFormArray } from '@angular/forms';
import {
  ContractSecurities,
  Currency,
  CurrencyChangeEvent,
  CurrencyEnum,
  Enums,
  ExchangeRateResponse,
  SecurityFormConfig,
} from '@core/models';
import { ExchangeRateApiService } from '@core/services/apis/fiduciary-process-api/common-api/exchange-rate/exchange-rate-api.service';
import { ContractFormCompleteService } from '@core/services/forms/contract-form-complete.service';
import { AppStateWithCurrencies } from '@core/store';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { createSecurityGroup } from '../aditional-information/aditional-information.form';
import { FillFormService } from '../../services/fill-form.service';

@Component({
  selector: 'fi-securities',
  templateUrl: './securities.component.html',
})
export class SecuritiesComponent implements OnInit, OnDestroy {
  @Input() addSecurityPermission: PermissionEnum[] = [PermissionEnum.SPECIAL];
  @Input() removeSecurityPermission: PermissionEnum[] = [
    PermissionEnum.SPECIAL,
  ];
  private readonly subscriptions = new Subscription();

  ModeEnum = ModeEnum;
  enum = Enums;

  @Input() form = new UntypedFormArray([]);
  @Input() amendmentInfo: ContractSecurities[] = [];
  @Input() isAmendment: boolean;
  @Input() readOnly = false;
  @Input() mode;

  @Output() currencyChange = new EventEmitter<CurrencyChangeEvent>();

  baseConfig: SecurityFormConfig = {
    data: {
      currencies: [],
      securityTypes: [],
    },
    settings: {
      mode: ModeEnum.CREATE,
    },
  };

  /**
   * Set and update base config with config parameter
   */
  @Input() set config(config: SecurityFormConfig) {
    this.baseConfig.data = { ...this.baseConfig.data, ...config.data };
    this.baseConfig.settings = {
      ...this.baseConfig.settings,
      ...config.settings,
    };
    if (this.baseConfig.settings.mode === ModeEnum.READ) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  selectedCurrency: CurrencyEnum[] = [];
  storeCurrencies: Currency[];
  dataCurrency: CurrencyEnum[] = [];

  constructor(
    private readonly store: Store<AppStateWithCurrencies>,
    readonly exchangeRateApi: ExchangeRateApiService,
    readonly contractsFormSvc: ContractFormCompleteService,
    readonly fillFormSvc: FillFormService
  ) {}

  ngOnInit(): void {
    this.loadCurrency(this.form.controls);
    if (this.isAmendment) {
      this.getCurrencies();
      this.amendmentInfo.forEach(() => {
        this.addSecurity();
        this.removeValidators();
        this.deleteSecurity(this.amendmentInfo.length);
      });
      this.warrantyObject(this.amendmentInfo);
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
    if (this.readOnly) {
      this.form.disable();
    }
  }

  loadCurrency(controls: AbstractControl[]): void {
    this.contractsFormSvc.commonApi
      .getCurrencies()
      .subscribe((response: Currency[]) => {
        this.dataCurrency = response.map((item) => {
          return {
            id: item.currency,
            currency: item.currency,
            numberOfDecimals: item.numberOfDecimals,
            exchangeRate: null,
          };
        });

        for (const control of controls) {
          this.getExchangeRate(control['controls'].currency.value);
        }
      });
  }

  getExchangeRate(idCurrency: string): void {
    this.exchangeRateApi
      .convert(idCurrency)
      .subscribe((response: ExchangeRateResponse) => {
        const currency = this.dataCurrency.find((i) => i.id === idCurrency);
        currency.exchangeRate = response.exchangeRate;
        this.selectedCurrency.push(currency);
      });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  addSecurity(): void {
    this.form.push(createSecurityGroup());
  }

  deleteSecurity(index: number): void {
    this.form.removeAt(index);
  }

  removeValidators(): void {
    this.form.controls.forEach((control) => {
      control.get('amount').clearValidators();
      control.get('amount').updateValueAndValidity();
      control.get('expirationDate').clearValidators();
      control.get('expirationDate').updateValueAndValidity();
      control.get('securityType').clearValidators();
      control.get('securityType').updateValueAndValidity();
      control.get('currency').clearValidators();
      control.get('currency').updateValueAndValidity();
    });
  }

  onTotalAmountChange(value: number, index: number): void {
    if (
      this.selectedCurrency.length === 0 ||
      this.selectedCurrency[index].exchangeRate === null
    ) {
      return;
    }

    const row = this.form.at(index);
    const usdEquivalentAmount =
      value / this.selectedCurrency[index].exchangeRate;
    row.get('usdEquivalentAmount').setValue(usdEquivalentAmount);
  }

  /**
   * Emits and select currency
   * @param currencyId
   * @param index
   * @returns
   */
  onCurrencyChange(currencyId: string, index: number): void {
    if (!currencyId) {
      return;
    }

    const currency = this.baseConfig.data.currencies.find(
      (i) => i.id === currencyId
    );

    this.selectedCurrency[index] = currency;

    this.onTotalAmountChange(this.form.at(index).get('amount').value, index);
    this.currencyChange.emit({ currency: currency.id, index });
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

  calculateUsdEquivalent(totalAmount: number, index: number): void {
    let exchangeRate: number;

    if (
      this.amendmentInfo[index].usdEquivalentAmount &&
      this.amendmentInfo[index].amount
    ) {
      exchangeRate =
        this.amendmentInfo[index].usdEquivalentAmount /
        this.amendmentInfo[index].amount;
    } else {
      exchangeRate = 1;
    }

    const usdEquivalentAmount = totalAmount * exchangeRate;

    this.form
      .at(index)
      .get('usdEquivalentAmount')
      .setValue(usdEquivalentAmount);
  }

  warrantyObject(data: ContractSecurities[]): void {
    if (this.mode !== ModeAmendmentEnum.CREATE) {
      const warranties = this.fillFormSvc.warrantyObject(data);
      this.form.patchValue(warranties);
    }
  }
}
