import { RContractsFeesComponent } from './r-contracts-fees.component';
import { render } from '@testing-library/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Currency } from '@core/models';

describe('RContractsFeesComponent', () => {
  const mockCurrencies: Currency[] = [
    { currency: 'USD', isBorrowing: true, isHard: true, numberOfDecimals: 0 },
    { currency: 'EUR', isBorrowing: false, isHard: true, numberOfDecimals: 0 },
    { currency: 'GBP', isBorrowing: false, isHard: false, numberOfDecimals: 0 },
  ];

  const mockCurrenciesList = [
    { currency: 'USD', total: 10000 },
    { currency: 'EUR', total: 5000 },
  ];

  const translations = {
    'R.CONTRACT.FEES.TITLE': 'Fees Title',
    'R.CONTRACT.FEES.PROFESSIONAL_FEES': 'Professional Fees',
    'R.CONTRACT.VALIDATION.FEES.TITLE': 'Validation Title',
    'R.CONTRACT.FEES.CONCEPT': 'Concept',
    'R.CONTRACT.FEES.CONCEPT_PLACEHOLDER': 'Enter concept',
    'R.CONTRACT.FEES.HOURS': 'Hours',
    'R.CONTRACT.FEES.CURRENCY': 'Currency',
    'R.CONTRACT.FEES.SUBTOTAL': 'Subtotal',
    'R.CONTRACT.FEES.UNIT_COST': 'Unit Cost',
    'R.CONTRACT.FEES.UNIT_COST_PLACEHOLDER': 'Calculated',
    'R.CONTRACT.FEES.DELETE_FEE': 'Delete Fee',
    'R.CONTRACT.FEES.TOTAL_LABEL': 'Total',
    'R.CONTRACT.FEES.ADD_FEE': 'Add Fee',
    'R.CONTRACT.VALIDATION.FEES.OVER': 'Over',
    'R.CONTRACT.VALIDATION.FEES.UNDER': 'Under',
    'R.CONTRACT.VALIDATION.FEES.CURRENCY_MISMATCH': 'Currency mismatch',
    'R.CONTRACT.VALIDATION.FEES.UNEXPECTED_CURRENCY': 'Unexpected currency',
    'R.CONTRACT.VALIDATION.LOTS.INVALID_CURRENCY': 'Invalid currency',
    'BIDDER.REQUIRED': 'Required',
  };

  function createTranslateServiceMock() {
    return {
      instant: jest.fn((key: string) => translations[key] || key),
      get: jest.fn((key: string | string[]) => {
        if (Array.isArray(key)) {
          const result = {};
          key.forEach((k) => (result[k] = translations[k] || k));
          return of(result);
        }
        return of(translations[key] || key);
      }),
      onLangChange: of({ lang: 'en', translations }),
      onTranslationChange: of({ lang: 'en', translations }),
      onDefaultLangChange: of({ lang: 'en', translations }),
      setDefaultLang: jest.fn(),
      use: jest.fn().mockReturnValue(of(translations)),
      currentLang: 'en',
      defaultLang: 'en',
    };
  }

  async function setup(
    showFees: boolean = true,
    currenciesList: { currency: string; total: number }[] = mockCurrenciesList
  ) {
    const fb = new FormBuilder();
    const form = fb.group({
      fees: fb.array([]),
    });

    const translateServiceMock = createTranslateServiceMock();

    const { fixture } = await render(RContractsFeesComponent, {
      componentProperties: {
        form: form as any,
        allCurrencies$: of(mockCurrencies),
        currenciesList: currenciesList,
        showFees: showFees,
      },
      providers: [
        FormBuilder,
        { provide: TranslateService, useValue: translateServiceMock },
      ],
      imports: [ReactiveFormsModule, TranslateModule.forRoot()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    });

    const component = fixture.componentInstance;
    fixture.detectChanges();

    return {
      component,
      fixture,
      translateServiceMock,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should add a new fee when addFee is called', async () => {
    const { component } = await setup();
    const initialLength = component.feesArray.length;

    component.addFee();

    expect(component.feesArray.length).toBe(initialLength + 1);
  });

  it('should remove a fee when removeFee is called', async () => {
    const { component } = await setup();

    component.addFee();
    component.addFee();
    const lengthBeforeRemove = component.feesArray.length;

    component.removeFee(0);

    expect(component.feesArray.length).toBe(lengthBeforeRemove - 1);
  });

  it('should calculate unit cost correctly', async () => {
    const { component } = await setup();

    component.addFee();
    const feeControl = component.feesArray.at(0);

    feeControl.controls.hours.setValue(10);
    feeControl.controls.subtotal.setValue(1000);
    component['calculateUnitCosts']();

    expect(feeControl.controls.usdEquivalent.value).toBe(100);
  });

  it('should calculate unit cost as 0 when hours is 0', async () => {
    const { component } = await setup();

    component.addFee();
    const feeControl = component.feesArray.at(0);

    feeControl.controls.hours.setValue(0);
    feeControl.controls.subtotal.setValue(1000);
    component['calculateUnitCosts']();

    expect(feeControl.controls.usdEquivalent.value).toBe(0);
  });

  it('should calculate unit cost as 0 when subtotal is 0', async () => {
    const { component } = await setup();

    component.addFee();
    const feeControl = component.feesArray.at(0);

    feeControl.controls.hours.setValue(10);
    feeControl.controls.subtotal.setValue(0);
    component['calculateUnitCosts']();

    expect(feeControl.controls.usdEquivalent.value).toBe(0);
  });

  it('should calculate total cost correctly', async () => {
    const { component } = await setup();

    component.addFee();
    component.addFee();

    component.feesArray.at(0).controls.subtotal.setValue(1000);
    component.feesArray.at(1).controls.subtotal.setValue(2000);

    component.syncSignalsWithForm();

    expect(component.totalCost()).toBe(3000);
  });

  it('should format number correctly', async () => {
    const { component } = await setup();

    const formatted = component.formatNumber(1234.5);

    expect(formatted).toBe('1,234.50');
  });

  it('should validate currency totals and show no errors when totals match', async () => {
    const { component } = await setup();

    component.addFee();
    component.addFee();

    component.feesArray.at(0).controls.currency.setValue('USD');
    component.feesArray.at(0).controls.subtotal.setValue(10000);

    component.feesArray.at(1).controls.currency.setValue('EUR');
    component.feesArray.at(1).controls.subtotal.setValue(5000);

    component['validateCurrencyTotals']();

    expect(component.validationErrors().length).toBe(0);
  });

  it('should show error when currency total is over expected', async () => {
    const { component } = await setup();

    component.addFee();
    component.feesArray.at(0).controls.currency.setValue('USD');
    component.feesArray.at(0).controls.subtotal.setValue(12000);

    component['validateCurrencyTotals']();

    expect(component.validationErrors().length).toBeGreaterThan(0);
    expect(component.validationErrors()[0].params?.status).toBe('Over');
  });

  it('should show error when currency total is under expected', async () => {
    const { component } = await setup();

    component.addFee();
    component.feesArray.at(0).controls.currency.setValue('USD');
    component.feesArray.at(0).controls.subtotal.setValue(8000);

    component['validateCurrencyTotals']();

    expect(component.validationErrors().length).toBeGreaterThan(0);
    expect(component.validationErrors()[0].params?.status).toBe('Under');
  });

  it('should show error for unexpected currency', async () => {
    const { component } = await setup();

    component.addFee();
    component.feesArray.at(0).controls.currency.setValue('GBP');
    component.feesArray.at(0).controls.subtotal.setValue(5000);

    component['validateCurrencyTotals']();

    expect(component.validationErrors().length).toBeGreaterThan(0);
    expect(
      component
        .validationErrors()
        .some((e) => e.translationKey.includes('UNEXPECTED_CURRENCY'))
    ).toBe(true);
  });

  it('should not show errors when no fees exist', async () => {
    const { component } = await setup();

    component['validateCurrencyTotals']();

    expect(component.validationErrors().length).toBe(0);
  });

  it('should not show errors when currenciesList is empty', async () => {
    const { component } = await setup(true, []);

    component.addFee();
    component.feesArray.at(0).controls.currency.setValue('USD');
    component.feesArray.at(0).controls.subtotal.setValue(5000);

    component['validateCurrencyTotals']();

    expect(component.validationErrors().length).toBe(0);
  });

  it('should sync signals with form values', async () => {
    const { component } = await setup();

    component.addFee();
    const feeControl = component.feesArray.at(0);

    feeControl.controls.concept.setValue('Test Concept');
    feeControl.controls.hours.setValue(10);
    feeControl.controls.currency.setValue('USD');
    feeControl.controls.subtotal.setValue(1000);

    component.syncSignalsWithForm();

    const feesData = component['feesData']();
    expect(feesData[0].concept).toBe('Test Concept');
    expect(feesData[0].hours).toBe(10);
    expect(feesData[0].currency).toBe('USD');
    expect(feesData[0].subtotal).toBe(1000);
  });

  it('should subscribe to feesArray valueChanges on init', async () => {
    const { component } = await setup();

    component.addFee();
    const feeControl = component.feesArray.at(0);

    const calculateSpy = jest.spyOn(component as any, 'calculateUnitCosts');
    const validateSpy = jest.spyOn(component as any, 'validateCurrencyTotals');
    const syncSpy = jest.spyOn(component, 'syncSignalsWithForm');

    feeControl.controls.hours.setValue(5);

    expect(calculateSpy).toHaveBeenCalled();
    expect(validateSpy).toHaveBeenCalled();
    expect(syncSpy).toHaveBeenCalled();
  });

  it('should unsubscribe on destroy', async () => {
    const { component } = await setup();

    const unsubscribeSpy = jest.spyOn(
      component['subscriptions'],
      'unsubscribe'
    );

    component.ngOnDestroy();

    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  it('should round unit cost to 2 decimals', async () => {
    const { component } = await setup();

    component.addFee();
    const feeControl = component.feesArray.at(0);

    feeControl.controls.hours.setValue(3);
    feeControl.controls.subtotal.setValue(100);
    component['calculateUnitCosts']();

    expect(feeControl.controls.usdEquivalent.value).toBe(33.33);
  });

  it('should handle precision issues in currency validation', async () => {
    const { component } = await setup();

    component.addFee();
    component.feesArray.at(0).controls.currency.setValue('USD');
    component.feesArray.at(0).controls.subtotal.setValue(10000.005);

    component['validateCurrencyTotals']();

    expect(component.validationErrors().length).toBeGreaterThan(0);
  });

  it('should handle empty concept gracefully in syncSignalsWithForm', async () => {
    const { component } = await setup();

    component.addFee();
    const feeControl = component.feesArray.at(0);
    feeControl.controls.concept.setValue(null);

    component.syncSignalsWithForm();

    const feesData = component['feesData']();
    expect(feesData[0].concept).toBe('');
  });
});
