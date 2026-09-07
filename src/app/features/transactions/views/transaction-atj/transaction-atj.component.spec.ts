import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import {
  AccordionModule,
  DirectivesModule,
  KendoModule,
  NotificationGlobalService,
  PipeModule,
} from '@fiduciary-interface/app/shared';
import { HttpRequestController } from '@fiduciary-interface-test';
import { provideWindowSizeMock } from '@fiduciary-interface-test';
import { provideMockStore } from '@ngrx/store/testing';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { IconsModule } from '@progress/kendo-angular-icons';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { TransactionAtjComponent } from './transaction-atj.component';
import { FiTransactionsApiService } from '../../services';
import { ProjectStatus } from '@core/models';
import {
  BeneficiaryDetails,
  BeneficiaryEmmiter,
  ResponseJustAmount,
  TransactionByIdGetResponse,
  TransactionComponent,
  TransactionHeaderBalances,
  TransactionRequest,
  TransactionSaveResponse,
} from '../../models';
import { createAtjForm } from './transaction-atj.form';
import { of, throwError } from 'rxjs';
import { TransactionsTypes } from '../../enums';
import { PermissionActions } from '@core/enums';
import { SelectedProjectState } from '@core/store';
import { DialogModule, DialogService } from '@progress/kendo-angular-dialog';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { NotificationService } from '@progress/kendo-angular-notification';
import { TranslateEnumPipe } from '@fiduciary-interface/app/shared/pipes/translate-enum.pipe';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

const beneficiaryEmmiter: BeneficiaryEmmiter = {
  accountCurrency: 'USD',
  bankFlowId: '1',
};
const balances: TransactionHeaderBalances = {
  originalIdb: 10,
  currentIdb: 10,
  availableBalance: 10,
  projectedAvailableBalance: 10,
  disbursedAmount: 10,
  disbursedPercent: 100,
  lastDisbursementDate: null,
  cofinanced: 10,
  cancellations: 10,
  budgetContributionProjectedAvailableBalance: 10,
  budgetContributionAvailableBalance: 10,
  localCounterpart: 10,
  totalAmountPendingJustification: 10,
  minimumAmountPendingJustification: 10,
  toJustifyPercent: 10,
  coFinancedDisbursed: 0,
  localCounterpartDisbursed: 10,
  cumulativeExtension: 1,
  currentDisbExpiration: '',
  financialPeriodDeadline: '',
  lastAdvanceOfFoundsANTDate: '',
  lastAdvanceOfFoundsANTAmount: 1,
  lastRequestNumber: 1,
  retroactiveFinancingInformation: {
    availRfAmount: 3,
    disbRfAmount: 4,
    hasRetroactiveFinancing: true,
    projAvailRfAmount: 4,
    projDisbRfAmount: 5,
    rfCurrentAmount: 6,
    rfOriginalAmount: 6,
  },
};

const balancesWithNoCofinanced: TransactionHeaderBalances = {
  originalIdb: 10,
  currentIdb: 10,
  availableBalance: 10,
  projectedAvailableBalance: 10,
  disbursedAmount: 10,
  disbursedPercent: 100,
  lastDisbursementDate: null,
  cofinanced: 0,
  cancellations: 10,
  budgetContributionProjectedAvailableBalance: 10,
  budgetContributionAvailableBalance: 10,
  localCounterpart: 10,
  totalAmountPendingJustification: 10,
  minimumAmountPendingJustification: 10,
  toJustifyPercent: 10,
  coFinancedDisbursed: 0,
  localCounterpartDisbursed: 10,
  cumulativeExtension: 1,
  currentDisbExpiration: '',
  financialPeriodDeadline: '',
  lastAdvanceOfFoundsANTDate: '',
  lastAdvanceOfFoundsANTAmount: 1,
  lastRequestNumber: 1,
  retroactiveFinancingInformation: {
    availRfAmount: 5,
    disbRfAmount: 6,
    hasRetroactiveFinancing: true,
    projAvailRfAmount: 6,
    projDisbRfAmount: 6,
    rfCurrentAmount: 6,
    rfOriginalAmount: 6,
  },
};

