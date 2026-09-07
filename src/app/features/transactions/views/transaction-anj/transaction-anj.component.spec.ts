import { render } from '@testing-library/angular';
import { TransactionAnjComponent } from './transaction-anj.component';
import { TransactionsHeaderComponent } from '../../components/transactions-header/transactions-header.component';
import { AmountsJustificationComponent } from '../../components/amounts-justification/amounts-justification.component';
import { TransactionComponentsComponent } from '../../components/transaction-components/transaction-components.component';
import { TransactionDocumentsComponent } from '../../components/transaction-documents/transaction-documents.component';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { provideMockStore } from '@ngrx/store/testing';
import { ProjectBalancesComponent } from '../../components/project-balances/project-balances.component';
import { TransactionDetailComponent } from '../../components/transaction-detail/transaction-detail.component';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { ProjectStatus } from '@core/models';
import { createTransactionComponentsForm } from '../../components/transaction-components/transaction-components.form';
import { AccordionModule } from '@fiduciary-interface/app/shared/components/accordion/accordion.module';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import {
  HttpRequestController,
  provideWindowSizeMock,
} from '@fiduciary-interface-test';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { RouterTestingModule } from '@angular/router/testing';
import { createAmountsJustificationForm } from '../../components/amounts-justification/amounts-justification.form';
import { transactionDetailForm } from '../../components/transaction-detail/transaction-detail.form';
import { AlertComponent } from '@fiduciary-interface/app/shared/components/notification/components/alert/alert.component';
import { IconsModule } from '@progress/kendo-angular-icons';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared/services/notification-global.service';

import { FiInputNumeric } from '@fiduciary-interface/app/shared/components/input-numeric/components/input-numeric/input-numeric.component';
import { FiTransactionsApiService } from '../../services';
import { of, throwError } from 'rxjs';
import {
  AnjTransactionRequest,
  AvailableNumbers,
  TransactionAnjGetResponse,
  TransactionSaveResponse,
} from '../../models';
import { DirectivesModule, PipeModule } from '@fiduciary-interface/app/shared';
import { PermissionActions } from '@core/enums';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { SelectedProjectState } from '@core/store';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { MaskingStatusPipe } from '../../pipes/masking-status.pipe';

const anjResponse: TransactionAnjGetResponse = {
  transactionId: 0,
  requestDetail: {
    requestNumber: 0,
    partNumber: 0,
    transactionNumber: 'string',
    status: 'string',
  },
  requestAmount: {
    bid: 0,
    localCounterpart: 0,
    cofinancing: 0,
  },
  components: [
    {
      id: 0,
      code: 0,
      name: 'string',
      amountsDistribute: {
        distributeIbd: 0,
        distributeLocalCounterpart: 0,
        distributeCofinancing: 0,
      },
      amountsProjectedAvailable: {
        distributeIbd: 0,
        distributeLocalCounterpart: 0,
        distributeCofinancing: 0,
      },
      readOnly: true,
    },
  ],
  isEditMode: true,
  canEdit: true,
};

const mockSaveResponse: TransactionSaveResponse = {
  id: 1,
  type: 'ANJ',
  statusCode: 'Pending signature',
  transactionNumbers: ['1', '2', '3'],
  statusId: 1,
  idANJ: 1,
  idANT: 1,
};

const availableNumbers: AvailableNumbers = {
  requestNumber: 1,
  partNumber: 1,
  currentRequestPartNumbers: {
    1: [1, 2, 3],
    2: [4, 5, 6],
  },
};

const canActivateMock = {
  canActivate: true,
  errorMsg: 'Error',
};

