import { EquivalentAmountComponent } from './equivalent-amount.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { NotificationService } from '@progress/kendo-angular-notification';

import { KendoModule } from '@fiduciary-interface/app/shared';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Currency } from '@core/models';
import { TransactionHeaderBalances } from '../../models';
import { of } from 'rxjs';

const hardCurrency: Currency = {
  currency: 'USD',
  isBorrowing: false,
  isHard: true,
  numberOfDecimals: 2,
};
const hardCurrencyEUR: Currency = {
  currency: 'EUR',
  isBorrowing: false,
  isHard: true,
  numberOfDecimals: 2,
};

const softCurrency: Currency = {
  currency: 'JPY',
  isBorrowing: false,
  isHard: false,
  numberOfDecimals: 0,
};

const balances: TransactionHeaderBalances = {
  originalIdb: 10,
  currentIdb: 10,
  availableBalance: 10,
  projectedAvailableBalance: 10,
  disbursedAmount: 10,
  disbursedPercent: 100,
  lastDisbursementDate: null,
  cofinanced: 10,
  cancellations: 10,
  budgetContributionProjectedAvailableBalance: 10,
  budgetContributionAvailableBalance: 10,
  localCounterpart: 10,
  totalAmountPendingJustification: 10,
  minimumAmountPendingJustification: 10,
  toJustifyPercent: 10,
  coFinancedDisbursed: 10,
  localCounterpartDisbursed: 10,
  cumulativeExtension: 1,
  currentDisbExpiration: '',
  financialPeriodDeadline: '',
  lastAdvanceOfFoundsANTDate: '',
  lastAdvanceOfFoundsANTAmount: 1,
  lastRequestNumber: 1,
  retroactiveFinancingInformation: {
    availRfAmount: 3,
    disbRfAmount: 4,
    hasRetroactiveFinancing: true,
    projAvailRfAmount: 5,
    projDisbRfAmount: 5,
    rfCurrentAmount: 5,
    rfOriginalAmount: 65,
  },
};

