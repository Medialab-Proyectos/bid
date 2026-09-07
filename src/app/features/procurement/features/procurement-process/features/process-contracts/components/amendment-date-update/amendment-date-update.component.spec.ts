import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { initialState } from '@core/store/tempDoc/reducers/tempDoc.reducer';
import {
  AccordionModule,
  NotificationModule,
} from '@fiduciary-interface/app/shared';
import { FormSectionsModule } from '@fiduciary-interface/app/shared/components/form-sections/form-sections.module';
import { provideMockStore } from '@ngrx/store/testing';
import { DatePickerModule } from '@progress/kendo-angular-dateinputs';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';

import { AmendmentDateUpdateComponent } from './amendment-date-update.component';
import { MatDateComponent } from '../../../../../../../../shared/components/mat-date/mat-date.component';

describe('AmendmentDateUpdateComponent', () => {
  it('they should check if the start date is greater than the end date', async () => {
    const { component } = await setup();

    const startDate = new Date(2022, 0, 26);
    const endDate = new Date(2022, 0, 28);

    component.startDateControl.setValue(startDate);
    component.endDateControl.setValue(endDate);

    expect(component.form.errors).toEqual(null);
  });

  it('they should check if the start date is greater than the end date', async () => {
    const { component } = await setup();

    const startDate = null;
    const endDate = null;

    component.startDateControl.setValue(startDate);
    component.endDateControl.setValue(endDate);

    expect(component.form.errors).toEqual(null);
  });
});

async function setup() {
  const { fixture } = await render(AmendmentDateUpdateComponent, {
    imports: [
      MatDateComponent,
      LabelModule,
      InputsModule,
      FormsModule,
      FormSectionsModule,
      AccordionModule,
      ReactiveFormsModule,
      DatePickerModule,
      InputsModule,
      NotificationModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    declarations: [AmendmentDateUpdateComponent],
    providers: [
      provideMockStore({ initialState }),
      { provide: 'windowObject', useValue: window },
    ],
  });

  const component = fixture.componentInstance;
  return {
    component,
  };
}
