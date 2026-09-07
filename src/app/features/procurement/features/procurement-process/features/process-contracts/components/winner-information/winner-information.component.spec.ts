import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModeEnum } from '@core/enums';
import { WinnerInformationFormConfig } from '@core/models/components/process-contract/winner-information-form-config.model';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { render, screen } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import {
  createWinnerInformationForm,
  createWinnerInformationGroup,
} from './winner-information-form.form';
import { WinnerInformationComponent } from './winner-information.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatNumericComponent } from '@fiduciary-interface/app/shared/components/mat-numeric/mat-numeric.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { By } from '@angular/platform-browser';

describe('WinnerInformationComponent', () => {
  describe('form mode', () => {
    it('should set form in disabled mode', async () => {
      const { component } = await setup();
      const config = component.baseConfig;
      config.settings.mode = ModeEnum.READ;
      component.config = config;

      expect(component.form.disabled).toBe(true);
    });

    it('should set form in write mode by default', async () => {
      const { component } = await setup();
      const config = component.baseConfig;
      config.settings.mode = ModeEnum.CREATE;
      component.config = config;
      expect(component.form.enabled).toBe(true);
    });
  });

  it('should set form number', async () => {
    await setup();

    const number = screen.getByText(/1/i);

    expect(number).toBeTruthy();
  });

  it('should set form title', async () => {
    await setup();

    const title = screen.getByText(/Awarded Information/i);

    expect(title).toBeTruthy();
  });

  describe('when no participant is selected', () => {
    it('should set error in form group', async () => {
      const { component } = await setup();

      const hasError =
        component.form.get('winnerList').errors.minimumSelectedWinners;

      expect(hasError).toBe(true);
    });
  });

  describe('when at least 1 participant is selected', () => {
    it('should remove error from form group', async () => {
      const { component, fixture } = await setup();

      const checkboxDebug = fixture.debugElement.query(
        By.css('mat-checkbox input')
      );

      const inputEl: HTMLInputElement = checkboxDebug.nativeElement;

      inputEl.click();

      const errors = component.form.get('winnerList').errors;
      expect(errors).toBe(null);
    });
  });

  describe('when provide a invalid form', () => {
    it('should no show form', async () => {
      const { component } = await setup();
      component.form = null;
      expect(screen.queryByTestId('winnerCheckbox')).not.toBeInTheDocument();
    });
  });

  describe('only read mode', () => {
    it('should no show checkbox', async () => {
      const { component } = await setup();
      const config = { ...component.baseConfig };
      config.settings.mode = ModeEnum.READ;
      component.config = config;

      expect(screen.queryByTestId('winnerCheckbox')).not.toBeInTheDocument();
    });
  });
});

async function setup() {
  const form = createWinnerInformationForm();
  const formValues = [
    {
      biddingProcessParticipantId: '1',
      name: 'Lilias flores',
      nationality: 0,
      checked: false,
    },
  ];
  formValues.forEach((winner) => {
    const winnerGroup = createWinnerInformationGroup();
    winnerGroup.setValue(winner);
    (form.get('winnerList') as FormArray).push(winnerGroup);
  });

  const config: WinnerInformationFormConfig = {
    data: { memberCountries: [{ id: 0, name: 'FI.CNVG.FP.ENUM.COUNTRY.AR' }] },
    settings: { mode: ModeEnum.CREATE },
  };

  const { fixture } = await render(WinnerInformationComponent, {
    componentProperties: {
      form: form,
      number: 1,
      config,
    },
    imports: [
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      InputsModule,
      LabelModule,
      DropDownsModule,
      MatFormFieldModule,
      MatInputModule,
      MatRadioModule,
      MatSelectModule,
      MatCheckboxModule,
      MatNumericComponent,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
  });

  const component = fixture.componentInstance;
  return {
    component,
    formValues,
    fixture,
  };
}
