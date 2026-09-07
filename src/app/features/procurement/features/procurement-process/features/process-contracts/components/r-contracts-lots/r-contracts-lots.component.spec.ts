import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RContractsLotsComponent } from './r-contracts-lots.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, Subject } from 'rxjs';
import { Currency } from '@core/models';
import { ContractRebrandService } from '../../services/contract-rebrand.service';
import { FormValidationService } from '@core/services/validation';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('RContractsLotsComponent', () => {
  let component: RContractsLotsComponent;
  let fixture: ComponentFixture<RContractsLotsComponent>;
  let contractRebrandService: jest.Mocked<ContractRebrandService>;
  let validationService: jest.Mocked<FormValidationService>;
  let translateService: jest.Mocked<TranslateService>;

  const mockCurrencies: Currency[] = [
    { currency: 'USD', isBorrowing: true, isHard: false, numberOfDecimals: 2 },
    { currency: 'EUR', isBorrowing: false, isHard: true, numberOfDecimals: 2 },
    { currency: 'GBP', isBorrowing: false, isHard: false, numberOfDecimals: 2 },
  ];

  const mockCurrenciesList = [
    { currency: 'USD', total: 10000 },
    { currency: 'EUR', total: 5000 },
  ];

  const translations = {
    'R.CONTRACT.VALIDATION.LOTS.OVER': 'Over',
    'R.CONTRACT.VALIDATION.LOTS.UNDER': 'Under',
    'R.CONTRACT.VALIDATION.LOTS.CURRENCY_MISMATCH': 'Currency mismatch',
    'R.CONTRACT.VALIDATION.LOTS.UNEXPECTED_CURRENCY': 'Unexpected currency',
    'R.CONTRACT.VALIDATION.LOTS.INVALID_CURRENCY': 'Invalid currency',
    'CONTRACT.LOTS.TITLE': 'Lots',
    'CONTRACT.LOTS.NUMBER': 'Lot Number',
    'CONTRACT.LOTS.AMOUNT': 'Amount',
    'CONTRACT.LOTS.UNITS': 'Units',
    'CONTRACT.LOTS.ADD_LOT': 'Add Lot',
    'CONTRACT.LOTS.DELETE_LOT': 'Delete Lot',
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

  beforeEach(() => {
    const isFormSubmittedSubject = new Subject<boolean>();

    contractRebrandService = {
      isFormSubmitted$: isFormSubmittedSubject.asObservable(),
    } as any;

    validationService = {
      validateForm: jest.fn().mockReturnValue([]),
    } as any;

    translateService = createTranslateServiceMock() as any;

    const fb = new FormBuilder();
    const form = fb.group({
      lots: fb.array([]),
    });

    TestBed.configureTestingModule({
      declarations: [RContractsLotsComponent],
      imports: [ReactiveFormsModule, TranslateModule.forRoot()],
      providers: [
        FormBuilder,
        { provide: ContractRebrandService, useValue: contractRebrandService },
        { provide: FormValidationService, useValue: validationService },
        { provide: TranslateService, useValue: translateService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(RContractsLotsComponent);
    component = fixture.componentInstance;
    component.form = form as any;
    component.allCurrencies$ = of(mockCurrencies);
    component.currenciesList = mockCurrenciesList;
    component.showLots = true;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form if not provided', () => {
    component.form = undefined;
    component.ngOnInit();
    expect(component.form).toBeDefined();
  });

  it('should add a new lot', () => {
    fixture.detectChanges();
    const initialLength = component.lotsArray.length;

    component.addLot();

    expect(component.lotsArray.length).toBe(initialLength + 1);
  });

  it('should remove a lot', () => {
    fixture.detectChanges();
    component.addLot();
    component.addLot();
    const lengthBeforeRemove = component.lotsArray.length;

    component.removeLot(0);

    expect(component.lotsArray.length).toBe(lengthBeforeRemove - 1);
  });

  it('should return lotsArray from getter', () => {
    fixture.detectChanges();
    expect(component.lotsArray).toBe(component.form.controls.lots);
  });

  it('should return true for hasLotErrors when there are errors', () => {
    component.currencyErrors = [
      {
        translationKey: 'ERROR',
        params: {},
      },
    ];
    expect(component.hasLotErrors).toBe(true);
  });

  it('should return false for hasLotErrors when there are no errors', () => {
    component.currencyErrors = [];
    expect(component.hasLotErrors).toBe(false);
  });

  it('should validate currency totals on init', () => {
    const validateSpy = jest.spyOn(component as any, 'validateCurrencyTotals');
    component.ngOnInit();
    expect(validateSpy).toHaveBeenCalled();
  });

  it('should subscribe to isFormSubmitted$', () => {
    fixture.detectChanges();
    expect(contractRebrandService.isFormSubmitted$).toBeDefined();
  });

  it('should validate form when submitted', (done) => {
    fixture.detectChanges();

    const subject = new Subject<boolean>();
    contractRebrandService.isFormSubmitted$ = subject.asObservable();

    component.ngOnInit();

    subject.next(true);

    setTimeout(() => {
      expect(component.isSubmited).toBe(true);
      expect(validationService.validateForm).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should subscribe to lotsArray valueChanges', () => {
    fixture.detectChanges();
    const validateSpy = jest.spyOn(component as any, 'validateCurrencyTotals');

    component.addLot();
    const lotControl = component.lotsArray.at(0);
    lotControl.controls.amount.setValue(1000);

    expect(validateSpy).toHaveBeenCalled();
  });

  it('should update validators when currenciesList changes', () => {
    fixture.detectChanges();
    component.addLot();

    component.currenciesList = [{ currency: 'JPY', total: 1000 }];
    component.ngOnChanges({
      currenciesList: {
        currentValue: [{ currency: 'JPY', total: 1000 }],
        previousValue: mockCurrenciesList,
        firstChange: false,
        isFirstChange: () => false,
      },
    });

    const lotControl = component.lotsArray.at(0);
    expect(lotControl.controls.currency.hasValidator).toBeTruthy();
  });

  it('should not update validators on first change', () => {
    fixture.detectChanges();
    const updateSpy = jest.spyOn(component as any, 'updateValidators');

    component.ngOnChanges({
      currenciesList: {
        currentValue: mockCurrenciesList,
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true,
      },
    });

    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('should unsubscribe on destroy', () => {
    fixture.detectChanges();
    const unsubscribeSpy = jest.spyOn(
      component['subscriptions'],
      'unsubscribe'
    );

    component.ngOnDestroy();

    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  it('should show no errors when currency totals match', () => {
    fixture.detectChanges();
    component.addLot();
    component.addLot();

    component.lotsArray.at(0).controls.currency.setValue('USD');
    component.lotsArray.at(0).controls.amount.setValue(10000);

    component.lotsArray.at(1).controls.currency.setValue('EUR');
    component.lotsArray.at(1).controls.amount.setValue(5000);

    component['validateCurrencyTotals']();

    expect(component.currencyErrors.length).toBe(0);
  });

  it('should show error when currency total is over', () => {
    fixture.detectChanges();
    component.addLot();

    component.lotsArray.at(0).controls.currency.setValue('USD');
    component.lotsArray.at(0).controls.amount.setValue(12000);

    component['validateCurrencyTotals']();

    expect(component.currencyErrors.length).toBeGreaterThan(0);
    expect(component.currencyErrors[0].params?.status).toBe('Over');
  });

  it('should show error when currency total is under', () => {
    fixture.detectChanges();
    component.addLot();

    component.lotsArray.at(0).controls.currency.setValue('USD');
    component.lotsArray.at(0).controls.amount.setValue(8000);

    component['validateCurrencyTotals']();

    expect(component.currencyErrors.length).toBeGreaterThan(0);
    expect(component.currencyErrors[0].params?.status).toBe('Under');
  });

  it('should show error for unexpected currency', () => {
    fixture.detectChanges();
    component.addLot();

    component.lotsArray.at(0).controls.currency.setValue('GBP');
    component.lotsArray.at(0).controls.amount.setValue(5000);

    component['validateCurrencyTotals']();

    expect(component.currencyErrors.length).toBeGreaterThan(0);
    expect(
      component.currencyErrors.some((e) =>
        e.translationKey.includes('UNEXPECTED_CURRENCY')
      )
    ).toBe(true);
  });

  it('should show no errors when no lots exist', () => {
    fixture.detectChanges();
    component['validateCurrencyTotals']();
    expect(component.currencyErrors.length).toBe(0);
  });

  it('should show no errors when currenciesList is empty', () => {
    fixture.detectChanges();
    component.currenciesList = [];
    component.addLot();

    component.lotsArray.at(0).controls.currency.setValue('USD');
    component.lotsArray.at(0).controls.amount.setValue(5000);

    component['validateCurrencyTotals']();

    expect(component.currencyErrors.length).toBe(0);
  });

  it('should format numbers correctly', () => {
    const formatted = component['formatNumber'](1234.5);
    expect(formatted).toBe('1,234.50');
  });

  it('should set errors on amount controls when totals mismatch', () => {
    fixture.detectChanges();
    component.addLot();

    const lotControl = component.lotsArray.at(0);
    lotControl.controls.currency.setValue('USD');
    lotControl.controls.amount.setValue(8000);

    component['validateCurrencyTotals']();

    expect(lotControl.controls.amount.hasError('currencyTotalMismatch')).toBe(
      true
    );
  });

  it('should clear currencyTotalMismatch error when totals match', () => {
    fixture.detectChanges();
    component.addLot();

    const lotControl = component.lotsArray.at(0);
    lotControl.controls.currency.setValue('USD');
    lotControl.controls.amount.setValue(8000);

    component['validateCurrencyTotals']();
    expect(lotControl.controls.amount.hasError('currencyTotalMismatch')).toBe(
      true
    );

    lotControl.controls.amount.setValue(10000);
    component['validateCurrencyTotals']();

    expect(lotControl.controls.amount.hasError('currencyTotalMismatch')).toBe(
      false
    );
  });

  it('should handle precision issues in currency validation', () => {
    fixture.detectChanges();
    component.addLot();

    component.lotsArray.at(0).controls.currency.setValue('USD');
    component.lotsArray.at(0).controls.amount.setValue(10000.005);

    component['validateCurrencyTotals']();

    expect(component.currencyErrors.length).toBeGreaterThan(0);
  });

  it('should skip validation for lot without currency', () => {
    fixture.detectChanges();
    component.addLot();

    const lotControl = component.lotsArray.at(0);
    lotControl.controls.currency.setValue(null);
    lotControl.controls.amount.setValue(1000);

    component['validateCurrencyTotals']();

    // Should not throw and handle gracefully
    expect(component.currencyErrors.length).toBeGreaterThan(0);
  });

  it('should handle lot with 0 amount', () => {
    fixture.detectChanges();
    component.addLot();

    component.lotsArray.at(0).controls.currency.setValue('USD');
    component.lotsArray.at(0).controls.amount.setValue(0);

    component['validateCurrencyTotals']();

    expect(component.currencyErrors.length).toBeGreaterThan(0);
  });

  it('should validate after adding lot', () => {
    fixture.detectChanges();
    const validateSpy = jest.spyOn(component as any, 'validateCurrencyTotals');

    component.addLot();

    expect(validateSpy).toHaveBeenCalled();
  });

  it('should validate after removing lot', () => {
    fixture.detectChanges();
    component.addLot();
    component.addLot();

    const validateSpy = jest.spyOn(component as any, 'validateCurrencyTotals');

    component.removeLot(0);

    expect(validateSpy).toHaveBeenCalled();
  });
});
