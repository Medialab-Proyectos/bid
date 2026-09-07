import { TestBed } from '@angular/core/testing';
import { ProjectStoreService } from '@core/services/store-services';
import { VisibilityService } from '@core/services/view';
import { RouterTestingModule } from '@angular/router/testing';
import { render } from '@testing-library/angular';
import { provideMockStore } from '@ngrx/store/testing';
import { Router } from '@angular/router';
import { routes } from './../../transactions-routing.module';
import { DatePipe, Location } from '@angular/common';
import { TransactionsComponent } from './transactions.component';
import { provideWindowSizeMock } from '@fiduciary-interface-test';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { DirectivesModule, PipeModule } from '@fiduciary-interface/app/shared';
import { TransactionsStoreService } from '../../store/services/transactions-store.service';
import { NotificationService } from '@progress/kendo-angular-notification';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ModalOptions, ProjectStatus } from '@core/models';
import { of, throwError } from 'rxjs';
import { DialogModule } from '@progress/kendo-angular-dialog';
import {
  Transaction,
  TransactionEventEmitter,
  TransactionGetResponse,
} from '../../models';
import {
  TransactionAction,
  TransactionsStatus,
  TransactionsTypes,
} from '../../enums';
import { SelectedProjectState } from '@core/store';
import { TransactionCardsComponent } from '../transaction-cards/transaction-cards.component';
import { TransactionAntComponent } from '../transaction-ant/transaction-ant.component';
import { TransactionAnjComponent } from '../transaction-anj/transaction-anj.component';
import { TransactionAtjComponent } from '../transaction-atj/transaction-atj.component';
import { TransactionDpbComponent } from '../transaction-dpb/transaction-dpb.component';
import { TransactionDpsComponent } from '../transaction-dps/transaction-dps.component';
import { AuditTrailComponent } from '../../components/audit-trail/audit-trail.component';
import { TransactionsFormService } from '../../services';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { WorkflowConfig } from '@fiduciary-interface/app/features/workflow/models';
import { TransactionDrpComponent } from '../transaction-drp/transaction-drp.component';
import { IFDatePipe } from '@fiduciary-interface/app/shared/pipes/if-date-pipe.pipe';
import { TransactionAniComponent } from '../transaction-ani/transaction-ani.component';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { MaskingStatusPipe } from '../../pipes/masking-status.pipe';

const mockTransaction1: Transaction[] = [
  {
    id: 1,
    transactionNumber: '2',
    transactionType: 'string',
    requestNumber: 1,
    partNumber: 1,
    currency: 'string',
    amount: 1,
    status: 'string',
    approvalDate: new Date(),
    lastUpdatedBy: 'string',
    lastUpdate: new Date('2021-12-29T03:00:00'),
    valueDate: new Date('2021-12-29T03:00:00'),
    transactionActions: [],
    transactionStatusCode: 'Completed',
    transactionStatusId: TransactionsStatus.COMPLETED,
    transactionTypeCode: TransactionsTypes.ANJ,
    parentId: 1,
  },
  {
    id: 2,
    transactionNumber: '1',
    transactionType: 'string',
    requestNumber: 1,
    partNumber: 1,
    currency: 'string',
    amount: 1,
    status: 'string',
    approvalDate: new Date('2021-12-30T03:00:00'),
    lastUpdatedBy: 'string',
    lastUpdate: new Date(),
    valueDate: new Date('2021-12-29T03:00:00'),
    transactionActions: [],
    transactionStatusCode: 'Completed',
    transactionStatusId: TransactionsStatus.COMPLETED,
    transactionTypeCode: TransactionsTypes.ANJ,
    parentId: 2,
  },
];