const transactionSaveResponse: TransactionSaveResponse = {
  id: 1,
  type: 'ANT',
  statusCode: 'EDraft',
  transactionNumbers: ['1'],
  statusId: 1,
  idANJ: 1,
  idANT: 1,
};

const saveTransaction: TransactionRequest = {
  requestDetails: null,
  requestJustAmounts: null,
  requestAntAmounts: null,
  requestTotalsAmount: null,
  components: [],
  requestAntAndJustDetail: {
    numberDaysFinancialPlanning: 0,
    antDetail: null,
    justDetail: null,
  },
  beneficiary: null,
  documents: null,
};

const components: TransactionComponent = {
  amountsDistribute: {
    distributeCofinancing: 1,
    distributeIbd: 1,
    distributeLocalCounterpart: 1,
  },
  amountsProjectedAvailable: {
    distributeCofinancing: 1,
    distributeIbd: 1,
    distributeLocalCounterpart: 1,
  },
  code: 1,
  id: 1,
  name: 'string',
};

const transactionByIdGetResponse: TransactionByIdGetResponse = {
  transactionId: 1,
  transactionNumber: 'string',
  requestDetail: null,
  requestAntAndJustDetail: {
    numberDaysFinancialPlanning: 1,
    status: 'string',
    statusId: 1,
    antDetail: {
      transactionId: 1,
      partNumber: 1,
      requestNumber: 1,
    },
    justDetail: {
      partNumber: 1,
      requestNumber: 1,
      transactionId: 1,
    },
  },
  requestJustAmount: {
    bid: 1,
    cofinancing: 1,
    localCounterpart: 1,
  },
  requestAntAmount: {
    availableBalance: 1,
    equivalentApprovedCurrency: 1,
    requestedCurrency: {
      currency: 'USD',
      isBorrowing: true,
      isHard: true,
      numberOfDecimals: 2,
    },
    requiredAmount: 1,
  },
  requestTotalsAmount: null,
  beneficiary: {
    accountNumber: 'string',
    acronym: 'string',
    bankFlowId: 'string',
    beneficiaryName: 'string',
    institutionName: 'string',
  },
  components: [components],
  isEditMode: true,
  canEdit: true,
};

const transactionByIdGetResponseEditFalse: TransactionByIdGetResponse = {
  transactionId: 1,
  transactionNumber: 'string',
  requestDetail: null,
  requestAntAndJustDetail: {
    numberDaysFinancialPlanning: 1,
    status: 'string',
    statusId: 1,
    antDetail: {
      transactionId: 1,
      partNumber: 1,
      requestNumber: 1,
    },
    justDetail: {
      partNumber: 1,
      requestNumber: 1,
      transactionId: 1,
    },
  },
  requestJustAmount: {
    bid: 1,
    cofinancing: 1,
    localCounterpart: 1,
  },
  requestAntAmount: {
    availableBalance: 1,
    equivalentApprovedCurrency: 1,
    requestedCurrency: {
      currency: 'USD',
      isBorrowing: true,
      isHard: true,
      numberOfDecimals: 2,
    },
    requiredAmount: 1,
  },
  requestTotalsAmount: null,
  beneficiary: {
    accountNumber: 'string',
    acronym: 'string',
    bankFlowId: 'string',
    beneficiaryName: 'string',
    institutionName: 'string',
  },
  components: [components],
  isEditMode: false,
  canEdit: false,
};

const canActivateMock = {
  canActivate: false,
  errorMsg: 'Error',
};

