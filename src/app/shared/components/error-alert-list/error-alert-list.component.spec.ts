import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ErrorAlertListComponent,
  ErrorTranslationsKey,
} from './error-alert-list.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

describe('ErrorAlertListComponent', () => {
  let component: ErrorAlertListComponent;
  let fixture: ComponentFixture<ErrorAlertListComponent>;

  const translations = {
    'R.CONTRACT.VALIDATION_ERRORS.LIST_LABEL': 'Validation Errors',
    'R.CONTRACT.VALIDATION.LOTS.REQUIRED': 'Lot is required',
    'R.CONTRACT.VALIDATION.FEES.INVALID': 'Fee is invalid',
    'ERROR.FIELD_REQUIRED': 'Field {{index}} is required',
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
    title: string = 'R.CONTRACT.VALIDATION_ERRORS.LIST_LABEL',
    formErrorCollection: ErrorTranslationsKey[] = []
  ) {
    const translateServiceMock = createTranslateServiceMock();

    await TestBed.configureTestingModule({
      imports: [ErrorAlertListComponent, TranslateModule.forRoot()],
      providers: [
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorAlertListComponent);
    component = fixture.componentInstance;

    // Set inputs
    component.title = title;
    component.formErrorCollection = formErrorCollection;

    fixture.detectChanges();

    return { component, fixture, translateServiceMock };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display default title', async () => {
    const { fixture } = await setup();
    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('.fi-error-alert__title');
    expect(title).toBeTruthy();
  });

  it('should display custom title', async () => {
    const { fixture } = await setup('CUSTOM.TITLE');
    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('.fi-error-alert__title');
    expect(title).toBeTruthy();
  });

  it('should have alert role', async () => {
    const { fixture } = await setup();
    const compiled = fixture.nativeElement;
    const alert = compiled.querySelector('[role="alert"]');
    expect(alert).toBeTruthy();
  });

  it('should have aria-live attribute set to assertive', async () => {
    const { fixture } = await setup();
    const compiled = fixture.nativeElement;
    const alert = compiled.querySelector('[aria-live="assertive"]');
    expect(alert).toBeTruthy();
    expect(alert.getAttribute('aria-live')).toBe('assertive');
  });

  it('should display error icon', async () => {
    const { fixture } = await setup();
    const compiled = fixture.nativeElement;
    const icon = compiled.querySelector('mat-icon');
    expect(icon).toBeTruthy();
    expect(icon.textContent.trim()).toBe('error');
  });

  it('should display empty list when no errors', async () => {
    const { fixture } = await setup(
      'R.CONTRACT.VALIDATION_ERRORS.LIST_LABEL',
      []
    );
    const compiled = fixture.nativeElement;
    const list = compiled.querySelector('.fi-error-alert__message');
    const items = list.querySelectorAll('li');
    expect(items.length).toBe(0);
  });

  it('should display list of errors', async () => {
    const errors: ErrorTranslationsKey[] = [
      { key: 'R.CONTRACT.VALIDATION.LOTS.REQUIRED' },
      { key: 'R.CONTRACT.VALIDATION.FEES.INVALID' },
    ];

    const { fixture } = await setup(
      'R.CONTRACT.VALIDATION_ERRORS.LIST_LABEL',
      errors
    );
    const compiled = fixture.nativeElement;
    const list = compiled.querySelector('.fi-error-alert__message');
    const items = list.querySelectorAll('li');

    expect(items.length).toBe(2);
  });

  it('should display error with index parameter', async () => {
    const errors: ErrorTranslationsKey[] = [
      { key: 'ERROR.FIELD_REQUIRED', index: 1 },
    ];

    const { fixture } = await setup(
      'R.CONTRACT.VALIDATION_ERRORS.LIST_LABEL',
      errors
    );
    const compiled = fixture.nativeElement;
    const items = compiled.querySelectorAll('.fi-error-alert__message li');

    expect(items.length).toBe(1);
    expect(items[0].getAttribute('ng-reflect-translate')).toBe(
      'ERROR.FIELD_REQUIRED'
    );
  });

  it('should have correct CSS classes', async () => {
    const { fixture } = await setup();
    const compiled = fixture.nativeElement;

    const alertDiv = compiled.querySelector('.fi-error-alert');
    expect(alertDiv).toBeTruthy();
    expect(alertDiv.classList.contains('w-100')).toBe(true);
  });

  it('should have content wrapper', async () => {
    const { fixture } = await setup();
    const compiled = fixture.nativeElement;

    const contentDiv = compiled.querySelector('.fi-error-alert__content');
    expect(contentDiv).toBeTruthy();
  });

  it('should have list container', async () => {
    const { fixture } = await setup();
    const compiled = fixture.nativeElement;

    const listDiv = compiled.querySelector('.fi-error-alert__list');
    expect(listDiv).toBeTruthy();
  });

  it('should have item container', async () => {
    const { fixture } = await setup();
    const compiled = fixture.nativeElement;

    const itemDiv = compiled.querySelector('.fi-error-alert__item');
    expect(itemDiv).toBeTruthy();
  });

  it('should have message list', async () => {
    const { fixture } = await setup();
    const compiled = fixture.nativeElement;

    const messageList = compiled.querySelector('.fi-error-alert__message');
    expect(messageList).toBeTruthy();
    expect(messageList.tagName).toBe('UL');
  });

  it('should update title when input changes', async () => {
    const { component, fixture } = await setup('INITIAL.TITLE');

    component.title = 'UPDATED.TITLE';
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('.fi-error-alert__title');
    expect(title).toBeTruthy();
  });

  it('should update error list when input changes', async () => {
    const initialErrors: ErrorTranslationsKey[] = [{ key: 'ERROR.ONE' }];

    const { component, fixture } = await setup('TITLE', initialErrors);

    const updatedErrors: ErrorTranslationsKey[] = [
      { key: 'ERROR.ONE' },
      { key: 'ERROR.TWO' },
      { key: 'ERROR.THREE' },
    ];

    component.formErrorCollection = updatedErrors;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const items = compiled.querySelectorAll('.fi-error-alert__message li');
    expect(items.length).toBe(3);
  });

  it('should handle empty formErrorCollection', async () => {
    const { component } = await setup();

    expect(component.formErrorCollection).toEqual([]);
  });

  it('should display multiple errors with different keys', async () => {
    const errors: ErrorTranslationsKey[] = [
      { key: 'ERROR.ONE' },
      { key: 'ERROR.TWO' },
      { key: 'ERROR.THREE' },
    ];

    const { fixture } = await setup('TITLE', errors);
    const compiled = fixture.nativeElement;
    const items = compiled.querySelectorAll('.fi-error-alert__message li');

    expect(items.length).toBe(3);
    expect(items[0].getAttribute('ng-reflect-translate')).toBe('ERROR.ONE');
    expect(items[1].getAttribute('ng-reflect-translate')).toBe('ERROR.TWO');
    expect(items[2].getAttribute('ng-reflect-translate')).toBe('ERROR.THREE');
  });

  it('should handle error with custom error property', async () => {
    const errors: ErrorTranslationsKey[] = [
      { key: 'ERROR.CUSTOM', error: 'custom error message' },
    ];

    const { fixture } = await setup('TITLE', errors);
    const compiled = fixture.nativeElement;
    const items = compiled.querySelectorAll('.fi-error-alert__message li');

    expect(items.length).toBe(1);
  });

  it('should have default title value', async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorAlertListComponent, TranslateModule.forRoot()],
      providers: [
        { provide: TranslateService, useValue: createTranslateServiceMock() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorAlertListComponent);
    component = fixture.componentInstance;

    expect(component.title).toBe('R.CONTRACT.VALIDATION_ERRORS.LIST_LABEL');
  });

  it('should have default empty formErrorCollection', async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorAlertListComponent, TranslateModule.forRoot()],
      providers: [
        { provide: TranslateService, useValue: createTranslateServiceMock() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorAlertListComponent);
    component = fixture.componentInstance;

    expect(component.formErrorCollection).toEqual([]);
  });

  it('should render with ngFor loop', async () => {
    const errors: ErrorTranslationsKey[] = [
      { key: 'ERROR.FIRST', index: 0 },
      { key: 'ERROR.SECOND', index: 1 },
    ];

    const { fixture } = await setup('TITLE', errors);
    const compiled = fixture.nativeElement;
    const items = compiled.querySelectorAll('.fi-error-alert__message li');

    expect(items.length).toBe(errors.length);
  });
});
