import { render, screen } from '@testing-library/angular';
import { NO_ERRORS_SCHEMA, Component, Input, signal } from '@angular/core';
import { RContractsCostDistributionComponent } from './r-contracts-cost-distribution.component';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import {
  ProjectsApiService,
  ExchangeRateApiService,
} from '@core/services/apis';
import {
  Currency,
  FiduciaryProcessDocumentGroup,
  ProjectTask,
} from '@core/models';
import { IfNumberPipe } from '../../../../../../../../shared/pipes/if-number.pipe';
import { provideMockStore } from '@ngrx/store/testing';
import { defaultCurrency } from '../../rebrand-form/forms';
import { NotificationService } from '@progress/kendo-angular-notification';
import {
  MatDialogProviders,
  MockMatNumericComponent,
  mockNotificationService,
} from '../../../../../../../../../test/test-helpers';
import {
  ContractPreloadedData,
  ContractRebrandService,
} from '../../services/contract-rebrand.service';

// Mock del componente accordion
@Component({
  selector: 'fi-accordion-panel',
  template: `
    <div>
      <ng-content select="[title]"></ng-content>
      <ng-content select="[body]"></ng-content>
    </div>
  `,
})
class MockAccordionPanelComponent {
  @Input() collapsible = true;
}

const mockCurrencies: Currency[] = [
  { currency: 'USD', numberOfDecimals: 2 } as Currency,
  { currency: 'EUR', numberOfDecimals: 2 } as Currency,
  { currency: 'GBP', numberOfDecimals: 2 } as Currency,
  { currency: 'JPY', numberOfDecimals: 0 } as Currency,
];

const mockProjectTasks: ProjectTask[] = [
  {
    id: '1',
    name: 'Component 1',
    type: 1,
    executionWbs: 'WBS-001',
    estimatedStartDate: '2024-01-01',
    estimatedEndDate: '2024-12-31',
    actualStartDate: '2024-01-15',
    actualEndDate: '2024-12-20',
    bidEstimatedAmount: 100000,
    localCounterpartAmount: 20000,
    coFinancingAmount: 30000,
    totalEstimatedAmount: 150000,
    bidActualCost: 95000,
    localCounterpartActualCost: 18000,
    coFinancingActualCost: 28000,
    totalActualAmount: 141000,
    currency: 'USD',
    status: 1,
  },
  {
    id: '2',
    name: 'Component 2',
    type: 1,
    executionWbs: 'WBS-002',
    estimatedStartDate: '2024-02-01',
    estimatedEndDate: '2024-11-30',
    actualStartDate: '2024-02-10',
    actualEndDate: '2024-11-25',
    bidEstimatedAmount: 80000,
    localCounterpartAmount: 15000,
    coFinancingAmount: 25000,
    totalEstimatedAmount: 120000,
    bidActualCost: 78000,
    localCounterpartActualCost: 14500,
    coFinancingActualCost: 24000,
    totalActualAmount: 116500,
    currency: 'USD',
    status: 1,
  },
  {
    id: '3',
    name: 'Component 3',
    type: 1,
    executionWbs: 'WBS-003',
    estimatedStartDate: '2024-03-01',
    estimatedEndDate: '2024-10-31',
    actualStartDate: '2024-03-05',
    actualEndDate: '2024-10-28',
    bidEstimatedAmount: 60000,
    localCounterpartAmount: 12000,
    coFinancingAmount: 18000,
    totalEstimatedAmount: 90000,
    bidActualCost: 58000,
    localCounterpartActualCost: 11500,
    coFinancingActualCost: 17500,
    totalActualAmount: 87000,
    currency: 'USD',
    status: 1,
  },
];