function getInitialState() {
  return {
    projectBalances: {
      projectBalances: balances,
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
  const formGroup = createAtjForm();
  const projectBucketId = '1';
  const { fixture } = await render(TransactionAtjComponent, {
    componentProperties: {
      formGroup: formGroup,
      projectBucketId: projectBucketId,
    },
    declarations: [TransactionAtjComponent],
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
      KendoModule,
      DialogModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
      NotificationModule,
      RouterTestingModule,
      NoopAnimationsModule,
      LayoutModule,
    ],
    providers: [
      DialogService,
      NotificationService,
      provideMockStore({ initialState: getInitialState() }),
      provideWindowSizeMock({ mobileView: false }),
      HttpRequestController,
      DialogService,
      DatePipe,
      NotificationGlobalService,
      TranslateEnumPipe,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
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

describe('TransactionAtjComponent', () => {
  it('should be created', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('initRequestAmountsForm', () => {
    it('should disable requestAmountsForm when balances has no cofinanced', async () => {
      const { component } = await setup();
      const requestAmountsForm = component.requestAmountsForm;
      component.initRequestAmountsForm(balancesWithNoCofinanced);
      expect(requestAmountsForm.get('cofinancing').disabled).toBe(true);
    });
  });

  describe('cancel', () => {
    it('should call router navigate', async () => {
      const { component } = await setup();
      const routerSpy = jest.spyOn(component.router, 'navigate');
      component.cancel();
      expect(routerSpy).toHaveBeenCalled();
    });
    it('should call router navigate with transaction id', async () => {
      const { component } = await setup();
      component.activatedRoute.snapshot.params.id = '1';
      const routerSpy = jest.spyOn(component.router, 'navigate');
      component.cancel();
      expect(routerSpy).toHaveBeenCalled();
    });
  });

  describe('antAndAnjNumbersDuplicates', () => {
    it('should return true when antAndAnjNumbersDuplicates is true', async () => {
      const { component } = await setup();
      component.requestDetailsForm
        .get('requestNumberJustification')
        .setValue(1);
      component.requestDetailsForm.get('partNumberJustification').setValue(1);

      component.requestDetailsForm
        .get('requestNumberAdvanceOfFunds')
        .setValue(1);
      component.requestDetailsForm.get('partNumberAdvanceOfFunds').setValue(1);

      expect(component.antAndAnjNumbersDuplicates()).toBeTruthy();
    });
    it('should return false when antAndAnjNumbersDuplicates is false', async () => {
      const { component } = await setup();
      component.requestDetailsForm
        .get('requestNumberJustification')
        .setValue(1);
      component.requestDetailsForm.get('partNumberJustification').setValue(1);

      component.requestDetailsForm
        .get('requestNumberAdvanceOfFunds')
        .setValue(2);
      component.requestDetailsForm.get('partNumberAdvanceOfFunds').setValue(2);

      expect(component.antAndAnjNumbersDuplicates()).toBe(false);
    });
  });

  describe('onBeneficiaryChange', () => {
    it('should setErrors if currency doesnt match', async () => {
      const { component } = await setup();

      component.approvedCurrency = 'USD';
      const setErrorsSpy = jest.spyOn(component.beneficiaryForm, 'setErrors');
      component.onBeneficiaryChange(beneficiaryEmmiter);
      expect(setErrorsSpy).not.toHaveBeenCalled();
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

  describe('setRequestJustAmountsRequest', () => {
    it('should return a ResponseJustAmount ', async () => {
      const { component } = await setup();
      const mockJustAmount: ResponseJustAmount = {
        bid: 1,
        cofinancing: 1,
        localCounterpart: 1,
      };

      component.requestAmountsForm.get('bid').setValue(1);
      component.requestAmountsForm.get('cofinancing').setValue(1);
      component.requestAmountsForm.get('localCounterpart').setValue(1);

      const responseJustAmount = component.setRequestJustAmountsRequest();
      expect(responseJustAmount).toEqual(mockJustAmount);
    });
  });

  describe('setrequestAntAndJustDetailRequest', () => {
    it('shoudl return a requestAntAndJustDetailRequest', async () => {
      const { component } = await setup();

      const requestAntAndJustDetailRequestMock = {
        numberDaysFinancialPlanning: 1,
        antDetail: {
          partNumber: 1,
          requestNumber: 1,
          transactionId: 1,
        },
        justDetail: {
          partNumber: 1,
          requestNumber: 1,
          transactionId: 1,
        },
      };

      component.requestDetailsForm
        .get('numberDaysFinancialPlanning')
        .setValue(1);
      component.requestDetailsForm.get('partNumberJustification').setValue(1);
      component.requestDetailsForm
        .get('requestNumberJustification')
        .setValue(1);
      component.requestDetailsForm.get('partNumberAdvanceOfFunds').setValue(1);
      component.requestDetailsForm
        .get('requestNumberAdvanceOfFunds')
        .setValue(1);

      component.transactionIdANT = 1;
      component.transactionIdANJ = 1;

      const requestAntAndJustDetailRequest =
        component.setrequestAntAndJustDetailRequest();

      expect(requestAntAndJustDetailRequest).toEqual(
        requestAntAndJustDetailRequestMock
      );
    });
  });

  describe('setBeneficiaryCountry', () => {
    it('should set beneficiaryForm country with the value of the getBeneficiaryDetail service', async () => {
      const beneficiaryDetail: BeneficiaryDetails = {
        beneficiaryAccountData: null,
        beneficiaryBank: null,
        beneficiaryBasicData: {
          institutionName: 'string',
          streetAddress: 'string',
          city: 'ESP',
          country: 'string',
          zipCode: 'string',
          typeName: 'string',
          type: 'string',
          id: 'string',
          contactFirstName: 'string',
          contactEmail: 'string',
        },
        intermediaryBank: null,
      };
      const { component } = await setup();

      const getBeneficiaryDetailSpy = jest.spyOn(
        component.transactionsSvc,
        'getBeneficiaryDetail'
      );
      getBeneficiaryDetailSpy.mockReturnValue(of(beneficiaryDetail));
      component.setBeneficiaryCountry('20', '1');

      expect(component.beneficiaryForm.get('country').value).toBe(
        beneficiaryDetail.beneficiaryBasicData.country
      );
    });
  });

  describe('loadSelectedProject', () => {
    it('should call getPartNumbersSuccess after getTransactionsDetail', async () => {
      const { component, fixture } = await setup();

      const mockResponse = {
        availableNumbers$: {
          requestNumber: 0,
          partNumber: 0,
          currentRequestPartNumbers: {
            1: [0, 1, 2, 3],
            2: [3, 4, 5, 6],
            5: [3, 4, 5, 6],
            25: [3, 4, 5, 6],
          },
        },
        components$: {
          amountAssignIdb: 1,
          amountAssignLocalCounterpart: 1,
          amountAssignCofinancing: 1,
          components: [],
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
        beneficiaries$: [
          {
            institutionName: 'string',
            acronym: 'string',
            beneficiaryName: 'string',
            accountNumber: 'string',
            bankFlowId: 'string',
          },
        ],
      };

      component.transactionId = 1;

      jest
        .spyOn(component.transactionsFormService, 'canActivateTransaction')
        .mockReturnValue(of(canActivateMock));

      jest
        .spyOn(component, 'getTransactionsDetail')
        .mockReturnValue(of(mockResponse));

      const partSpy = jest.spyOn(component, 'getAvailableNumbersSuccess');
      const getTransactionByIdSpy = jest.spyOn(component, 'getTransactionById');

      component.loadSelectedProject();
      fixture.detectChanges();

      expect(partSpy).toHaveBeenCalled();
      expect(getTransactionByIdSpy).toHaveBeenCalled();
    });

    it('shold call error toast when something fails', async () => {
      const { component } = await setup();

      jest
        .spyOn(component.transactionsFormService, 'canActivateTransaction')
        .mockReturnValue(of(canActivateMock));

      jest
        .spyOn(component, 'getTransactionsDetail')
        .mockReturnValue(throwError('error'));

      const errorSpy = jest.spyOn(
        component.transactionsFormService,
        'showErrorToast'
      );

      component.loadSelectedProject();

      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('updateTransaction', () => {
    it('should call updateTransactionSuccess', async () => {
      const { component } = await setup();
      jest
        .spyOn(component.transactionsSvc, 'updateTransactionById')
        .mockReturnValue(of(transactionSaveResponse));
      jest
        .spyOn(component.fiModalSvc, 'openWorkFlowCommentsModal')
        .mockReturnValue(of(''));
      const spy = jest.spyOn(component, 'updateTransactionSuccess');

      component.checkWorkFlowComment(saveTransaction, false);
      expect(spy).toHaveBeenCalled();
    });

    it('should call showErrorToast', async () => {
      const { component } = await setup();
      jest
        .spyOn(component.transactionsSvc, 'updateTransactionById')
        .mockReturnValue(throwError('error'));
      jest
        .spyOn(component.fiModalSvc, 'openWorkFlowCommentsModal')
        .mockReturnValue(of(''));
      const spy = jest.spyOn(
        component.transactionsFormService,
        'showErrorToast'
      );

      component.checkWorkFlowComment(saveTransaction, false);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('saveTransaction', () => {
    it('should call saveTransactionSuccess', async () => {
      const { component } = await setup();
      jest
        .spyOn(component.transactionsSvc, 'postTransactionById')
        .mockReturnValue(of(transactionSaveResponse));

      const spy = jest.spyOn(component, 'saveTransactionSuccess');

      component.saveTransaction(saveTransaction);
      expect(spy).toHaveBeenCalled();
    });
    it('should call showErrorToast', async () => {
      const { component } = await setup();
      jest
        .spyOn(component.transactionsSvc, 'postTransactionById')
        .mockReturnValue(throwError('error'));

      const spy = jest.spyOn(
        component.transactionsFormService,
        'showErrorToast'
      );

      component.saveTransaction(saveTransaction);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('getTransactionById', () => {
    it('sholuld call getTransactionById', async () => {
      const { component } = await setup();
      const spy = jest
        .spyOn(component.transactionsSvc, 'getTransactionById')
        .mockReturnValue(of(transactionByIdGetResponseEditFalse));

      component
        .getTransactionById('1', 1, TransactionsTypes.ATJ)
        .subscribe(() => {
          expect(component.isEditMode).toBe(true);
          expect(spy).toHaveBeenCalled();
        });
    });
  });

  describe('setAntAmountsSection', () => {
    it('should set amountForms values of the response', async () => {
      const { component } = await setup();

      component.setAntAmountsSection(transactionByIdGetResponse);

      expect(component.amountsForm.get('requestedCurrency').value).toEqual(
        transactionByIdGetResponse.requestAntAmount.requestedCurrency
      );
    });
  });

  describe('setComponentFormSection', () => {
    it('should set componentsForm section with the value of the response', async () => {
      const { component } = await setup();

      component.setComponentFormSection(transactionByIdGetResponse);

      setTimeout(() => {
        expect(component.componentsForm.get('components').value).toEqual(
          transactionByIdGetResponse.components
        );
      }, 5);
    });
  });

  describe('setAnjFormSection', () => {
    it('should set requestAmountsForm section with the value of the response', async () => {
      const { component } = await setup();

      component.setAnjFormSection(transactionByIdGetResponse);

      expect(component.requestAmountsForm.get('bid').value).toEqual(
        transactionByIdGetResponse.requestJustAmount.bid
      );
    });
  });

  describe('submitSave', () => {
    it('should set error on requestNumberJustification if antAndAnjNumbersDuplicates() is true', async () => {
      const { component } = await setup();

      jest.spyOn(component, 'antAndAnjNumbersDuplicates').mockReturnValue(true);

      const errorSpy = jest.spyOn(
        component.requestDetailsForm.get('requestNumberJustification'),
        'setErrors'
      );

      component.submitSave(true);

      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('setBeneficiaryFormSection', () => {
    it('should set beneficiaryForm values with the parameters received', async () => {
      const { component } = await setup();

      component.setBeneficiaryFormSection(transactionByIdGetResponse);

      expect(component.beneficiaryForm.get('bankFlowId').value).toEqual(
        transactionByIdGetResponse.beneficiary.bankFlowId
      );
    });
  });

  describe('getters form controls', () => {
    it('should return bankflowIdControl', async () => {
      const { component } = await setup();

      const bankFlow = jest
        .spyOn(component.bankFlowIdControl, 'get')
        .mockReturnValue(new FormControl('bankFlowId'));

      expect(bankFlow).toBeTruthy();
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
      component.formGroup.disable();
      component.setReadOnly(true);

      expect(component.formGroup.disabled).toBe(true);
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
        currentApprovedAmount: 100,
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
