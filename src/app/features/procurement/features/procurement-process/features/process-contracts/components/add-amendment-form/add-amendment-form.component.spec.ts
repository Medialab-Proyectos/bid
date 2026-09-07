import { render } from '@testing-library/angular';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AddAmendmentFormComponent } from './add-amendment-form.component';
import { NotificationService } from '@progress/kendo-angular-notification';
import { provideMockStore } from '@ngrx/store/testing';
import { DatePipe } from '@angular/common';
import {
  AmendmentLastResponse,
  BiddingContractByProcess,
  BiddingContractResponse,
} from '@core/models';
import { of, throwError } from 'rxjs';
import { BiddingContractStatusesEnum, ModeAmendmentEnum } from '@core/enums';
import { createAddAmendmentForm } from './add-amendment-form.form';
import { DirectivesModule } from '@fiduciary-interface/app/shared';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { DialogModule } from '@progress/kendo-angular-dialog';

const mockOriginalContract: BiddingContractResponse = {
  amendmentsTotalAmount: 0,
  applicableLaw: '111',
  biddingProcurementProcessId: 'e977a593-2deb-4fed-8062-61a1dc6d340c',
  bonusMaximumPercentage: null,
  bonusPaymentFrecuency: null,
  bonusPercentage: null,
  bonusType: null,
  code: '15',
  cofinancedamount: 667,
  conflictResolutionMethod: 0,
  contractStatus: 1,
  contractTotalAmount: 0,
  contractType: 0,
  controlNumber: '111',
  justification: '',
  endDate: new Date('2022-12-16T05:00:00'),
  goodsSource: null,
  hasAdvancedPayment: false,
  idbAmount: 111,
  liquidatedDamageMaximumPercentage: null,
  liquidatedDamagePaymentFrecuency: null,
  liquidatedDamagePercentage: null,
  liquidatedDamageType: null,
  localCounterpartAmount: 222,
  name: 'asdasd',
  object: 'CFI-5591',
  signatureDate: new Date('2022-12-14T05:00:00'),
  startDate: new Date('2022-12-15T05:00:00'),
  version: 0,
  contractTypeDesignation: '',
};

const initialState = {
  biddingProcessPlan: {
    selectedBiddingProcessProcurementProcess: {
      category: {
        id: 2,
      },
      supervisionMethod: {
        id: 0,
      },
    },
  },
};

