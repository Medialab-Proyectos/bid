import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PermissionEnum } from '@core/enums';
import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import {
  Currency,
  CurrencyChangeEvent,
  CurrencyEnum,
  ExchangeRateResponse,
} from '@core/models';
import { GeneralInformationFormConfig } from '@core/models/components/process-contract/general-information-form-config.model';
import { ExchangeRateApiService } from '@core/services/apis/fiduciary-process-api/common-api/exchange-rate/exchange-rate-api.service';
import { ContractFormCompleteService } from '@core/services/forms/contract-form-complete.service';
import { removeRequired } from '@core/utils';
import {
  createContractGeneralInformationForm,
  createCurrencyGroup,
} from './contract-general-information.form';
import { BiddingContractTypes } from '../../enums';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'fi-contract-general-information',
  templateUrl: './contract-general-information.component.html',
})
export class ContractGeneralInformationComponent {
  @Input() goodsVisibility: boolean;
  @Input() set contractTypeDesignation(value: boolean) {
    this._contractTypeDesignation = value;
    this.validateTypeDesignationVisibility(value);
  }
  @Input() addCurrencyPermission: PermissionEnum[] = [PermissionEnum.SPECIAL];
  @Input() removeCurrencyPermission: PermissionEnum[] = [
    PermissionEnum.SPECIAL,
  ];
  @Input() form: UntypedFormGroup = createContractGeneralInformationForm();
  @Input() number: string | number = '';
  @Input() set config(config: GeneralInformationFormConfig) {
    this.baseConfig = {
      ...this.baseConfig,
      ...config,
    };

    if (config.settings.disabled === true) {
      removeRequired(`.${this.CLASS} .fi-kendo-label--required`);
    }
  }

  baseConfig: GeneralInformationFormConfig = {
    data: {
      conflictsResolutionsList: [],
      contractTypesList: [],
      currencies: [],
      procurementProcessDescription: '',
      goodsSourceList: [],
    },
    settings: {
      disabled: false,
      status: null,
    },
  };

  constructor(
    readonly exchangeRateApi: ExchangeRateApiService,
    readonly contractsFormSvc: ContractFormCompleteService
  ) {}

  CLASS = 'c-contract-general-information';
  selectedCurrency: CurrencyEnum[] = [];
  dataCurrency: CurrencyEnum[] = [];
  _contractTypeDesignation: boolean;
  @Output() currencyChange = new EventEmitter<CurrencyChangeEvent>();

  ngOnInit(): void {
    this.loadCurrency(this.currencyList.controls);
  }

  loadCurrency(controls: AbstractControl[]) {
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
          if (control['controls'].currency.value) {
            this.getExchangeRate(control['controls'].currency.value);
          }
        }
      });
  }

  getExchangeRate(idCurrency: string) {
    this.exchangeRateApi
      .convert(idCurrency)
      .subscribe((response: ExchangeRateResponse) => {
        const currency = this.dataCurrency.find((i) => i.id === idCurrency);
        currency.exchangeRate = response.exchangeRate;
        this.selectedCurrency.push(currency);
      });
  }

  addCurrency(): void {
    if (this.currencyList.length <= 3) {
      this.currencyList.push(createCurrencyGroup());
    }
  }

  get currencyList(): UntypedFormArray {
    return this.form.get('currencyList') as UntypedFormArray;
  }

  removeCurrency(index: number) {
    this.currencyList.removeAt(index);
  }

  onTotalAmountChange(value: number, index: number) {
    if (
      this.selectedCurrency.length === 0 ||
      this.selectedCurrency[index].exchangeRate === null
    ) {
      return;
    }

    const row = this.currencyList.at(index);
    const dollarEquivalent = (
      value / this.selectedCurrency[index].exchangeRate
    ).toFixed(2);
    row.get('usdEquivalentAmount').setValue(dollarEquivalent);
  }

  /**
   * Emits and select currency
   * @param selectedCurrency
   * @param index
   * @returns
   */
  onCurrencyChange(selectedCurrency: MatSelectChange, index: number) {
    if (!selectedCurrency.value) {
      return;
    }

    const currency = this.baseConfig.data.currencies.find(
      (i) => i.id === selectedCurrency.value
    );

    this.selectedCurrency[index] = currency;
    this.onTotalAmountChange(
      this.currencyList.at(index).get('totalAmount').value,
      index
    );
    this.currencyChange.emit({ currency: currency.id, index });
  }

  startDateLowerThanSignatureDate(): boolean {
    const signatureDate = this.form.get('signatureDate').value;
    const startDate = this.form.get('startDate').value;

    return !!signatureDate && !!startDate && startDate < signatureDate;
  }

  endDateLessThanStartDate(): boolean {
    const dateStart = this.form.get('startDate').value;
    const endDate = this.form.get('endDate').value;
    if (endDate === '') {
      return false;
    } else {
      return endDate < dateStart;
    }
  }

  validateTypeDesignationVisibility(
    contractTypeDesignationAvailable: boolean
  ): void {
    let validatorsContractType = contractTypeDesignationAvailable
      ? Validators.required
      : null;
    this.form.get('typeDesignation').setValidators(validatorsContractType);
    this.form.get('typeDesignation').updateValueAndValidity();
  }

  typeContractChange(changeEvent: MatSelectChange): void {
    const contractType = changeEvent.value as BiddingContractTypes;
    this._contractTypeDesignation = contractType === BiddingContractTypes.OTHER;
    this.validateTypeDesignationVisibility(this._contractTypeDesignation);
  }
}
