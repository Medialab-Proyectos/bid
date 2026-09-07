import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';
import { TransactionAntComponent } from './transaction-ant.component';
import { render } from '@testing-library/angular';
import { TransactionsHeaderComponent } from '../../components/transactions-header/transactions-header.component';
import { TransactionDetailComponent } from '../../components/transaction-detail/transaction-detail.component';
import { TransactionDocumentsComponent } from '../../components/transaction-documents/transaction-documents.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { RouterTestingModule } from '@angular/router/testing';
import {
  HttpRequestController,
  provideWindowSizeMock,
} from '@fiduciary-interface-test';
import { of, throwError } from 'rxjs';
import {
  AntTransactionRequest,
  BeneficiaryDetails,
  BeneficiaryEmmiter,
  TransactionAntResponse,
  TransactionSaveResponse,
} from '../../models';
import { transactionDetailForm } from '../../components/transaction-detail/transaction-detail.form';
import { amountsDisbursementForm } from '../../components/amounts-disbursement/amounts-disbursement.form';
import { transactionBeneficiaryForm } from '../../components/transaction-beneficiary/transaction-beneficiary.form';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import {
  AccordionModule,
  DirectivesModule,
  NotificationGlobalService,
  PipeModule,
} from '@fiduciary-interface/app/shared';
import { FiTransactionsApiService } from '../../services';
import { AmountsDisbursementComponent } from '../../components/amounts-disbursement/amounts-disbursement.component';
import { TransactionBeneficiaryComponent } from '../../components/transaction-beneficiary/transaction-beneficiary.component';
import { ProjectBalancesComponent } from '../../components/project-balances/project-balances.component';
import { FiInputNumeric } from '@fiduciary-interface/app/shared/components/input-numeric/components/input-numeric/input-numeric.component';
import { AlertComponent } from '@fiduciary-interface/app/shared/components/notification/components/alert/alert.component';
import { CommonModule, DatePipe } from '@angular/common';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { IconsModule } from '@progress/kendo-angular-icons';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { ProjectStatus } from '@core/models';
import { PermissionActions } from '@core/enums';
import { SelectedProjectState } from '@core/store';
import { DialogService } from '@progress/kendo-angular-dialog';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';

const beneficiaryEmmiter: BeneficiaryEmmiter = {
  accountCurrency: 'USD',
  bankFlowId: '1',
};

