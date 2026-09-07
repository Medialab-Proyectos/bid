/* eslint-disable @typescript-eslint/no-var-requires */
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { BidderRegistrationFormComponent } from './bidder-registration-form.component';

function getInitialState() {
  return {};
}

async function setup() {
  const initialState = getInitialState();
  const { fixture } = await render(BidderRegistrationFormComponent, {
    componentProperties: {
      typeList: [],
      memberCountries: [
        {
          isMember: true,
          isBeneficiary: true,
          id: 1,
          code: 'CL',
          name: 'CHILE',
        },
        {
          isMember: true,
          isBeneficiary: false,
          id: 2,
          code: 'AR',
          name: 'ARGENTINA',
        },
      ],
      countries: [
        {
          isMember: false,
          isBeneficiary: false,
          id: 3,
          code: '3',
          name: '3',
        },
        {
          isMember: false,
          isBeneficiary: false,
          id: 5,
          code: '5',
          name: '5',
        },
      ],
      allUnfilterCountries: [
        {
          isMember: true,
          isBeneficiary: true,
          id: 1,
          code: 'CL',
          name: 'CHILE',
        },
        {
          isMember: true,
          isBeneficiary: false,
          id: 2,
          code: 'AR',
          name: 'ARGENTINA',
        },
        {
          isMember: false,
          isBeneficiary: false,
          id: 3,
          code: '3',
          name: '3',
        },
        {
          isMember: false,
          isBeneficiary: false,
          id: 5,
          code: '5',
          name: '5',
        },
      ],
    },
    declarations: [BidderRegistrationFormComponent],
    imports: [
      CommonModule,
      InputsModule,
      LabelModule,
      DropDownsModule,
      ButtonsModule,
      RouterTestingModule,
      ReactiveFormsModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    providers: [provideMockStore({ initialState })],
  });
  const component = fixture.debugElement.componentInstance;
  return { fixture, component };
}

describe('BidderRegistrationFormComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('When i change the selected option', () => {
    it('should emit the right event selectionChange to the parent component - CPO', async () => {
      const { component, fixture } = await setup();
      const componentInstance = fixture.componentInstance;
      jest.spyOn(componentInstance.bidderType, 'emit');
      component.bidderTypeChange(false);
      fixture.detectChanges();
      expect(componentInstance.bidderType.emit).toHaveBeenCalled();
    });
  });
});
