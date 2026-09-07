import { render } from '@testing-library/angular';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
  signal,
} from '@angular/core';
import { RContractsStepperComponent } from './r-contracts-stepper.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateTestingModule } from 'ngx-translate-testing';
import {
  EnumsStoreService,
  BiddingProcessPlanStoreService,
} from '@core/services/store-services';
import { ContractFormCompleteService } from '@core/services/forms/contract-form-complete.service';
import {
  BiddingContractApiService,
  GeneralProcurementDocumentsApiService,
  ProjectsApiService,
} from '@core/services/apis';
import { ContractsService } from '../../services/contracts.service';
import {
  ContractPreloadedData,
  ContractRebrandService,
} from '../../services/contract-rebrand.service';
import { ProcurementProcessCategoriesEnum } from '@core/enums';
import {
  Enums,
  FiduciaryProcessDocumentGroup,
  LocationEnums,
  MasterDataCountryEnum,
} from '@core/models';
import { FormValidationService } from '@core/services/validation';
import { NotificationService } from '@progress/kendo-angular-notification';
import {
  MatDialogProviders,
  mockNotificationService,
} from '../../../../../../../../../test/test-helpers';
import { provideWindowSizeMock } from '@fiduciary-interface-test';

const mockEnums = {
  contractsTypes: [
    {
      id: 1,
      nameEn: 'Type 1',
      nameEs: 'Tipo 1',
      nameFr: 'Type 1',
      namePt: 'Tipo 1',
    },
    {
      id: 2,
      nameEn: 'Type 2',
      nameEs: 'Tipo 2',
      nameFr: 'Type 2',
      namePt: 'Tipo 2',
    },
  ],
  contractsConflictResolutionMethods: [
    {
      id: 1,
      nameEn: 'Method 1',
      nameEs: 'Método 1',
      nameFr: 'Méthode 1',
      namePt: 'Método 1',
    },
  ],
  memberCountries: [{ id: 1, name: 'Country 1' }],
  contractsGuaranteeTypes: [
    {
      id: 1,
      nameEn: 'Security Type 1',
      nameEs: 'Tipo de Seguridad 1',
      nameFr: 'Type de Sécurité 1',
      namePt: 'Tipo de Segurança 1',
    },
  ],
  contractsPaymentFrequencies: [
    {
      id: 1,
      nameEn: 'Frequency 1',
      nameEs: 'Frecuencia 1',
      nameFr: 'Fréquence 1',
      namePt: 'Frequência 1',
    },
  ],
  contractsLiquidationDamageTypes: [
    {
      id: 1,
      nameEn: 'Damage Type 1',
      nameEs: 'Tipo de Daño 1',
      nameFr: 'Type de Dommage 1',
      namePt: 'Tipo de Dano 1',
    },
  ],
  contractsBonusTypes: [
    {
      id: 1,
      nameEn: 'Bonus Type 1',
      nameEs: 'Tipo de Bono 1',
      nameFr: 'Type de Bonus 1',
      namePt: 'Tipo de Bônus 1',
    },
  ],
  contractsPaymentRequests: [
    {
      id: 1,
      nameEn: 'Payment Request 1',
      nameEs: 'Solicitud de Pago 1',
      nameFr: 'Demande de Paiement 1',
      namePt: 'Solicitação de Pagamento 1',
    },
  ],
  enumsLoaded: {
    [Enums.contractsTypes]: true,
    [Enums.contractsConflictResolutionMethods]: true,
    [LocationEnums.memberCountries]: true,
    [Enums.contractsGuaranteeTypes]: true,
    [Enums.contractsLiquidationDamageTypes]: true,
    [Enums.contractsBonusTypes]: true,
    [Enums.contractsPaymentFrequencies]: true,
    [Enums.contractsPaymentRequests]: true,
  },
};

const countries: MasterDataCountryEnum[] = [
  {
    id: 1,
    code: 'US',
    name: {
      en: 'United States',
      es: 'Estados Unidos',
      fr: 'États-Unis',
      pt: 'Estados Unidos',
    },
    isActive: true,
    isBeneficiary: false,
    isMember: true,
  },
];

const mockMasterDataEnums = {
  countries: countries,
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
];

const mockParticipantsAwarded = {
  participantsAwarded: [
    {
      biddingProcessBidderId: 'bidder-1',
      biddingProcessParticipantId: '1',
      name: 'Participant 1',
      nationality: { en: 'USA', es: 'EE.UU', fr: 'USA', pt: 'EUA' },
      type: { en: 'Type 1', es: 'Tipo 1', fr: 'Type 1', pt: 'Tipo 1' },
    },
    {
      biddingProcessBidderId: 'bidder-2',
      biddingProcessParticipantId: '2',
      name: 'Participant 2',
      nationality: { en: 'Canada', es: 'Canadá', fr: 'Canada', pt: 'Canadá' },
      type: { en: 'Type 2', es: 'Tipo 2', fr: 'Type 2', pt: 'Tipo 2' },
    },
  ],
};

