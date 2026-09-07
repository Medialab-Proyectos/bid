import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonModule } from '@angular/common';
import { AccordionModule } from './../../../../shared';
import { provideMockStore } from '@ngrx/store/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { render, screen } from '@testing-library/angular';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { AlertComponent } from '@fiduciary-interface/app/shared/components/notification/components/alert/alert.component';
import {
  Beneficiary,
  BeneficiaryDetails,
  ExecutorBeneficiaries,
  executorBeneficiaries,
} from '../../models';
import { TransactionBeneficiaryComponent } from './transaction-beneficiary.component';

import { FilterComponent } from '../../../../shared/components/filter/components/filter/filter.component';
import { BeneficiaryComponent } from '../beneficiary/beneficiary.component';
import { BeneficiaryDetailComponent } from '../beneficiary-detail/beneficiary-detail.component';
import { TransactionsStoreService } from '../../store/services/transactions-store.service';
import { transactionBeneficiaryForm } from './transaction-beneficiary.form';
import { of } from 'rxjs';
import { TransactionsTypes } from '../../enums';

const beneficiaries: Beneficiary[] = [
  {
    institutionName: '',
    acronym: '',
    beneficiaryName: '',
    accountNumber: '',
    bankFlowId: '1',
    beneficiaryId: '1',
    details: {
      beneficiaryAccountData: null,
      beneficiaryBank: null,
      beneficiaryBasicData: {
        institutionName: 'string',
        streetAddress: 'string',
        city: 'string',
        country: 'ESP',
        zipCode: 'string',
        typeName: 'string',
        type: 'string',
        id: 'string',
        contactFirstName: 'string',
        contactEmail: 'string',
      },
      intermediaryBank: null,
    },
  },
];

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

async function setup(state = null) {
  let initialState = {};
  if (state) {
    initialState = state;
  } else {
    initialState = getState();
  }

  const { fixture } = await render(TransactionBeneficiaryComponent, {
    componentProperties: {
      beneficiaryForm: transactionBeneficiaryForm(),
      beneficiaries: beneficiaries,
    },
    imports: [
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      AccordionModule,
      InputsModule,
      HttpClientTestingModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    declarations: [
      AlertComponent,
      FilterComponent,
      BeneficiaryComponent,
      BeneficiaryDetailComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    providers: [TransactionsStoreService, provideMockStore({ initialState })],
  });
  const component = fixture.componentInstance;
  component.beneficiaries = executorBeneficiaries.beneficiaries;

  function filterBeneficiaries(filterValue: string) {
    component.filterValue(filterValue);
    fixture.detectChanges();
  }

  return { component, fixture, filterBeneficiaries };
}

describe('TransactionBeneficiaryComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('TransactionBeneficiaryComponent Given I see the Beneficiary Information section', () => {
    it('Should display a search field', async () => {
      await setup();
      expect(screen.getByTestId('search-filter')).toBeInTheDocument();
    });
  });

  describe('TransactionBeneficiaryComponent columns', () => {
    it('Should display six headers', async () => {
      await setup();
      expect(screen.getByTestId('radiobuttons')).toBeInTheDocument();
      expect(screen.getByTestId('institution-name')).toBeInTheDocument();
      expect(screen.getByTestId('acronym')).toBeInTheDocument();
      expect(screen.getByTestId('beneficiary-name')).toBeInTheDocument();
      expect(screen.getByTestId('account-number')).toBeInTheDocument();
    });
  });

  describe('getBeneficiaryDetails', () => {
    it('should return an observable of BeneficiaryDetails', async () => {
      const { component, fixture } = await setup();
      const beneficiaryDetails: BeneficiaryDetails = undefined;

      const spy = jest
        .spyOn(component.transactionApi, 'getBeneficiaryDetail')
        .mockReturnValue(of(beneficiaryDetails));

      component.getBeneficiaryDetails('1', beneficiaries[0]);
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('filterValue', () => {
    it('should not filter if value is empty string', async () => {
      const { component, fixture } = await setup();
      component.beneficiaries = beneficiaries;
      component.filterValue('');
      fixture.detectChanges();
      expect(component.filteredBeneficiaries).toEqual(beneficiaries);
    });

    it('should filter by the value of the search field', async () => {
      const { component, fixture } = await setup();
      component.beneficiaries = beneficiaries;
      component.filterValue('asd');
      fixture.detectChanges();
      expect(component.filteredBeneficiaries).toEqual([]);
    });
    it('should call getDpsBeneficiaries if transactionType  is DPS', async () => {
      const { component } = await setup();
      component.transactionType = TransactionsTypes.DPS;
      const spy = jest.spyOn(component, 'getDpsBeneficiaries');

      component.filterValue('asd');

      expect(spy).toHaveBeenCalled();
    });
  });
  describe('setBeneficiaryDetails', () => {
    it('should set the beneficiary details with the data of getBeneficiaryDetails service', async () => {
      const { component, fixture } = await setup();
      const beneficiariesMock: Beneficiary[] = [
        {
          institutionName: '',
          acronym: '',
          beneficiaryName: '',
          accountNumber: '',
          bankFlowId: '1',
        },
      ];

      const mockResponse: BeneficiaryDetails = {
        beneficiaryBasicData: null,
        beneficiaryAccountData: null,
        beneficiaryBank: null,
        intermediaryBank: null,
      };
      component.beneficiaries = beneficiariesMock;

      jest
        .spyOn(component, 'getBeneficiaryDetails')
        .mockReturnValue(of(mockResponse));

      component.setBeneficiaryDetails(beneficiariesMock);
      fixture.detectChanges();
      expect(component.beneficiaries[0].details).toEqual(
        beneficiariesMock[0].details
      );
    });
  });

  describe('getDpsBeneficiaries', () => {
    it('should set beneficiaries  and filteredBeneficiaries  with the data from the service', async () => {
      const { component, fixture } = await setup();

      const executor: ExecutorBeneficiaries = {
        beneficiaries: beneficiaries,
        itemsCount: 2,
      };
      jest
        .spyOn(component.transactionApi, 'getBeneficiaries')
        .mockReturnValue(of(executor));

      component.getDpsBeneficiaries('asd');
      fixture.detectChanges();
      expect(component.beneficiaries).toEqual(beneficiaries);
      expect(component.filteredBeneficiaries).toEqual(beneficiaries);
    });
  });
});
