import { render } from '@testing-library/angular';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { ContractAmountComponent } from './contract-amount.component';
import { provideMockStore } from '@ngrx/store/testing';
import { ContractAmountData, Currency } from '@core/models';
import { IfNumberPipe } from '@fiduciary-interface/app/shared/pipes/if-number.pipe';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const mockCurrencies: Currency[] = [
  { currency: 'USD', isHard: true, isBorrowing: false, numberOfDecimals: 2 },
  { currency: 'JPY', isHard: true, isBorrowing: false, numberOfDecimals: 0 },
];

const initialState = {
  currencies: {
    currencies: mockCurrencies,
  },
};

const amendmentInfo: ContractAmountData[] = [
  {
    currency: 'USD',
    totalAmount: 100,
    usdEquivalentAmount: 100,
  },
];

async function setup() {
  const { fixture } = await render(ContractAmountComponent, {
    componentProperties: {
      storeCurrencies: mockCurrencies,
    },
    declarations: [ContractAmountComponent, IfNumberPipe],
    providers: [provideMockStore({ initialState })],
    imports: [
      HttpClientTestingModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  });
  const component = fixture.componentInstance;
  return { component, fixture };
}

describe('ContractAmountComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should unsubscribe subscriptions when destroy', async () => {
    const { component } = await setup();
    const spy = jest.spyOn(component.subscriptions, 'unsubscribe');
    component.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
  });

  describe('calculateUsdEquivalent', () => {
    it('calculate usd equivalent and set the form value', async () => {
      const { component, fixture } = await setup();
      component.amendmentInfo = amendmentInfo;
      component.calculateUsdEquivalent(100, 0);
      fixture.detectChanges();
      const usdEquivalentAmount = component.form
        .at(0)
        .get('usdEquivalentAmount').value;

      expect(usdEquivalentAmount).toEqual(100);
    });
  });

  describe('getNumberOfDecimals', () => {
    it('return 2 decimals ', async () => {
      const { component } = await setup();

      const decimals = component.getNumberOfDecimals('USD');
      expect(decimals).toBe(2);
    });

    it('return 0 decimals ', async () => {
      const { component } = await setup();

      const decimals = component.getNumberOfDecimals('JPY');
      expect(decimals).toBe(0);
    });
  });

  describe('addContractAmount', () => {
    it('should push a createAmendmentCurrencyGroup to the form', async () => {
      const { component, fixture } = await setup();

      component.addContractAmount();
      fixture.detectChanges();

      expect(component.form).toHaveLength(2);
    });
  });

  describe('removeContractAmount', () => {
    it('should remove a form', async () => {
      const { component, fixture } = await setup();

      component.removeContractAmount(0);
      fixture.detectChanges();

      expect(component.form).toHaveLength(0);
    });
  });
});
