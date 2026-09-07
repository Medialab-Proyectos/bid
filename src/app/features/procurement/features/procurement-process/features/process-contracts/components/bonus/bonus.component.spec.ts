import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModeEnum } from '@core/enums';
import {
  AccordionModule,
  DirectivesModule,
} from '@fiduciary-interface/app/shared';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { provideMockStore } from '@ngrx/store/testing';
import { DatePickerModule } from '@progress/kendo-angular-dateinputs';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { render, screen } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';

import { BonusComponent } from './bonus.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatNumericComponent } from '@fiduciary-interface/app/shared/components/mat-numeric/mat-numeric.component';
import { MatIconModule } from '@angular/material/icon';

describe('BonusComponent', () => {
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

async function emptySetup() {
  const { fixture } = await render(BonusComponent, {
    providers: [provideMockStore({})],
    imports: [
      MsalTestModule,
      DirectivesModule,
      CommonModule,
      HttpClientTestingModule,
      FormsModule,
      ReactiveFormsModule,
      InputsModule,
      LabelModule,
      DropDownsModule,
      DatePickerModule,
      AccordionModule,
      MatFormFieldModule,
      MatButtonModule,
      MatIconModule,
      MatSelectModule,
      MatNumericComponent,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
  });
  const component = fixture.componentInstance;
  return { component, fixture };
}
