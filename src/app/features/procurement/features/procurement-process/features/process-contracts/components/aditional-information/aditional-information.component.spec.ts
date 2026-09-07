import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccordionModule } from '@fiduciary-interface/app/shared/components/accordion/accordion.module';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { render, screen } from '@testing-library/angular';
import { AditionalInformationComponent } from './aditional-information.component';
import {
  createAditionalInformationForm,
  createBonusGroup,
  createDamagesGroup,
  createSecurityGroup,
} from './aditional-information.form';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { DatePickerModule } from '@progress/kendo-angular-dateinputs';
import { AditionalInformationFormConfig } from '@core/models';
import { SecuritiesComponent } from '../securities/securities.component';
import { DamagesComponent } from '../damages/damages.component';
import { BonusComponent } from '../bonus/bonus.component';
import { ModeEnum } from '@core/enums';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DirectivesModule, PipeModule } from '@fiduciary-interface/app/shared';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatNumericComponent } from '@fiduciary-interface/app/shared/components/mat-numeric/mat-numeric.component';
import { MatDateComponent } from '../../../../../../../../shared/components/mat-date/mat-date.component';
import { MockFiMatNumericComponent } from '../../../../../../../../../test/test-helpers';

describe('AditionalInformationComponent', () => {
  describe('form mode', () => {
    it('should set form in disabled mode', async () => {
      const { component } = await emptySetup();
      const config = component.baseConfig;
      config.settings.mode = ModeEnum.READ;
      component.config = config;

      expect(component.form.disabled).toBe(true);
    });

    it('should set form in write mode', async () => {
      const { component } = await emptySetup();
      const config = component.baseConfig;
      config.settings.mode = ModeEnum.CREATE;
      component.config = config;
      expect(component.form.enabled).toBe(true);
    });
  });

  describe('securities', () => {
    it('should init with 0 rows and show button for add more rows', async () => {
      await emptySetup();

      expect(screen.queryAllByTestId('securityRow').length).toBe(0);
    });

    it('should add row when click in add security button', async () => {
      const { fixture } = await emptySetup();

      screen.getByTestId('addSecurityButton').click();
      fixture.detectChanges();
      expect(screen.queryAllByTestId('securityRow').length).toBe(1);
    });

    it('should delete row when click in delete button', async () => {
      const { fixture } = await emptySetup();

      screen.getByTestId('addSecurityButton').click();
      fixture.detectChanges();
      expect(screen.queryAllByTestId('securityRow').length).toBe(1);

      screen.getByTestId('deleteSecurityButton').click();
      fixture.detectChanges();
      expect(screen.queryAllByTestId('securityRow').length).toBe(0);
    });
  });

  describe('damages', () => {
    it('should init with 0 rows and show button for add more rows', async () => {
      await emptySetup();
      expect(screen.queryAllByTestId('damagesRow').length).toBe(0);
    });

    it('should hide button for add more rows, when has 1 row', async () => {
      const { fixture } = await emptySetup();
      screen.queryByTestId('addDamagesButton').click();
      fixture.detectChanges();
      expect(screen.queryAllByTestId('damagesRow').length).toBe(1);
      expect(screen.queryByTestId('addDamagesButton')).not.toBeInTheDocument();
    });

    it('should delete row when click in delete button', async () => {
      const { fixture } = await emptySetup();
      screen.queryByTestId('addDamagesButton').click();
      fixture.detectChanges();

      screen.queryByTestId('deleteDamagesButton').click();
      fixture.detectChanges();

      expect(screen.queryByTestId('addDamagesButton')).toBeInTheDocument();
      expect(screen.queryAllByTestId('damagesRow').length).toBe(0);
    });
  });

  describe('bonus', () => {
    it('should init with 0 rows and show button for add more rows', async () => {
      await emptySetup();
      expect(screen.queryAllByTestId('bonusRow').length).toBe(0);
    });

    it('should hide button for add more rows, when has 1 row', async () => {
      const { fixture } = await emptySetup();
      screen.queryByTestId('addBonusButton').click();
      fixture.detectChanges();
      expect(screen.queryAllByTestId('bonusRow').length).toBe(1);
      expect(screen.queryByTestId('addBonusButton')).not.toBeInTheDocument();
    });

    it('should delete row when click in delete button', async () => {
      const { fixture } = await emptySetup();
      screen.queryByTestId('addBonusButton').click();
      fixture.detectChanges();

      screen.queryByTestId('deleteBonusButton').click();
      fixture.detectChanges();

      expect(screen.queryByTestId('addBonusButton')).toBeInTheDocument();
      expect(screen.queryAllByTestId('bonusRow').length).toBe(0);
    });
  });

  it('should set form number', async () => {
    await setup();

    const number = screen.getByText(/6/i);

    expect(number).toBeTruthy();
  });

  it('should set form title', async () => {
    await setup();

    const title = screen.getByText(
      /Additional information \(optional, only if it applies to the contract\)/i
    );

    expect(title).toBeTruthy();
  });
});