const mockTransactionResponse: TransactionGetResponse = {
  itemsCount: 2,
  transactions: mockTransaction1,
};

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
    name: 'Programa de apoyo para la mejora de las trayectorias educativas en zonas rurales focalizadas',
    nameEs:
      'Programa de apoyo para la mejora de las trayectorias educativas en zonas rurales focalizadas',
    nameFr:
      "Programme d'appui pour la meilleure des trajectoires éducatives dans les zones rurales focalisées",
    namePt:
      'Programa de apoio para melhorar as trajectórias educativas nas zonas rurais focais',
    favorite: false,
    nameEn: '',
    projectName: {
      en: '',
      es: '',
      fr: '',
      pt: '',
    },
  },
  loaded: true,
  loading: false,
  error: null,
};

const mockWfConfigWithUser: WorkflowConfig = {
  workFlowConfig: [
    {
      id: 'string',
      step: 0,
      institutionCode: 'string',
      order: 0,
      assignedUsers: [
        {
          userName: 'string',
          email: 'string',
          fullName: 'string',
          roleIdCode: 'string',
        },
      ],
      taskDescription: 'string',
      lastUpdate: new Date(),
      isMandatory: false,
    },
  ],
};
const mockWfConfigEmpty: WorkflowConfig = {
  workFlowConfig: [
    {
      id: 'string',
      step: 0,
      institutionCode: 'string',
      order: 0,
      assignedUsers: [],
      taskDescription: 'string',
      lastUpdate: new Date(),
      isMandatory: false,
    },
  ],
};

const mockWfConfigNull: WorkflowConfig = {
  workFlowConfig: [],
};