describe('TransactionAnjComponent', () => {
  it('should be created', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('cancel', () => {
    it('should call router navigate', async () => {
      const { component } = await setup();
      const routerSpy = jest.spyOn(component.router, 'navigate');
      component.cancelOrBack();
      expect(routerSpy).toHaveBeenCalled();
    });
    it('should call router navigate with transaction id', async () => {
      const { component } = await setup();
      component.activatedRoute.snapshot.params.id = '1';
      const routerSpy = jest.spyOn(component.router, 'navigate');
      component.cancelOrBack();
      expect(routerSpy).toHaveBeenCalled();
    });
  });

  describe('getTransactionById', () => {
    it('sholuld call store service', async () => {
      const { component } = await setup();
      const storeSpy = jest.spyOn(component.projectStore, 'selectedProject');
      component.getTransactionById(1);

      expect(storeSpy).toHaveBeenCalled();
    });

    it('should call populateTransaction', async () => {
      const { component } = await setup();

      jest
        .spyOn(component.transactionsApi, 'getAnjTransactionById')
        .mockReturnValue(of(anjResponse));

      const populateTransactionSpy = jest
        .spyOn(component, 'populateTransaction')
        .mockReturnValue();

      component.getTransactionById(1);
      expect(populateTransactionSpy).toHaveBeenCalled();
    });

    it('should show error toast on error response', async () => {
      const { component, fixture } = await setup();

      jest
        .spyOn(component.projectStore, 'selectedProject')
        .mockReturnValue(throwError('error'));
      const errorSpy = jest.spyOn(
        component.transactionsFormService,
        'showErrorToast'
      );

      component.getTransactionById(1);
      fixture.detectChanges();

      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('onInit', () => {
    it('should call getTransactionById', async () => {
      const { component } = await setup();
      component.transactionId = 1;
      const getTransactionByIdSpy = jest.spyOn(component, 'getTransactionById');

      component.ngOnInit();

      expect(getTransactionByIdSpy).toHaveBeenCalled();
    });
  });

  describe('loadSelectedProject', () => {
    it('should call getPartNumbersSuccess', async () => {
      const { component } = await setup();

      const mockResponse = {
        availableNumbers$: null,
        components$: {
          amountAssignIdb: 0,
          amountAssignLocalCounterpart: 0,
          amountAssignCofinancing: 0,
          components: [
            {
              id: 0,
              type: 0,
              code: 0,
              name: 'string',
              amountsDistribute: {
                distributeIbd: 0,
                distributeLocalCounterpart: 0,
                distributeCofinancing: 0,
              },
              amountsProjectedAvailable: {
                distributeIbd: 0,
                distributeLocalCounterpart: 0,
                distributeCofinancing: 0,
              },
              readOnly: true,
            },
          ],
          componentsTotalAmountCurrentIdb: 0,
          componentsTotalAmountCurrentLc: 0,
          componentsTotalAmountCurrentCf: 0,
          componentsTotalAmountDisbursedIdb: 0,
          componentsTotalAmountDisbursedLc: 0,
          componentsTotalAmountDisbursedCf: 0,
          componentsTotalAmountAvailableIdb: 0,
          componentsTotalAmountAvailableLc: 0,
          componentsTotalAmountAvailableCf: 0,
          componentsTotalAmountProjectedIdb: 0,
          componentsTotalAmountProjectedLc: 0,
          componentsTotalAmountProjectedCf: 0,
        },
      };
      const getPartNumbersSuccessSpy = jest.spyOn(
        component,
        'getAvailableNumbersSuccess'
      );

      jest
        .spyOn(component.transactionsFormService, 'canActivateTransaction')
        .mockReturnValue(of(canActivateMock));

      jest
        .spyOn(component, 'getTransactionsDetail')
        .mockReturnValue(of(mockResponse));

      component.loadSelectedProject();

      expect(getPartNumbersSuccessSpy).toHaveBeenCalled();
    });

    it('should call error toast', async () => {
      const { component } = await setup();
      jest
        .spyOn(component.projectStore, 'selectedProject')
        .mockReturnValue(throwError('error'));

      const errorSpy = jest.spyOn(
        component.transactionsFormService,
        'showErrorToast'
      );
      component.loadSelectedProject();

      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('saveTransaction', () => {
    it('should call saveAnjTransaction', async () => {
      const { component } = await setup();
      const saveTransaction: AnjTransactionRequest = {};
      const saveAnjTransactionSpy = jest
        .spyOn(component.transactionsApi, 'saveAnjTransaction')
        .mockReturnValue(of(null));

      component.saveTransaction(saveTransaction);
      expect(saveAnjTransactionSpy).toHaveBeenCalled();
    });
    it('should call saveTransactionSuccess', async () => {
      const { component } = await setup();
      const saveTransaction: AnjTransactionRequest = {};

      jest
        .spyOn(component.transactionsApi, 'saveAnjTransaction')
        .mockReturnValue(of(mockSaveResponse));

      const saveTransactionSuccessSpy = jest
        .spyOn(component, 'saveTransactionSuccess')
        .mockReturnValue();

      component.saveTransaction(saveTransaction).subscribe((_) => {
        expect(saveTransactionSuccessSpy).toHaveBeenCalled();
      });
    });
    it('should call showErrorToast on catchError', async () => {
      const { component } = await setup();
      const errorSpy = jest.spyOn(
        component.transactionsFormService,
        'showErrorToast'
      );
      const saveTransaction: AnjTransactionRequest = {};
      jest
        .spyOn(component.transactionsApi, 'saveAnjTransaction')
        .mockReturnValue(throwError('error'));

      component.saveTransaction(saveTransaction).subscribe((_) => {
        expect(errorSpy).toHaveBeenCalled();
      });
    });
  });

  describe('saveTransactionSuccess', () => {
    it('should set values given the response passed by parameter', async () => {
      const { component, fixture } = await setup();
      component.transactionNumber = '1';

      const notificationSpy = jest
        .spyOn(
          component.transactionsFormService,
          'showTransacctionSuccessToast'
        )
        .mockReturnValue();

      component.saveTransactionSuccess(mockSaveResponse);
      fixture.detectChanges();

      expect(notificationSpy).toHaveBeenCalled();
      expect(component.transactionNumber).toEqual(
        mockSaveResponse.transactionNumbers[0]
      );
      expect(component.transactionNumberPrefixed).toEqual(
        `OD${component.transactionNumber}`
      );
      expect(component.transactionStatusCode).toEqual(
        mockSaveResponse.statusCode
      );
    });
  });

  describe('onOneDocumentValidation', () => {
    it('should set hasMinimumDocs with the value of the parameter', async () => {
      const { component } = await setup();
      component.hasMinimumDocs = false;

      component.onOneDocumentValidation(true);

      expect(component.hasMinimumDocs).toEqual(true);
    });
  });

  describe('launchWorkflow', () => {
    it('launchWorkflow error', async () => {
      const { component, fixture } = await setup();

      jest
        .spyOn(component.transactionsFormService, 'checkPartNumbers')
        .mockReturnValue(throwError('error'));

      component.launchWorkflow('');
      fixture.detectChanges();

      expect(component.isLoading).toBe(false);
    });
  });

  describe('setReadOnly', () => {
    it('should disable transactionForm', async () => {
      const { component } = await setup();
      component.form.disable();
      component.setReadOnly(true);

      expect(component.form.disabled).toBe(true);
    });
  });

  describe('setPermissions', () => {
    it('should add displayTransactionListActions with CAN_NOT_EDIT if canEdit  === false', async () => {
      const { component, fixture } = await setup();
      component.displayTransactionListActions = [];
      component.setPermissions(false);
      fixture.detectChanges();
      expect(component.displayTransactionListActions).toEqual([
        PermissionActions.CAN_NOT_EDIT,
      ]);
    });
    it('should add displayTransactionListActions with CAN_EDIT and WORKFLOW_PERMISSION if canEdit  === true', async () => {
      const { component, fixture } = await setup();
      component.displayTransactionListActions = [];
      component.setPermissions(true);
      fixture.detectChanges();
      expect(component.displayTransactionListActions).toEqual([
        PermissionActions.CAN_EDIT,
        PermissionActions.WORKFLOW_PERMISSION,
      ]);
    });
  });

  describe('updateTransaction', () => {
    it('should call saveTransactionSuccess', async () => {
      const { component } = await setup();
      const saveTransaction: AnjTransactionRequest = {};

      jest
        .spyOn(component.transactionsApi, 'updateAnjTransaction')
        .mockReturnValue(of(mockSaveResponse));
      jest
        .spyOn(component.fiModalSvc, 'openWorkFlowCommentsModal')
        .mockReturnValue(of(''));

      const saveTransactionSuccessSpy = jest
        .spyOn(component, 'updateTransactionSuccess')
        .mockReturnValue();

      component.checkWorkflowComment(saveTransaction).subscribe((_) => {
        expect(saveTransactionSuccessSpy).toHaveBeenCalled();
      });
    });
    it('should call showErrorToast on catchError', async () => {
      const { component } = await setup();
      const errorSpy = jest.spyOn(
        component.transactionsFormService,
        'showErrorToast'
      );
      const saveTransaction: AnjTransactionRequest = {};
      jest
        .spyOn(component.transactionsApi, 'updateAnjTransaction')
        .mockReturnValue(throwError('error'));
      jest
        .spyOn(component.fiModalSvc, 'openWorkFlowCommentsModal')
        .mockReturnValue(of(''));

      component.checkWorkflowComment(saveTransaction).subscribe((_) => {
        expect(errorSpy).toHaveBeenCalled();
      });
    });
  });

  describe('updateTransactionSuccess', () => {
    it('shpuld call showTransacctionSuccessToast', async () => {
      const { component } = await setup();
      const errorSpy = jest
        .spyOn(
          component.transactionsFormService,
          'showTransacctionSuccessToast'
        )
        .mockReturnValue();

      component.updateTransactionSuccess();
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('canActivateTransaction', () => {
    const mockProjectState: SelectedProjectState = {
      selectedProject: {
        name: 'string',
        nameEs: 'string',
        nameFr: 'string',
        namePt: 'string',
        operationNumber: 'string',
        executor: 'string',
        executorAcronym: 'string',
        contract: 'string',
        approvedAmount: 100,
        countryCode: 'string',
        projectBucketId: 'string',
        id: '100',
        nameEn: '',
        projectName: {
          en: '',
          es: '',
          fr: '',
          pt: '',
        },
        currentApprovedAmount: 100,
        favorite: false,
      },
      loaded: true,
      loading: false,
      error: null,
    };
    it('should call canActivateTransaction', async () => {
      const { component } = await setup();

      const spy = jest
        .spyOn(component.transactionsFormService, 'canActivateTransaction')
        .mockReturnValue(of(canActivateMock));
      component.canActivateTransaction(mockProjectState);
      expect(spy).toHaveBeenCalled();
    });
    it('should not call canActivateTransaction', async () => {
      const { component } = await setup();
      component.transactionId = 123;

      const spy = jest
        .spyOn(component.transactionsFormService, 'canActivateTransaction')
        .mockReturnValue(of(canActivateMock));
      component.canActivateTransaction(mockProjectState);
      expect(spy).not.toHaveBeenCalled();
    });
  });
});

function getInitialState() {
  return {
    projectBalances: {
      projectBalances: {
        totalAmountPendingJustification: 800000,
        cofinanced: 0,
        retroactiveFinancingInformation: {
          hasRetroactiveFinancing: true,
          rfCurrentAmount: 3,
          rfOriginalAmount: 3,
          disbRfAmount: 3,
          availRfAmount: 3,
          projAvailRfAmount: 3,
          projDisbRfAmount: 3,
        },
      },
    },
    selectedProject: {
      selectedProject: {
        name: 'name',
        operationNumber: 'operationNumber',
        executor: 'executor',
        executorAcronym: 'executorAcronym',
        contract: 'contract',
        approvedAmount: 0,
        location: 'location',
        status: ProjectStatus.Finished,
        institution: 'institution',
        operation: null,
        countryCode: 'countryCode',
        projectBucketId: '20',
      },
      loaded: true,
    },
    preferences: {
      selectedLanguage: {
        code: 'en',
        name: 'English',
      },
      loaded: true,
    },
  };
}

async function setup() {
  const form = new FormGroup({
    requestDetailsForm: transactionDetailForm(),
    requestAmountsForm: createAmountsJustificationForm(),
    componentsForm: createTransactionComponentsForm(),
    documentsForm: new FormGroup({}),
  });
  const projectBucketId = '20';
  const { fixture } = await render(TransactionAnjComponent, {
    componentProperties: {
      form,
      projectBucketId,
      availableNumbers,
    },
    declarations: [
      TransactionsHeaderComponent,
      TransactionDetailComponent,
      AmountsJustificationComponent,
      TransactionComponentsComponent,
      TransactionDocumentsComponent,
      ProjectBalancesComponent,
      FiInputNumeric,
      AlertComponent,
      MaskingStatusPipe,
    ],
    imports: [
      MsalTestModule,
      DialogModule,
      TooltipModule,
      DirectivesModule,
      PipeModule,
      CommonModule,
      HttpClientTestingModule,
      ReactiveFormsModule,
      FormsModule,
      InputsModule,
      IconsModule,
      AccordionModule,
      ButtonsModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
      NotificationModule,
      RouterTestingModule,
    ],
    providers: [
      provideMockStore({ initialState: getInitialState() }),
      provideWindowSizeMock({ mobileView: false }),
      DatePipe,
      HttpRequestController,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
  });
  const httpMock = TestBed.inject(HttpRequestController);
  const component = fixture.componentInstance;

  const notificationService = TestBed.inject(NotificationGlobalService);
  const transactionService = TestBed.inject(FiTransactionsApiService);

  fixture.detectChanges();

  return {
    component,
    fixture,
    httpMock,
    notificationService,
    transactionService,
  };
}