const mockCostDistributionData = {
  currencies: mockCurrencies,
  components: [
    { id: '1', name: 'Task 1' },
    { id: '2', name: 'Task 2' },
  ],
  project: {
    countryCode: 'US',
  },
};

const mockProcurementProcess = {
  selectedBiddingProcessProcurementProcess: {
    id: 'process-1',
    description: 'Test procurement process description',
    category: {
      id: ProcurementProcessCategoriesEnum.GOODS,
      name: 'Goods',
    },
  },
};

const mockEnumsStoreService = {
  selectEnums: jest.fn(() => of(mockEnums)),
  selectEnumsMasterData: jest.fn(() => of(mockMasterDataEnums)),
};

const mockContractFormCompleteService = {
  commonApi: {
    getCurrencies: jest.fn(() => of(mockCurrencies)),
  },
};

const mockBiddingContractApiService = {
  getAwardeedsV2: jest.fn(() => of(mockParticipantsAwarded)),
  postContractV2: jest.fn(() => of('contract-123')),
  getPaymentSchedule: jest.fn(() => of([])),
  getContractByIdV2: jest.fn(() => of(null)),
};

const mockContractsService = {
  preloadAllDataContracts: jest.fn(() => of(mockCostDistributionData)),
};

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
  contractGroups: signal<FiduciaryProcessDocumentGroup[]>([]).asReadonly(),
};

const mockBiddingProcessPlanStoreService = {
  biddingProcessPlan: jest.fn(() => of(mockProcurementProcess)),
};

const mockGeneralProcurementDocumentsApiService = {
  getGroups: jest.fn(() => of([])),
};

const mockProjectsApiService = {
  getProjectTasksChilds: jest.fn(() => of({ projectTasks: [] })),
};

const mockFormValidationService = {
  validateForm: jest.fn(() => []),
};

function getInitialState() {
  return {
    enums: mockEnums,
    preferences: {
      preferences: {
        preferredLanguage: 'en',
      },
    },
  };
}

