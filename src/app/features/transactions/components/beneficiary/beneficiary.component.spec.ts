import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { BeneficiaryComponent } from './beneficiary.component';
import { Beneficiary } from '../../models';
import { render } from '@testing-library/angular';

const mockBeneficiary: Beneficiary = {
  accountNumber: '',
  acronym: '',
  bankFlowId: '',
  beneficiaryName: '',
  details: {
    beneficiaryAccountData: {
      accountCurrency: '',
      accountSpecialInstructions: '',
      bankAccountNumber: '',
      name: '',
    },
    beneficiaryBank: {
      abaRoutingCode: '',
      branchName: '',
      city: '',
      country: '',
      name: '',
      specialInstructions: '',
      streetAddress: '',
      swiftCode: '',
      zipCode: '',
    },
    beneficiaryBasicData: {
      city: '',
      contactEmail: '',
      contactFirstName: '',
      country: '',
      id: '',
      institutionName: 'institutionName',
      streetAddress: '',
      type: '',
      typeName: '',
      zipCode: '',
    },
    intermediaryBank: {
      abaRoutingCode: '',
      branchName: '',
      city: '',
      country: '',
      name: '',
      specialInstructions: '',
      streetAddress: '',
      swiftCode: '',
      zipCode: '',
    },
  },
  institutionName: 'institutionName',
};

async function setup() {
  const { fixture } = await render(BeneficiaryComponent, {
    componentProperties: {
      beneficiary: mockBeneficiary,
      beneficiaryDetails: mockBeneficiary.details,
    },
    declarations: [BeneficiaryComponent],
    schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    imports: [
      StoreModule.forRoot({}),
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
  });

  const component = fixture.componentInstance;
  return { component, fixture };
}

describe('BeneficiaryComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('beneficiarySections', () => {
    it('shoudl set sections with they keys of beneficiary.details', async () => {
      const { component } = await setup();

      component.beneficiarySections();

      expect(component.sections).toEqual([
        'beneficiaryAccountData',
        'beneficiaryBank',
        'beneficiaryBasicData',
        'intermediaryBank',
      ]);
    });
  });
});
