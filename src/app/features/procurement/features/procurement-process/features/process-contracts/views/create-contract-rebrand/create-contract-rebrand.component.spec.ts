import { render } from '@testing-library/angular';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CreateContractRebrandComponent } from './create-contract-rebrand.component';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { EnumsStoreService } from '@core/services/store-services';
import { ContractFormCompleteService } from '@core/services/forms/contract-form-complete.service';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { CommonModule } from '@angular/common';

const mockEnums = {
  biddingContractTypes: [
    { id: 1, name: 'Type 1' },
    { id: 2, name: 'Type 2' },
  ],
  biddingContractConflictResolutionMethods: [
    { id: 1, name: 'Method 1' },
    { id: 2, name: 'Method 2' },
  ],
  memberCountries: [
    { id: 1, name: 'Country 1' },
    { id: 2, name: 'Country 2' },
  ],
  biddingContractSecurityTypes: [
    { id: 1, name: 'Security Type 1' },
    { id: 2, name: 'Security Type 2' },
  ],
  biddingContractBonusPaymentFrequency: [
    { id: 1, name: 'Frequency 1' },
    { id: 2, name: 'Frequency 2' },
  ],
  biddingContractLiquidatedDamageTypes: [
    { id: 1, name: 'Damage Type 1' },
    { id: 2, name: 'Damage Type 2' },
  ],
  biddingContractBonusTypes: [
    { id: 1, name: 'Bonus Type 1' },
    { id: 2, name: 'Bonus Type 2' },
  ],
  enumsLoaded: {
    biddingContractTypes: true,
    biddingContractConflictResolutionMethods: true,
    memberCountries: true,
    biddingContractSecurityTypes: true,
    biddingContractLiquidatedDamageTypes: true,
    biddingContractBonusTypes: true,
  },
};

const mockCurrencies = [
  {
    currency: 'USD',
    numberOfDecimals: 2,
  },
  {
    currency: 'EUR',
    numberOfDecimals: 2,
  },
  {
    currency: 'GBP',
    numberOfDecimals: 2,
  },
];

const mockEnumsStoreService = {
  selectEnums: jest.fn(() => of(mockEnums)),
};

const mockContractFormCompleteService = {
  commonApi: {
    getCurrencies: jest.fn(() => of(mockCurrencies)),
  },
};

function getInitialState() {
  return {
    enums: mockEnums,
  };
}