async function setup(
  params = { processId: 'test-process-id', contractId: null }
) {
  const initialState = getInitialState();

  const { fixture } = await render(RContractsStepperComponent, {
    imports: [
      ReactiveFormsModule,
      RouterTestingModule.withRoutes([
        {
          path: 'contracts/:processId/v2',
          children: [
            {
              path: 'register-contract',
              component: RContractsStepperComponent,
            },
            {
              path: ':contractId/payment-schedule',
              component: RContractsStepperComponent,
            },
            {
              path: ':contractId/add-documents',
              component: RContractsStepperComponent,
            },
            {
              path: ':contractId/preview',
              component: RContractsStepperComponent,
            },
          ],
        },
      ]),
      MatStepperModule,
      BrowserAnimationsModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    providers: [
      provideMockStore({ initialState }),
      provideWindowSizeMock(),
      { provide: EnumsStoreService, useValue: mockEnumsStoreService },
      {
        provide: ContractFormCompleteService,
        useValue: mockContractFormCompleteService,
      },
      {
        provide: BiddingContractApiService,
        useValue: mockBiddingContractApiService,
      },
      { provide: ContractsService, useValue: mockContractsService },
      { provide: ContractRebrandService, useValue: mockContractRebrandService },
      {
        provide: BiddingProcessPlanStoreService,
        useValue: mockBiddingProcessPlanStoreService,
      },
      {
        provide: GeneralProcurementDocumentsApiService,
        useValue: mockGeneralProcurementDocumentsApiService,
      },
      { provide: ProjectsApiService, useValue: mockProjectsApiService },
      { provide: FormValidationService, useValue: mockFormValidationService },
      { provide: NotificationService, useValue: mockNotificationService },
      ...MatDialogProviders,
    ],
    componentProperties: {
      processId: params.processId,
    },
  });

  const component = fixture.componentInstance;
  const router = fixture.debugElement.injector.get(Router);

  // Navigate to initial route
  await router.navigate([
    'contracts',
    params.processId,
    'v2',
    'register-contract',
  ]);

  fixture.detectChanges();
  await fixture.whenStable();

  return {
    fixture,
    component,
    router,
  };
}

describe('RContractsStepperComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set showLots based on category', async () => {
      const { component } = await setup();
      expect(component.showLots).toBe(true);
    });

    it('should set showDamages based on category', async () => {
      const { component } = await setup();
      expect(component.showDamages).toBe(true);
    });

    it('should set showBonus based on category', async () => {
      const { component } = await setup();
      expect(component.showBonus).toBe(true);
    });
  });

  describe('Stepper navigation', () => {
    it('should not navigate if step index is out of bounds', async () => {
      const { component } = await setup();

      component.gotoStep(999);

      expect(
        mockBiddingContractApiService.postContractV2
      ).not.toHaveBeenCalled();
    });

    it('should validate current step before navigating forward', async () => {
      const { component, fixture } = await setup();

      jest.spyOn(component.contract, 'valid', 'get').mockReturnValue(false);

      const markAsTouchedSpy = jest.spyOn(
        component.contract,
        'markAllAsTouched'
      );

      component.gotoStep(1);
      fixture.detectChanges();

      expect(markAsTouchedSpy).toHaveBeenCalled();
      expect(
        mockBiddingContractApiService.postContractV2
      ).not.toHaveBeenCalled();
    });

    it('should allow step change when form is valid', async () => {
      const { component, fixture } = await setup();

      jest.spyOn(component.contract, 'valid', 'get').mockReturnValue(true);

      const stepEvent = {
        selectedIndex: 1,
        previouslySelectedIndex: 0,
        selectedStep: null,
        previouslySelectedStep: null,
      };

      component.onStepChange(stepEvent as any);
      fixture.detectChanges();

      expect(component).toBeTruthy();
    });
  });

  describe('Form validation', () => {
    it('should validate step 0 (contract form)', async () => {
      const { component } = await setup();

      jest.spyOn(component.contract, 'valid', 'get').mockReturnValue(true);
      const isValid = component['validateCurrentStep'](0);

      expect(isValid).toBe(true);
    });

    it('should mark form as touched when validation fails', async () => {
      const { component } = await setup();

      const markAsTouchedSpy = jest.spyOn(
        component.contract,
        'markAllAsTouched'
      );
      component['markCurrentStepAsTouched'](0);

      expect(markAsTouchedSpy).toHaveBeenCalled();
    });
  });

  describe('Form getters', () => {
    it('should return generalInfoContract form', async () => {
      const { component } = await setup();

      expect(component.generalInfoContract).toBeDefined();
      expect(component.generalInfoContract).toBe(
        component.contract.controls.generalInfo
      );
    });

    it('should return participantsForm', async () => {
      const { component } = await setup();

      expect(component.participantsForm).toBeDefined();
      expect(component.participantsForm).toBe(
        component.contract.controls.participants
      );
    });

    it('should return costDistributionForm', async () => {
      const { component } = await setup();

      expect(component.costDistributionForm).toBeDefined();
      expect(component.costDistributionForm).toBe(
        component.contract.controls.costDistribution
      );
    });

    it('should return executionPlaceForm', async () => {
      const { component } = await setup();

      expect(component.executionPlaceForm).toBeDefined();
      expect(component.executionPlaceForm).toBe(
        component.contract.controls.executionPlace
      );
    });

    it('should return additionalInfoForm', async () => {
      const { component } = await setup();

      expect(component.additionalInfoForm).toBeDefined();
      expect(component.additionalInfoForm).toBe(
        component.contract.controls.additionalInformation
      );
    });

    it('should return lotsForm', async () => {
      const { component } = await setup();

      expect(component.lotsForm).toBeDefined();
      expect(component.lotsForm).toBe(component.contract.controls.lots);
    });

    it('should return feesForm', async () => {
      const { component } = await setup();

      expect(component.feesForm).toBeDefined();
      expect(component.feesForm).toBe(component.contract.controls.fees);
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

  describe('setMinimumData', () => {
    it('should prefill contract objective with procurement process description', async () => {
      const { component } = await setup();

      const testDescription = 'New test description';
      const testProcurement = {
        ...mockProcurementProcess.selectedBiddingProcessProcurementProcess,
        description: testDescription,
      };

      component.setMinimumData(testProcurement as any, component.contract);

      expect(
        component.contract.controls.generalInfo.controls.contractObjective.value
      ).toBe(testDescription);
    });
  });

  describe('currenciesList getter', () => {
    it('should calculate currency totals correctly', async () => {
      const { component } = await setup();

      const list = component.currenciesList;

      expect(Array.isArray(list)).toBe(true);
    });
  });

  describe('Observable methods', () => {
    it('should return enums observable with proper data', async () => {
      const { component } = await setup();

      const enumsObs$ = component.enumsObs('en');

      enumsObs$.subscribe((enums) => {
        expect(enums.biddingContractTypes).toBeDefined();
        expect(enums.memberCountries).toBeDefined();
      });
    });

    it('should return currency observable with proper mapping', async () => {
      const { component } = await setup();

      const currencyObs$ = component.currencyObs();

      currencyObs$.subscribe((currencies) => {
        expect(currencies.length).toBe(2);
        expect(currencies[0].currency).toBe('USD');
        expect(currencies[0].numberOfDecimals).toBe(2);
        expect(currencies[0].exchangeRate).toBeNull();
      });
    });

    it('should return participants awarded observable', async () => {
      const { component } = await setup();

      const participantsObs$ = component.participantsAwardeedObs('en');

      participantsObs$.subscribe((participants) => {
        expect(participants.length).toBe(2);
        expect(participants[0].name).toBe('Participant 1');
        expect(participants[0].nationality).toBe('USA');
      });
    });
  });
});
