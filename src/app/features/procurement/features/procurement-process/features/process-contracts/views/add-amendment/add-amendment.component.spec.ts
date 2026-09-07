import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { provideWindowSizeMock } from '@fiduciary-interface-test';
import {
  DirectivesModule,
  NotificationModule,
} from '@fiduciary-interface/app/shared';
import { provideMockStore } from '@ngrx/store/testing';
import { NotificationService } from '@progress/kendo-angular-notification';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { AddAmendmentComponent } from './add-amendment.component';
import { render } from '@testing-library/angular';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { BiddingContractStatusesEnum, ModeAmendmentEnum } from '@core/enums';
import { of, throwError } from 'rxjs';
import {
  AmendmentLastResponse,
  BiddingContractByProcess,
  BiddingContractResponse,
} from '@core/models';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';

const PENDING_SIGNATURE = BiddingContractStatusesEnum.PENDING_SIGNATURE;
const SIGNED = BiddingContractStatusesEnum.SIGNED;

const initialState = {
  biddingProcessPlan: {
    selectedBiddingProcessProcurementProcess: {
      code: 'CO-L1229-P39',
    },
  },
};

const mockBiddingContractResponse: BiddingContractResponse[] = [
  {
    biddingProcurementProcessId: '123456',

    // General information
    name: 'string',
    object: 'string',
    signatureDate: new Date(),
    startDate: new Date(),
    endDate: new Date(),
    controlNumber: 'string',
    contractType: 0,
    hasAdvancedPayment: false,
    conflictResolutionMethod: 0,
    applicableLaw: 'string',
    contractTypeDesignation: '',

    /**
     * @fromEnum BiddingContractStatusesEnum
     */
    contractStatus: PENDING_SIGNATURE,

    // Cost distribution
    contractTotalAmount: 0,
    idbAmount: 0,
    localCounterpartAmount: 0,
    cofinancedamount: 0,
    justification: 'string',

    // Damages
    liquidatedDamagePercentage: 0,
    liquidatedDamageMaximumPercentage: 0,
    bonusPercentage: 0,
    bonusMaximumPercentage: 0,

    // Bonus
    liquidatedDamageType: 0,
    bonusType: 0,
    liquidatedDamagePaymentFrecuency: 0,
    bonusPaymentFrecuency: 0,
    code: '55',
    version: 0,
    goodsSource: 0,
    amendmentsTotalAmount: 0,
  },
  {
    biddingProcurementProcessId: '123456',

    // General information
    name: 'string',
    object: 'string',
    signatureDate: new Date(),
    startDate: new Date(),
    endDate: new Date(),
    controlNumber: 'string',
    contractType: 0,
    hasAdvancedPayment: false,
    conflictResolutionMethod: 0,
    applicableLaw: 'string',
    contractTypeDesignation: '',

    /**
     * @fromEnum BiddingContractStatusesEnum
     */
    contractStatus: PENDING_SIGNATURE,

    // Cost distribution
    contractTotalAmount: 0,
    idbAmount: 0,
    localCounterpartAmount: 0,
    cofinancedamount: 0,
    justification: 'string',

    // Damages
    liquidatedDamagePercentage: 0,
    liquidatedDamageMaximumPercentage: 0,
    bonusPercentage: 0,
    bonusMaximumPercentage: 0,

    // Bonus
    liquidatedDamageType: 0,
    bonusType: 0,
    liquidatedDamagePaymentFrecuency: 0,
    bonusPaymentFrecuency: 0,
    code: '1',
    version: 0,
    goodsSource: 0,
    amendmentsTotalAmount: 0,
  },
];

const mockAmendment: AmendmentLastResponse = {
  id: 'string',
  version: 0,
  name: 'string',
  object: 'string',
  status: 0,
  signatureDate: new Date(),
  startDate: new Date(),
  endDate: new Date(),
  idbAmount: 0,
  localCounterpartAmount: 0,
  cofinancedAmount: 0,
  controlNumber: 'string',
  contractType: 0,
  hasAdvancedPayment: true,
  conflictResolutionMethod: 0,
  applicableLaw: 'string',
  liquidatedDamage: {
    liquidatedDamagePercentage: 0,
    liquidatedDamageMaximumPercentage: 0,
    liquidatedDamagePaymentFrecuency: 0,
    liquidatedDamageType: 0,
  },
  bonus: {
    bonusMaximumPercentage: 0,
    bonusPercentage: 0,
    bonusPaymentFrecuency: 0,
    bonusType: 0,
  },
  currencies: [],
  biddingContractLots: [],
  securities: [],
};

const biddingContractByProcess: BiddingContractByProcess[] = [
  {
    visualCode: 'string',
    biddingContractId: '123456',
    parentId: 'string',
    code: 'string',
    version: 0,
    biddingContractsAwarded: [],
    contractType: 0,
    contractStatus: BiddingContractStatusesEnum.SIGNED,
    nationality: 'string',
    idbAmount: 0,
    localCounterpartAmount: 0,
    cofinancedAmount: 0,
    startDate: 'date',
    endDate: 'date',
    amendments: [],
  },
];

async function setup() {
  const { fixture } = await render(AddAmendmentComponent, {
    declarations: [AddAmendmentComponent],
    imports: [
      MsalTestModule,
      DialogModule,
      DirectivesModule,
      RouterTestingModule,
      HttpClientTestingModule,
      NotificationModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    providers: [
      provideWindowSizeMock(),
      provideMockStore({ initialState }),
      NotificationService,
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            params: {
              processId: '123456',
            },
          },
        },
      },
    ],
  });
  const component = fixture.componentInstance;
  return { component, fixture };
}

