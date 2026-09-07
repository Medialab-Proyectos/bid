import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  AccordionModule,
  DirectivesModule,
  PipeModule,
} from '@fiduciary-interface/app/shared';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { render, screen } from '@testing-library/angular';

import { ContractGeneralInformationComponent } from './contract-general-information.component';
import { createContractGeneralInformationForm } from './contract-general-information.form';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { CurrencyEnum } from '@core/models';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { IfNumberPipe } from '@fiduciary-interface/app/shared/pipes/if-number.pipe';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatNumericComponent } from '@fiduciary-interface/app/shared/components/mat-numeric/mat-numeric.component';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
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
import { MatDateComponent } from '../../../../../../../../shared/components/mat-date/mat-date.component';

describe('ContractGeneralInformationComponent', () => {
  it('should set form title', async () => {
    await setup();

    const title = screen.getByText(/Contract General Information/i);

    expect(title).toBeTruthy();
  });

  it('should no calculate dollar equivalent when selected currency dont have selected currency', async () => {
    const { component, fixture, formValues } = await setup();
    component.form.setValue(formValues);
    const matSelectChange = { value: null } as MatSelectChange;
    component.onCurrencyChange(matSelectChange, 0);
    component.onTotalAmountChange(100000, 0);
    fixture.detectChanges();
    expect(screen.getByText(/50,001.00/)).toBeInTheDocument();
  });

  it('should no calculate dollar equivalent when selected currency dont have exchange rate', async () => {
    const { component, fixture, formValues } = await setup();
    component.form.setValue(formValues);
    const currencies: CurrencyEnum[] = [
      {
        currency: 'COP',
        id: 'COP',
        numberOfDecimals: 2,
        exchangeRate: null,
      },
    ];
    component.baseConfig.data.currencies = currencies;
    const selectChange = { value: 'COP' } as MatSelectChange;
    component.onCurrencyChange(selectChange, 0);
    component.onTotalAmountChange(100000, 0);
    fixture.detectChanges();
    expect(screen.getByText(/50,001.00/)).toBeInTheDocument();
  });
});

async function setup() {
  const form = createContractGeneralInformationForm();
  const formValues = {
    name: 'Prestación de servicios',
    objective:
      'Asesorar al MINEDUCACION como gerente de educación rural de proyectos desarrollados en el marco del contrato de préstamo BID 4209/OC-C0 Con apoyo de equipos de implementación técnica fiduciaria y de monitoreo y evaluación',
    signatureDate: new Date('2020-04-20'),
    startDate: new Date('2020-04-23'),
    endDate: new Date('2020-12-30'),
    goodsSource: 'CL',
    currencyList: [
      {
        id: 'COP',
        currency: 'COP',
        totalAmount: 50000,
        usdEquivalentAmount: 50001,
      },
    ],
    controlNumber: 'C01.PCCNTR1510806',
    contractType: 1,
    hasAdvancedPayment: true,
    conflictResolutionMethod: 2,
    applicableLaw: 'Sistema nacional',
    typeDesignation: '',
  };
  const { fixture } = await render(ContractGeneralInformationComponent, {
    componentProperties: {
      form: form,
      number: 2,
      baseConfig: {
        data: {
          conflictsResolutionsList: [],
          goodsSourceList: [
            { code: 'CL', name: 'Chile' },
            { code: 'SP', name: 'Spain' },
          ],
          contractTypesList: [{ id: 1, name: 'tipo contrato' }],
          currencies: [],
          procurementProcessDescription: '',
        },
        settings: {
          disabled: false,
          status: null,
        },
      },
    },
    imports: [
      MatDateComponent,
      PipeModule,
      MsalTestModule,
      DirectivesModule,
      HttpClientTestingModule,
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      InputsModule,
      LabelModule,
      DropDownsModule,
      DateInputsModule,
      AccordionModule,
      TooltipModule,
      MatFormFieldModule,
      MatInputModule,
      MatDatepickerModule,
      MatSelectModule,
      MatIconModule,
      MatButtonModule,
      MatRadioModule,
      MatNumericComponent,
      MatTooltipModule,
      MatDividerModule,
      MatCheckboxModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    providers: [
      provideMockStore({}),
      { provide: DateAdapter, useClass: MomentDateAdapter },
      { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
      { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
      { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: false } },
    ],
    declarations: [IfNumberPipe],
  });

  const component = fixture.componentInstance;
  return {
    component,
    fixture,
    formValues,
  };
}
