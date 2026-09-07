import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccordionModule } from '@fiduciary-interface/app/shared';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { render, screen } from '@testing-library/angular';
import {
  createTransactionComponentsForm,
  setTransactionComponentsFormValue,
  TransactionComponentsForm,
} from './transaction-components.form';
import { TransactionComponentsComponent } from './transaction-components.component';

import { TranslateTestingModule } from 'ngx-translate-testing';
import { Amount, TransactionComponent } from '../../models';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { IfNumberPipe } from '@fiduciary-interface/app/shared/pipes/if-number.pipe';
import { provideMockStore } from '@ngrx/store/testing';

async function setup() {
  const form = createTransactionComponentsForm();

  const components: TransactionComponent[] = [
    {
      id: 1,
      code: 1,
      name: 'Apoyos productivos',
      amountsDistribute: {
        distributeIbd: 10000,
        distributeCofinancing: 1000,
        distributeLocalCounterpart: 1000,
      },
      amountsProjectedAvailable: {
        distributeIbd: 20000,
        distributeCofinancing: 25000,
        distributeLocalCounterpart: 2000,
      },
      readOnly: false,
    },
    {
      id: 2,
      code: 2,
      name: 'Administración',
      amountsDistribute: {
        distributeIbd: 14000,
        distributeCofinancing: 15000,
        distributeLocalCounterpart: 16000,
      },
      amountsProjectedAvailable: {
        distributeIbd: 23000,
        distributeCofinancing: 35000,
        distributeLocalCounterpart: 12000,
      },
      readOnly: true,
    },
  ];

  const amountsToAssign: Amount = {
    distributeIbd: 1000000,
    distributeCofinancing: 1358000,
    distributeLocalCounterpart: 223500,
  };

  const amountsDistribute: Amount = {
    distributeIbd: 1787950,
    distributeCofinancing: 1164000,
    distributeLocalCounterpart: 3460100,
  };

  const amountsProjectedAvailable: Amount = {
    distributeIbd: 1234000,
    distributeCofinancing: 1348700,
    distributeLocalCounterpart: 1849600,
  };

  const formValues: TransactionComponentsForm = {
    amountsToAssign,
    components,
    totals: {
      amountsDistribute,
      amountsProjectedAvailable,
    },
  };

  setTransactionComponentsFormValue(form, formValues);

  const { fixture } = await render(TransactionComponentsComponent, {
    componentProperties: {
      form: form,
      number: 3,
    },
    imports: [
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      InputsModule,
      LabelModule,
      DropDownsModule,
      TooltipModule,
      AccordionModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    declarations: [IfNumberPipe],
    providers: [provideMockStore({})],
  });

  const component = fixture.componentInstance;

  return {
    formValues,
    component,
  };
}

describe('TransactionComponentsComponent', () => {
  it('should set form number', async () => {
    await setup();
    const number = screen.getByText(/^3$/i);
    expect(number).toBeTruthy();
  });

  it('should set form title', async () => {
    await setup();
    const title = screen.getByText(/Components/i);
    expect(title).toBeTruthy();
  });
});