const mockProducts: ProjectTask[] = [
  {
    id: 'p1',
    name: 'Product 1',
    type: 2,
    executionWbs: 'WBS-001-P1',
    estimatedStartDate: '2024-01-01',
    estimatedEndDate: '2024-06-30',
    actualStartDate: '2024-01-15',
    actualEndDate: '2024-06-25',
    bidEstimatedAmount: 50000,
    localCounterpartAmount: 10000,
    coFinancingAmount: 15000,
    totalEstimatedAmount: 75000,
    bidActualCost: 48000,
    localCounterpartActualCost: 9500,
    coFinancingActualCost: 14500,
    totalActualAmount: 72000,
    currency: 'USD',
    status: 1,
  },
  {
    id: 'p2',
    name: 'Product 2',
    type: 2,
    executionWbs: 'WBS-001-P2',
    estimatedStartDate: '2024-07-01',
    estimatedEndDate: '2024-12-31',
    actualStartDate: '2024-07-10',
    actualEndDate: '2024-12-20',
    bidEstimatedAmount: 50000,
    localCounterpartAmount: 10000,
    coFinancingAmount: 15000,
    totalEstimatedAmount: 75000,
    bidActualCost: 47000,
    localCounterpartActualCost: 8500,
    coFinancingActualCost: 13500,
    totalActualAmount: 69000,
    currency: 'USD',
    status: 1,
  },
];

const mockContractRebrandService = {
  loading$: of(false),
  setLoading: jest.fn(),
  isSubmitted: jest.fn(),
  mapFormToMakeRequest: jest.fn(() => ({})),
  setContractGroups: jest.fn(),
  setPreloadedData: jest.fn(),
  updateContractData: jest.fn(),
  updatePaymentSchedule: jest.fn(),
  updateDocumentGroups: jest.fn(),
  setSignDate: jest.fn(),
  setContractJustUpdated: jest.fn(),
  setPaymentScheduleMode: jest.fn(),
  contractPreloadedDataSignal: signal<ContractPreloadedData>({
    paymentSchedule: [],
    contractData: null,
    documents: [],
  }).asReadonly(),
  contractGroupsSignal: signal<FiduciaryProcessDocumentGroup[]>(
    []
  ).asReadonly(),
  contractJustUpdatedSignal: signal<boolean>(false).asReadonly(),
  paymentScheduleModeSignal: signal(null).asReadonly(),
  contractSignDate$: of(''),
};

const mockProjectsApiService = {
  getProjectTasksChilds: jest.fn(() => of({ projectTasks: mockProducts })),
};

const mockExchangeRateApiService = {
  convert: jest.fn((currency: string) =>
    of({
      fromCurrency: currency,
      toCurrency: 'USD',
      exchangeRate: 1.2,
    })
  ),
};

async function setup(
  componentProperties: Partial<RContractsCostDistributionComponent> = {}
) {
  const defaultForm = defaultCurrency();

  const { fixture } = await render(RContractsCostDistributionComponent, {
    declarations: [
      MockAccordionPanelComponent,
      IfNumberPipe,
      MockMatNumericComponent,
    ],
    imports: [
      CommonModule,
      ReactiveFormsModule,
      MatFormFieldModule,
      MatInputModule,
      MatSelectModule,
      MatButtonModule,
      MatIconModule,
      MatProgressSpinnerModule,
      MatTooltipModule,
      BrowserAnimationsModule,
      TranslateTestingModule.withTranslations('en', {
        'EX.R_CONTRACTS.DISTRIBUTION_COSTS_TITLE': 'Cost Distribution',
        'EX.R_CONTRACTS.DISTRIBUTION_COSTS_INSTRUCTIONS':
          'Distribution Instructions',
        'EX.R_CONTRACTS.DISTRIBUTION_COSTS_SUBTITLE': 'Subtitle',
        'EX.R_CONTRACTS.DISTRIBUTION_COSTS_CURRENCY_TYPE': 'Currency Type',
        'EX.R_CONTRACTS.DISTRIBUTION_COSTS_ADD_COMPONENT_BTN': 'Add Component',
        'EX.R_CONTRACTS.DISTRIBUTION_COSTS_ADD_PRODUCT_BTN': 'Add Product',
        'EX.R_CONTRACTS.DISTRIBUTION_COSTS_TOTAL_AMOUNT_OF_CURRENCY':
          'Total Amount of Currency',
        'EX.R_CONTRACTS.DISTRIBUTION_COSTS_TOTAL_AMOUNT_OF_BID':
          'Total Amount BID',
        'EX.R_CONTRACTS.DISTRIBUTION_COSTS_TOTAL-LOCAL_CONSTRIBUTION_AMOUNT':
          'Total Local Contribution',
        'EX.R_CONTRACTS.DISTRIBUTION_COSTS_TOTAL_AMOUNT_CO_FINANCING':
          'Total Co-financing',
        'EX.R_CONTRACTS.DISTRIBUTION_COSTS_TOTAL_CURRENCY': 'Total Currency',
        'EX.R_CONTRACTS.DISTRIBUTION_COSTS_TOTAL_EQUIVALENT':
          'Total Equivalent',
      }).withDefaultLanguage('en'),
    ],
    schemas: [NO_ERRORS_SCHEMA],
    providers: [
      provideMockStore({}),
      FormBuilder,
      { provide: ProjectsApiService, useValue: mockProjectsApiService },
      { provide: ExchangeRateApiService, useValue: mockExchangeRateApiService },
      {
        provide: NotificationService,
        useValue: mockNotificationService,
      },
      {
        provide: ContractRebrandService,
        useValue: mockContractRebrandService,
      },
      ...MatDialogProviders,
    ],
    componentProperties: {
      form: defaultForm,
      allCurrencies$: of(mockCurrencies),
      allProjectTasks$: of(mockProjectTasks),
      currenciesMap: mockCurrencies,
      ...componentProperties,
    },
  });

  const component = fixture.componentInstance;

  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();

  return {
    fixture,
    component,
  };
}

