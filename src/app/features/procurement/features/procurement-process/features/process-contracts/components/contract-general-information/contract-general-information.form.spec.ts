import { render } from '@testing-library/angular';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { ContractGeneralInformationComponent } from './contract-general-information.component';
import { initialState } from '@core/store/tempDoc/reducers/tempDoc.reducer';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { GeneralInformationFormConfig } from '@core/models/components/process-contract/general-information-form-config.model';
import { Currency, CurrencyEnum, ExchangeRateResponse } from '@core/models';
import { of } from 'rxjs';
import { DirectivesModule, PipeModule } from '@fiduciary-interface/app/shared';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { LabelModule } from '@progress/kendo-angular-label';
import { DatePickerModule } from '@progress/kendo-angular-dateinputs';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatDateComponent } from '@fiduciary-interface/app/shared/components/mat-date/mat-date.component';
import { MockMatNumericComponent } from '../../../../../../../../../test/test-helpers';

async function setup() {
  const { fixture } = await render(ContractGeneralInformationComponent, {
    componentProperties: {
      number: 1,
      config: config,
    },
    declarations: [
      ContractGeneralInformationComponent,
      MockMatNumericComponent,
    ],
    providers: [HttpClient, provideMockStore({ initialState })],
    imports: [
      PipeModule,
      ReactiveFormsModule,
      FormsModule,
      DirectivesModule,
      HttpClientModule,
      InputsModule,
      LayoutModule,
      LabelModule,
      DatePickerModule,
      DropDownsModule,
      MatSelectModule,
      MatFormFieldModule,
      MatInputModule,
      MatRadioModule,
      MatDateComponent,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
      MsalTestModule,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  });
  const component = fixture.componentInstance;
  return { component, fixture };
}

describe('ContractGeneralInformationComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('funtions', () => {
    it('should add currency', async () => {
      const { component } = await setup();
      component.addCurrency();
      expect(component).toBeTruthy();
    });

    it('should remove currency', async () => {
      const { component } = await setup();
      component.removeCurrency(1);
      expect(component).toBeTruthy();
    });
    it('should called onTotalAmountChange', async () => {
      const { component } = await setup();
      component.selectedCurrency = selectedCurrency;
      component.onTotalAmountChange(2342455, 0);
      expect(component).toBeTruthy();
    });
    it('should call onCurrencyChange', async () => {
      const { component } = await setup();
      component.selectedCurrency = selectedCurrency2;
      const matSelectChange = { value: 'CLP' } as MatSelectChange;
      component.onCurrencyChange(matSelectChange, 0);
      expect(component).toBeTruthy();
    });
  });

  describe('error function', () => {
    it('should return errorTotalAmountChange', async () => {
      const { component } = await setup();
      component.selectedCurrency = [];
      component.onTotalAmountChange(2342455, 0);
      expect(component).toBeTruthy();
    });

    it('should error call onCurrencyChange', async () => {
      const { component } = await setup();
      component.selectedCurrency = selectedCurrency2;
      const matSelectChange = { value: '' } as MatSelectChange;
      component.onCurrencyChange(matSelectChange, 0);
      expect(component).toBeTruthy();
    });
  });

  describe('function subscribe', () => {
    it('should loadCurrency', async () => {
      const { component } = await setup();
      const spy = jest
        .spyOn(component.contractsFormSvc.commonApi, 'getCurrencies')
        .mockReturnValue(of(currencyArray));
      component.ngOnInit();
      expect(spy).toHaveBeenCalled();
    });

    it('should getExchangeRate', async () => {
      const { component } = await setup();
      const spy = jest
        .spyOn(component.exchangeRateApi, 'convert')
        .mockReturnValue(of(selectExchangeRate));
      component.dataCurrency = currencyEnum;
      component.getExchangeRate('ARS');
      expect(spy).toHaveBeenCalled();
    });
  });
});

