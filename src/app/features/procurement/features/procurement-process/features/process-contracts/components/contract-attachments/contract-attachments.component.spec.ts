import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { render, screen } from '@testing-library/angular';
import { ContractAttachmentsComponent } from './contract-attachments.component';
import { AccordionModule } from '@fiduciary-interface/app/shared';
import { TranslateTestingModule } from 'ngx-translate-testing';

describe('ContractAttachmentsComponent', () => {
  async function setup() {
    await render(ContractAttachmentsComponent, {
      componentProperties: {
        number: 7,
      },
      imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        InputsModule,
        LabelModule,
        DropDownsModule,
        AccordionModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
  }

  it('should set form number', async () => {
    await setup();

    const number = screen.getByText(/7/i);

    expect(number).toBeTruthy();
  });

  it('should set form title', async () => {
    await setup();

    const title = screen.getByText(/Attachment data/i);

    expect(title).toBeTruthy();
  });
});