const canActivateMock = {
  canActivate: true,
  errorMsg: 'Error',
};

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
    detail: transactionDetailForm(),
    amounts: amountsDisbursementForm(),
    beneficiary: transactionBeneficiaryForm(),
    documents: new FormGroup({}),
  });
  const projectBucketId = '20';
  const { fixture } = await render(TransactionAntComponent, {
    componentProperties: {
      transactionForm: form,
      projectBucketId,
    },
    declarations: [
      TransactionsHeaderComponent,
      TransactionDetailComponent,
      AmountsDisbursementComponent,
      TransactionBeneficiaryComponent,
      TransactionDocumentsComponent,
      ProjectBalancesComponent,
      FiInputNumeric,
      AlertComponent,
    ],
    imports: [
      MsalTestModule,
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
      DatePipe,
      provideMockStore({ initialState: getInitialState() }),
      provideWindowSizeMock({ mobileView: false }),
      HttpRequestController,

      DialogService,
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

describe('TransactionAntComponent', () => {
  it('should be created', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('getTransactionById', () => {
    it('sholuld call store service', async () => {
      const { component } = await setup();
      const storeSpy = jest.spyOn(component.projectStoreSvc, 'selectedProject');
      component.getTransactionById(1);

      expect(storeSpy).toHaveBeenCalled();
    });

    it('should call populateTransaction', async () => {
      const { component } = await setup();

      const antResponse: TransactionAntResponse = {
        transactionId: 0,
        requestDetail: {
          transactionNumber: 'string',
          status: 'string',
          requestNumber: 0,
          partNumber: 0,
        },
        requestAmount: {
          availableBalance: 0,
          requestedCurrency: {
            currency: 'string',
            isHard: false,
            isBorrowing: true,
            numberOfDecimals: 0,
          },
          requiredAmount: 0,
          equivalentApprovedCurrency: 0,
        },
        beneficiary: {
          institutionName: 'string',
          acronym: 'string',
          beneficiaryName: 'string',
          beneficiaryId: 'string',
          accountNumber: 'string',
          bankFlowId: 'string',
        },
        isEditMode: true,
        canEdit: true,
      };

      jest
        .spyOn(component.transactionsSvc, 'getAntTransactionById')
        .mockReturnValue(of(antResponse));

      const populateTransactionSpy = jest
        .spyOn(component, 'populateTransaction')
        .mockReturnValue();

      component.getTransactionById(1);
      expect(populateTransactionSpy).toHaveBeenCalled();
    });

    it('should show error toast on error response', async () => {
      const { component, fixture } = await setup();

      jest
        .spyOn(component.projectStoreSvc, 'selectedProject')
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

  describe('saveTransaction', () => {
    it('should call saveAntTransaction', async () => {
      const { component } = await setup();
      const saveTransaction: AntTransactionRequest = {};
      const saveAntTransactionSpy = jest
        .spyOn(component.transactionsSvc, 'saveNewAntTransaction')
        .mockReturnValue(of(null));

      component.saveTransaction(saveTransaction);
      expect(saveAntTransactionSpy).toHaveBeenCalled();
    });
    it('shouls show error msg on error response', async () => {
      const { component } = await setup();

      jest
        .spyOn(component.transactionsSvc, 'saveNewAntTransaction')
        .mockReturnValue(throwError('error'));
      const errorSpy = jest.spyOn(
        component.transactionsFormService,
        'showErrorToast'
      );

      component.saveTransaction({});
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('saveTransactionSuccess', () => {
    const mockSaveResponse: TransactionSaveResponse = {
      id: 1,
      type: 'ANT',
      statusCode: 'string',
      transactionNumbers: ['1', '2', '3'],
      statusId: 1,
      idANJ: 1,
      idANT: 1,
    };

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
      expect(component.transactionNumberWithPrefix).toEqual(
        `OD${component.transactionNumber}`
      );
      expect(component.transactionStatusCode).toEqual(
        mockSaveResponse.statusCode
      );
    });
  });

  describe('updateTransaction', () => {
    it('should call updateAntTransaction', async () => {
      const { component } = await setup();
      jest
        .spyOn(component.fiModalSvc, 'openWorkFlowCommentsModal')
        .mockReturnValue(of(''));
      const saveTransaction: AntTransactionRequest = {};
      const saveAntTransactionSpy = jest
        .spyOn(component.transactionsSvc, 'updateAntTransaction')
        .mockReturnValue(of(null));

      component.checkWorkflowComment(saveTransaction);
      expect(saveAntTransactionSpy).toHaveBeenCalled();
    });

    it('should call error toast on error response', async () => {
      const { component } = await setup();
      jest
        .spyOn(component.fiModalSvc, 'openWorkFlowCommentsModal')
        .mockReturnValue(of(''));
      const saveTransaction: AntTransactionRequest = {};
      jest
        .spyOn(component.transactionsSvc, 'updateAntTransaction')
        .mockReturnValue(throwError('error'));
      const errorSpy = jest.spyOn(
        component.transactionsFormService,
        'showErrorToast'
      );

      component.checkWorkflowComment(saveTransaction);
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('updateTransactionSuccess', () => {
    it('should set values given the response passed by parameter', async () => {
      const { component, fixture } = await setup();
      component.transactionNumber = '1';

      const notificationSpy = jest
        .spyOn(
          component.transactionsFormService,
          'showTransacctionSuccessToast'
        )
        .mockReturnValue();

      component.updateTransactionSuccess();
      fixture.detectChanges();

      expect(notificationSpy).toHaveBeenCalled();
    });
  });

  describe('getters', () => {
    it('should return transactions form', async () => {
      const { component } = await setup();

      const transaction = jest
        .spyOn(component.transaction, 'get')
        .mockReturnValue(new FormGroup({}));

      expect(transaction).toBeTruthy();
    });

    it('should return details form', async () => {
      const { component } = await setup();

      const details = jest
        .spyOn(component.detail, 'get')
        .mockReturnValue(new FormGroup({}));

      expect(details).toBeTruthy();
    });

    it('should return amounts form', async () => {
      const { component } = await setup();

      const amounts = jest
        .spyOn(component.amounts, 'get')
        .mockReturnValue(new FormGroup({}));

      expect(amounts).toBeTruthy();
    });

    it('should return beneficiary form', async () => {
      const { component } = await setup();

      const beneficiary = jest
        .spyOn(component.beneficiary, 'get')
        .mockReturnValue(new FormGroup({}));

      expect(beneficiary).toBeTruthy();
    });
    it('should return bankflowIdControl', async () => {
      const { component } = await setup();

      const bankFlow = jest
        .spyOn(component.bankFlowIdControl, 'get')
        .mockReturnValue(new FormControl('bankFlowId'));

      expect(bankFlow).toBeTruthy();
    });
  });

  describe('populateTransaction', () => {
    it('should set values to the form', async () => {
      const antResponse: TransactionAntResponse = {
        transactionId: 0,
        requestDetail: {
          transactionNumber: 'string',
          status: 'string',
          requestNumber: 0,
          partNumber: 0,
          numberDaysFinancialPlanning: 123,
        },
        requestAmount: {
          availableBalance: 0,
          requestedCurrency: {
            currency: 'string',
            isHard: false,
            isBorrowing: true,
            numberOfDecimals: 0,
          },
          requiredAmount: 0,
          equivalentApprovedCurrency: 0,
        },
        beneficiary: {
          institutionName: 'string',
          acronym: 'string',
          beneficiaryName: 'string',
          beneficiaryId: 'string',
          accountNumber: 'string',
          bankFlowId: 'string',
        },
        isEditMode: true,
        canEdit: true,
      };

      const { component } = await setup();

      component.availableNumbers = {
        currentRequestPartNumbers: {
          1: [1],
          2: [2],
        },
        partNumber: 1,
        requestNumber: 1,
      };

      component.populateTransaction(antResponse);

      expect(component.isLoadingApiData).toBe(false);
      expect(component.isEditMode).toBe(true);
    });
  });

  describe('cancelTransaction', () => {
    it('should call router navigate', async () => {
      const { component } = await setup();
      const routerSpy = jest.spyOn(component.router, 'navigate');
      component.cancelOrBackTransaction();
      expect(routerSpy).toHaveBeenCalled();
    });
    it('should call router navigate with transaction id', async () => {
      const { component } = await setup();
      component.activatedRoute.snapshot.params.id = '1';
      const routerSpy = jest.spyOn(component.router, 'navigate');
      component.cancelOrBackTransaction();
      expect(routerSpy).toHaveBeenCalled();
    });
  });

  describe('onBeneficiaryChange', () => {
    it('should setErrors if currency doesnt match', async () => {
      const { component } = await setup();

      component.approvedCurrency = 'USD';
      const setErrorsSpy = jest.spyOn(component.beneficiary, 'setErrors');
      component.onBeneficiaryChange(beneficiaryEmmiter);
      expect(setErrorsSpy).not.toHaveBeenCalled();
    });
  });

  describe('setBeneficiaryCountry', () => {
    it('should set value country in beneficiary FormControl', async () => {
      const { component } = await setup();

      const beneficiaryDetail: BeneficiaryDetails = {
        intermediaryBank: {
          name: 'string',
          branchName: 'string',
          swiftCode: 'string',
          abaRoutingCode: 'string',
          streetAddress: 'string',
          city: 'string',
          country: 'string',
          zipCode: 'string',
          specialInstructions: 'string',
        },
        beneficiaryBank: {
          name: 'string',
          branchName: 'string',
          swiftCode: 'string',
          abaRoutingCode: 'string',
          streetAddress: 'string',
          city: 'string',
          country: 'Spain',
          zipCode: 'string',
          specialInstructions: 'string',
        },
        beneficiaryBasicData: {
          institutionName: 'string',
          streetAddress: 'string',
          city: 'string',
          country: 'Spain',
          zipCode: 'string',
          typeName: 'string',
          type: 'string',
          id: 'string',
          contactFirstName: 'string',
          contactEmail: 'string',
        },
        beneficiaryAccountData: {
          name: 'string',
          bankAccountNumber: 'string',
          accountCurrency: 'string',
          accountSpecialInstructions: 'string',
        },
      };

      jest
        .spyOn(component.transactionsSvc, 'getBeneficiaryDetail')
        .mockReturnValue(of(beneficiaryDetail));
      component.setBeneficiaryCountry(
        'id',
        beneficiaryDetail.beneficiaryBasicData.country
      );

      expect(component.beneficiary.get('country').value).toEqual('Spain');
    });
  });

  describe('loadSelectedProject', () => {
    it('should call getPartNumbersSuccess', async () => {
      const { component } = await setup();

      const mockResponse = {
        availableNumbers$: null,
        beneficiaries$: [],
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
        .spyOn(component.projectStoreSvc, 'selectedProject')
        .mockReturnValue(throwError('error'));

      const errorSpy = jest.spyOn(
        component.transactionsFormService,
        'showErrorToast'
      );
      component.loadSelectedProject();

      expect(errorSpy).toHaveBeenCalled();
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

  describe('setReadOnly', () => {
    it('should disable transactionForm', async () => {
      const { component } = await setup();
      component.transactionForm.disable();
      component.setReadOnly(true);

      expect(component.transactionForm.disabled).toBe(true);
    });
  });

  describe('setPermissions', () => {
    it('should set permissions CAN_NOT_EDIT', async () => {
      const { component } = await setup();

      component.setPermissions(false);

      expect(component.displayTransactionListActions).toEqual([
        PermissionActions.TRANSACTION_ACTION,
        PermissionActions.VIEW_DISBURSEMENT_ACTION,
        PermissionActions.IS_CREATE,
        PermissionActions.CAN_NOT_EDIT,
      ]);
    });
    it('should set permissions CAN_EDIT, WORKFLOW_PERMISSION', async () => {
      const { component } = await setup();

      component.setPermissions(true);

      expect(component.displayTransactionListActions).toEqual([
        PermissionActions.TRANSACTION_ACTION,
        PermissionActions.VIEW_DISBURSEMENT_ACTION,
        PermissionActions.IS_CREATE,
        PermissionActions.CAN_EDIT,
        PermissionActions.WORKFLOW_PERMISSION,
      ]);
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
