import { TransactionAniComponent } from './transaction-ani.component';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import {
  NotificationService,
  NOTIFICATION_CONTAINER,
} from '@progress/kendo-angular-notification';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideWindowSizeMock } from '@fiduciary-interface-test';
import { PermissionActions } from '@core/enums';
import { ProjectStatus } from '@core/models';
import {
  BeneficiaryDetails,
  BeneficiaryEmmiter,
  TransactionByIdGetResponse,
  TransactionHeaderBalances,
} from '../../models';
import { createAntForm } from '../transaction-ant/transaction-ant.form';
import { of, throwError } from 'rxjs';
import { DialogModule, DialogService } from '@progress/kendo-angular-dialog';
import { DirectivesModule } from '@fiduciary-interface/app/shared';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import {
  MsalBroadcastService,
  MsalService,
  MSAL_GUARD_CONFIG,
} from '@azure/msal-angular';
import { CanDeactivateFromGuard } from '@core/guards/canDeactivateForm.guard';
import { MSALGuardConfigFactory } from '@fiduciary-interface/app/msal/msal.config';

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
    projDisbRfAmount: 4,
    rfCurrentAmount: 4,
    rfOriginalAmount: 5,
  },
};

const transactionByIdGetResponse: TransactionByIdGetResponse = {
  transactionId: 1,
  transactionNumber: 'string',
  requestDetail: {
    partNumber: 1,
    requestNumber: 2,
    numberDaysFinancialPlanning: 180,
    statusId: 123,
    status: 'asd',
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
      transactionNumber: '123',
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
  components: [],
  isEditMode: true,
  canEdit: true,
};

const beneficiaryEmmiter: BeneficiaryEmmiter = {
  accountCurrency: 'USD',
  bankFlowId: '1',
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

const canActivateMock = {
  canActivate: true,
  errorMsg: 'Error',
};

async function setup() {
  const { fixture } = await render(TransactionAniComponent, {
    componentProperties: {
      detailForm: createAntForm(),
    },
    schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    imports: [
      DirectivesModule,
      MsalTestModule,
      RouterTestingModule,
      HttpClientTestingModule,
      DialogModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    providers: [
      provideMockStore({ initialState: getInitialState() }),
      provideWindowSizeMock(),
      NotificationService,
      MsalBroadcastService,
      MsalService,
      DialogService,
      CanDeactivateFromGuard,
      {
        provide: MSAL_GUARD_CONFIG,
        useFactory: MSALGuardConfigFactory,
      },
      {
        provide: NOTIFICATION_CONTAINER,
        useFactory: () => {
          return { nativeElement: document.body } as ElementRef;
        },
      },
    ],
  });
  const component = fixture.componentInstance;
  return { component, fixture };
}

describe('TransactionAniComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('onOneDocumentValidation', () => {
    it('should set hasMinimumDocs with the value of the parameter', async () => {
      const { component } = await setup();
      component.hasMinimumDocs = false;

      component.onOneDocumentValidation(true);

      expect(component.hasMinimumDocs).toEqual(true);
    });
  });

  describe('cancel', () => {
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

  describe('setAntAmountsSection', () => {
    it('should set amountForms values of the response', async () => {
      const { component } = await setup();

      component.setAntAmountsSection(transactionByIdGetResponse);

      expect(component.amountsForm.get('requestedCurrency').value).toEqual(
        transactionByIdGetResponse.requestAntAmount.requestedCurrency
      );
    });
  });

  describe('updateTransactionSuccess', () => {
    it('should call showTransacctionSuccessToast', async () => {
      const { component } = await setup();

      const alertSpy = jest
        .spyOn(
          component.transactionsFormService,
          'showTransacctionSuccessToast'
        )
        .mockReturnValue();

      component.updateTransactionSuccess(true, true);

      expect(alertSpy).toHaveBeenCalled();
    });
  });

  describe('loadSelectedProject', () => {
    it('should call getPartNumbersSuccess', async () => {
      const { component } = await setup();

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
        beneficiaries$: [
          {
            institutionName: 'string',
            acronym: 'string',
            beneficiaryName: 'string',
            accountNumber: 'string',
            bankFlowId: 'string',
          },
        ],
        aniHeaderDetail$: {
          requestAntDetails: {
            requestNumber: 0,
            partNumber: 0,
            numberDaysFinancialPlanning: 0,
            transactionNumber: 'string',
            status: 'string',
            statusId: 0,
            receivedDate: new Date(),
            financialPlanningPeriodDeadLine: new Date(),
            authorizeDate: new Date(),
          },
          requestAntAmounts: {
            approvedCurrency: 'string',
            requestedCurrency: 'string',
            requiredAmount: 0,
            equivalentApprovedCurrency: 0,
            projectedAvailableBalance: 0,
            realValueDate: new Date(),
          },
          documents: [
            {
              createdUser: 'string',
              createdDate: 'string',
              documentNumber: 'string',
              documentName: 'string',
              documentGroup: 0,
              transactionType: 'string',
              originalTransactionId: 0,
            },
          ],
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

  describe('onBeneficiaryChange', () => {
    it('should setErrors if currency doesnt match', async () => {
      const { component } = await setup();

      const setErrorsSpy = jest.spyOn(component.beneficiaryForm, 'setErrors');
      component.onBeneficiaryChange(beneficiaryEmmiter);
      expect(setErrorsSpy).not.toHaveBeenCalled();
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
});
