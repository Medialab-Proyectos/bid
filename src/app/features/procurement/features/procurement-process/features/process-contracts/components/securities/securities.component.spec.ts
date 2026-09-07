import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormArray } from '@angular/forms';
import { ModeEnum } from '@core/enums';
import { CurrencyEnum } from '@core/models';
import { HttpClient } from '@angular/common/http';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { createSecurityGroup } from '../aditional-information/aditional-information.form';
import { SecuritiesComponent } from './securities.component';
import { IfNumberPipe } from '@fiduciary-interface/app/shared/pipes/if-number.pipe';

import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { CUSTOM_DATE_FORMATS } from '../../process-contracts.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MsalProviders } from '../../../../../../../../../test/test-helpers';

describe('SecuritiesComponent', () => {
  let component: SecuritiesComponent;
  let fixture: ComponentFixture<SecuritiesComponent>;

  describe('form mode', () => {
    beforeEach(async () => {
      await setupTest(true);
    });

    it('should create the component', () => {
      expect(component).toBeTruthy();
    });
  });

  async function setupTest(isEmpty: boolean = false) {
    const securityRow = createSecurityGroup();
    securityRow.setValue({
      id: null,
      currency: '1',
      amount: 22,
      securityType: 1,
      usdEquivalentAmount: 34,
      expirationDate: new Date('10/13/2021'),
    });
    const form = new FormArray([securityRow]);

    const currencies: CurrencyEnum[] = [
      {
        id: '1',
        currency: 'Currency 1',
        exchangeRate: 1.4,
        numberOfDecimals: 2,
      },
      {
        id: '2',
        currency: 'Currency 2',
        exchangeRate: 1.2,
        numberOfDecimals: 0,
      },
      {
        id: '3',
        currency: 'Currency 3',
        exchangeRate: null,
        numberOfDecimals: 0,
      },
    ];

    const securityTypes = [
      { id: 1, name: 'Security 1' },
      { id: 2, name: 'Security 2' },
    ];

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateTestingModule.withTranslations('en', {}).withDefaultLanguage(
          'en'
        ),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        ...MsalProviders,
        HttpClient,
        provideMockStore({
          initialState: {
            ...initialState,
            preferences: {
              preferences: {
                preferredLanguage: 'en',
              },
            },
          },
        }),
        { provide: DateAdapter, useClass: MomentDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
        { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
        {
          provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS,
          useValue: { useUtc: false },
        },
      ],
      declarations: [IfNumberPipe],
    }).compileComponents();

    fixture = TestBed.createComponent(SecuritiesComponent);
    component = fixture.componentInstance;

    // Configurar las propiedades ANTES de detectChanges
    if (!isEmpty) {
      component.config = {
        data: {
          currencies: currencies,
          securityTypes: securityTypes,
        },
        settings: {
          mode: ModeEnum.CREATE,
        },
      };
      component.form = form;
    }

    // Detectar cambios
    fixture.detectChanges();
  }
});

const currencires = [
  {
    currency: 'USD',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 2,
  },
  {
    currency: 'EUR',
    isHard: false,
    isBorrowing: false,
    numberOfDecimals: 2,
  },
];

const initialState = {
  currencies: currencires,
};
