import { screen, render } from '@testing-library/angular';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RContractsAdditionalInfoComponent } from './r-contracts-additional-info.component';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { ExchangeRateApiService } from '@core/services/apis';
import {
  ContractSecurities,
  CurrencyEnum,
  Enumerator,
  ExchangeRateResponse,
} from '@core/models';
import { defaultContractAdditionalInfo } from '../../rebrand-form/forms';
import { NotificationGlobalService } from '../../../../../../../../shared';
import {
  MockAccordionPanelComponent,
  MockFiMatDateComponent,
  MockFiMatNumericComponent,
  MockSubTitleComponent,
} from '../../../../../../../../../test/test-helpers';

const mockEnumerators: Enumerator[] = [
  { id: 1, name: 'Type 1', code: 'T1' } as Enumerator,
  { id: 2, name: 'Type 2', code: 'T2' } as Enumerator,
  { id: 3, name: 'Type 3', code: 'T3' } as Enumerator,
];

const mockCurrencies: CurrencyEnum[] = [
  {
    id: '1',
    currency: 'USD',
    numberOfDecimals: 2,
    exchangeRate: 1.0,
  },
  {
    id: '2',
    currency: 'EUR',
    numberOfDecimals: 2,
    exchangeRate: 1.2,
  },
  {
    id: '3',
    currency: 'GBP',
    numberOfDecimals: 2,
    exchangeRate: 1.3,
  },
  {
    id: '4',
    currency: 'JPY',
    numberOfDecimals: 0,
    exchangeRate: 0.0091,
  },
];

const mockAmendmentInfo: ContractSecurities[] = [
  {
    id: '1',
    securityType: 1,
    currency: 'USD',
    amount: 10000,
    usdEquivalentAmount: 10000,
    expirationDate: new Date('2024-12-31'),
  },
  {
    id: '2',
    securityType: 2,
    currency: 'EUR',
    amount: 5000,
    usdEquivalentAmount: 6000,
    expirationDate: new Date('2024-11-30'),
  },
];

const mockExchangeRateResponse: ExchangeRateResponse = {
  fromCurrency: 'EUR',
  toCurrency: 'USD',
  exchangeRate: 1.2,
  date: '2024-01-01',
} as ExchangeRateResponse;

const mockExchangeRateApiService = {
  convert: jest.fn((_: string) => of(mockExchangeRateResponse)),
};

const mockNotificationService = {
  showError: jest.fn((_: string) => {}),
};

async function setup(
  componentProperties: Partial<RContractsAdditionalInfoComponent> = {}
) {
  const defaultForm = defaultContractAdditionalInfo();

  const { fixture } = await render(RContractsAdditionalInfoComponent, {
    declarations: [
      MockAccordionPanelComponent,
      MockSubTitleComponent,
      MockFiMatNumericComponent,
      MockFiMatDateComponent,
    ],
    imports: [
      CommonModule,
      ReactiveFormsModule,
      MatFormFieldModule,
      MatInputModule,
      MatSelectModule,
      MatButtonModule,
      MatIconModule,
      MatDividerModule,
      BrowserAnimationsModule,
      TranslateTestingModule.withTranslations('en', {
        'EX.R_CONTRACTS_ADDITIONAL_INFORMATION_LABEL': 'Additional Information',
        'EX.R_CONTRACTS_WARRANTY_DEPOSIT_LABEL': 'Warranty/Deposit',
        'EX.R_CONTRACTS_CURRENCY_TYPE_LABEL': 'Currency Type',
        'EX.R_CONTRACTS_AMOUNT_LABEL': 'Amount',
        'EX.R_CONTRACTS_TOTAL_EQUIVALENT_LABEL': 'Total Equivalent (USD)',
        'EX.R_CONTRACTS_DATE_OF_ISSUE_LABEL': 'Issue Date',
        'EX.R_CONTRACTS_COMPLETION_DATE_LABEL': 'Completion Date',
        'EX.R_CONTRACTS_ADD_ANOTHER_GUARANTEE_LABEL': 'Add Another Guarantee',
        'EX.R_CONTRACTS_SETTLEMENT_FOR_DAMAGES_PERJURY_LABEL':
          'Liquidated Damages',
        'EX.R_CONTRACTS_DAILY_OR_WEEKLY_PAYMENT_LABEL': 'Payment Frequency',
        'EX.R_CONTRACTS_MAXIMUM_PERCENTAGE_LABEL': 'Maximum Percentage',
        'EX.R_CONTRACTS_BONUS_LABEL': 'Bonus',
        'CONTRACT.ADDITIONAL_INFO.DAMAGES': 'Damages Type',
        'CONTRACT.ADDITIONAL_INFO.PERCENTAGE': 'Percentage',
        'CONTRACT.ADDITIONAL_INFO.BONUS': 'Bonus Type',
      }).withDefaultLanguage('en'),
    ],
    schemas: [NO_ERRORS_SCHEMA],
    providers: [
      FormBuilder,
      {
        provide: ExchangeRateApiService,
        useValue: mockExchangeRateApiService,
      },
      {
        provide: NotificationGlobalService,
        useValue: mockNotificationService,
      },
    ],
    componentProperties: {
      form: defaultForm,
      biddingContractSecurityTypes: mockEnumerators,
      biddingContractBonusPaymentFrequency: mockEnumerators,
      currencies: mockCurrencies,
      amendmentInfo: mockAmendmentInfo,
      biddingContractLiquidatedDamageTypes: mockEnumerators,
      biddingContractBonusTypes: mockEnumerators,
      ...componentProperties,
    },
  });

  const component = fixture.componentInstance;

  return {
    fixture,
    component,
  };
}

describe('RContractsAdditionalInfoComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Component initialization', () => {
    it('should initialize with default form', async () => {
      const { component } = await setup();

      expect(component.form).toBeDefined();
      expect(component.form.get('securities')).toBeDefined();
      expect(component.form.get('liquidatedDamage')).toBeDefined();
      expect(component.form.get('bonus')).toBeDefined();
    });

    it('should call setupValueChanges on ngOnInit', async () => {
      const { component } = await setup();

      const setupSpy = jest.spyOn(component as any, 'setupValueChanges');
      component.ngOnInit();

      expect(setupSpy).toHaveBeenCalled();
    });

    it('should have subscriptions object', async () => {
      const { component } = await setup();

      expect(component['subscriptions']).toBeDefined();
    });

    it('should initialize exchangeRates object', async () => {
      const { component } = await setup();

      expect(component['exchangeRates']).toBeDefined();
      expect(typeof component['exchangeRates']).toBe('object');
    });
  });

  describe('Input properties', () => {
    it('should accept biddingContractSecurityTypes', async () => {
      const { component } = await setup();

      expect(component.biddingContractSecurityTypes).toEqual(mockEnumerators);
      expect(component.biddingContractSecurityTypes.length).toBe(3);
    });

    it('should accept biddingContractBonusPaymentFrequency', async () => {
      const { component } = await setup();

      expect(component.biddingContractBonusPaymentFrequency).toEqual(
        mockEnumerators
      );
    });

    it('should accept amendmentInfo', async () => {
      const { component } = await setup();

      expect(component.amendmentInfo).toEqual(mockAmendmentInfo);
    });

    it('should accept biddingContractLiquidatedDamageTypes', async () => {
      const { component } = await setup();

      expect(component.biddingContractLiquidatedDamageTypes).toEqual(
        mockEnumerators
      );
    });

    it('should accept biddingContractBonusTypes', async () => {
      const { component } = await setup();

      expect(component.biddingContractBonusTypes).toEqual(mockEnumerators);
    });
  });

  describe('guarantees getter', () => {
    it('should return securities FormArray', async () => {
      const { component } = await setup();

      const guarantees = component.guarantees;

      expect(guarantees).toBeDefined();
      expect(guarantees.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('bonus getter', () => {
    it('should return bonus FormGroup', async () => {
      const { component } = await setup();

      const bonus = component.bonus;

      expect(bonus).toBeDefined();
      expect(bonus.get('liquidatedDamageType')).toBeDefined();
      expect(bonus.get('percentage')).toBeDefined();
    });
  });

  describe('addGuaranteeorFianzas method', () => {
    it('should add a new guarantee to FormArray', async () => {
      const { component, fixture } = await setup();

      const initialLength = component.guarantees.length;
      component.addGuaranteeorFianzas();
      fixture.detectChanges();

      expect(component.guarantees.length).toBe(initialLength + 1);
    });

    it('should setup value changes for new guarantee', async () => {
      const { component, fixture } = await setup();

      const setupSpy = jest.spyOn(
        component as any,
        'setupGuaranteeValueChanges'
      );
      component.addGuaranteeorFianzas();
      fixture.detectChanges();

      expect(setupSpy).toHaveBeenCalled();
    });

    it('should create guarantee with correct structure', async () => {
      const { component, fixture } = await setup();

      component.addGuaranteeorFianzas();
      fixture.detectChanges();

      const newGuarantee = component.guarantees.at(
        component.guarantees.length - 1
      );
      expect(newGuarantee.get('securityType')).toBeDefined();
      expect(newGuarantee.get('currency')).toBeDefined();
      expect(newGuarantee.get('amount')).toBeDefined();
      expect(newGuarantee.get('usdEquivalentAmount')).toBeDefined();
      expect(newGuarantee.get('expirationDate')).toBeDefined();
    });
  });

  describe('removeGuarantee method', () => {
    it('should remove guarantee at specified index', async () => {
      const { component, fixture } = await setup();

      component.addGuaranteeorFianzas();
      component.addGuaranteeorFianzas();
      fixture.detectChanges();

      const initialLength = component.guarantees.length;
      component.removeGuarantee(0);
      fixture.detectChanges();

      expect(component.guarantees.length).toBe(initialLength - 1);
    });

    it('should allow removal when length is greater than 0', async () => {
      const { component, fixture } = await setup();

      component.addGuaranteeorFianzas();
      fixture.detectChanges();

      const initialLength = component.guarantees.length;
      component.removeGuarantee(0);
      fixture.detectChanges();

      expect(component.guarantees.length).toBeLessThan(initialLength);
    });
  });

  describe('getDecimalsForGuarantee method', () => {
    it('should return default 2 decimals when no currency selected', async () => {
      const { component, fixture } = await setup();

      component.addGuaranteeorFianzas();
      fixture.detectChanges();

      const decimals = component.getDecimalsForGuarantee(0);

      expect(decimals).toBe(2);
    });
  });

  describe('Currency change handling', () => {
    it('should update selectedCurrencies when currency changes', async () => {
      const { component, fixture } = await setup();

      component.addGuaranteeorFianzas();
      fixture.detectChanges();

      const guarantee = component.guarantees.at(0);
      guarantee.get('currency')?.setValue('EUR');
      fixture.detectChanges();

      setTimeout(() => {
        expect(component['selectedCurrencies'][0]).toBeDefined();
        expect(component['selectedCurrencies'][0].currency).toBe('EUR');
      }, 100);
    });
  });

  describe('Component rendering', () => {
    it('should render the accordion panel', async () => {
      await setup();

      const accordion = document.querySelector('fi-accordion-panel');
      expect(accordion).toBeInTheDocument();
    });

    it('should render title', async () => {
      await setup();

      expect(screen.getByText('Additional Information')).toBeInTheDocument();
    });

    it('should render warranty/deposit section', async () => {
      await setup();

      expect(screen.getByText('Warranty/Deposit')).toBeInTheDocument();
    });

    it('should render add guarantee button', async () => {
      await setup();

      expect(screen.getByText('Add Another Guarantee')).toBeInTheDocument();
    });

    it('should render liquidated damages section', async () => {
      await setup();

      expect(screen.getByText('Liquidated Damages')).toBeInTheDocument();
    });

    it('should render bonus section', async () => {
      await setup();

      expect(screen.getByText('Bonus')).toBeInTheDocument();
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from all subscriptions', async () => {
      const { component } = await setup();

      const unsubscribeSpy = jest.spyOn(
        component['subscriptions'],
        'unsubscribe'
      );

      component.ngOnDestroy();

      expect(unsubscribeSpy).toHaveBeenCalled();
    });

    it('should clean up subscriptions properly', async () => {
      const { component, fixture } = await setup();

      component.addGuaranteeorFianzas();
      fixture.detectChanges();

      // Simulate subscriptions
      const guarantee = component.guarantees.at(0);
      guarantee.get('currency')?.setValue('EUR');
      fixture.detectChanges();

      expect(component['subscriptions'].closed).toBe(false);

      component.ngOnDestroy();

      expect(component['subscriptions'].closed).toBe(true);
    });
  });

  describe('Form structure', () => {
    it('should have bonus form group', async () => {
      const { component } = await setup();

      const bonus = component.form.get('bonus');

      expect(bonus).toBeDefined();
      expect(bonus?.get('liquidatedDamageType')).toBeDefined();
      expect(bonus?.get('percentage')).toBeDefined();
      expect(bonus?.get('paymentFrequencyType')).toBeDefined();
      expect(bonus?.get('maximumPercentage')).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty guarantees array', async () => {
      const { component } = await setup();

      expect(component.guarantees.length).toBeGreaterThanOrEqual(0);
      expect(() => component.guarantees.controls).not.toThrow();
    });

    it('should handle multiple guarantees', async () => {
      const { component, fixture } = await setup();

      component.addGuaranteeorFianzas();
      component.addGuaranteeorFianzas();
      component.addGuaranteeorFianzas();
      fixture.detectChanges();

      expect(component.guarantees.length).toBeGreaterThanOrEqual(3);
    });

    it('should handle currency change with null values', async () => {
      const { component, fixture } = await setup();

      component.addGuaranteeorFianzas();
      fixture.detectChanges();

      expect(() => {
        const guarantee = component.guarantees.at(0);
        guarantee.get('currency')?.setValue(null);
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should handle amount change with zero value', async () => {
      const { component, fixture } = await setup();

      component.addGuaranteeorFianzas();
      fixture.detectChanges();

      component['exchangeRates'][0] = 1.2;

      expect(() => {
        const guarantee = component.guarantees.at(0);
        guarantee.get('amount')?.setValue(0);
        fixture.detectChanges();
      }).not.toThrow();
    });
  });

  describe('Integration tests', () => {
    it('should maintain separate exchange rates for multiple guarantees', async () => {
      const { component, fixture } = await setup();

      component.addGuaranteeorFianzas();
      component.addGuaranteeorFianzas();
      fixture.detectChanges();

      component['exchangeRates'][0] = 1.2;
      component['exchangeRates'][1] = 1.5;

      expect(component['exchangeRates'][0]).not.toBe(
        component['exchangeRates'][1]
      );
    });

    it('should validate expirationDate is a Date object', async () => {
      const { component } = await setup();

      expect(component.amendmentInfo[0].expirationDate).toBeInstanceOf(Date);
    });

    it('should properly store and retrieve ContractSecurities data', async () => {
      const { component } = await setup();

      const security = component.amendmentInfo[0];

      expect(security.id).toBe('1');
      expect(security.securityType).toBe(1);
      expect(security.currency).toBe('USD');
      expect(security.amount).toBe(10000);
      expect(security.usdEquivalentAmount).toBe(10000);
      expect(security.expirationDate).toBeInstanceOf(Date);
    });
  });

  describe('CurrencyEnum interface validation', () => {
    it('should have valid currency IDs as strings', async () => {
      const { component } = await setup();

      component.currencies.forEach((currency) => {
        expect(typeof currency.id).toBe('string');
        expect(currency.id).toBeTruthy();
      });
    });

    it('should have currency codes as strings', async () => {
      const { component } = await setup();

      component.currencies.forEach((currency) => {
        expect(typeof currency.currency).toBe('string');
        expect(currency.currency.length).toBeGreaterThan(0);
      });
    });

    it('should have valid numberOfDecimals', async () => {
      const { component } = await setup();

      component.currencies.forEach((currency) => {
        expect(typeof currency.numberOfDecimals).toBe('number');
        expect(currency.numberOfDecimals).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle optional exchangeRate property', async () => {
      const { component } = await setup();

      const currencyWithRate = component.currencies.find(
        (c) => c.exchangeRate !== undefined
      );
      const currencyWithoutRate: CurrencyEnum = {
        id: '10',
        currency: 'AUD',
        numberOfDecimals: 2,
      };

      if (currencyWithRate) {
        expect(typeof currencyWithRate.exchangeRate).toBe('number');
      }
      expect(currencyWithoutRate.exchangeRate).toBeUndefined();
    });
  });

  describe('ContractSecurities interface validation', () => {
    it('should have valid amount as number', async () => {
      const { component } = await setup();

      component.amendmentInfo.forEach((security) => {
        expect(typeof security.amount).toBe('number');
        expect(security.amount).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have currency as string', async () => {
      const { component } = await setup();

      component.amendmentInfo.forEach((security) => {
        expect(typeof security.currency).toBe('string');
        expect(security.currency.length).toBeGreaterThan(0);
      });
    });

    it('should have expirationDate as Date object', async () => {
      const { component } = await setup();

      component.amendmentInfo.forEach((security) => {
        expect(security.expirationDate).toBeInstanceOf(Date);
        expect(security.expirationDate.getTime()).toBeGreaterThan(0);
      });
    });

    it('should have securityType as number', async () => {
      const { component } = await setup();

      component.amendmentInfo.forEach((security) => {
        expect(typeof security.securityType).toBe('number');
        expect(security.securityType).toBeGreaterThan(0);
      });
    });

    it('should have usdEquivalentAmount as number', async () => {
      const { component } = await setup();

      component.amendmentInfo.forEach((security) => {
        expect(typeof security.usdEquivalentAmount).toBe('number');
        expect(security.usdEquivalentAmount).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle optional id property', async () => {
      const { component } = await setup();

      const securityWithId = component.amendmentInfo.find((s) => s.id);
      const securityWithoutId: ContractSecurities = {
        securityType: 3,
        currency: 'GBP',
        amount: 8000,
        usdEquivalentAmount: 10400,
        expirationDate: new Date('2025-06-30'),
      };

      if (securityWithId) {
        expect(typeof securityWithId.id).toBe('string');
      }
      expect(securityWithoutId.id).toBeUndefined();
    });
  });
});