describe('TransactionsComponent', () => {
  async function setup() {
    const initialState = {
      selectedProject: selectedProject,
    };

    const { fixture } = await render(TransactionsComponent, {
      componentProperties: {},
      declarations: [
        TransactionAniComponent,
        TransactionCardsComponent,
        TransactionAntComponent,
        TransactionAnjComponent,
        TransactionAtjComponent,
        TransactionDpbComponent,
        TransactionDpsComponent,
        TransactionDrpComponent,
        AuditTrailComponent,
        MaskingStatusPipe,
      ],
      imports: [
        MsalTestModule,
        DialogModule,
        DirectivesModule,
        PipeModule,
        HttpClientTestingModule,
        TooltipModule,
        RouterTestingModule.withRoutes(routes),
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [
        MaskingStatusPipe,
        provideWindowSizeMock(),
        VisibilityService,
        ProjectStoreService,
        TransactionsStoreService,
        NotificationService,
        provideMockStore({ initialState }),
        Location,
        DatePipe,
        IFDatePipe,
        TransactionsFormService,
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    });

    const location: Location = TestBed.inject(Location);
    const router: Router = TestBed.inject(Router);
    router.initialNavigation();
    const component = fixture.componentInstance;
    return { fixture, component, router, location };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('startTransaction', () => {
    it('should call router navigate', async () => {
      const { component } = await setup();
      const routerSpy = jest.spyOn(component.router, 'navigate');
      component.startTransaction();
      expect(routerSpy).toHaveBeenCalled();
    });
  });

  describe('deleteTransactionModalLogic', () => {
    it('should haveBeenCalled', async () => {
      const { component } = await setup();
      const obsItem = {
        result: ModalOptions.ACCEPT,
      };

      const spy = jest
        .spyOn(component.fiModalSvc, 'open')
        .mockReturnValue(of(obsItem));
      component.deleteTransactionModalLogic(mockTransaction1[0]);

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('deleteTransaction', () => {
    it('should filter the transactions array', async () => {
      const { component, fixture } = await setup();
      component.transactions = mockTransaction1;

      jest
        .spyOn(component.fiTransactionsApiService, 'deleteTransaction')
        .mockReturnValue(of('string'));

      component.deleteTransaction('1', mockTransaction1[0]);
      fixture.detectChanges();
      expect(component.transactions).toHaveLength(1);
    });

    it('should call notificationGlobalService on error response', async () => {
      const { component } = await setup();

      jest
        .spyOn(component.fiTransactionsApiService, 'deleteTransaction')
        .mockReturnValue(throwError('error'));

      const spy = jest.spyOn(
        component.transactionsFormService,
        'showErrorToast'
      );
      component.deleteTransaction('1', mockTransaction1[0]);

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('handleTransactionActions', () => {
    it('should call router navigate if event is SHOW_AUDIT_TRAIL', async () => {
      const { component } = await setup();

      const event: TransactionEventEmitter = {
        action: {
          text: 'SHOW_AUDIT_TRAIL',
          value: TransactionAction.SHOW_AUDIT_TRAIL,
        },
        transaction: mockTransaction1[0],
      };
      const routerSpy = jest.spyOn(component.router, 'navigate');
      component.handleTransactionActions(event);
      expect(routerSpy).toHaveBeenCalled();
    });
    it('should call router navigate if event is SHOW_AUDIT_TRAIL with parentId', async () => {
      const { component } = await setup();

      const event: TransactionEventEmitter = {
        action: {
          text: 'SHOW_AUDIT_TRAIL',
          value: TransactionAction.SHOW_AUDIT_TRAIL,
        },
        transaction: mockTransaction1[1],
      };
      const routerSpy = jest.spyOn(component.router, 'navigate');
      component.handleTransactionActions(event);
      expect(routerSpy).toHaveBeenCalled();
    });

    it('should call deleteTransactionModalLogic if event is DELETE', async () => {
      const { component } = await setup();

      const event: TransactionEventEmitter = {
        action: {
          text: 'DELETE',
          value: TransactionAction.DELETE,
        },
        transaction: mockTransaction1[0],
      };
      const routerSpy = jest
        .spyOn(component, 'deleteTransactionModalLogic')
        .mockReturnValue();
      component.handleTransactionActions(event);
      expect(routerSpy).toHaveBeenCalled();
    });
  });

  describe('loadTransactionsTable', () => {
    it('should call fiTransactionsApiService', async () => {
      const { component } = await setup();
      jest
        .spyOn(component.projectStoreSvc, 'selectedProject')
        .mockReturnValue(of(selectedProject));

      const spy = jest
        .spyOn(component.fiTransactionsApiService, 'getProjectTransactions')
        .mockReturnValue(of(mockTransactionResponse));

      component.loadTransactionsTable();
      expect(spy).toHaveBeenCalled();
    });

    it('should call notificationGlobalService on error response', async () => {
      const { component } = await setup();

      jest
        .spyOn(component.projectStoreSvc, 'selectedProject')
        .mockReturnValue(of(selectedProject));

      jest
        .spyOn(component.fiTransactionsApiService, 'getProjectTransactions')
        .mockReturnValue(throwError('error'));

      const spy = jest.spyOn(
        component.transactionsFormService,
        'showErrorToast'
      );
      component.loadTransactionsTable();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('checkworkFlowConfig', () => {
    it('should check workflow config', async () => {
      const { component } = await setup();
      component.contract = {
        email: '',
        name: '',
        username: '',
        given_name: '',
        family_name: '',
        is_internal: false,
        contactId: '',
      };

      component.checkworkFlowConfig('').subscribe((response) => {
        expect(response).toBe(true);
      });
    });
  });

  describe('checkworkFlowConfigSuccess', () => {
    it('should set isStartTransactionDisabled false is config is empty', async () => {
      const { component, fixture } = await setup();
      component.checkworkFlowConfigSuccess(mockWfConfigNull);
      fixture.detectChanges();
      expect(component.isStartTransactionDisabled).toBe(true);
    });
    it('should set isStartTransactionDisabled true is config has assignedUsers in every workFlowConfig', async () => {
      const { component, fixture } = await setup();
      component.checkworkFlowConfigSuccess(mockWfConfigWithUser);
      fixture.detectChanges();
      expect(component.isStartTransactionDisabled).toBe(false);
    });
    it('should set isStartTransactionDisabled false because has no users', async () => {
      const { component, fixture } = await setup();
      component.checkworkFlowConfigSuccess(mockWfConfigEmpty);
      fixture.detectChanges();
      expect(component.isStartTransactionDisabled).toBe(true);
    });
  });
});