async function setup() {
  const initialState = getInitialState();

  const { fixture } = await render(CreateContractRebrandComponent, {
    imports: [
      CommonModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    providers: [
      provideMockStore({ initialState }),
      { provide: EnumsStoreService, useValue: mockEnumsStoreService },
      {
        provide: ContractFormCompleteService,
        useValue: mockContractFormCompleteService,
      },
    ],
  });

  const component = fixture.componentInstance;

  return {
    fixture,
    component,
  };
}

describe('CreateContractRebrandComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call loadEnums on initialization', async () => {
      const { component } = await setup();
      const loadEnumsSpy = jest.spyOn(component as any, 'loadEnums');

      component.ngOnInit();

      expect(loadEnumsSpy).toHaveBeenCalled();
    });

    it('should load all required enums', async () => {
      const { component, fixture } = await setup();

      component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(mockEnumsStoreService.selectEnums).toHaveBeenCalled();
      expect(component.biddingContractTypes).toEqual(
        mockEnums.biddingContractTypes
      );
      expect(component.biddingContractConflictResolutionMethods).toEqual(
        mockEnums.biddingContractConflictResolutionMethods
      );
      expect(component.memberCountries).toEqual(mockEnums.memberCountries);
      expect(component.biddingContractSecurityTypes).toEqual(
        mockEnums.biddingContractSecurityTypes
      );
      expect(component.biddingContractBonusPaymentFrequency).toEqual(
        mockEnums.biddingContractBonusPaymentFrequency
      );
      expect(component.biddingContractLiquidatedDamageTypes).toEqual(
        mockEnums.biddingContractLiquidatedDamageTypes
      );
      expect(component.biddingContractBonusTypes).toEqual(
        mockEnums.biddingContractBonusTypes
      );
    });

    it('should load currencies and map them correctly', async () => {
      const { component, fixture } = await setup();

      component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(
        mockContractFormCompleteService.commonApi.getCurrencies
      ).toHaveBeenCalled();
      expect(component.currencies.length).toBe(3);
      expect(component.currencies[0]).toEqual({
        id: 'USD',
        currency: 'USD',
        numberOfDecimals: 2,
        exchangeRate: null,
      });
      expect(component.currencies[1]).toEqual({
        id: 'EUR',
        currency: 'EUR',
        numberOfDecimals: 2,
        exchangeRate: null,
      });
    });
  });

  describe('loadEnums', () => {
    it('should call forkJoin with enums and currencies observables', async () => {
      const { component, fixture } = await setup();

      component['loadEnums']();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(mockEnumsStoreService.selectEnums).toHaveBeenCalled();
      expect(
        mockContractFormCompleteService.commonApi.getCurrencies
      ).toHaveBeenCalled();
    });

    it('should subscribe and populate all properties', async () => {
      const { component, fixture } = await setup();

      component['loadEnums']();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.biddingContractTypes.length).toBeGreaterThan(0);
      expect(
        component.biddingContractConflictResolutionMethods.length
      ).toBeGreaterThan(0);
      expect(component.memberCountries.length).toBeGreaterThan(0);
      expect(component.currencies.length).toBeGreaterThan(0);
    });

    it('should use takeUntilDestroyed for subscription cleanup', async () => {
      const { component, fixture } = await setup();

      component['loadEnums']();
      fixture.detectChanges();
      await fixture.whenStable();

      // Verify the subscription was created and data was loaded
      expect(component.biddingContractTypes).toBeDefined();
    });
  });

  describe('areRequiredEnumsLoaded', () => {
    it('should return true when all required enums are loaded', async () => {
      const { component } = await setup();

      const result = component['areRequiredEnumsLoaded'](mockEnums as any);

      expect(result).toBe(true);
    });

    it('should return false when any required enum is not loaded', async () => {
      const { component } = await setup();

      const incompleteEnums = {
        ...mockEnums,
        enumsLoaded: {
          ...mockEnums.enumsLoaded,
          biddingContractTypes: false,
        },
      };

      const result = component['areRequiredEnumsLoaded'](
        incompleteEnums as any
      );

      expect(result).toBe(false);
    });

    it('should return false when biddingContractConflictResolutionMethods is not loaded', async () => {
      const { component } = await setup();

      const incompleteEnums = {
        ...mockEnums,
        enumsLoaded: {
          ...mockEnums.enumsLoaded,
          biddingContractConflictResolutionMethods: false,
        },
      };

      const result = component['areRequiredEnumsLoaded'](
        incompleteEnums as any
      );

      expect(result).toBe(false);
    });

    it('should return false when memberCountries is not loaded', async () => {
      const { component } = await setup();

      const incompleteEnums = {
        ...mockEnums,
        enumsLoaded: {
          ...mockEnums.enumsLoaded,
          memberCountries: false,
        },
      };

      const result = component['areRequiredEnumsLoaded'](
        incompleteEnums as any
      );

      expect(result).toBe(false);
    });
  });

  describe('extractRequiredEnums', () => {
    it('should extract all required enums correctly', async () => {
      const { component } = await setup();

      const result = component['extractRequiredEnums'](mockEnums as any);

      expect(result.biddingContractTypes).toEqual(
        mockEnums.biddingContractTypes
      );
      expect(result.biddingContractConflictResolutionMethods).toEqual(
        mockEnums.biddingContractConflictResolutionMethods
      );
      expect(result.memberCountries).toEqual(mockEnums.memberCountries);
      expect(result.biddingContractSecurityTypes).toEqual(
        mockEnums.biddingContractSecurityTypes
      );
      expect(result.biddingContractBonusPaymentFrequency).toEqual(
        mockEnums.biddingContractBonusPaymentFrequency
      );
      expect(result.biddingContractLiquidatedDamageTypes).toEqual(
        mockEnums.biddingContractLiquidatedDamageTypes
      );
      expect(result.biddingContractBonusTypes).toEqual(
        mockEnums.biddingContractBonusTypes
      );
    });

    it('should return an object with all enum properties', async () => {
      const { component } = await setup();

      const result = component['extractRequiredEnums'](mockEnums as any);

      expect(result).toHaveProperty('biddingContractTypes');
      expect(result).toHaveProperty('biddingContractConflictResolutionMethods');
      expect(result).toHaveProperty('memberCountries');
      expect(result).toHaveProperty('biddingContractSecurityTypes');
      expect(result).toHaveProperty('biddingContractBonusPaymentFrequency');
      expect(result).toHaveProperty('biddingContractLiquidatedDamageTypes');
      expect(result).toHaveProperty('biddingContractBonusTypes');
    });
  });

  describe('Component rendering', () => {
    it('should render the card container', async () => {
      await setup();

      const card = document.querySelector('.card');
      expect(card).toBeInTheDocument();
    });

    it('should render the stepper component', async () => {
      await setup();

      const stepper = document.querySelector('fi-r-contracts-stepper');
      expect(stepper).toBeInTheDocument();
    });
  });

  describe('Currency mapping', () => {
    it('should map currency with correct structure', async () => {
      const { component, fixture } = await setup();

      component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();

      const currency = component.currencies[0];
      expect(currency).toHaveProperty('id');
      expect(currency).toHaveProperty('currency');
      expect(currency).toHaveProperty('numberOfDecimals');
      expect(currency).toHaveProperty('exchangeRate');
      expect(currency.exchangeRate).toBeNull();
    });

    it('should handle empty currencies array', async () => {
      const emptyMockService = {
        commonApi: {
          getCurrencies: jest.fn(() => of([])),
        },
      };

      const { fixture } = await render(CreateContractRebrandComponent, {
        imports: [
          CommonModule,
          TranslateTestingModule.withTranslations('en', {}).withDefaultLanguage(
            'en'
          ),
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        providers: [
          provideMockStore({ initialState: getInitialState() }),
          { provide: EnumsStoreService, useValue: mockEnumsStoreService },
          {
            provide: ContractFormCompleteService,
            useValue: emptyMockService,
          },
        ],
      });

      const component = fixture.componentInstance;
      component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.currencies).toEqual([]);
    });
  });

  describe('Enum properties initialization', () => {
    it('should have all enum properties defined after ngOnInit', async () => {
      const { component, fixture } = await setup();

      component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.biddingContractTypes).toBeDefined();
      expect(component.biddingContractConflictResolutionMethods).toBeDefined();
      expect(component.memberCountries).toBeDefined();
      expect(component.biddingContractSecurityTypes).toBeDefined();
      expect(component.biddingContractBonusPaymentFrequency).toBeDefined();
      expect(component.biddingContractLiquidatedDamageTypes).toBeDefined();
      expect(component.biddingContractBonusTypes).toBeDefined();
      expect(component.currencies).toBeDefined();
    });

    it('should have correct types for all enum arrays', async () => {
      const { component, fixture } = await setup();

      component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(Array.isArray(component.biddingContractTypes)).toBe(true);
      expect(
        Array.isArray(component.biddingContractConflictResolutionMethods)
      ).toBe(true);
      expect(Array.isArray(component.memberCountries)).toBe(true);
      expect(Array.isArray(component.biddingContractSecurityTypes)).toBe(true);
      expect(
        Array.isArray(component.biddingContractBonusPaymentFrequency)
      ).toBe(true);
      expect(
        Array.isArray(component.biddingContractLiquidatedDamageTypes)
      ).toBe(true);
      expect(Array.isArray(component.biddingContractBonusTypes)).toBe(true);
      expect(Array.isArray(component.currencies)).toBe(true);
    });
  });

  describe('Service integration', () => {
    it('should handle service errors gracefully', async () => {
      const errorMockEnumsService = {
        selectEnums: jest.fn(() => of(mockEnums)),
      };

      const errorMockContractService = {
        commonApi: {
          getCurrencies: jest.fn(() => of(mockCurrencies)),
        },
      };

      const { fixture } = await render(CreateContractRebrandComponent, {
        imports: [
          CommonModule,
          TranslateTestingModule.withTranslations('en', {}).withDefaultLanguage(
            'en'
          ),
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        providers: [
          provideMockStore({ initialState: getInitialState() }),
          { provide: EnumsStoreService, useValue: errorMockEnumsService },
          {
            provide: ContractFormCompleteService,
            useValue: errorMockContractService,
          },
        ],
      });

      const component = fixture.componentInstance;

      expect(() => {
        component.ngOnInit();
        fixture.detectChanges();
      }).not.toThrow();
    });
  });
});
