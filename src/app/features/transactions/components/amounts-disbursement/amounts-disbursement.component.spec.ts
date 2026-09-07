import { TranslateTestingModule } from 'ngx-translate-testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonModule } from '@angular/common';
import { LabelModule } from '@progress/kendo-angular-label';
import { AccordionModule } from '@fiduciary-interface/app/shared';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { provideMockStore } from '@ngrx/store/testing';

import { ExchangeRateApiService } from '@core/services/apis/fiduciary-process-api/common-api/exchange-rate/exchange-rate-api.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { render, screen } from '@testing-library/angular';
import { AmountsDisbursementComponent } from './amounts-disbursement.component';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { AlertComponent } from '@fiduciary-interface/app/shared/components/notification/components/alert/alert.component';
import { amountsDisbursementForm } from './amounts-disbursement.form';
import { Currency } from '@core/models';
import { NotificationService } from '@progress/kendo-angular-notification';
import { RouterTestingModule } from '@angular/router/testing';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { TransactionStatusService } from '../../services/transaction-status/transaction-status.service';
import { IfNumberPipe } from '@fiduciary-interface/app/shared/pipes/if-number.pipe';

const currencyList = [
  {
    currency: 'USD',
    isHard: false,
    numberOfDecimals: 2,
    isBorrowing: false,
  },
  {
    currency: 'EUR',
    isHard: true,
    numberOfDecimals: 2,
    isBorrowing: false,
  },
  {
    currency: 'GBP',
    isHard: false,
    numberOfDecimals: 2,
    isBorrowing: false,
  },
  {
    currency: 'CAD',
    isHard: true,
    numberOfDecimals: 2,
    isBorrowing: false,
  },
  {
    currency: 'KRW',
    isHard: false,
    numberOfDecimals: 0,
    isBorrowing: false,
  },
  {
    currency: 'JPY',
    isHard: true,
    numberOfDecimals: 0,
    isBorrowing: false,
  },
  {
    currency: 'PYG',
    isHard: false,
    numberOfDecimals: 0,
    isBorrowing: false,
  },
];

function getState() {
  return {
    selectedProject: {
      selectedProject: {
        countryCode: 'CO',
        name: 'Programa de apoyo para la mejora de las trayectorias educativas en zonas rurales focalizadas',
        executor: 'MINISTERIO DE EDUCACION NACIONAL',
        executorAcronym: 'CO-MEN',
        contract: '4902/OC-CO',
        operationNumber: 'CO-L1229',
        approvedAmount: 60000000,
        status: 'In progress',
        projectBucketId: '12345678',
      },
      loaded: true,
      loading: false,
      error: null,
    },
    projectBalances: {
      projectBalances: {
        projectedAvailableBalance: 1_000_000,
      },
      loaded: true,
      loading: false,
      error: null,
    },
    currencyList: currencyList,
  } as any;
}

async function setup(state = null) {
  let initialState = {};
  if (state) {
    initialState = state;
  } else {
    initialState = getState();
  }

  const { fixture } = await render(AmountsDisbursementComponent, {
    componentProperties: {
      amountsForm: amountsDisbursementForm(),
    },
    imports: [
      MsalTestModule,
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      DropDownsModule,
      AccordionModule,
      LabelModule,
      InputsModule,
      HttpClientTestingModule,
      RouterTestingModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    declarations: [AlertComponent, IfNumberPipe],
    providers: [
      ExchangeRateApiService,
      provideMockStore({ initialState }),
      NotificationService,
      TransactionStatusService,
    ],
  });
  const component = fixture.componentInstance;
  return { component, fixture };
}

describe('AmountsDisbursementComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('AmountsDisbursementComponent fields', () => {
    it('Should display five headers', async () => {
      await setup();

      expect(screen.getByText('Approved Currency')).toBeInTheDocument();
      expect(screen.getByText(/request currency/i)).toBeInTheDocument();
      expect(screen.getByText(/requested amount/i)).toBeInTheDocument();
      expect(
        screen.getByText(/equivalent in approved currency/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/expected balance/i)).toBeInTheDocument();
    });
  });

  describe('requestedCurrencySetValues', () => {
    it('should set format n0 and decimals 0', async () => {
      const { component, fixture } = await setup();
      const currency: Currency = {
        currency: 'USD',
        isHard: true,
        numberOfDecimals: 0,
        isBorrowing: false,
      };

      component.requestedCurrencySetValues(currency);
      fixture.detectChanges();

      expect(component.format).toEqual('n0');
      expect(component.decimals).toEqual(0);
    });
    it('should set format n2 and decimals 2', async () => {
      const { component, fixture } = await setup();
      const currency: Currency = {
        currency: 'USD',
        isHard: true,
        numberOfDecimals: 2,
        isBorrowing: false,
      };

      component.requestedCurrencySetValues(currency);
      fixture.detectChanges();

      expect(component.format).toEqual('n2');
      expect(component.decimals).toEqual(2);
    });

    it('should not call loadCurrencyExchangeRate when is soft currency', async () => {
      const { component } = await setup();
      const currency: Currency = {
        currency: 'USD',
        isHard: false,
        numberOfDecimals: 2,
        isBorrowing: false,
      };

      const spy = jest.spyOn(component, 'loadCurrencyExchangeRate');

      component.requestedCurrencySetValues(currency);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('amountsFormInitialConfig', () => {
    it('should disable equivalentApprovedCurrency if requestedAmount has value', async () => {
      const { component, fixture } = await setup();
      component.amountsForm.controls.requestedAmount.setValue(1);
      component.amountsFormInitialConfig();
      fixture.detectChanges();

      expect(
        component.amountsForm.get('equivalentApprovedCurrency').disabled
      ).toBe(true);
    });

    it('should disable requestedAmount if equivalentApprovedCurrency has value', async () => {
      const { component, fixture } = await setup();
      component.amountsForm.controls.equivalentApprovedCurrency.setValue(1);
      component.amountsForm.controls.requestedAmount.setValue(0);
      component.amountsFormInitialConfig();
      fixture.detectChanges();

      expect(
        component.amountsForm.get('requestedAmount').disabled
      ).toBeTruthy();
    });
  });

  describe('expectedBalanceCalc', () => {
    it('should not calculate because currency is USD', async () => {
      const { component, fixture } = await setup();
      component.amountsForm.get('requestedCurrency').setValue(currencyList[1]);
      component.expectedBalanceCalc();
      fixture.detectChanges();

      expect(component.equivalentApprovedCurrency.value).toEqual(0);
    });
  });
});
