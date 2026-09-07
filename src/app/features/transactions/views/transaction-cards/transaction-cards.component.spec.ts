import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { ProjectStatus } from '@core/models';
import { SelectedProjectState } from '@core/store';
import { provideWindowSizeMock } from '@fiduciary-interface-test';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { provideMockStore } from '@ngrx/store/testing';
import { NotificationService } from '@progress/kendo-angular-notification';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { of, throwError } from 'rxjs';
import { TransactionsTypes } from '../../enums';
import { TransactionCard, TransactionsCardsResponse } from '../../models';

import { TransactionCardsComponent } from './transaction-cards.component';

const selectedProject: SelectedProjectState = {
  selectedProject: {
    approvedAmount: 60000000,
    contract: '4902/OC-CO',
    countryCode: 'CO',
    executor: 'MINISTERIO DE EDUCACION NACIONAL',
    executorAcronym: 'CO-MEN',
    operationNumber: 'CO-L1229',
    projectBucketId: 'c0c2633a-2ca2-4f45-9f8e-edcaea3a9950',
    status: ProjectStatus.InProgress,
    currentApprovedAmount: 1000,
    id: '1',
    nameEn: '',
    projectName: {
      en: '',
      es: '',
      fr: '',
      pt: '',
    },
    name: 'Programa de apoyo para la mejora de las trayectorias educativas en zonas rurales focalizadas',
    nameEs:
      'Programa de apoyo para la mejora de las trayectorias educativas en zonas rurales focalizadas',
    nameFr:
      "Programme d'appui pour la meilleure des trajectoires éducatives dans les zones rurales focalisées",
    namePt:
      'Programa de apoio para melhorar as trajectórias educativas nas zonas rurais focais',
    favorite: false,
  },
  loaded: true,
  loading: false,
  error: null,
};

const transactionCard: TransactionCard[] = [
  {
    description: '',
    errorMessage: '',
    icon: '',
    title: '',
    type: TransactionsTypes.ANJ,
  },
  {
    description: '',
    errorMessage: '',
    icon: '',
    title: '',
    type: TransactionsTypes.ANT,
  },
  {
    description: '',
    errorMessage: '',
    icon: '',
    title: '',
    type: TransactionsTypes.ATJ,
  },
  {
    description: '',
    errorMessage: '',
    icon: '',
    title: '',
    type: TransactionsTypes.DPB,
  },
  {
    description: '',
    errorMessage: '',
    icon: '',
    title: '',
    type: TransactionsTypes.DPS,
  },
  {
    description: '',
    errorMessage: '',
    icon: '',
    title: '',
    type: TransactionsTypes.DRP,
  },
];

function getInitialState() {
  return {
    selectedProject,
  };
}

describe('TransactionCards', () => {
  const initialState = getInitialState();
  async function setup(empty = false) {
    if (empty) {
      initialState.selectedProject.selectedProject = null;
    }
    const { fixture } = await render(TransactionCardsComponent, {
      declarations: [TransactionCardsComponent],
      imports: [
        MsalTestModule,
        RouterTestingModule,
        HttpClientTestingModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore({ initialState }),
        provideWindowSizeMock(),
        NotificationService,
      ],
    });
    const component = fixture.componentInstance;
    return { fixture, component };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('loadTransactionTypes', () => {
    it('should load TransactionCard', async () => {
      const { component } = await setup();

      const response: TransactionsCardsResponse = {
        transactionsType: transactionCard,
      };

      jest
        .spyOn(component.fiTransactionsApiService, 'getProjectTransactionTypes')
        .mockReturnValue(of(response));

      component.loadTransactionTypes();
      const sortedCard = component.sortTransactionByType(
        response.transactionsType
      );
      expect(component.transactionCard).toEqual(sortedCard);
    });
    it('should show alert toast when error response', async () => {
      const { component, fixture } = await setup();
      jest
        .spyOn(component.fiTransactionsApiService, 'getProjectTransactionTypes')
        .mockReturnValue(throwError('error'));
      const spyError = jest.spyOn(
        component.transactionsFormService,
        'showErrorToast'
      );
      component.loadTransactionTypes();
      fixture.detectChanges();
      expect(spyError).toHaveBeenCalled();
    });
  });

  describe('initTransactionType', () => {
    it('should call navigate with the correct params', async () => {
      const { component } = await setup();
      const routerSyp = jest.spyOn(component.router, 'navigate');
      component.initTransactionType('ANT');
      expect(routerSyp).toHaveBeenCalled();
    });
  });

  describe('sortTransactionByType', () => {
    it('should sort the transactions by type', async () => {
      const { component } = await setup();

      const sorted = component.sortTransactionByType(transactionCard);
      expect(sorted[0].type).toBe(TransactionsTypes.ANT);
    });
  });
});