describe('RContractsCostDistributionComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create', async () => {
    const { component, fixture } = await setup();
    fixture.detectChanges();
    await fixture.whenStable(); // Añadir esta línea
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Component initialization', () => {
    it('should initialize with default form', async () => {
      const { component } = await setup();

      expect(component.form).toBeDefined();
      expect(component.form.controls.currencies).toBeDefined();
    });

    it('should have MAXIMUM_CURRENCIES set to 4', async () => {
      const { component } = await setup();

      expect(component.MAXIMUM_CURRENCIES).toBe(4);
    });
  });

  describe('Input properties', () => {
    it('should accept allCurrencies$ observable', async () => {
      const { component, fixture } = await setup();

      fixture.detectChanges();

      component.allCurrencies$.subscribe((currencies) => {
        expect(currencies).toEqual(mockCurrencies);
        expect(currencies.length).toBe(4);
      });
    });

    it('should accept allProjectTasks$ observable', async () => {
      const { component, fixture } = await setup();

      fixture.detectChanges();

      component.allProjectTasks$.subscribe((tasks) => {
        expect(tasks).toEqual(mockProjectTasks);
        expect(tasks.length).toBe(3);
      });
    });

    it('should accept currenciesMap array', async () => {
      const { component } = await setup();

      expect(component.currenciesMap).toEqual(mockCurrencies);
    });
  });

  describe('currenciesList getter', () => {
    it('should return currencies FormArray', async () => {
      const { component } = await setup();

      const formArray = component.currenciesList;

      expect(formArray).toBeDefined();
      expect(formArray.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getComponentsArray method', () => {
    it('should return components array for given currency index', async () => {
      const { component } = await setup();

      const componentsArray = component.getComponentsArray(0);

      expect(componentsArray).toBeDefined();
    });
  });

  describe('getProductsArray method', () => {
    it('should return products array for given currency and component index', async () => {
      const { component, fixture } = await setup();

      component.addComponent(0);
      fixture.detectChanges();

      const productsArray = component.getProductsArray(0, 0);

      expect(productsArray).toBeDefined();
    });
  });

  describe('addCurrencies method', () => {
    it('should add a new currency', async () => {
      const { component, fixture } = await setup();

      const initialLength = component.currenciesList.length;
      component.addCurrencies();
      fixture.detectChanges();

      expect(component.currenciesList.length).toBe(initialLength + 1);
    });

    it('should not add currency if maximum reached', async () => {
      const { component, fixture } = await setup();

      // Add currencies until maximum
      component.addCurrencies();
      component.addCurrencies();
      component.addCurrencies();
      fixture.detectChanges();

      const lengthAtMax = component.currenciesList.length;

      // Try to add one more
      component.addCurrencies();
      fixture.detectChanges();

      expect(component.currenciesList.length).toBe(lengthAtMax);
    });
  });

  describe('deleteCurrency method', () => {
    it('should not delete if only one currency exists', async () => {
      const { component, fixture } = await setup();

      const initialLength = component.currenciesList.length;
      component.deleteCurrency(0);
      fixture.detectChanges();

      expect(component.currenciesList.length).toBe(initialLength);
    });

    it('should not delete if index is out of bounds', async () => {
      const { component, fixture } = await setup();

      const initialLength = component.currenciesList.length;
      component.deleteCurrency(-1);
      component.deleteCurrency(999);
      fixture.detectChanges();

      expect(component.currenciesList.length).toBe(initialLength);
    });
  });

  describe('addComponent method', () => {
    it('should add component to specified currency', async () => {
      const { component, fixture } = await setup();

      const initialLength = component.getComponentsArray(0).length;
      component.addComponent(0);
      fixture.detectChanges();

      expect(component.getComponentsArray(0).length).toBe(initialLength + 1);
    });
  });

  describe('addProduct method', () => {
    it('should add product to specified component', async () => {
      const { component, fixture } = await setup();

      component.addComponent(0);
      fixture.detectChanges();

      const initialLength = component.getProductsArray(0, 0).length;
      component.addProduct(0, 0);
      fixture.detectChanges();

      expect(component.getProductsArray(0, 0).length).toBe(initialLength + 1);
    });
  });

  describe('deleteProduct method', () => {
    it('should delete product at specified index', async () => {
      const { component, fixture } = await setup();

      component.addComponent(0);
      component.addProduct(0, 0);
      component.addProduct(0, 0);
      fixture.detectChanges();

      const initialLength = component.getProductsArray(0, 0).length;
      component.deleteProduct(0, 0, 0);
      fixture.detectChanges();

      expect(component.getProductsArray(0, 0).length).toBe(initialLength - 1);
    });
  });

  describe('getCurrencyDecimal method', () => {
    it('should return number of decimals for currency', async () => {
      const { component, fixture } = await setup();

      component.currenciesList.at(0).controls.numberOfDecimal.setValue(2);
      fixture.detectChanges();

      const decimals = component.getCurrencyDecimal(0);

      expect(decimals).toBe(2);
    });
  });

  describe('getCurrencyName method', () => {
    it('should return currency name', async () => {
      const { component, fixture } = await setup();

      component.currenciesList.at(0).controls.currency.setValue('USD');
      fixture.detectChanges();

      const name = component.getCurrencyName(0);

      expect(name).toBe('USD');
    });
  });

  describe('getCurrenciesTotalEquivalent method', () => {
    it('should return total equivalent of all currencies', async () => {
      const { component } = await setup();

      const total = component.getCurrenciesTotalEquivalent();

      expect(typeof total).toBe('number');
      expect(total).toBeGreaterThanOrEqual(0);
    });

    it('should round to 2 decimals', async () => {
      const { component } = await setup();

      const total = component.getCurrenciesTotalEquivalent();
      const decimalPlaces = total.toString().split('.')[1]?.length || 0;

      expect(decimalPlaces).toBeLessThanOrEqual(2);
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

      expect(screen.getByText('Cost Distribution')).toBeInTheDocument();
    });

    it('should render instructions', async () => {
      await setup();

      expect(screen.getByText('Distribution Instructions')).toBeInTheDocument();
    });

    it('should render total summary', async () => {
      await setup();

      const summary = document.querySelector(
        '.cost-distribution__total-summary'
      );
      expect(summary).toBeInTheDocument();
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy$ subject', async () => {
      const { component } = await setup();

      const nextSpy = jest.spyOn(component['destroy$'], 'next');
      const completeSpy = jest.spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });

  describe('Form integration', () => {
    it('should have form bound correctly', async () => {
      const { component } = await setup();

      expect(component.form.controls.currencies).toBeDefined();
    });

    it('should update form when adding currency', async () => {
      const { component, fixture } = await setup();

      const initialLength = component.form.controls.currencies.length;
      component.addCurrencies();
      fixture.detectChanges();

      expect(component.form.controls.currencies.length).toBe(initialLength + 1);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty form arrays', async () => {
      const { component } = await setup();

      expect(() => {
        component.getComponentsArray(0);
      }).not.toThrow();
    });

    it('should handle invalid indices gracefully', async () => {
      const { component } = await setup();

      expect(() => {
        component.deleteCurrency(-1);
        component.deleteCurrency(999);
      }).not.toThrow();
    });

    it('should handle multiple rapid additions', async () => {
      const { component, fixture } = await setup();

      component.addCurrencies();
      component.addCurrencies();
      component.addCurrencies();
      fixture.detectChanges();

      expect(component.currenciesList.length).toBeLessThanOrEqual(4);
    });
  });
});
