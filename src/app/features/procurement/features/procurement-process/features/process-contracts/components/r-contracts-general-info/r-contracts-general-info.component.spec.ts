import { screen, render } from '@testing-library/angular';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RContractsGeneralInfoComponent } from './r-contracts-general-info.component';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { CommonModule } from '@angular/common';
import { MatDateComponent } from '../../../../../../../../shared/components/mat-date/mat-date.component';
import { provideMockStore } from '@ngrx/store/testing';
import { defaultContractGeneralInfo } from '../../rebrand-form/forms';
import { BiddingContractTypes } from '../../enums';
import { MasterDataCountryEnum } from '../../../../../../../../core/models';

const mockBiddingContractTypes = [
  { id: 1, name: 'ENUM.CONTRACT_TYPE.WORKS' },
  { id: 2, name: 'ENUM.CONTRACT_TYPE.GOODS' },
  { id: 3, name: 'ENUM.CONTRACT_TYPE.SERVICES' },
  { id: 4, name: 'ENUM.CONTRACT_TYPE.OTHER' },
];

const mockConflictResolutionMethods = [
  { id: 1, name: 'ENUM.CONFLICT.ARBITRATION' },
  { id: 2, name: 'ENUM.CONFLICT.MEDIATION' },
  { id: 3, name: 'ENUM.CONFLICT.LITIGATION' },
];

const mockMemberCountries: MasterDataCountryEnum[] = [
  {
    id: 1,
    translatedName: 'ENUM.COUNTRY.AR',
    code: 'AR',
    isActive: true,
    isBeneficiary: true,
    isMember: true,
    name: { en: '', es: '', fr: '', pt: '' },
  },
  {
    id: 2,
    translatedName: 'ENUM.COUNTRY.BR',
    code: 'BR',
    isActive: true,
    isBeneficiary: true,
    isMember: true,
    name: { en: '', es: '', fr: '', pt: '' },
  },
  {
    id: 3,
    translatedName: 'ENUM.COUNTRY.CO',
    code: 'CO',
    isActive: true,
    isBeneficiary: true,
    isMember: true,
    name: { en: '', es: '', fr: '', pt: '' },
  },
];

const initialState = {
  enums: {
    biddingContractTypes: mockBiddingContractTypes,
    biddingContractConflictResolutionMethods: mockConflictResolutionMethods,
    memberCountries: mockMemberCountries,
  },
  preferences: {
    preferences: {
      defaultLanguage: 'en',
      preferredLanguage: 'en',
      projects: [],
      procurementPreferences: [],
    },
    loaded: true,
    loading: false,
    error: null,
  },
};

