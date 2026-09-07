import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideWindowSizeMock } from '@fiduciary-interface-test';
import { provideMockStore } from '@ngrx/store/testing';
import { DialogService } from '@progress/kendo-angular-dialog';
import { NotificationService } from '@progress/kendo-angular-notification';
import { render } from '@testing-library/angular';
import { DetailContractComponent } from './detail-contract.component';
import { BiddingContractStatusesEnum, ModeEnum } from '@core/enums';
import { of, throwError } from 'rxjs';
import { BiddingContractApiService } from '@core/services/apis';
import { TestBed } from '@angular/core/testing';
import { ContractsService } from '../../services/contracts.service';
import {
  BiddingContractDetail,
  DialogResponse,
  ModalOptions,
} from '@core/models';
import { commonTestProviders } from '@fiduciary-interface/test/test-helpers';
import { TranslateTestingModule } from 'ngx-translate-testing';

describe('DetailContractComponent', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('checkAmmendmentButtonVisibility', () => {
    it('should set showAddAmentment to false when the contract status is PENDING_SIGNATURE, AMENDMENT_UNDER_REV, or AMENDMENT_REVIEWED', async () => {
      const { component, biddingContractApiService } = await setup();
      const contractStatus = BiddingContractStatusesEnum.PENDING_SIGNATURE;

      const getAmendmentsLastSpy = jest
        .spyOn(biddingContractApiService, 'getAmendmentsLast')
        .mockReturnValue(of({ status: contractStatus }));

      component.checkAmmendmentButtonVisibility();

      expect(getAmendmentsLastSpy).toHaveBeenCalledWith(
        component.biddingContractId
      );
      expect(component.showAddAmentment).toBe(false);
    });
    it('should set showAddAmentment to false when the contract status is PENDING_SIGNATURE, AMENDMENT_UNDER_REV, or AMENDMENT_REVIEWED', async () => {
      const { component, biddingContractApiService } = await setup();
      const contractStatus = BiddingContractStatusesEnum.AMENDMENT_REVIEWED;

      const getAmendmentsLastSpy = jest
        .spyOn(biddingContractApiService, 'getAmendmentsLast')
        .mockReturnValue(of({ status: contractStatus }));

      component.checkAmmendmentButtonVisibility();

      expect(getAmendmentsLastSpy).toHaveBeenCalledWith(
        component.biddingContractId
      );
      expect(component.showAddAmentment).toBe(false);
    });

    it('should set showAddAmentment to true when the contract status is not PENDING_SIGNATURE, AMENDMENT_UNDER_REV, or AMENDMENT_REVIEWED', async () => {
      const { component, biddingContractApiService } = await setup();
      const contractStatus = BiddingContractStatusesEnum.SIGNED;
      const getAmendmentsLastSpy = jest
        .spyOn(biddingContractApiService, 'getAmendmentsLast')
        .mockReturnValue(of({ status: contractStatus }));

      component.checkAmmendmentButtonVisibility();

      expect(getAmendmentsLastSpy).toHaveBeenCalledWith(
        component.biddingContractId
      );
      expect(component.showAddAmentment).toBe(true);
    });
  });

  describe('completeContract', () => {
    it('should complete the contract and navigate to the contracts list when the modal result is ModalOptions.ACCEPT', async () => {
      const { component, contractsSvc } = await setup();

      const dialogResponse: DialogResponse = {
        result: ModalOptions.ACCEPT,
        content: 'xd',
        text: '2',
      };
      const completeContractModalSpy = jest
        .spyOn(contractsSvc, 'completeContractModal')
        .mockReturnValue(of(dialogResponse));

      const completeContractActionSpy = jest.spyOn(
        component['store'],
        'completeContractAction'
      );
      const navigateToContractsListSpy = jest.spyOn(
        component,
        'navigateToContractsList'
      );

      component.completeContract();

      expect(completeContractModalSpy).toHaveBeenCalled();
      expect(completeContractActionSpy).toHaveBeenCalledWith(
        component.procurementProcessId,
        component.biddingContractId,
        component.selectedLanguage
      );
      expect(navigateToContractsListSpy).toHaveBeenCalled();
    });

    it('should not complete the contract or navigate to the contracts list when the modal result is not ModalOptions.ACCEPT', async () => {
      const { component, contractsSvc } = await setup();

      const dialogResponse: DialogResponse = {
        result: ModalOptions.CANCEL,
        content: 'xd',
        text: '2',
      };

      const completeContractActionSpy = jest.spyOn(
        component['store'],
        'completeContractAction'
      );
      const navigateToContractsListSpy = jest.spyOn(
        component,
        'navigateToContractsList'
      );
      const completeContractModalSpy = jest
        .spyOn(contractsSvc, 'completeContractModal')
        .mockReturnValue(of(dialogResponse));

      component.completeContract();

      expect(completeContractModalSpy).toHaveBeenCalled();
      expect(completeContractActionSpy).not.toHaveBeenCalled();
      expect(navigateToContractsListSpy).not.toHaveBeenCalled();
    });
  });

  describe('terminateContract', () => {
    it('should terminate the contract and navigate to the contracts list when the modal result is ModalOptions.ACCEPT', async () => {
      const { component, contractsSvc } = await setup();

      const dialogResponse: DialogResponse = {
        result: ModalOptions.ACCEPT,
        content: 'xd',
        text: '2',
      };

      const terminateContractActionSpy = jest.spyOn(
        component['store'],
        'terminateContractAction'
      );
      const navigateToContractsListSpy = jest.spyOn(
        component,
        'navigateToContractsList'
      );
      const terminateContractModalSpy = jest
        .spyOn(contractsSvc, 'terminateContractModal')
        .mockReturnValue(of(dialogResponse));

      component.terminateContract();

      expect(terminateContractModalSpy).toHaveBeenCalled();
      expect(terminateContractActionSpy).toHaveBeenCalledWith(
        component.procurementProcessId,
        component.biddingContractId,
        component.selectedLanguage
      );
      expect(navigateToContractsListSpy).toHaveBeenCalled();
    });

    it('should not terminate the contract or navigate to the contracts list when the modal result is not ModalOptions.ACCEPT', async () => {
      const { component, contractsSvc } = await setup();

      const dialogResponse: DialogResponse = {
        result: ModalOptions.CANCEL,
        content: 'xd',
        text: '2',
      };

      const terminateContractActionSpy = jest.spyOn(
        component['store'],
        'terminateContractAction'
      );
      const navigateToContractsListSpy = jest.spyOn(
        component,
        'navigateToContractsList'
      );
      const terminateContractModalSpy = jest
        .spyOn(contractsSvc, 'terminateContractModal')
        .mockReturnValue(of(dialogResponse));

      component.terminateContract();

      expect(terminateContractModalSpy).toHaveBeenCalled();
      expect(terminateContractActionSpy).not.toHaveBeenCalled();
      expect(navigateToContractsListSpy).not.toHaveBeenCalled();
    });
  });

  describe('getContractDetail', () => {
    it('should fill the form data and set other properties on successful response', async () => {
      const { component } = await setup();

      const response: BiddingContractDetail = JSON.parse(
        JSON.stringify(mockBiddingContractDetail)
      );

      const fillFormDataSpy = jest.spyOn(
        component['contractFormSvc'],
        'fillFormData'
      );
      const combineRequestsSpy = jest
        .spyOn(component, 'combineRequests')
        .mockReturnValue(of(response));

      component.getContractDetail();

      expect(combineRequestsSpy).toHaveBeenCalled();
      expect(fillFormDataSpy).toHaveBeenCalledWith(
        component.form,
        response,
        'detail'
      );
      expect(component.visualCode).toBe(response.visualCode);
      expect(component.status).toBe(response.contract.contractStatus);
      expect(component.hasPendingSignatureAmendment).toBe(
        response.hasPendingSignatureAmendment
      );
      expect(component.isLoading).toBe(false);
    });

    it('should on error response', async () => {
      const { component } = await setup();

      const error = new Error('Some error message');
      const combineRequestsSpy = jest
        .spyOn(component, 'combineRequests')
        .mockReturnValue(throwError(error));

      component.getContractDetail();

      expect(combineRequestsSpy).toHaveBeenCalled();
      expect(component.isLoading).toBe(false);
    });
  });

  describe('', () => {
    it('should combine contract detail and hasPendingSignatureAmendment into a single observable', async () => {
      const { component } = await setup();

      const contractDetail: BiddingContractDetail = JSON.parse(
        JSON.stringify(mockBiddingContractDetail)
      );
      const hasPendingSignatureAmendment = true;

      const getContractDetailSpy = jest
        .spyOn(component['contractFormSvc'], 'getContractDetail')
        .mockReturnValue(of(contractDetail));
      const hasContractAmendmentUnderReviewSpy = jest
        .spyOn(
          component['biddingContractApiService'],
          'hasContractAmendmentUnderReview'
        )
        .mockReturnValue(of(hasPendingSignatureAmendment));

      component.combineRequests().subscribe((result: BiddingContractDetail) => {
        expect(result).toEqual({
          ...contractDetail,
          hasPendingSignatureAmendment: hasPendingSignatureAmendment,
        });
      });

      expect(getContractDetailSpy).toHaveBeenCalledWith(
        component.biddingContractId,
        component.procurementProcessId
      );
      expect(hasContractAmendmentUnderReviewSpy).toHaveBeenCalledWith(
        component.biddingContractId
      );
    });
  });
});