describe('AddAmendmentComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should unsubscribe subscriptions when destroy', async () => {
    const { component } = await setup();
    const spy = jest.spyOn(component.subscriptions, 'unsubscribe');
    component.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
  });

  describe('checkDeleteStatus', () => {
    it('should showDeleteButton if contract is PENDING_SIGNATURE', async () => {
      const { component, fixture } = await setup();
      component.checkDeleteStatus(PENDING_SIGNATURE);
      fixture.detectChanges();

      expect(component.showDeleteButton).toBe(true);
    });

    it('should not showDeleteButton if contract is PENDING_SIGNATURE', async () => {
      const { component, fixture } = await setup();
      component.checkDeleteStatus(SIGNED);
      fixture.detectChanges();
      expect(component.showDeleteButton).toBe(false);
    });
  });

  describe('getAmendment', () => {
    it('shoudl call getAmendmentById if mode is ModeAmendmentEnum.READ', async () => {
      const { component } = await setup();
      component.mode = ModeAmendmentEnum.READ;

      const spy = jest.spyOn(component, 'getAmendmentById');

      component.getAmendment();

      expect(spy).toHaveBeenCalled();
    });

    it('shoudl call getAmendmentLast ModeAmendmentEnum.UPDATE', async () => {
      const { component } = await setup();
      component.mode = ModeAmendmentEnum.UPDATE;

      const spy = jest.spyOn(component, 'getAmendmentLast');

      component.getAmendment();
      expect(spy).toHaveBeenCalled();
    });

    it('shoudl call getAmendmentLast ModeAmendmentEnum.CREATE', async () => {
      const { component } = await setup();
      component.mode = ModeAmendmentEnum.CREATE;

      const spy = jest.spyOn(component, 'getAmendmentLast');
      component.getAmendment();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('getAmendmentById', () => {
    it('should call setAmendmentData', async () => {
      const { component, fixture } = await setup();

      const spy = jest
        .spyOn(component.biddingContractApiService, 'getAmendmentById')
        .mockReturnValue(of(mockAmendment));
      const setAmendmetSpy = jest.spyOn(component, 'setAmendmentData');
      component.getAmendmentById();
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
      expect(setAmendmetSpy).toHaveBeenCalled();
      expect(component.isLoading).toBe(false);
    });
  });

  describe('getAmendmentLast', () => {
    it('should call setAmendmentData', async () => {
      const { component, fixture } = await setup();

      const spy = jest
        .spyOn(component.biddingContractApiService, 'getAmendmentsLast')
        .mockReturnValue(of(mockAmendment));
      const setAmendmetSpy = jest.spyOn(component, 'setAmendmentData');
      component.getAmendmentLast();
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
      expect(setAmendmetSpy).toHaveBeenCalled();
      expect(component.isLoading).toBe(false);
    });
  });

  describe('getContractByProcess', () => {
    it('should set contract and selected contract variables', async () => {
      const { component, fixture } = await setup();
      const response = {
        procurementContracts: biddingContractByProcess,
        loaded: true,
        loading: false,
        error: 'error',
      };

      component.contractId = '123456';
      jest
        .spyOn(component.biddingContractstore, 'getContractsByProcess')
        .mockReturnValue(of(response));

      component.getContractByProcess();
      fixture.detectChanges();

      expect(component.contracts).toBe(response.procurementContracts);
      expect(component.selectedContract).toBe(response.procurementContracts[0]);
    });
  });

  describe('showErrorMsg', () => {
    it('should show error message', async () => {
      const { component } = await setup();
      const spy = jest
        .spyOn(component.notificationGlobalSvc, 'showError')
        .mockReturnValue();

      component.showErrorMsg();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('showSuccessMsg', () => {
    it('should show success message', async () => {
      const { component } = await setup();
      const spy = jest
        .spyOn(component.notificationGlobalSvc, 'showSuccess')
        .mockReturnValue();

      component.showSuccessMsg();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('deleteAmendment', () => {
    it('should delete the amendment and navigate to contract table', async () => {
      const { component } = await setup();
      const spy = jest
        .spyOn(component.biddingContractApiService, 'deleteContract')
        .mockReturnValue(of(mockAmendment));
      const navigateSpy = jest.spyOn(component, 'navigateToContractTable');

      component.deleteAmendment();

      expect(spy).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalled();
    });

    it('should show error message if error occurs', async () => {
      const { component } = await setup();
      const spy = jest
        .spyOn(component.biddingContractApiService, 'deleteContract')
        .mockReturnValue(throwError('error'));
      const showErrorSpy = jest.spyOn(component, 'showErrorMsg');

      component.deleteAmendment();

      expect(spy).toHaveBeenCalled();
      expect(showErrorSpy).toHaveBeenCalled();
    });
  });

  describe('loadProcess', () => {
    it('should call getBiddingProcessByIdAction', async () => {
      const { component } = await setup();

      const spy = jest.spyOn(
        component.biddingProcessPlanStoreService,
        'getBiddingProcessByIdAction'
      );
      component.loadProcess();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('setCode', () => {
    it('should set concatenate code with the data from the service adding 0 to Contract code', async () => {
      const { component, fixture } = await setup();

      jest
        .spyOn(component.biddingContractApiService, 'getContractById')
        .mockReturnValue(of(mockBiddingContractResponse[0]));

      component.setCode('CO-L1229');
      fixture.detectChanges();

      expect(component.visualCode).toBe('CO-L1229-C55');
    });

    it('should set concatenate code with the data from the service', async () => {
      const { component, fixture } = await setup();

      jest
        .spyOn(component.biddingContractApiService, 'getContractById')
        .mockReturnValue(of(mockBiddingContractResponse[1]));

      component.setCode('CO-L1229');
      fixture.detectChanges();

      expect(component.visualCode).toBe('CO-L1229-C01');
    });
  });
});
