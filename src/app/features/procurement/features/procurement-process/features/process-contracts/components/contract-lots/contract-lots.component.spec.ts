import { render, screen } from '@testing-library/angular';
import { ContractLotsComponent } from './contract-lots.component';
import { createContractLotsForm } from './contract-lots.form';
import { provideWindowSizeMock } from '@fiduciary-interface-test';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { MockIfNumberPipe } from '../../../../../../../../../test/test-helpers';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ContractLotsComponent', () => {
  it('should exist component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should set form number', async () => {
    await setup();
    const number = screen.getByText(/4/i);
    expect(number).toBeTruthy();
  });

  it('should set form title', async () => {
    await setup();
    const title = screen.getAllByText(/Lotes/i);
    expect(title).toBeTruthy();
  });
});

async function setup() {
  const form = createContractLotsForm();
  const formValues = {
    id: null,
    name: 'Computadora',
    units: 10,
    amount: 20,
  };
  form.setValue([formValues]);

  const { fixture } = await render(ContractLotsComponent, {
    componentProperties: {
      form: form,
      number: 4,
      config: {
        settings: {
          disabled: false,
          status: null,
        },
        data: {
          showUnits: true,
        },
      },
    },
    imports: [
      TranslateTestingModule.withTranslations('en', {}).withDefaultLanguage(
        'en'
      ),
    ],
    schemas: [NO_ERRORS_SCHEMA],
    providers: [provideWindowSizeMock()],
    declarations: [MockIfNumberPipe],
  });
  const component = fixture.componentInstance;
  return {
    formValues,
    component,
  };
}