const mockDialogService = {
  open: jest.fn(),
  close: jest.fn(),
};

const mockNotificationGlobalService = {
  showSuccess: jest.fn(),
};

async function setup() {
  let biddingContractApiService: BiddingContractApiService;
  let contractsSvc: ContractsService;
  const { fixture } = await render(DetailContractComponent, {
    componentProperties: {
      mode: ModeEnum.READ,
    },
    declarations: [DetailContractComponent],
    imports: [
      RouterTestingModule,
      HttpClientTestingModule,
      TranslateTestingModule,
    ],
    providers: [
      { provide: DialogService, useValue: mockDialogService },
      { provide: NotificationService, useValue: mockNotificationGlobalService },
      ...commonTestProviders,
      provideMockStore(),
      provideWindowSizeMock(),
    ],
  });
  const component = fixture.componentInstance;
  biddingContractApiService = TestBed.inject(BiddingContractApiService);
  contractsSvc = TestBed.inject(ContractsService);

  return {
    component,
    fixture,
    biddingContractApiService,
    contractsSvc,
  };
}

const mockBiddingContractDetail: BiddingContractDetail = {
  awardees: [
    {
      biddingProcessBidderId: '1f34d708-0ea0-420f-aba2-ac0d960b5971',
      biddingProcessParticipantId: 'a755fdf6-4123-4f39-acc1-90fe8fd86b8e',
      name: 'JointVenture 24dec',
      nationality: '0',
    },
  ],
  contract: {
    contractStatus: 1,
    applicableLaw: 'Applicable Law',
    biddingProcurementProcessId: '598bafa3-da73-43d0-9356-0552b245ce3c',
    bonusMaximumPercentage: null,
    bonusPaymentFrecuency: null,
    bonusPercentage: null,
    bonusType: null,
    code: '5',
    cofinancedamount: 200000,
    conflictResolutionMethod: 2,
    goodsSource: 1,
    contractType: 2,
    controlNumber: '',
    endDate: new Date('2021-12-30T03:00:00'),
    hasAdvancedPayment: true,
    idbAmount: 500000,
    liquidatedDamageMaximumPercentage: null,
    liquidatedDamagePaymentFrecuency: null,
    liquidatedDamagePercentage: null,
    liquidatedDamageType: null,
    localCounterpartAmount: 1000000,
    name: 'This is a new Test',
    object: 'Objetive of the contract',
    signatureDate: new Date('2021-12-29T03:00:00'),
    startDate: new Date('2021-12-30T03:00:00'),
    version: 0,
    contractTotalAmount: 2,
    justification: '',
    amendmentsTotalAmount: 1,
    contractTypeDesignation: '',
  },
  currencies: [
    {
      currency: 'ARS',
      id: 'c4612374-46db-4ea5-841a-f09d49b8c53b',
      totalAmount: 20000,
      usdEquivalentAmount: 1994415,
    },
  ],
  documents: [],
  locations: [
    {
      address: 'asd',
      country: 1,
      id: 'cb398480-d664-4ece-b811-5a3e913a7c36',
      zipCode: 'asd',
    },
  ],
  lots: [
    {
      amount: 12,
      id: 'f0934370-2dcc-4468-a471-f82c122150dc',
      name: 'Lot',
      units: null,
    },
  ],
  participants: [
    {
      biddingProcessBidderId: '1f34d708-0ea0-420f-aba2-ac0d960b5971',
      biddingProcessParticipantId: 'a755fdf6-4123-4f39-acc1-90fe8fd86b8e',
      name: 'JointVenture 24dec',
      nationality: '0',
    },
    {
      biddingProcessBidderId: '08e5a5e8-b0df-4df5-9a7f-3377a97ffa9f',
      biddingProcessParticipantId: 'abd09e6d-1351-43da-af73-bad98d0b07ae',
      name: 'Favio',
      nationality: '39',
    },
  ],
  participantsAndWinners: [
    {
      biddingProcessBidderId: '1f34d708-0ea0-420f-aba2-ac0d960b5971',
      biddingProcessParticipantId: 'a755fdf6-4123-4f39-acc1-90fe8fd86b8e',
      checked: true,
      name: 'JointVenture 24dec',
      nationality: '0',
    },
    {
      biddingProcessBidderId: '08e5a5e8-b0df-4df5-9a7f-3377a97ffa9f',
      biddingProcessParticipantId: 'abd09e6d-1351-43da-af73-bad98d0b07ae',
      checked: false,
      name: 'Favio',
      nationality: '39',
    },
  ],
  securities: [
    {
      amount: 0,
      currency: 'ARS',
      expirationDate: new Date(),
      id: 'e1e78412-580b-48f7-b0d2-cfaef559c8f7',
      securityType: 0,
      usdEquivalentAmount: 1,
    },
  ],
  visualCode: 'CO-L1229-P38-C10',
};
