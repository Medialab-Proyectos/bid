import { ReactiveFormsModule } from '@angular/forms';
import { AccordionModule } from '@fiduciary-interface/app/shared';
import { AlertComponent } from '@fiduciary-interface/app/shared/components/notification/components/alert/alert.component';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { NumericTextBoxModule } from '@progress/kendo-angular-inputs';
import { render, screen } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';

import { AmountsJustificationComponent } from './amounts-justification.component';
import { createAmountsJustificationForm } from './amounts-justification.form';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { IfNumberPipe } from '@fiduciary-interface/app/shared/pipes/if-number.pipe';

function getState() {
  return {
    selectedProject: {
      selectedProject: {
        countryCode: 'CO',
        name: 'Programa de apoyo para la mejora de las trayectorias educativas en zonas rurales focalizadas',
        executor: 'MINISTERIO DE EDUCACION NACIONAL',
        executorAcronym: 'CO-MEN',
        contract: '4902/OC-CO',
        operationNumber: 'CO-L1229',
        approvedAmount: 60000000,
        status: 'In progress',
        projectBucketId: '12345678',
      },
      loaded: true,
      loading: false,
      error: null,
    },
    projectBalances: {
      projectBalances: {
        projectedAvailableBalance: 1_000_000,
      },
      loaded: true,
      loading: false,
      error: null,
    },
  } as any;
}

describe('AmountsJustificationComponent', () => {
  async function setup(type: '' | 'amountPendingError' = '') {
    const form = createAmountsJustificationForm();
    form.setValue({
      bid: 10,
      localCounterpart: 20,
      cofinancing: 30,
      amountPendingJustification: 10543,
    });

    if (type === 'amountPendingError') {
      form.patchValue({ amountPendingJustification: -10 });
    }

    const { fixture } = await render(AmountsJustificationComponent, {
      componentProperties: {
        form,
        number: 2,
      },
      declarations: [AlertComponent, IfNumberPipe],
      imports: [
        AccordionModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
        NumericTextBoxModule,
        ButtonsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
      ],
      providers: [provideMockStore({ initialState: getState() })],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    });

    const component = fixture.componentInstance;
    return { component, fixture };
  }

  it('should show form number', async () => {
    await setup();

    expect(screen.getByText(/2/i)).toBeInTheDocument();
  });
});
