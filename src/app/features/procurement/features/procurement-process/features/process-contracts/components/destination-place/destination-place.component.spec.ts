import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccordionModule } from '@fiduciary-interface/app/shared';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { render, screen } from '@testing-library/angular';
import { DestinationPlaceComponent } from './destination-place.component';
import { createDestinationPlaceForm } from './destination-place.form';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { CodeNameEnum } from '@core/models';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatNumericComponent } from '@fiduciary-interface/app/shared/components/mat-numeric/mat-numeric.component';

describe('DestinationPlaceComponent', () => {
  async function setup() {
    const form = createDestinationPlaceForm();
    const formValues = {
      id: null,
      address: 'Central Avenue',
      zipCode: '3242344',
      country: 'US',
    };
    form.setValue(formValues);

    const countries: CodeNameEnum[] = [{ code: 'US', name: 'United States' }];
    const beneficiaryCountries: CodeNameEnum[] = [
      { code: 'US', name: 'United States' },
    ];

    await render(DestinationPlaceComponent, {
      componentProperties: {
        form: form,
        number: 5,
        countries,
        config: {
          data: {
            beneficiaryCountries,
          },
          settings: {
            disabled: false,
            status: null,
          },
        },
      },
      imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        InputsModule,
        LabelModule,
        DropDownsModule,
        AccordionModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatRadioModule,
        MatNumericComponent,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    return {
      formValues,
      countries,
    };
  }

  it('should render the component', async () => {
    await setup();
  });

  it('should set form number', async () => {
    await setup();

    const number = screen.getByText(/5/i);

    expect(number).toBeTruthy();
  });

  it('should set form title', async () => {
    await setup();

    const title = screen.getByText(
      /Destination\/Execution Location of the Works/i
    );

    expect(title).toBeTruthy();
  });
});