const config: GeneralInformationFormConfig = {
  data: {
    currencies: [
      {
        id: 'ARS',
        currency: 'ARS',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'ATS',
        currency: 'ATS',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'AUD',
        currency: 'AUD',
        numberOfDecimals: 0,
        exchangeRate: null,
      },
      {
        id: 'BBD',
        currency: 'BBD',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'BEF',
        currency: 'BEF',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'BOB',
        currency: 'BOB',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'BRL',
        currency: 'BRL',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'BSD',
        currency: 'BSD',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'BZD',
        currency: 'BZD',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'CAD',
        currency: 'CAD',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'CHF',
        currency: 'CHF',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'CLP',
        currency: 'CLP',
        numberOfDecimals: 2,
        exchangeRate: 789.04,
      },
      {
        id: 'CNY',
        currency: 'CNY',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'COP',
        currency: 'COP',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'CRC',
        currency: 'CRC',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'CZK',
        currency: 'CZK',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'DEM',
        currency: 'DEM',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'DKK',
        currency: 'DKK',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'DOP',
        currency: 'DOP',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'ECS',
        currency: 'ECS',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'ESP',
        currency: 'ESP',
        numberOfDecimals: 0,
        exchangeRate: null,
      },
      {
        id: 'EUR',
        currency: 'EUR',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'FIM',
        currency: 'FIM',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'FRF',
        currency: 'FRF',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'GBP',
        currency: 'GBP',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'GRD',
        currency: 'GRD',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'GTQ',
        currency: 'GTQ',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'GYD',
        currency: 'GYD',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'HKD',
        currency: 'HKD',
        numberOfDecimals: 0,
        exchangeRate: null,
      },
      {
        id: 'HNL',
        currency: 'HNL',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'HRK',
        currency: 'HRK',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'HTG',
        currency: 'HTG',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'HUF',
        currency: 'HUF',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'IDR',
        currency: 'IDR',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'ILS',
        currency: 'ILS',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'INR',
        currency: 'INR',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'ISK',
        currency: 'ISK',
        numberOfDecimals: 0,
        exchangeRate: null,
      },
      {
        id: 'ITL',
        currency: 'ITL',
        numberOfDecimals: 0,
        exchangeRate: null,
      },
      {
        id: 'JMD',
        currency: 'JMD',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'JPY',
        currency: 'JPY',
        numberOfDecimals: 0,
        exchangeRate: null,
      },
      {
        id: 'KRW',
        currency: 'KRW',
        numberOfDecimals: 0,
        exchangeRate: null,
      },
      {
        id: 'LUF',
        currency: 'LUF',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'MXN',
        currency: 'MXN',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'NIO',
        currency: 'NIO',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'NLG',
        currency: 'NLG',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'NOK',
        currency: 'NOK',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'NZD',
        currency: 'NZD',
        numberOfDecimals: 0,
        exchangeRate: null,
      },
      {
        id: 'PAB',
        currency: 'PAB',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'PEN',
        currency: 'PEN',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'PLN',
        currency: 'PLN',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'PTE',
        currency: 'PTE',
        numberOfDecimals: 0,
        exchangeRate: null,
      },
      {
        id: 'PYG',
        currency: 'PYG',
        numberOfDecimals: 0,
        exchangeRate: null,
      },
      {
        id: 'RUB',
        currency: 'RUB',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'SAR',
        currency: 'SAR',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'SEK',
        currency: 'SEK',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'SIT',
        currency: 'SIT',
        numberOfDecimals: 0,
        exchangeRate: null,
      },
      {
        id: 'SRD',
        currency: 'SRD',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'SVC',
        currency: 'SVC',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'TRY',
        currency: 'TRY',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'TTD',
        currency: 'TTD',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'TWD',
        currency: 'TWD',
        numberOfDecimals: 0,
        exchangeRate: null,
      },
      {
        id: 'UAC',
        currency: 'UAC',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'USD',
        currency: 'USD',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'UYU',
        currency: 'UYU',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'VEF',
        currency: 'VEF',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'XEU',
        currency: 'XEU',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'ZAR',
        currency: 'ZAR',
        numberOfDecimals: 0,
        exchangeRate: null,
      },
      {
        id: 'YUM',
        currency: 'YUM',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'VEB',
        currency: 'VEB',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'SRG',
        currency: 'SRG',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
      {
        id: 'SGD',
        currency: 'SGD',
        numberOfDecimals: 0,
        exchangeRate: null,
      },
      {
        id: 'NOS',
        currency: 'NOS',
        numberOfDecimals: 0,
        exchangeRate: null,
      },
      {
        id: 'BMD',
        currency: 'BMD',
        numberOfDecimals: 0,
        exchangeRate: null,
      },
    ],
    conflictsResolutionsList: [
      {
        id: 0,
        name: 'ENUM.CONTRACT.CONFLICT.RESOLUTION.METHOD.ARBITRAGE',
      },
      {
        id: 1,
        name: 'ENUM.CONTRACT.CONFLICT.RESOLUTION.METHOD.DISPUTE_BOARDS',
      },
      {
        id: 2,
        name: 'ENUM.CONTRACT.CONFLICT.RESOLUTION.METHOD.DOES_NOT_APPLY',
      },
      {
        id: 3,
        name: 'ENUM.CONTRACT.CONFLICT.RESOLUTION.METHOD.OTHER',
      },
    ],
    contractTypesList: [
      {
        id: 0,
        name: 'ENUM.CONTRACT.TYPE.DESIGN_BUILD',
      },
      {
        id: 1,
        name: 'ENUM.CONTRACT.TYPE.BUILD_OPERATE_TRANSFER',
      },
      {
        id: 2,
        name: 'ENUM.CONTRACT.TYPE.BUILD_OWN_OPERATE',
      },
      {
        id: 3,
        name: 'ENUM.CONTRACT.TYPE.FRAMEWORK_AGREEMENTS',
      },
      {
        id: 4,
        name: 'ENUM.CONTRACT.TYPE.LUMP_SUM',
      },
      {
        id: 5,
        name: 'ENUM.CONTRACT.TYPE.MANAGEMENT_SERVICES',
      },
      {
        id: 6,
        name: 'ENUM.CONTRACT.TYPE.OTHER',
      },
      {
        id: 7,
        name: 'ENUM.CONTRACT.TYPE.PERFORMANCE_BASED',
      },
      {
        id: 8,
        name: 'ENUM.CONTRACT.TYPE.PURCHASE_ORDER',
      },
      {
        id: 9,
        name: 'ENUM.CONTRACT.TYPE.REIMBURSABLE_COST',
      },
      {
        id: 10,
        name: 'ENUM.CONTRACT.TYPE.TIME_BASED',
      },
      {
        id: 11,
        name: 'ENUM.CONTRACT.TYPE.TURNKEY',
      },
      {
        id: 12,
        name: 'ENUM.CONTRACT.TYPE.UNIT_PRICE',
      },
    ],
    procurementProcessDescription:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen boo the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software ",
    goodsSourceList: [],
  },
  settings: {
    status: 0,
    disabled: true,
  },
};

const selectedCurrency: CurrencyEnum[] = [
  {
    id: 'ARS',
    currency: 'ARS',
    numberOfDecimals: 2,
    exchangeRate: 110.8885,
  },
];

const selectedCurrency2: CurrencyEnum[] = [
  {
    id: 'ARS',
    currency: 'ARS',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
];

const currencyArray: Currency[] = [
  {
    currency: 'ARS',
    isHard: false,
    isBorrowing: true,
    numberOfDecimals: 2,
  },
  {
    currency: 'ATS',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 2,
  },
  {
    currency: 'AUD',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 0,
  },
  {
    currency: 'BBD',
    isHard: false,
    isBorrowing: true,
    numberOfDecimals: 2,
  },
  {
    currency: 'BEF',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 2,
  },
  {
    currency: 'BOB',
    isHard: false,
    isBorrowing: true,
    numberOfDecimals: 2,
  },
  {
    currency: 'BRL',
    isHard: false,
    isBorrowing: true,
    numberOfDecimals: 2,
  },
  {
    currency: 'BSD',
    isHard: false,
    isBorrowing: true,
    numberOfDecimals: 2,
  },
  {
    currency: 'BZD',
    isHard: false,
    isBorrowing: true,
    numberOfDecimals: 2,
  },
  {
    currency: 'CAD',
    isHard: true,
    isBorrowing: false,
    numberOfDecimals: 2,
  },
  {
    currency: 'CHF',
    isHard: true,
    isBorrowing: false,
    numberOfDecimals: 2,
  },
  {
    currency: 'CLP',
    isHard: false,
    isBorrowing: true,
    numberOfDecimals: 2,
  },
  {
    currency: 'CNY',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 2,
  },
  {
    currency: 'COP',
    isHard: false,
    isBorrowing: true,
    numberOfDecimals: 2,
  },
  {
    currency: 'CRC',
    isHard: false,
    isBorrowing: true,
    numberOfDecimals: 2,
  },
  {
    currency: 'CZK',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 2,
  },
  {
    currency: 'DEM',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 2,
  },
  {
    currency: 'DKK',
    isHard: true,
    isBorrowing: false,
    numberOfDecimals: 2,
  },
  {
    currency: 'DOP',
    isHard: false,
    isBorrowing: true,
    numberOfDecimals: 2,
  },
  {
    currency: 'ECS',
    isHard: false,
    isBorrowing: true,
    numberOfDecimals: 2,
  },
  {
    currency: 'ESP',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 0,
  },
  {
    currency: 'EUR',
    isHard: true,
    isBorrowing: false,
    numberOfDecimals: 2,
  },
  {
    currency: 'FIM',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 2,
  },
  {
    currency: 'FRF',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 2,
  },
  {
    currency: 'GBP',
    isHard: true,
    isBorrowing: false,
    numberOfDecimals: 2,
  },
  {
    currency: 'GRD',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 2,
  },
  {
    currency: 'GTQ',
    isHard: false,
    isBorrowing: true,
    numberOfDecimals: 2,
  },
  {
    currency: 'GYD',
    isHard: false,
    isBorrowing: true,
    numberOfDecimals: 2,
  },
  {
    currency: 'HKD',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 0,
  },
  {
    currency: 'HNL',
    isHard: false,
    isBorrowing: true,
    numberOfDecimals: 2,
  },
  {
    currency: 'HRK',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 2,
  },
  {
    currency: 'HTG',
    isHard: false,
    isBorrowing: true,
    numberOfDecimals: 2,
  },
  {
    currency: 'HUF',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 2,
  },
  {
    currency: 'IDR',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 2,
  },
  {
    currency: 'ILS',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 2,
  },
  {
    currency: 'INR',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 2,
  },
  {
    currency: 'ISK',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 0,
  },
  {
    currency: 'ITL',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 0,
  },
  {
    currency: 'JMD',
    isHard: false,
    isBorrowing: true,
    numberOfDecimals: 2,
  },
  {
    currency: 'JPY',
    isHard: true,
    isBorrowing: false,
    numberOfDecimals: 0,
  },
  {
    currency: 'KRW',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 0,
  },
  {
    currency: 'LUF',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 2,
  },
  {
    currency: 'MXN',
    isHard: false,
    isBorrowing: true,
    numberOfDecimals: 2,
  },
  {
    currency: 'NIO',
    isHard: false,
    isBorrowing: true,
    numberOfDecimals: 2,
  },
  {
    currency: 'NLG',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 2,
  },
  {
    currency: 'NOK',
    isHard: true,
    isBorrowing: false,
    numberOfDecimals: 2,
  },
  {
    currency: 'NZD',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 0,
  },
  {
    currency: 'PAB',
    isHard: false,
    isBorrowing: true,
    numberOfDecimals: 2,
  },
  {
    currency: 'PEN',
    isHard: false,
    isBorrowing: true,
    numberOfDecimals: 2,
  },
  {
    currency: 'PLN',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 2,
  },
  {
    currency: 'PTE',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 0,
  },
  {
    currency: 'PYG',
    isHard: false,
    isBorrowing: true,
    numberOfDecimals: 0,
  },
  {
    currency: 'RUB',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 2,
  },
  {
    currency: 'SAR',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 2,
  },
  {
    currency: 'SEK',
    isHard: true,
    isBorrowing: false,
    numberOfDecimals: 2,
  },
  {
    currency: 'SIT',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 0,
  },
  {
    currency: 'SRD',
    isHard: false,
    isBorrowing: true,
    numberOfDecimals: 2,
  },
  {
    currency: 'SVC',
    isHard: false,
    isBorrowing: true,
    numberOfDecimals: 2,
  },
  {
    currency: 'TRY',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 2,
  },
  {
    currency: 'TTD',
    isHard: false,
    isBorrowing: true,
    numberOfDecimals: 2,
  },
  {
    currency: 'TWD',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 0,
  },
  {
    currency: 'UAC',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 2,
  },
  {
    currency: 'USD',
    isHard: true,
    isBorrowing: false,
    numberOfDecimals: 2,
  },
  {
    currency: 'UYU',
    isHard: false,
    isBorrowing: true,
    numberOfDecimals: 2,
  },
  {
    currency: 'VEF',
    isHard: false,
    isBorrowing: true,
    numberOfDecimals: 2,
  },
  {
    currency: 'XEU',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 2,
  },
  {
    currency: 'ZAR',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 0,
  },
  {
    currency: 'YUM',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 2,
  },
  {
    currency: 'VEB',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 2,
  },
  {
    currency: 'SRG',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 2,
  },
  {
    currency: 'SGD',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 0,
  },
  {
    currency: 'NOS',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 0,
  },
  {
    currency: 'BMD',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 0,
  },
];

const currencyEnum: CurrencyEnum[] = [
  {
    id: 'ARS',
    currency: 'ARS',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'ATS',
    currency: 'ATS',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'AUD',
    currency: 'AUD',
    numberOfDecimals: 0,
    exchangeRate: null,
  },
  {
    id: 'BBD',
    currency: 'BBD',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'BEF',
    currency: 'BEF',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'BOB',
    currency: 'BOB',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'BRL',
    currency: 'BRL',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'BSD',
    currency: 'BSD',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'BZD',
    currency: 'BZD',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'CAD',
    currency: 'CAD',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'CHF',
    currency: 'CHF',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'CLP',
    currency: 'CLP',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'CNY',
    currency: 'CNY',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'COP',
    currency: 'COP',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'CRC',
    currency: 'CRC',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'CZK',
    currency: 'CZK',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'DEM',
    currency: 'DEM',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'DKK',
    currency: 'DKK',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'DOP',
    currency: 'DOP',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'ECS',
    currency: 'ECS',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'ESP',
    currency: 'ESP',
    numberOfDecimals: 0,
    exchangeRate: null,
  },
  {
    id: 'EUR',
    currency: 'EUR',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'FIM',
    currency: 'FIM',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'FRF',
    currency: 'FRF',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'GBP',
    currency: 'GBP',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'GRD',
    currency: 'GRD',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'GTQ',
    currency: 'GTQ',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'GYD',
    currency: 'GYD',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'HKD',
    currency: 'HKD',
    numberOfDecimals: 0,
    exchangeRate: null,
  },
  {
    id: 'HNL',
    currency: 'HNL',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'HRK',
    currency: 'HRK',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'HTG',
    currency: 'HTG',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'HUF',
    currency: 'HUF',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'IDR',
    currency: 'IDR',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'ILS',
    currency: 'ILS',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'INR',
    currency: 'INR',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'ISK',
    currency: 'ISK',
    numberOfDecimals: 0,
    exchangeRate: null,
  },
  {
    id: 'ITL',
    currency: 'ITL',
    numberOfDecimals: 0,
    exchangeRate: null,
  },
  {
    id: 'JMD',
    currency: 'JMD',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'JPY',
    currency: 'JPY',
    numberOfDecimals: 0,
    exchangeRate: null,
  },
  {
    id: 'KRW',
    currency: 'KRW',
    numberOfDecimals: 0,
    exchangeRate: null,
  },
  {
    id: 'LUF',
    currency: 'LUF',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'MXN',
    currency: 'MXN',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'NIO',
    currency: 'NIO',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'NLG',
    currency: 'NLG',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'NOK',
    currency: 'NOK',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'NZD',
    currency: 'NZD',
    numberOfDecimals: 0,
    exchangeRate: null,
  },
  {
    id: 'PAB',
    currency: 'PAB',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'PEN',
    currency: 'PEN',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'PLN',
    currency: 'PLN',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'PTE',
    currency: 'PTE',
    numberOfDecimals: 0,
    exchangeRate: null,
  },
  {
    id: 'PYG',
    currency: 'PYG',
    numberOfDecimals: 0,
    exchangeRate: null,
  },
  {
    id: 'RUB',
    currency: 'RUB',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'SAR',
    currency: 'SAR',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'SEK',
    currency: 'SEK',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'SIT',
    currency: 'SIT',
    numberOfDecimals: 0,
    exchangeRate: null,
  },
  {
    id: 'SRD',
    currency: 'SRD',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'SVC',
    currency: 'SVC',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'TRY',
    currency: 'TRY',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'TTD',
    currency: 'TTD',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'TWD',
    currency: 'TWD',
    numberOfDecimals: 0,
    exchangeRate: null,
  },
  {
    id: 'UAC',
    currency: 'UAC',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'USD',
    currency: 'USD',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'UYU',
    currency: 'UYU',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'VEF',
    currency: 'VEF',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'XEU',
    currency: 'XEU',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'ZAR',
    currency: 'ZAR',
    numberOfDecimals: 0,
    exchangeRate: null,
  },
  {
    id: 'YUM',
    currency: 'YUM',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'VEB',
    currency: 'VEB',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'SRG',
    currency: 'SRG',
    numberOfDecimals: 2,
    exchangeRate: null,
  },
  {
    id: 'SGD',
    currency: 'SGD',
    numberOfDecimals: 0,
    exchangeRate: null,
  },
  {
    id: 'NOS',
    currency: 'NOS',
    numberOfDecimals: 0,
    exchangeRate: null,
  },
  {
    id: 'BMD',
    currency: 'BMD',
    numberOfDecimals: 0,
    exchangeRate: null,
  },
];

const selectExchangeRate: ExchangeRateResponse = {
  fromCurrency: 'ARS',
  toCurrency: 'USD',
  exchangeRate: 110.8885,
};