async function setup(
  componentProperties: Partial<RContractsGeneralInfoComponent> = {}
) {
  const isGoods = componentProperties.isGoods ?? false;
  const defaultForm = defaultContractGeneralInfo(isGoods, false);

  const { fixture } = await render(RContractsGeneralInfoComponent, {
    declarations: [],
    imports: [
      CommonModule,
      ReactiveFormsModule,
      MatFormFieldModule,
      MatInputModule,
      MatSelectModule,
      MatRadioModule,
      MatIconModule,
      BrowserAnimationsModule,
      TranslateTestingModule.withTranslations('en', {
        'EX.R_CONTRACTS.GENERAL_INFO.TITLE': 'General Information',
        'CONTRACT.GENERAL_INFO.CONTRACT_NAME': 'Contract Name',
        'CONTRACT.GENERAL_INFO.CONTRACT_OBJECTIVE': 'Contract Objective',
        'CONTRACT.GENERAL_INFO.CONTRACT_SIGN_DATE': 'Signature Date',
        'CONTRACT.GENERAL_INFO.START_DATE': 'Start Date',
        'CONTRACT.GENERAL_INFO.END_DATE': 'End Date',
        'CONTRACT.GENERAL_INFO.CONTROL_NUMBER': 'Control Number',
        'CONTRACT.GENERAL_INFO.TYPE_OF_CONTRACT': 'Type of Contract',
        'CONTRACT.GENERAL_INFO.ADVANCE_PAYMENT': 'Advance Payment',
        'CONTRACT.GENERAL_INFO.YES': 'Yes',
        'CONTRACT.GENERAL_INFO.NO': 'No',
        'CONTRACT.GENERAL_INFO.CONFLICT_RESOLUTION_METHOD':
          'Conflict Resolution Method',
        'CONTRACT.GENERAL_INFO.APPLICABLE_LAW': 'Applicable Law',
        'CONTRACT.GENERAL_INFO.GOODS_SOURCE': 'Goods Source',
        'ENUM.CONTRACT_TYPE.WORKS': 'Works',
        'ENUM.CONTRACT_TYPE.GOODS': 'Goods',
        'ENUM.CONTRACT_TYPE.SERVICES': 'Services',
        'ENUM.CONTRACT_TYPE.OTHER': 'Other',
        'ENUM.CONFLICT.ARBITRATION': 'Arbitration',
        'ENUM.CONFLICT.MEDIATION': 'Mediation',
        'ENUM.CONFLICT.LITIGATION': 'Litigation',
        'ENUM.COUNTRY.AR': 'Argentina',
        'ENUM.COUNTRY.BR': 'Brazil',
        'ENUM.COUNTRY.CO': 'Colombia',
      }).withDefaultLanguage('en'),
      MatDateComponent,
    ],
    schemas: [NO_ERRORS_SCHEMA],
    providers: [
      FormBuilder,
      provideMockStore({
        initialState,
      }),
    ],
    componentProperties: {
      biddingContractConflictResolutionMethods: mockConflictResolutionMethods,
      biddingContractTypes: mockBiddingContractTypes,
      countries: mockMemberCountries,
      form: defaultForm,
      isGoods: false,
      ...componentProperties,
    },
  });

  const component = fixture.componentInstance;

  return {
    fixture,
    component,
  };
}