async function setup() {
  const { fixture } = await render(AddAmendmentFormComponent, {
    componentProperties: {
      selectedContract: selectedContract,
      amendment: amendmentMock,
      originalContract: mockOriginalContract,
    },
    declarations: [AddAmendmentFormComponent],
    imports: [
      MsalTestModule,
      DirectivesModule,
      HttpClientTestingModule,
      RouterTestingModule,
      DialogModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    providers: [
      NotificationService,
      DatePipe,
      provideMockStore({ initialState }),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  });
  const component = fixture.componentInstance;
  return { fixture, component };
}

describe('AddAmendmentFormComponent', () => {
  it('should create', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  describe('checkMode', () => {
    it('should set readOnly false and secondStep true', async () => {
      const { component, fixture } = await setup();
      component.mode = ModeAmendmentEnum.UPDATE;
      component.amendment.status =
        BiddingContractStatusesEnum.PENDING_SIGNATURE;
      component.planNotInSync = true;
      component.checkMode();
      fixture.detectChanges();

      expect(component.readOnly).toBe(false);
      expect(component.secondStep).toBe(true);
    });
    it('should not change variables values', async () => {
      const { component, fixture } = await setup();
      component.mode = ModeAmendmentEnum.CREATE;
      component.amendment.status =
        BiddingContractStatusesEnum.PENDING_SIGNATURE;
      component.readOnly = false;
      component.secondStep = true;

      component.checkMode();
      fixture.detectChanges();

      expect(component.readOnly).toBe(false);
      expect(component.secondStep).toBe(true);
    });
  });

  describe('saveAmendment', () => {
    it('should have been called', async () => {
      const { component, fixture } = await setup();
      const spy = jest
        .spyOn(component.biddingContractApiSvc, 'postAmendment')
        .mockReturnValue(of({}));

      component.saveAmendment();
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('editAmendment', () => {
    it('should call putAmendment', async () => {
      const { component } = await setup();
      const spy = jest
        .spyOn(component.biddingContractApiSvc, 'putAmendment')
        .mockReturnValue(of({}));
      component.editOrConfirmAmendment(false);

      expect(spy).toHaveBeenCalled();
    });
    it('should call error msg', async () => {
      const { component } = await setup();
      const spy = jest
        .spyOn(component.biddingContractApiSvc, 'putAmendment')
        .mockReturnValue(throwError('error'));

      const errorSpy = jest.spyOn(component, 'showErrorMsg');
      component.editOrConfirmAmendment(false);

      expect(spy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should filter values that have ids', async () => {
      const { component, fixture } = await setup();
      component.savedAmendmendId = '1234';
      component.amendment = amendmentMock;
      component.amendmentRequest = amendmentMock;

      component.processAmendmentRequest();
      fixture.detectChanges();

      expect(component.amendment.id).toEqual(component.savedAmendmendId);
      expect(component.amendmentRequest.biddingContractLots).toEqual([
        {
          name: 'string',
          units: 0,
          amount: 0,
          id: 'string',
        },
      ]);
      expect(component.amendmentRequest.securities).toEqual([
        {
          id: 'string',
          securityType: 0,
          currency: 'string',
          amount: 0,
          usdEquivalentAmount: 0,
          expirationDate: new Date('2021-12-30T03:00:00'),
        },
      ]);
      expect(component.amendmentRequest.currencies).toEqual([
        {
          id: 'string',
          currency: 'string',
          totalAmount: 0,
          usdEquivalentAmount: 0,
        },
      ]);
    });
  });

  describe('confirmAmendment', () => {
    it('should call error notification', async () => {
      const { component, fixture } = await setup();
      jest
        .spyOn(component.biddingContractApiSvc, 'putAmendment')
        .mockReturnValue(of({}));
      jest
        .spyOn(component.biddingContractApiSvc, 'putConfirmAmendment')
        .mockReturnValue(throwError('error'));

      const spy = jest.spyOn(component, 'showErrorMsg');

      component.editOrConfirmAmendment(true);
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('showErrorMsg', () => {
    it('should have been called', async () => {
      const { component } = await setup();
      const notificationSpy = jest
        .spyOn(component.notificationGlobalSvc, 'showError')
        .mockImplementation();

      component.showErrorMsg();

      expect(notificationSpy).toHaveBeenCalled();
    });
  });

  describe('showCancelMsg', () => {
    it('should have been called', async () => {
      const { component } = await setup();

      component.mode = ModeAmendmentEnum.CREATE;
      const notificationSpy = jest
        .spyOn(component.notificationGlobalSvc, 'showInfo')
        .mockImplementation();

      component.showCancelMsg();

      expect(notificationSpy).toHaveBeenCalled();
    });
  });

  describe('transformDate', () => {
    it('should format date', async () => {
      const { component } = await setup();
      const formatedDate = '2021-12-30';
      const date = component.transformDate('2021-12-30T03:00:00');

      expect(date).toEqual(formatedDate);
    });
  });

  describe('startDateLowerThanSignatureDate', () => {
    it('check if the start date is greater than sign date', async () => {
      const { component } = await setup();

      const startDate = new Date(2022, 0, 26);
      const signatureDate = new Date(2022, 0, 20);

      component.form.controls.dateUpdateForm
        .get('startDate')
        .setValue(startDate);
      component.form.controls.dateUpdateForm
        .get('signatureDate')
        .setValue(signatureDate);

      expect(component.startDateLowerThanSignatureDate()).toBe(false);
    });

    it('check if the start date is lower than sign date', async () => {
      const { component } = await setup();

      const startDate = new Date(2022, 0, 16);
      const signatureDate = new Date(2022, 0, 20);

      component.form.controls.dateUpdateForm
        .get('startDate')
        .setValue(startDate);
      component.form.controls.dateUpdateForm
        .get('signatureDate')
        .setValue(signatureDate);

      expect(component.startDateLowerThanSignatureDate()).toBe(true);
    });
  });

  describe('setCurrenciesFormValues', () => {
    it('should set currencies form values', async () => {
      const { component, fixture } = await setup();
      component.mode = ModeAmendmentEnum.CREATE;
      component.secondStep = false;
      component.amendment.currencies = [
        {
          currency: 'USD',
          totalAmount: 0,
          usdEquivalentAmount: 0,
        },
      ];

      component.form = createAddAmendmentForm();

      component.setCurrenciesFormValues();
      fixture.detectChanges();

      expect(component.currencies).toEqual(component.amendment.currencies);
    });
  });

  describe('setLotsFormValues', () => {
    it('should set lots form values', async () => {
      const { component, fixture } = await setup();
      component.mode = ModeAmendmentEnum.CREATE;
      component.secondStep = false;
      component.amendment.biddingContractLots = [
        {
          name: 'string',
          units: 0,
          amount: 0,
        },
      ];

      component.form = createAddAmendmentForm();

      component.setLotsFormValues();
      fixture.detectChanges();

      expect(component.lots).toEqual(component.amendment.biddingContractLots);
    });
    it('should set lots form values with an ID', async () => {
      const { component, fixture } = await setup();
      component.mode = ModeAmendmentEnum.CREATE;
      component.secondStep = true;
      component.amendment.biddingContractLots = [
        {
          name: 'string',
          units: 0,
          amount: 0,
          id: 'string',
        },
      ];

      component.form = createAddAmendmentForm();

      component.setLotsFormValues();
      fixture.detectChanges();

      expect(component.lots).toEqual(component.amendment.biddingContractLots);
    });
  });

  describe('checkIsAbleToEdit', () => {
    it('should return true', async () => {
      const { component } = await setup();
      component.selectedContract = {
        visualCode: '',
        biddingContractId: '1',
        parentId: '',
        code: '',
        version: 0,
        biddingContractsAwarded: [
          {
            biddingProcessParticipantId: 'string',
            biddingProcessBidderId: 'string',
            name: 'string',
            nationality: 'string',
          },
        ],
        contractType: 0,
        contractStatus: BiddingContractStatusesEnum.SIGNED,
        nationality: '',
        idbAmount: 10,
        localCounterpartAmount: 10,
        cofinancedAmount: 10,
        startDate: '',
        endDate: '',
        amendments: [],
      };

      expect(component.checkIsAbleToEdit()).toBe(true);
    });

    it('should return false', async () => {
      const { component } = await setup();
      component.selectedContract = {
        visualCode: '',
        biddingContractId: '1',
        parentId: '',
        code: '',
        version: 0,
        biddingContractsAwarded: [
          {
            biddingProcessParticipantId: 'string',
            biddingProcessBidderId: 'string',
            name: 'string',
            nationality: 'string',
          },
        ],
        contractType: 0,
        contractStatus: BiddingContractStatusesEnum.SIGNED,
        nationality: '',
        idbAmount: 10,
        localCounterpartAmount: 10,
        cofinancedAmount: 10,
        startDate: '',
        endDate: '',
        amendments: [
          {
            visualCode: '',
            biddingContractId: '1',
            parentId: '',
            code: '',
            version: 0,
            biddingContractsAwarded: [
              {
                biddingProcessParticipantId: 'string',
                biddingProcessBidderId: 'string',
                name: 'string',
                nationality: 'string',
              },
            ],
            contractType: 0,
            contractStatus: BiddingContractStatusesEnum.SIGNED,
            nationality: '',
            idbAmount: 10,
            localCounterpartAmount: 10,
            cofinancedAmount: 10,
            startDate: '',
            endDate: '',
            amendments: [],
          },
        ],
      };

      expect(component.checkIsAbleToEdit()).toBe(true);
    });

    it('should return false with amendment PENDING_SIGNATURE', async () => {
      const { component } = await setup();
      component.selectedContract = {
        visualCode: '',
        biddingContractId: '1',
        parentId: '',
        code: '',
        version: 0,
        biddingContractsAwarded: [
          {
            biddingProcessParticipantId: 'string',
            biddingProcessBidderId: 'string',
            name: 'string',
            nationality: 'string',
          },
        ],
        contractType: 0,
        contractStatus: BiddingContractStatusesEnum.SIGNED,
        nationality: '',
        idbAmount: 10,
        localCounterpartAmount: 10,
        cofinancedAmount: 10,
        startDate: '',
        endDate: '',
        amendments: [
          {
            visualCode: '',
            biddingContractId: '1',
            parentId: '',
            code: '',
            version: 1,
            biddingContractsAwarded: [
              {
                biddingProcessParticipantId: 'string',
                biddingProcessBidderId: 'string',
                name: 'string',
                nationality: 'string',
              },
            ],
            contractType: 0,
            contractStatus: BiddingContractStatusesEnum.PENDING_SIGNATURE,
            nationality: '',
            idbAmount: 10,
            localCounterpartAmount: 10,
            cofinancedAmount: 10,
            startDate: '',
            endDate: '',
            amendments: [],
          },
        ],
      };

      expect(component.checkIsAbleToEdit()).toBe(true);
    });

    it('should return false with amendment PENDING_SIGNATURE', async () => {
      const { component } = await setup();
      component.selectedContract = {
        visualCode: '',
        biddingContractId: '1',
        parentId: '',
        code: '',
        version: 0,
        biddingContractsAwarded: [
          {
            biddingProcessParticipantId: 'string',
            biddingProcessBidderId: 'string',
            name: 'string',
            nationality: 'string',
          },
        ],
        contractType: 0,
        contractStatus: BiddingContractStatusesEnum.SIGNED,
        nationality: '',
        idbAmount: 10,
        localCounterpartAmount: 10,
        cofinancedAmount: 10,
        startDate: '',
        endDate: '',
        amendments: [
          {
            visualCode: '',
            biddingContractId: '1',
            parentId: '',
            code: '',
            version: 1,
            biddingContractsAwarded: [
              {
                biddingProcessParticipantId: 'string',
                biddingProcessBidderId: 'string',
                name: 'string',
                nationality: 'string',
              },
            ],
            contractType: 0,
            contractStatus: BiddingContractStatusesEnum.PENDING_SIGNATURE,
            nationality: '',
            idbAmount: 10,
            localCounterpartAmount: 10,
            cofinancedAmount: 10,
            startDate: '',
            endDate: '',
            amendments: [],
          },
        ],
      };

      expect(component.checkIsAbleToEdit()).toBe(true);
    });

    it('should return false with amendment AMENDMENT_REVIEWED ', async () => {
      const { component } = await setup();
      component.selectedContract = {
        visualCode: '',
        biddingContractId: '1',
        parentId: '',
        code: '',
        version: 0,
        biddingContractsAwarded: [
          {
            biddingProcessParticipantId: 'string',
            biddingProcessBidderId: 'string',
            name: 'string',
            nationality: 'string',
          },
        ],
        contractType: 0,
        contractStatus: BiddingContractStatusesEnum.SIGNED,
        nationality: '',
        idbAmount: 10,
        localCounterpartAmount: 10,
        cofinancedAmount: 10,
        startDate: '',
        endDate: '',
        amendments: [
          {
            visualCode: '',
            biddingContractId: '1',
            parentId: '',
            code: '',
            version: 1,
            biddingContractsAwarded: [
              {
                biddingProcessParticipantId: 'string',
                biddingProcessBidderId: 'string',
                name: 'string',
                nationality: 'string',
              },
            ],
            contractType: 0,
            contractStatus: BiddingContractStatusesEnum.AMENDMENT_REVIEWED,
            nationality: '',
            idbAmount: 10,
            localCounterpartAmount: 10,
            cofinancedAmount: 10,
            startDate: '',
            endDate: '',
            amendments: [],
          },
        ],
      };

      expect(component.checkIsAbleToEdit()).toBe(true);
    });

    it('should return true', async () => {
      const { component } = await setup();
      component.amendment.status =
        BiddingContractStatusesEnum.PENDING_SIGNATURE;
      component.selectedContract = {
        visualCode: '',
        biddingContractId: '1',
        parentId: '',
        code: '',
        version: 0,
        biddingContractsAwarded: [
          {
            biddingProcessParticipantId: 'string',
            biddingProcessBidderId: 'string',
            name: 'string',
            nationality: 'string',
          },
        ],
        contractType: 0,
        contractStatus: BiddingContractStatusesEnum.SIGNED,
        nationality: '',
        idbAmount: 10,
        localCounterpartAmount: 10,
        cofinancedAmount: 10,
        startDate: '',
        endDate: '',
        amendments: [
          {
            visualCode: '',
            biddingContractId: '1',
            parentId: '',
            code: '',
            version: 1,
            biddingContractsAwarded: [
              {
                biddingProcessParticipantId: 'string',
                biddingProcessBidderId: 'string',
                name: 'string',
                nationality: 'string',
              },
            ],
            contractType: 0,
            contractStatus: BiddingContractStatusesEnum.PENDING_SIGNATURE,
            nationality: '',
            idbAmount: 10,
            localCounterpartAmount: 10,
            cofinancedAmount: 10,
            startDate: '',
            endDate: '',
            amendments: [],
          },
        ],
      };

      expect(component.checkIsAbleToEdit()).toBe(true);
    });
  });

  describe('checkIsAbleToConfirm', () => {
    it('should return true', async () => {
      const { component } = await setup();
      component.selectedContract = {
        visualCode: '',
        biddingContractId: '1',
        parentId: '',
        code: '',
        version: 0,
        biddingContractsAwarded: [
          {
            biddingProcessParticipantId: 'string',
            biddingProcessBidderId: 'string',
            name: 'string',
            nationality: 'string',
          },
        ],
        contractType: 0,
        contractStatus: BiddingContractStatusesEnum.SIGNED,
        nationality: '',
        idbAmount: 10,
        localCounterpartAmount: 10,
        cofinancedAmount: 10,
        startDate: '',
        endDate: '',
        amendments: [],
      };

      expect(component.checkIsAbleToConfirm()).toBe(true);
    });

    it('should return false', async () => {
      const { component } = await setup();
      component.selectedContract = {
        visualCode: '',
        biddingContractId: '1',
        parentId: '',
        code: '',
        version: 0,
        biddingContractsAwarded: [
          {
            biddingProcessParticipantId: 'string',
            biddingProcessBidderId: 'string',
            name: 'string',
            nationality: 'string',
          },
        ],
        contractType: 0,
        contractStatus: BiddingContractStatusesEnum.SIGNED,
        nationality: '',
        idbAmount: 10,
        localCounterpartAmount: 10,
        cofinancedAmount: 10,
        startDate: '',
        endDate: '',
        amendments: [
          {
            visualCode: '',
            biddingContractId: '1',
            parentId: '',
            code: '',
            version: 1,
            biddingContractsAwarded: [
              {
                biddingProcessParticipantId: 'string',
                biddingProcessBidderId: 'string',
                name: 'string',
                nationality: 'string',
              },
            ],
            contractType: 0,
            contractStatus: BiddingContractStatusesEnum.SIGNED,
            nationality: '',
            idbAmount: 10,
            localCounterpartAmount: 10,
            cofinancedAmount: 10,
            startDate: '',
            endDate: '',
            amendments: [],
          },
        ],
      };
      expect(component.checkIsAbleToConfirm()).toBe(true);
    });

    it('should return false with amendment PENDING_SIGNATURE', async () => {
      const { component } = await setup();
      component.selectedContract = {
        visualCode: '',
        biddingContractId: '1',
        parentId: '',
        code: '',
        version: 0,
        biddingContractsAwarded: [
          {
            biddingProcessParticipantId: 'string',
            biddingProcessBidderId: 'string',
            name: 'string',
            nationality: 'string',
          },
        ],
        contractType: 0,
        contractStatus: BiddingContractStatusesEnum.SIGNED,
        nationality: '',
        idbAmount: 10,
        localCounterpartAmount: 10,
        cofinancedAmount: 10,
        startDate: '',
        endDate: '',
        amendments: [
          {
            visualCode: '',
            biddingContractId: '1',
            parentId: '',
            code: '',
            version: 1,
            biddingContractsAwarded: [
              {
                biddingProcessParticipantId: 'string',
                biddingProcessBidderId: 'string',
                name: 'string',
                nationality: 'string',
              },
            ],
            contractType: 0,
            contractStatus: BiddingContractStatusesEnum.PENDING_SIGNATURE,
            nationality: '',
            idbAmount: 10,
            localCounterpartAmount: 10,
            cofinancedAmount: 10,
            startDate: '',
            endDate: '',
            amendments: [],
          },
        ],
      };
      expect(component.checkIsAbleToConfirm()).toBe(false);
    });

    it('should return false with amendment PENDING_SIGNATURE', async () => {
      const { component } = await setup();
      component.selectedContract = {
        visualCode: '',
        biddingContractId: '1',
        parentId: '',
        code: '',
        version: 0,
        biddingContractsAwarded: [
          {
            biddingProcessParticipantId: 'string',
            biddingProcessBidderId: 'string',
            name: 'string',
            nationality: 'string',
          },
        ],
        contractType: 0,
        contractStatus: BiddingContractStatusesEnum.SIGNED,
        nationality: '',
        idbAmount: 10,
        localCounterpartAmount: 10,
        cofinancedAmount: 10,
        startDate: '',
        endDate: '',
        amendments: [
          {
            visualCode: '',
            biddingContractId: '1',
            parentId: '',
            code: '',
            version: 1,
            biddingContractsAwarded: [
              {
                biddingProcessParticipantId: 'string',
                biddingProcessBidderId: 'string',
                name: 'string',
                nationality: 'string',
              },
            ],
            contractType: 0,
            contractStatus: BiddingContractStatusesEnum.PENDING_SIGNATURE,
            nationality: '',
            idbAmount: 10,
            localCounterpartAmount: 10,
            cofinancedAmount: 10,
            startDate: '',
            endDate: '',
            amendments: [],
          },
        ],
      };
      expect(component.checkIsAbleToConfirm()).toBe(false);
    });

    it('should return false with amendment AMENDMENT_REVIEWED ', async () => {
      const { component } = await setup();
      component.selectedContract = {
        visualCode: '',
        biddingContractId: '1',
        parentId: '',
        code: '',
        version: 0,
        biddingContractsAwarded: [
          {
            biddingProcessParticipantId: 'string',
            biddingProcessBidderId: 'string',
            name: 'string',
            nationality: 'string',
          },
        ],
        contractType: 0,
        contractStatus: BiddingContractStatusesEnum.SIGNED,
        nationality: '',
        idbAmount: 10,
        localCounterpartAmount: 10,
        cofinancedAmount: 10,
        startDate: '',
        endDate: '',
        amendments: [
          {
            visualCode: '',
            biddingContractId: '1',
            parentId: '',
            code: '',
            version: 1,
            biddingContractsAwarded: [
              {
                biddingProcessParticipantId: 'string',
                biddingProcessBidderId: 'string',
                name: 'string',
                nationality: 'string',
              },
            ],
            contractType: 0,
            contractStatus: BiddingContractStatusesEnum.AMENDMENT_REVIEWED,
            nationality: '',
            idbAmount: 10,
            localCounterpartAmount: 10,
            cofinancedAmount: 10,
            startDate: '',
            endDate: '',
            amendments: [],
          },
        ],
      };
      expect(component.checkIsAbleToConfirm()).toBe(false);
    });

    it('should return true', async () => {
      const { component } = await setup();
      component.amendment.status =
        BiddingContractStatusesEnum.PENDING_SIGNATURE;
      component.amendment.version = 1;
      component.selectedContract = {
        visualCode: '',
        biddingContractId: '1',
        parentId: '',
        code: '',
        version: 0,
        biddingContractsAwarded: [
          {
            biddingProcessParticipantId: 'string',
            biddingProcessBidderId: 'string',
            name: 'string',
            nationality: 'string',
          },
        ],
        contractType: 0,
        contractStatus: BiddingContractStatusesEnum.SIGNED,
        nationality: '',
        idbAmount: 10,
        localCounterpartAmount: 10,
        cofinancedAmount: 10,
        startDate: '',
        endDate: '',
        amendments: [
          {
            visualCode: '',
            biddingContractId: '1',
            parentId: '',
            code: '',
            version: 1,
            biddingContractsAwarded: [
              {
                biddingProcessParticipantId: 'string',
                biddingProcessBidderId: 'string',
                name: 'string',
                nationality: 'string',
              },
            ],
            contractType: 0,
            contractStatus: BiddingContractStatusesEnum.PENDING_SIGNATURE,
            nationality: '',
            idbAmount: 10,
            localCounterpartAmount: 10,
            cofinancedAmount: 10,
            startDate: '',
            endDate: '',
            amendments: [],
          },
        ],
      };
      expect(component.checkIsAbleToConfirm()).toBe(true);
    });
    it('should return true', async () => {
      const { component } = await setup();
      component.amendment.status =
        BiddingContractStatusesEnum.AMENDMENT_REVIEWED;
      component.selectedContract = {
        visualCode: '',
        biddingContractId: '1',
        parentId: '',
        code: '',
        version: 0,
        biddingContractsAwarded: [
          {
            biddingProcessParticipantId: 'string',
            biddingProcessBidderId: 'string',
            name: 'string',
            nationality: 'string',
          },
        ],
        contractType: 0,
        contractStatus: BiddingContractStatusesEnum.SIGNED,
        nationality: '',
        idbAmount: 10,
        localCounterpartAmount: 10,
        cofinancedAmount: 10,
        startDate: '',
        endDate: '',
        amendments: [
          {
            visualCode: '',
            biddingContractId: '1',
            parentId: '',
            code: '',
            version: 1,
            biddingContractsAwarded: [
              {
                biddingProcessParticipantId: 'string',
                biddingProcessBidderId: 'string',
                name: 'string',
                nationality: 'string',
              },
            ],
            contractType: 0,
            contractStatus: BiddingContractStatusesEnum.PENDING_SIGNATURE,
            nationality: '',
            idbAmount: 10,
            localCounterpartAmount: 10,
            cofinancedAmount: 10,
            startDate: '',
            endDate: '',
            amendments: [],
          },
        ],
      };
      expect(component.checkIsAbleToConfirm()).toBe(true);
    });
  });
});

const selectedContract: BiddingContractByProcess = {
  visualCode: '',
  biddingContractId: '1',
  parentId: '',
  code: '',
  version: 0,
  biddingContractsAwarded: [
    {
      biddingProcessParticipantId: 'string',
      biddingProcessBidderId: 'string',
      name: 'string',
      nationality: 'string',
    },
  ],
  contractType: 0,
  contractStatus: 0,
  nationality: '',
  idbAmount: 10,
  localCounterpartAmount: 10,
  cofinancedAmount: 10,
  startDate: '',
  endDate: '',
  amendments: [],
};

const amendmentMock: AmendmentLastResponse = {
  id: 'string',
  version: 0,
  name: 'string',
  object: 'string',
  status: 0,
  signatureDate: new Date('2021-12-30T03:00:00'),
  startDate: new Date('2021-12-30T03:00:00'),
  endDate: new Date('2021-12-30T03:00:00'),
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
    bonusPercentage: 0,
    bonusMaximumPercentage: 0,
    bonusPaymentFrecuency: 0,
    bonusType: 0,
  },
  currencies: [
    {
      currency: 'string',
      totalAmount: 0,
      usdEquivalentAmount: 0,
      id: 'string',
    },
  ],
  biddingContractLots: [
    {
      name: 'string',
      units: 0,
      amount: 0,
      id: 'string',
    },
  ],
  securities: [
    {
      securityType: 0,
      currency: 'string',
      amount: 0,
      usdEquivalentAmount: 0,
      expirationDate: new Date('2021-12-30T03:00:00'),
      id: 'string',
    },
  ],
};