async function setup() {
  const form = new FormGroup({
    source: new FormControl(''),
    sourceType: new FormControl(''),
    requestedAmount: new FormControl(''),
    equivalentCurrency: new FormControl(''),
    expectedBalances: new FormControl(''),
  });

  const { fixture } = await render(EquivalentAmountComponent, {
    componentProperties: {
      form: form,
      balances: balances,
      currency: new FormControl(hardCurrency),
    },
    declarations: [EquivalentAmountComponent],
    imports: [
      HttpClientTestingModule,
      KendoModule,
      ReactiveFormsModule,
      FormsModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    providers: [provideMockStore({}), NotificationService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  });
  const component = fixture.componentInstance;
  return { fixture, component };
}

describe('EquivalentAmountComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('requestedCurrencySetValues', () => {
    describe('when isHardCurrency', () => {
      it('should set format n2 and decimals 2', async () => {
        const { component } = await setup();
        component.requestedCurrencySetValues();
        expect(component.format).toBe('n2');
        expect(component.decimals).toBe(2);
      });

      it('should set format n2 and decimals 2', async () => {
        const { component } = await setup();
        component.currency = new FormControl(softCurrency);
        component.requestedCurrencySetValues();
        expect(component.format).toBe('n0');
        expect(component.decimals).toBe(0);
      });
    });
  });

  describe('expectedBalancesCalc', () => {
    it('should calc expectedBalances of form control with sourceType 0', async () => {
      const { component } = await setup();
      component.form.get('sourceType').setValue(0);
      component.form.get('equivalentCurrency').setValue(10);
      component.valueToBidRow = 10;

      component.expectedBalancesCalc();

      expect(component.expectedBalances.value).toBe(0);
    });
    it('should calc expectedBalances of form control with sourceType 1', async () => {
      const { component } = await setup();
      component.form.get('sourceType').setValue(1);
      component.form.get('equivalentCurrency').setValue(10);
      component.valueToBidRow = 10;

      component.expectedBalancesCalc();

      expect(component.expectedBalances.value).toBe(0);
    });
    it('should calc expectedBalances of form control with sourceType 2', async () => {
      const { component } = await setup();
      component.form.get('sourceType').setValue(2);
      component.form.get('equivalentCurrency').setValue(10);
      component.valueToBidRow = 10;

      component.expectedBalancesCalc();

      expect(component.expectedBalances.value).toBe(0);
    });
  });

  describe('ngOnInit', () => {
    it('should disable expectedBalances when expected balances are 9', async () => {
      const { component } = await setup();
      component.form.get('expectedBalances').setValue(0);
      component.ngOnInit();
      expect(component.form.get('expectedBalances').disabled).toBe(true);
    });
  });

  describe('controlsListener', () => {
    it('should call requestedAmountChange on valueChanges if there is selectedCurrency', async () => {
      const { component, fixture } = await setup();

      const spy = jest.spyOn(component, 'requestedAmountChange');

      component.form.get('requestedAmount').setValue(10);
      component.controlsListener();
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
    });

    it('should call expectedBalanceCalc when sourceType === 0', async () => {
      const { component, fixture } = await setup();

      component.form.get('sourceType').setValue(0);
      const spy = jest.spyOn(component, 'requestedAmountChange');
      fixture.detectChanges();

      component.form.get('requestedAmount').setValue(10);
      component.controlsListener();
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
    });
    it('should call expectedBalanceCalc when sourceType === 1 and calc expectedBalances', async () => {
      const { component, fixture } = await setup();

      component.form.get('sourceType').setValue(1);
      const spy = jest.spyOn(component, 'requestedAmountChange');
      fixture.detectChanges();

      component.form.get('requestedAmount').setValue(10);
      component.form.get('equivalentCurrency').setValue(10);
      component.controlsListener();
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
      expect(component.expectedBalances.value).toBe(0);
    });

    it('should call expectedBalanceCalc when sourceType === 2 and calc expectedBalances', async () => {
      const { component, fixture } = await setup();

      component.form.get('sourceType').setValue(2);
      const spy = jest.spyOn(component, 'requestedAmountChange');
      fixture.detectChanges();

      component.form.get('requestedAmount').setValue(10);
      component.form.get('equivalentCurrency').setValue(10);
      component.controlsListener();
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
      expect(component.expectedBalances.value).toBe(0);
    });
    it('should disable form when is readonly', async () => {
      const { component, fixture } = await setup();

      component.readonly = true;
      component.controlsListener();
      fixture.detectChanges();

      expect(component.form.disabled).toBe(true);
    });
  });

  describe('requestedAmountChange', () => {
    it('should enable equivalentCurrency and set empty value', async () => {
      const { component, fixture } = await setup();
      component.requestedAmountChange(0);
      fixture.detectChanges();

      expect(component.form.get('equivalentCurrency').disabled).toBe(true);
      expect(component.form.get('equivalentCurrency').value).toBe('');
    });
    it('should call expectedBalanceCalc when sourceType === 0', async () => {
      const { component } = await setup();
      component.form.get('sourceType').setValue(0);
      const spy = jest.spyOn(component, 'expectedBalanceCalc');
      component.requestedAmountChange(1);

      expect(spy).toHaveBeenCalled();
    });
    it('should enable equivalentCurrency', async () => {
      const { component, fixture } = await setup();
      component.form.get('sourceType').setValue(0);
      component.currency.setValue(hardCurrencyEUR);
      component.form.get('expectedBalances').setValue(200);
      component.requestedAmountChange(null);

      fixture.detectChanges();

      expect(component.form.get('equivalentCurrency').disabled).toBe(false);
    });
  });

  describe('currencieValueChange', () => {
    describe('case 0', () => {
      it('should reset and enable expectedBalances', async () => {
        const { component } = await setup();
        component.form.get('sourceType').setValue(0);

        const spy = jest.spyOn(component.expectedBalances, 'reset');
        component.currencieValueChange();

        expect(spy).toHaveBeenCalled();
        expect(component.expectedBalances.enabled).toBe(true);
      });
    });
    describe('case 1', () => {
      it('should reset and enable expectedBalances', async () => {
        const { component } = await setup();
        component.form.get('sourceType').setValue(1);

        const spy = jest.spyOn(component.expectedBalances, 'reset');
        component.currencieValueChange();

        expect(spy).toHaveBeenCalled();
        expect(component.expectedBalances.enabled).toBe(true);
      });
    });
    describe('case 2', () => {
      it('should reset and enable expectedBalances', async () => {
        const { component } = await setup();
        component.form.get('sourceType').setValue(2);

        const spy = jest.spyOn(component.expectedBalances, 'reset');
        component.currencieValueChange();

        expect(spy).toHaveBeenCalled();
        expect(component.expectedBalances.enabled).toBe(true);
      });
    });
  });

  describe('expectedBalanceCalc', () => {
    it('should enable equivalentCurrency when is soft currency', async () => {
      const { component } = await setup();
      component.currency.setValue(softCurrency);
      component.expectedBalanceCalc();

      expect(component.equivalentCurrency.enabled).toBe(true);
    });

    it('should not calc when is USD', async () => {
      const { component } = await setup();
      component.requestedAmount.setValue(10);
      component.expectedBalanceCalc();

      expect(component.equivalentCurrency.value).toBe(10);
    });

    it('should set equivalentCurrency to fivePercent calc', async () => {
      const { component, fixture } = await setup();
      component.exchangeRate = 1;
      component.currency.setValue(hardCurrencyEUR);

      component.requestedAmount.setValue(10);
      component.expectedBalanceCalc();
      fixture.detectChanges();

      expect(component.equivalentCurrency.value).toBe(10.5);
    });
    it('should set equivalentCurrency to threePercent calc', async () => {
      const { component, fixture } = await setup();
      component.exchangeRate = 1;
      component.currency.setValue(hardCurrencyEUR);
      component.requestedAmount.setValue(5);
      component.expectedBalanceCalc();
      fixture.detectChanges();

      expect(component.equivalentCurrency.value).toBe(5.15);
    });
  });
  describe('loadCurrencyExchangeRate', () => {
    it('shoudl set exchangeRate  whit the response of the service', async () => {
      const { component, fixture } = await setup();
      const spy = jest
        .spyOn(component.exchangeRateApi, 'convert')
        .mockReturnValue(
          of({
            fromCurrency: 'USD',
            toCurrency: 'EUR',
            exchangeRate: 1,
          })
        );
      component.loadCurrencyExchangeRate('USD');
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('loadSelectedCurrency', () => {
    it('should disable requestedAmount if requestedAmount is 0 and equivalentCurrency is diferent of 0', async () => {
      const { component, fixture } = await setup();
      component.requestedAmount.setValue(0);
      component.equivalentCurrency.setValue(2);
      component.loadSelectedCurrency();
      fixture.detectChanges();

      expect(component.requestedAmount.disabled).toBe(true);
    });
  });

  describe('onBlur', () => {
    it('should set value requestedAmount 0 if the event is null', async () => {
      const { component } = await setup();
      component.onBlur(null, 'requestedAmount');
      expect(component.requestedAmount.value).toBe(0);
    });
  });

  describe('equivalentCurrencyChange', () => {
    it('should enable requestedAmount', async () => {
      const { component, fixture } = await setup();

      component.currency.setValue(hardCurrencyEUR);
      component.equivalentCurrency.setValue(10);
      component.form.get('sourceType').setValue(0);

      component.equivalentCurrency.setValue(2);
      component.equivalentCurrencyChange(0);
      fixture.detectChanges();

      expect(component.requestedAmount.disabled).toBe(false);
    });
  });
});