describe('RContractsGeneralInfoComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe.each([
    { isGoods: true, description: 'when isGoods is true' },
    { isGoods: false, description: 'when isGoods is false' },
  ])('$description', ({ isGoods }) => {
    it('should create', async () => {
      const { component } = await setup({ isGoods });
      expect(component).toBeTruthy();
    });
  });

  describe.each([
    { isGoods: true, description: 'when isGoods is true' },
    { isGoods: false, description: 'when isGoods is false' },
  ])('Input properties - $description', ({ isGoods }) => {
    it('should have biddingContractTypes input', async () => {
      const { component } = await setup({ isGoods });

      expect(component.biddingContractTypes).toEqual(mockBiddingContractTypes);
      expect(component.biddingContractTypes.length).toBe(4);
    });

    it('should have biddingContractConflictResolutionMethods input', async () => {
      const { component } = await setup({ isGoods });

      expect(component.biddingContractConflictResolutionMethods).toEqual(
        mockConflictResolutionMethods
      );
      expect(component.biddingContractConflictResolutionMethods.length).toBe(3);
    });

    it('should have memberCountries input', async () => {
      const { component } = await setup({ isGoods });

      expect(component.sortedCountries).toEqual(mockMemberCountries);
      expect(component.sortedCountries.length).toBe(3);
    });

    it('should have form input with default values', async () => {
      const { component } = await setup({ isGoods });

      expect(component.form).toBeDefined();
      expect(component.form.controls.contractName).toBeDefined();
      expect(component.form.controls.contractObjective).toBeDefined();
      expect(component.form.controls.signatureDate).toBeDefined();
      expect(component.form.controls.startDate).toBeDefined();
      expect(component.form.controls.endDate).toBeDefined();
    });

    it('should accept custom contractType', async () => {
      const customType = 2;
      const { component } = await setup({ contractType: customType, isGoods });

      expect(component.contractType).toBe(customType);
    });

    it('should accept custom conflictResolution', async () => {
      const customResolution = 1;
      const { component } = await setup({
        conflictResolution: customResolution,
        isGoods,
      });

      expect(component.conflictResolution).toBe(customResolution);
    });

    it('should accept custom goodsOrigin', async () => {
      const customOrigin = 3;
      const { component } = await setup({ goodsOrigin: customOrigin, isGoods });

      expect(component.goodsOrigin).toBe(customOrigin);
    });

    it('should have isGoods property set correctly', async () => {
      const { component } = await setup({ isGoods });

      expect(component.isGoods).toBe(isGoods);
    });
  });

  describe('Form structure', () => {
    describe.each([
      { isGoods: true, description: 'when isGoods is true' },
      { isGoods: false, description: 'when isGoods is false' },
    ])('$description', ({ isGoods }) => {
      it('should have all required form controls', async () => {
        const { component } = await setup({ isGoods });

        expect(component.form.controls.contractName).toBeDefined();
        expect(component.form.controls.contractObjective).toBeDefined();
        expect(component.form.controls.signatureDate).toBeDefined();
        expect(component.form.controls.startDate).toBeDefined();
        expect(component.form.controls.endDate).toBeDefined();
        expect(component.form.controls.internalControlNumber).toBeDefined();
        expect(component.form.controls.contractType).toBeDefined();
        expect(component.form.controls.hasAdvancePayment).toBeDefined();
        expect(component.form.controls.conflictResolutionMethod).toBeDefined();
        expect(component.form.controls.applicableLaw).toBeDefined();
      });
    });

    it('should have goodsSource control when isGoods is true', async () => {
      const { component } = await setup({ isGoods: true });

      expect(component.form.controls.goodsSource).toBeDefined();
    });

    it('should have justification control when isGoods is true', async () => {
      const { component } = await setup({ isGoods: true });

      expect(component.form.controls.justification).toBeDefined();
    });
  });

  describe('Component rendering', () => {
    describe.each([
      { isGoods: true, description: 'when isGoods is true' },
      { isGoods: false, description: 'when isGoods is false' },
    ])('Common fields - $description', ({ isGoods }) => {
      it('should render the title banner', async () => {
        await setup({ isGoods });

        expect(screen.getByText('General Information')).toBeInTheDocument();
      });

      it('should render contract name input', async () => {
        await setup({ isGoods });

        expect(screen.getByText('Contract Name')).toBeInTheDocument();
      });

      it('should render contract objective textarea', async () => {
        await setup({ isGoods });

        expect(screen.getByText('Contract Objective')).toBeInTheDocument();
      });

      it('should render control number input', async () => {
        await setup({ isGoods });

        expect(screen.getByText('Control Number')).toBeInTheDocument();
      });

      it('should render type of contract select', async () => {
        await setup({ isGoods });

        expect(screen.getByText('Type of Contract')).toBeInTheDocument();
      });

      it('should render advance payment radio group', async () => {
        await setup({ isGoods });

        expect(screen.getByText('Advance Payment')).toBeInTheDocument();
        const yesButtons = screen.getAllByText('Yes');
        const noButtons = screen.getAllByText('No');
        expect(yesButtons.length).toBeGreaterThan(0);
        expect(noButtons.length).toBeGreaterThan(0);
      });

      it('should render conflict resolution method select', async () => {
        await setup({ isGoods });

        expect(
          screen.getByText('Conflict Resolution Method')
        ).toBeInTheDocument();
      });

      it('should render applicable law input', async () => {
        await setup({ isGoods });

        expect(screen.getByText('Applicable Law')).toBeInTheDocument();
      });
    });

    it('should render goods source select when isGoods is true', async () => {
      await setup({ isGoods: true });

      // Esperar a que el componente se renderice completamente
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(screen.getByText('Goods Source')).toBeInTheDocument();
    });

    it('should not render goods source select when isGoods is false', async () => {
      await setup({ isGoods: false });

      expect(screen.queryByText('Goods Source')).not.toBeInTheDocument();
    });
  });

  describe.each([
    { isGoods: true, description: 'when isGoods is true' },
    { isGoods: false, description: 'when isGoods is false' },
  ])('Form validation and interaction - $description', ({ isGoods }) => {
    it('should update form value when contract name changes', async () => {
      const { component, fixture } = await setup({ isGoods });

      const testValue = 'New Contract Name';
      component.form.controls.contractName.setValue(testValue);
      fixture.detectChanges();

      expect(component.form.controls.contractName.value).toBe(testValue);
    });

    it('should update form value when contract objective changes', async () => {
      const { component, fixture } = await setup({ isGoods });

      const testValue = 'Test contract objective';
      component.form.controls.contractObjective.setValue(testValue);
      fixture.detectChanges();

      expect(component.form.controls.contractObjective.value).toBe(testValue);
    });

    it('should update form value when has advance payment changes', async () => {
      const { component, fixture } = await setup({ isGoods });

      component.form.controls.hasAdvancePayment.setValue(true);
      fixture.detectChanges();

      expect(component.form.controls.hasAdvancePayment.value).toBe(true);
    });
  });

  describe.each([
    { isGoods: true, description: 'when isGoods is true' },
    { isGoods: false, description: 'when isGoods is false' },
  ])('Form state - $description', ({ isGoods }) => {
    it('should be able to reset form', async () => {
      const { component, fixture } = await setup({ isGoods });

      component.form.controls.contractName.setValue('Test Contract');
      component.form.controls.contractObjective.setValue('Test Objective');
      fixture.detectChanges();

      component.form.reset();
      fixture.detectChanges();

      expect(component.form.controls.contractName.value).toBeNull();
      expect(component.form.controls.contractObjective.value).toBeNull();
    });
  });

  describe('Component initialization', () => {
    it('should work with custom form', async () => {
      const fb = new FormBuilder();
      const customForm = fb.group({
        contractName: ['Custom Contract'],
        contractObjective: ['Custom Objective'],
        signatureDate: [null],
        startDate: [null],
        endDate: [null],
        internalControlNumber: [''],
        contractType: [null],
        hasAdvancePayment: [false],
        conflictResolutionMethod: [null],
        applicableLaw: [''],
        goodsSource: [null],
        justification: [''],
      });

      const { component } = await setup({ form: customForm as any });

      expect(component.form.controls.contractName.value).toBe(
        'Custom Contract'
      );
      expect(component.form.controls.contractObjective.value).toBe(
        'Custom Objective'
      );
    });
  });

  describe.each([
    { isGoods: true, description: 'when isGoods is true' },
    { isGoods: false, description: 'when isGoods is false' },
  ])('Radio button groups - $description', ({ isGoods }) => {
    it('should have radio buttons for advance payment', async () => {
      await setup({ isGoods });

      const radioGroup = document.querySelector(
        'mat-radio-group[formControlName="hasAdvancePayment"]'
      );
      expect(radioGroup).toBeInTheDocument();
    });

    it('should render advance payment radio group with correct aria label', async () => {
      await setup({ isGoods });

      const advancePaymentLabel = document.querySelector(
        '#contrato-anticipo-label'
      );
      expect(advancePaymentLabel).toBeInTheDocument();
    });
  });

  describe.each([
    { isGoods: true, description: 'when isGoods is true' },
    { isGoods: false, description: 'when isGoods is false' },
  ])('Select dropdowns - $description', ({ isGoods }) => {
    it('should render contract types in select dropdown', async () => {
      const { component } = await setup({ isGoods });

      expect(component.biddingContractTypes.length).toBe(4);
      component.biddingContractTypes.forEach((type) => {
        expect(type).toHaveProperty('id');
        expect(type).toHaveProperty('name');
      });
    });

    it('should render conflict resolution methods in select dropdown', async () => {
      const { component } = await setup({ isGoods });

      expect(component.biddingContractConflictResolutionMethods.length).toBe(3);
      component.biddingContractConflictResolutionMethods.forEach((method) => {
        expect(method).toHaveProperty('id');
        expect(method).toHaveProperty('name');
      });
    });

    it('should render member countries in select dropdown', async () => {
      const { component } = await setup({ isGoods });

      expect(component.sortedCountries.length).toBe(3);
      component.sortedCountries.forEach((country) => {
        expect(country).toHaveProperty('id');
        expect(country).toHaveProperty('name');
      });
    });
  });

  describe('ngOnInit lifecycle', () => {
    describe.each([
      { isGoods: true, description: 'when isGoods is true' },
      { isGoods: false, description: 'when isGoods is false' },
    ])('Date validations - $description', ({ isGoods }) => {
      it('should set up date validation subscriptions', async () => {
        const { component, fixture } = await setup({ isGoods });

        const updateSpy = jest.spyOn(
          component.form.controls.startDate,
          'updateValueAndValidity'
        );

        component.form.controls.signatureDate?.setValue(
          new Date().toISOString()
        );
        fixture.detectChanges();

        expect(updateSpy).toHaveBeenCalled();
      });

      it('should set up start date to end date validation', async () => {
        const { component, fixture } = await setup({ isGoods });

        const updateSpy = jest.spyOn(
          component.form.controls.endDate,
          'updateValueAndValidity'
        );

        component.form.controls.startDate.setValue(new Date().toISOString());
        fixture.detectChanges();

        expect(updateSpy).toHaveBeenCalled();
      });
    });

    it('should clear justification validators when contract type is not OTHER', async () => {
      const { component, fixture } = await setup({ isGoods: true });

      // Esperar a que ngOnInit complete
      await fixture.whenStable();

      component.form.controls.contractType.setValue(BiddingContractTypes.OTHER);
      fixture.detectChanges();

      component.form.controls.contractType.setValue(1);
      fixture.detectChanges();

      expect(
        component.form.controls.justification?.hasValidator(Validators.required)
      ).toBe(false);
    });
  });

  describe.each([
    { isGoods: true, description: 'when isGoods is true' },
    { isGoods: false, description: 'when isGoods is false' },
  ])('ngOnDestroy lifecycle - $description', ({ isGoods }) => {
    it('should complete destroy$ subject on destroy', async () => {
      const { component } = await setup({ isGoods });

      const nextSpy = jest.spyOn(component['destroy$'], 'next');
      const completeSpy = jest.spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });

  describe('Conditional rendering for goods', () => {
    it('should not render justification field when isGoods is false', async () => {
      const { fixture } = await setup({ isGoods: false });
      await fixture.whenStable();
      fixture.detectChanges();

      const justificationField = screen.queryByText('Justification');
      expect(justificationField).not.toBeInTheDocument();
    });

    it('should not render justification field when contractTypeOther is false', async () => {
      const { component, fixture } = await setup({ isGoods: true });

      // Esperar a que el componente se inicialice
      await fixture.whenStable();

      component.form.controls.contractType.setValue(1);
      fixture.detectChanges();

      // Esperar a que el DOM se actualice
      await fixture.whenStable();

      const justificationField = screen.queryByText('Justification');
      expect(justificationField).not.toBeInTheDocument();
    });
  });

  describe.each([
    { isGoods: true, description: 'when isGoods is true' },
    { isGoods: false, description: 'when isGoods is false' },
  ])('maxDate property - $description', ({ isGoods }) => {
    it('should initialize maxDate as current date', async () => {
      const { component } = await setup({ isGoods });

      expect(component.maxDate).toBeInstanceOf(Date);
      expect(component.maxDate.getTime()).toBeLessThanOrEqual(
        new Date().getTime()
      );
    });
  });
});
