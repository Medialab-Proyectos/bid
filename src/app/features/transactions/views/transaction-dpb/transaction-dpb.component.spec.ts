import { TransactionDpbComponent } from './transaction-dpb.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { NotificationService } from '@progress/kendo-angular-notification';
import { RouterTestingModule } from '@angular/router/testing';
import { provideWindowSizeMock } from '@fiduciary-interface-test';
import {
  Beneficiary,
  BeneficiaryDetails,
  BeneficiaryEmmiter,
  InstitutionExist,
  TransactionByIdGetResponse,
  TransactionComponent,
  TransactionHeaderBalances,
  TransactionRequest,
  TransactionSaveResponse,
} from '../../models';
import { Currency, ProjectStatus } from '@core/models';
import { FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { createDpbForm } from './transaction-dps.form';
import { TransactionsTypes } from '../../enums';
import { DirectivesModule } from '@fiduciary-interface/app/shared';
import { PermissionActions } from '@core/enums';
import { SelectedProjectState } from '@core/store';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';

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
    rfCurrentAmount: 5,
    rfOriginalAmount: 6,
  },
};

const currency: Currency = {
  currency: 'EUR',
  isBorrowing: true,
  isHard: true,
  numberOfDecimals: 2,
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

const transactionSaveResponse: TransactionSaveResponse = {
  id: 1,
  type: 'ANT',
  statusCode: 'EDraft',
  transactionNumbers: ['1'],
  statusId: 1,
  idANJ: 1,
  idANT: 1,
};

const beneficiaryEmmiter: BeneficiaryEmmiter = {
  accountCurrency: 'USD',
  bankFlowId: '1',
};

const beneficiaries: Beneficiary[] = [
  {
    institutionName: '',
    acronym: '',
    beneficiaryName: '',
    accountNumber: '',
    bankFlowId: '1',
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
  requestDetail: {
    partNumber: 1,
    requestNumber: 2,
    numberDaysFinancialPlanning: 180,
    status: 'asd',
    statusId: 1,
    transactionNumber: '123',
  },
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
  requestTotalsAmount: {
    selectedRequestedCurrency: {
      currency: 'USD',
      isBorrowing: false,
      isHard: true,
      numberOfDecimals: 2,
    },
    totalsItems: [
      {
        equivalentCurrency: 1,
        expectedBalances: 1,
        requestedAmount: 1,
        source: 'BID',
        sourceType: 1,
      },
    ],
  },
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

async function setup() {
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
  const { fixture } = await render(TransactionDpbComponent, {
    componentProperties: {
      form: createDpbForm(),
      projectBucketId: '20',
    },
    declarations: [TransactionDpbComponent],
    imports: [
      MsalTestModule,
      DialogModule,
      DirectivesModule,
      HttpClientTestingModule,
      RouterTestingModule,
      ReactiveFormsModule,
      FormsModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    providers: [
      provideMockStore({ initialState: getInitialState() }),
      provideWindowSizeMock(),
      NotificationService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  });
  const component = fixture.componentInstance;
  return { fixture, component };
}

describe('TransactionDpbComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
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

  describe('loadProjectBalances', () => {
    it('should set readonlyDistributeCofinancing  if coFinancedDisbursed is 0', async () => {
      const { component } = await setup();
      component.loadProjectBalances();
      expect(component.readonlyDistributeCofinancing).toBe(undefined);
    });
  });

  describe('loadSelectedProject', () => {
    it('should call getPartNumbersSuccess', async () => {
      const { component } = await setup();
      component.transactionId = 1;

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
        .spyOn(component.transactionsFormService, 'canActivateTransaction')
        .mockReturnValue(of(canActivateMock));
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
        component.transactionsApi,
        'getBeneficiaryDetail'
      );
      getBeneficiaryDetailSpy.mockReturnValue(of(beneficiaryDetail));
      component.setBeneficiaryCountry('20', '1');

      expect(component.beneficiaryForm.get('country').value).toBe(
        beneficiaryDetail.beneficiaryBasicData.country
      );
    });
  });
  describe('onBeneficiaryChange', () => {
    it('not setErrors', async () => {
      const { component } = await setup();
      const setErrorsSpy = jest.spyOn(component.beneficiaryForm, 'setErrors');
      component.onBeneficiaryChange(beneficiaryEmmiter);
      expect(setErrorsSpy).not.toHaveBeenCalled();
    });
  });
  describe('amountsValueChanges', () => {
    it('should call onBeneficiaryChange on amountsValueChanges', async () => {
      const { component, fixture } = await setup();
      const onBeneficiaryChangeSpy = jest.spyOn(
        component,
        'onBeneficiaryChange'
      );

      component.amountsForm.get('selectedRequestedCurrency').setValue(currency);
      component.beneficiaryEmmiter = {
        accountCurrency: 'USD',
        bankFlowId: 'string',
      };
      fixture.detectChanges();
      component.amountsValueChanges();
      expect(onBeneficiaryChangeSpy).toHaveBeenCalled();
    });
  });
  describe('updateTransaction', () => {
    it('should call updateTransactionSuccess', async () => {
      const { component } = await setup();
      jest
        .spyOn(component.fiModalSvc, 'openWorkFlowCommentsModal')
        .mockReturnValue(of(''));
      jest
        .spyOn(component.transactionsApi, 'updateTransactionById')
        .mockReturnValue(of(transactionSaveResponse));

      const spy = jest.spyOn(component, 'updateTransactionSuccess');

      component.checkWorkFlowComment(saveTransaction, false);
      expect(spy).toHaveBeenCalled();
    });

    it('should call showErrorToast', async () => {
      const { component } = await setup();
      jest
        .spyOn(component.fiModalSvc, 'openWorkFlowCommentsModal')
        .mockReturnValue(of(''));
      jest
        .spyOn(component.transactionsApi, 'updateTransactionById')
        .mockReturnValue(throwError('error'));

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
        .spyOn(component.transactionsApi, 'postTransactionById')
        .mockReturnValue(of(transactionSaveResponse));

      const spy = jest.spyOn(component, 'saveTransactionSuccess');

      component.saveTransaction(saveTransaction);
      expect(spy).toHaveBeenCalled();
    });
    it('should call showErrorToast', async () => {
      const { component } = await setup();
      jest
        .spyOn(component.transactionsApi, 'postTransactionById')
        .mockReturnValue(throwError('error'));

      const spy = jest.spyOn(
        component.transactionsFormService,
        'showErrorToast'
      );

      component.saveTransaction(saveTransaction);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('onDpsBeneficiaryChange', () => {
    it('should set beneficiaries with the values of the parameter', async () => {
      const { component } = await setup();
      component.onDpsBeneficiaryChange(beneficiaries);
      expect(component.beneficiaries).toEqual(beneficiaries);
    });
  });

  describe('getters', () => {
    it('should return componentsFormArray', async () => {
      const { component } = await setup();

      const transaction = jest
        .spyOn(component.componentsFormArray, 'get')
        .mockReturnValue(new FormArray([]));

      expect(transaction).toBeTruthy();
    });
    it('should return totalItems', async () => {
      const { component } = await setup();

      const transaction = jest
        .spyOn(component.totalItems, 'get')
        .mockReturnValue(new FormArray([]));

      expect(transaction).toBeTruthy();
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

  describe('checkInstitutionExists', () => {
    it('should set error on beneficiaryForm if intitutionExist === false', async () => {
      const { component } = await setup();

      const response: InstitutionExist = {
        intitutionExist: false,
      };

      jest
        .spyOn(component.transactionsApi, 'checkIfInstitutionExist')
        .mockReturnValue(of(response));

      component.checkInstitutionExists('123').subscribe(() => {
        const setErrorSpy = jest.spyOn(component.beneficiaryForm, 'setErrors');

        expect(setErrorSpy).toHaveBeenCalled();
      });
    });
    it('should not call beneficiaryForm if intitutionExist === false', async () => {
      const { component } = await setup();

      const response: InstitutionExist = {
        intitutionExist: true,
      };

      jest
        .spyOn(component.transactionsApi, 'checkIfInstitutionExist')
        .mockReturnValue(of(response));

      component.checkInstitutionExists('123').subscribe(() => {
        const setErrorSpy = jest.spyOn(component.beneficiaryForm, 'setErrors');

        expect(setErrorSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('populateFormForSubmit', () => {
    it('should call updateTransaction when has transaction id and transaction number', async () => {
      const { component } = await setup();
      jest
        .spyOn(component.fiModalSvc, 'openWorkFlowCommentsModal')
        .mockReturnValue(of(''));
      component.transactionNumber = '1';
      component.transactionId = 1;

      const spy = jest.spyOn(component, 'updateTransaction');
      component.populateFormForSubmit(true);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('getTransactionById', () => {
    it('should populate variables with the response of the service', async () => {
      const { component, fixture } = await setup();

      const spy = jest
        .spyOn(component.transactionsApi, 'getTransactionById')
        .mockReturnValue(of(transactionByIdGetResponse));

      component.getTransactionById('1', 1, TransactionsTypes.DPB);
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
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