async function setup() {
  const form = createAditionalInformationForm();

  const securityRow = createSecurityGroup();
  securityRow.setValue({
    id: null,
    securityType: 1,
    currency: '1',
    amount: 22,
    usdEquivalentAmount: 34,
    expirationDate: new Date('10/13/2021'),
  });
  (form.get('securityList') as FormArray).push(securityRow);

  const damagesRow = createDamagesGroup();
  damagesRow.setValue({
    damagesType: 1,
    damagesPercentage: 0.5,
    damagesPaymentFrequency: 2,
    damagesMaxPercentage: 10,
  });
  (form.get('damagesList') as FormArray).push(damagesRow);

  const bonusRow = createBonusGroup();
  bonusRow.setValue({
    bonusType: 1,
    bonusPercentage: 0.8,
    bonusPaymentFrequency: 2,
    bonusMaxPercentage: 8.9,
  });
  (form.get('bonusList') as FormArray).push(bonusRow);

  const baseConfig: AditionalInformationFormConfig = {
    data: {
      bonusTypes: [
        { id: 1, name: 'Bonus type 1' },
        { id: 2, name: 'Bonus type 2' },
      ],
      currencies: [
        {
          id: '1',
          currency: 'Currency 1',
          exchangeRate: 1,
          numberOfDecimals: 2,
        },
        {
          id: '2',
          currency: 'Currency 2',
          exchangeRate: 1,
          numberOfDecimals: 2,
        },
      ],
      damagesTypes: [
        { id: 1, name: 'Damage 1' },
        { id: 2, name: 'Damage 2' },
      ],
      frequencies: [
        { id: 1, name: 'Frequency 1' },
        { id: 2, name: 'Frequency 2' },
      ],
      securityTypes: [
        { id: 1, name: 'Security 1' },
        { id: 2, name: 'Security 2' },
      ],
    },
    settings: {
      mode: ModeEnum.CREATE,
      status: null,
    },
  };

  await render(AditionalInformationComponent, {
    componentProperties: {
      form: form,
      number: 6,
      config: baseConfig,
    },
    declarations: [
      SecuritiesComponent,
      DamagesComponent,
      BonusComponent,
      MockFiMatNumericComponent,
    ],
    imports: [
      MatDateComponent,
      MsalTestModule,
      DirectivesModule,
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      HttpClientTestingModule,
      InputsModule,
      LabelModule,
      DropDownsModule,
      DatePickerModule,
      PipeModule,
      AccordionModule,
      MatFormFieldModule,
      MatInputModule,
      MatSelectModule,
      MatRadioModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    providers: [provideMockStore({})],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
  });
}

async function emptySetup() {
  const form = createAditionalInformationForm();

  const { fixture } = await render(AditionalInformationComponent, {
    componentProperties: {
      form: form,
      number: 6,
    },
    declarations: [SecuritiesComponent, DamagesComponent, BonusComponent],
    imports: [
      MatDateComponent,
      MsalTestModule,
      DirectivesModule,
      CommonModule,
      FormsModule,
      HttpClientTestingModule,
      ReactiveFormsModule,
      InputsModule,
      LabelModule,
      PipeModule,
      DropDownsModule,
      DatePickerModule,
      AccordionModule,
      MatFormFieldModule,
      MatInputModule,
      MatSelectModule,
      MatRadioModule,
      MatNumericComponent,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    providers: [provideMockStore({})],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
  });
  const component = fixture.componentInstance;
  return { component, fixture };
}
