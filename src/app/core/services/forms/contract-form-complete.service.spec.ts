import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideWindowSizeMock } from '@fiduciary-interface-test';
import { createLotGroup } from '@fiduciary-interface/app/features/procurement/features/procurement-process/features/process-contracts/components/contract-lots/contract-lots.form';
import { createCurrencyGroup } from '@fiduciary-interface/app/features/procurement/features/procurement-process/features/process-contracts/components/contract-general-information/contract-general-information.form';
import { createContractsForm } from '@fiduciary-interface/app/features/procurement/features/procurement-process/features/process-contracts/components/contracts-form/contracts-form.form';
import { createWinnerInformationForm } from '@fiduciary-interface/app/features/procurement/features/procurement-process/features/process-contracts/components/winner-information/winner-information-form.form';
import { provideMockStore } from '@ngrx/store/testing';
import { ContractFormCompleteService } from './contract-form-complete.service';
import { of } from 'rxjs';
import {
  BiddingContractCurrenciesResponse,
  BiddingContractDetail,
  BiddingContractDocumentsResponse,
  BiddingContractLocationsResponse,
  BiddingContractLotsResponse,
  BiddingContractResponse,
  BiddingContractsAwarded,
  BiddingContractSecuritiesResponse,
  ParticipantsAwardedResponse,
} from '@core/models';
import { FormGroup } from '@angular/forms';
import {
  BiddingContractsPutRequest,
  BiddingContractsRequest,
} from '@core/models/requests/bidding-contracts-request.model';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';

const initialState = {
  biddingProcessPlan: {
    selectedBiddingProcessProcurementProcess: {
      code: 'CO-L1229-P39',
    },
  },
};

const mockBiddingContractResponse: BiddingContractResponse = {
  biddingProcurementProcessId: '',
  name: 'string',
  object: 'string',
  signatureDate: new Date(),
  startDate: new Date(),
  endDate: new Date(),
  controlNumber: 'string',
  contractType: 1,
  hasAdvancedPayment: true,
  conflictResolutionMethod: 1,
  applicableLaw: 'string',
  contractTotalAmount: 1,
  goodsSource: 1,
  idbAmount: 1,
  localCounterpartAmount: 1,
  cofinancedamount: 1,
  justification: 'string',
  liquidatedDamagePercentage: 1,
  liquidatedDamageMaximumPercentage: 1,
  bonusPercentage: 1,
  bonusMaximumPercentage: 1,
  liquidatedDamageType: 1,
  bonusType: 1,
  liquidatedDamagePaymentFrecuency: 1,
  bonusPaymentFrecuency: 1,
  code: 'string',
  version: 1,
  contractStatus: 1,
  amendmentsTotalAmount: 1,
  contractTypeDesignation: '',
};

const mockParticipantsAwardedResponse: ParticipantsAwardedResponse = {
  procurementProcessId: '',
  participantsAwarded: [],
};

const mockBiddingContractsAwarded: BiddingContractsAwarded[] = [];

const mockBiddingContractLocationsResponse: BiddingContractLocationsResponse = {
  locations: [],
};

const mockBiddingContractCurrenciesResponse: BiddingContractCurrenciesResponse =
  {
    biddingContractCurrency: [],
  };

const mockBiddingContractLotsResponse: BiddingContractLotsResponse = {
  biddingContractLots: [],
};

const mockBiddingContractSecuritiesResponse: BiddingContractSecuritiesResponse =
  {
    biddingContractSecurities: [
      {
        securityType: 1,
        currency: 'string',
        amount: 1,
        usdEquivalentAmount: 1,
        expirationDate: new Date(),
        id: 'string',
      },
    ],
  };

const mockBiddingContractDocumentsResponse: BiddingContractDocumentsResponse = {
  biddingContractDocuments: [],
};

const mockBiddingContractDetail: BiddingContractDetail = {
  awardees: [
    {
      biddingProcessBidderId: 'adeb9f0f-e20b-47e9-98ac-1a966f897d07',
      biddingProcessParticipantId: 'ce7779ee-7ce0-4225-b879-7cde0361daff',
      name: 'Bidder Test Add/Update Participant',
      nationality: '0',
    },
  ],
  contract: null,
  currencies: [],
  documents: [],
  locations: [],
  lots: [],
  participants: [
    {
      biddingProcessBidderId: 'adeb9f0f-e20b-47e9-98ac-1a966f897d07',
      biddingProcessParticipantId: 'ce7779ee-7ce0-4225-b879-7cde0361daff',
      name: 'Bidder Test Add/Update Participant',
      nationality: '0',
    },
    {
      biddingProcessBidderId: 'f4381891-8756-4f3b-8e02-2a33d1ca6d3b',
      biddingProcessParticipantId: '4742aa87-525b-43b3-969e-93396e16fdc5',
      name: 'THIS IS LAS TEST',
      nationality: '0',
    },
  ],
  participantsAndWinners: [],
  securities: [],
  visualCode: '',
};

const mockBiddingContractDetailDetail: BiddingContractDetail = {
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

const mockBiddingContractDetailEdit: BiddingContractDetail = {
  awardees: [
    {
      biddingProcessBidderId: '1f34d708-0ea0-420f-aba2-ac0d960b5971',
      biddingProcessParticipantId: 'a755fdf6-4123-4f39-acc1-90fe8fd86b8e',
      name: 'JointVenture 24dec',
      nationality: '0',
    },
  ],
  contract: {
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
    contractStatus: 1,
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

describe('ProjectBucketApiService', () => {
  let service: ContractFormCompleteService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MsalTestModule, RouterTestingModule],
      providers: [provideWindowSizeMock(), provideMockStore({ initialState })],
    });
    service = TestBed.inject(ContractFormCompleteService);
    service.contractForm = createContractsForm();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getters', () => {
    it('getter winnerInformationForm', () => {
      expect(service.winnerInformationForm.value).toEqual(
        createWinnerInformationForm().value
      );
    });
    it('getter winnerList', () => {
      expect(service.winnerList.value).toEqual([]);
    });
    it('getter bonus', () => {
      expect(service.bonus.value).toEqual([]);
    });
    it('getter damages', () => {
      expect(service.damages.value).toEqual([]);
    });
    it('getter securities', () => {
      expect(service.securities.value).toEqual([]);
    });
    it('getter generalInfoCurrencies', () => {
      expect(service.generalInfoCurrencies.value).toEqual([
        createCurrencyGroup().value,
      ]);
    });
    it('getter lots', () => {
      expect(service.lots.value).toEqual([createLotGroup().value]);
    });
  });

  it('show return a well formed observable  with type BiddingContractDetail', () => {
    jest
      .spyOn(service.biddingContractApiService, 'getContractById')
      .mockReturnValue(of(mockBiddingContractResponse));
    jest
      .spyOn(service.participantApi, 'getAwardedParticipants')
      .mockReturnValue(of(mockParticipantsAwardedResponse));
    jest
      .spyOn(service.biddingContractApiService, 'getContractAwardees')
      .mockReturnValue(of(mockBiddingContractsAwarded));
    jest
      .spyOn(service.biddingContractApiService, 'getBiddingContractLocations')
      .mockReturnValue(of(mockBiddingContractLocationsResponse));
    jest
      .spyOn(service.biddingContractApiService, 'getBiddingContractCurrencies')
      .mockReturnValue(of(mockBiddingContractCurrenciesResponse));
    jest
      .spyOn(service.biddingContractApiService, 'getBiddingContractLots')
      .mockReturnValue(of(mockBiddingContractLotsResponse));
    jest
      .spyOn(service.biddingContractApiService, 'getBiddingContractSecurities')
      .mockReturnValue(of(mockBiddingContractSecuritiesResponse));
    jest
      .spyOn(service.biddingContractApiService, 'getBiddingContractDocuments')
      .mockReturnValue(of(mockBiddingContractDocumentsResponse));
    service.getContractDetail('.', '').subscribe((data) => {
      expect(data).toEqual({
        contract: mockBiddingContractResponse,
        participants: [],
        awardees: [],
        locations: [],
        currencies: [],
        lots: [],
        securities: [],
        documents: [],
        participantsAndWinners: [],
        visualCode: '',
      });
    });
  });

  it('should update the participant and winner property', () => {
    expect(
      service.updateParticipantsWithWinner(mockBiddingContractDetail)
    ).toEqual([
      {
        biddingProcessBidderId: 'adeb9f0f-e20b-47e9-98ac-1a966f897d07',
        biddingProcessParticipantId: 'ce7779ee-7ce0-4225-b879-7cde0361daff',
        checked: true,
        name: 'Bidder Test Add/Update Participant',
        nationality: '0',
      },
      {
        biddingProcessBidderId: 'f4381891-8756-4f3b-8e02-2a33d1ca6d3b',
        biddingProcessParticipantId: '4742aa87-525b-43b3-969e-93396e16fdc5',
        checked: false,
        name: 'THIS IS LAS TEST',
        nationality: '0',
      },
    ]);
  });

  describe('should fomatCode', () => {
    describe('amendments', () => {
      it('code lower than 10', () => {
        expect(service.formatCode('CODE', '8', 2)).toBe('CODE-C08-2');
      });
      it('code upper than 10', () => {
        expect(service.formatCode('CODE', '12', 2)).toBe('CODE-C12-2');
      });
    });
    describe('contracts', () => {
      it('code lower than 10', () => {
        expect(service.formatCode('CODE', '8', 0)).toBe('CODE-C08');
      });
      it('code upper than 10', () => {
        expect(service.formatCode('CODE', '12', 0)).toBe('CODE-C12');
      });
    });
  });

  describe('should fill the form correctly', () => {
    it('on detail', () => {
      let form: FormGroup = createContractsForm();
      service.fillFormData(form, mockBiddingContractDetailDetail, 'detail');
    });
    it('on edit', () => {
      let form: FormGroup = createContractsForm();
      service.fillFormData(form, mockBiddingContractDetailEdit, 'edit');
    });
  });

  it('should save contract successfully for saveContract', (done) => {
    const form = createContractsForm();
    service.fillFormData(form, mockBiddingContractDetailEdit, 'detail');

    const processId = 'process-id-123';
    const biddingProcessRequest: BiddingContractsRequest =
      service.setPostModelInformation(form, processId);

    const response = 'successSave';
    const biddingContractApiServiceSpy = jest
      .spyOn(service.biddingContractApiService, 'postBiddingContracts')
      .mockReturnValue(of(response));

    service.saveContract(biddingProcessRequest).subscribe((data) => {
      expect(data).toEqual(response);
      done();
    });
    expect(biddingContractApiServiceSpy).toHaveBeenCalledWith(
      biddingProcessRequest
    );
  });

  it('should update contract successfully for updateContract', (done) => {
    const form = createContractsForm();
    service.fillFormData(form, mockBiddingContractDetailEdit, 'detail');
    const processId = 'process-id-123';
    const biddingProcessRequest: BiddingContractsPutRequest =
      service.setPutModelInformation(form, processId);

    const response = 'successUpdate';
    const spy = jest
      .spyOn(service.biddingContractApiService, 'putBiddingContracts')
      .mockReturnValue(of(response));

    service
      .updateContract(biddingProcessRequest, processId)
      .subscribe((data) => {
        expect(data).toEqual(response);
        done();
      });
    expect(spy).toHaveBeenCalledWith(biddingProcessRequest, processId);
  });

  it('should confirm contract successfully for confirmContract', (done) => {
    const form = createContractsForm();
    service.fillFormData(form, mockBiddingContractDetailEdit, 'detail');

    const processId = 'process-id-123';
    const biddingProcessRequest: BiddingContractsRequest =
      service.setPostModelInformation(form, processId);

    const response = 'success';
    const biddingContractApiServiceSpy = jest
      .spyOn(service.biddingContractApiService, 'postConfirmContract')
      .mockReturnValue(of(response));
    const lang = 'en';

    service.confirmContract(biddingProcessRequest, lang).subscribe((data) => {
      expect(data).toEqual(response);
      done();
    });
    expect(biddingContractApiServiceSpy).toHaveBeenCalledWith(
      biddingProcessRequest,
      lang
    );
  });

  it('should updateConfirm contract successfully for updateConfirm', (done) => {
    const processId = 'process-id-123';
    const response = 'success';
    const biddingContractApiServiceSpy = jest
      .spyOn(service.biddingContractApiService, 'putConfirmContract')
      .mockReturnValue(of(response));
    const lang = 'en';

    service.updateConfirm(processId, lang).subscribe((data) => {
      expect(data).toEqual(response);
      done();
    });
    expect(biddingContractApiServiceSpy).toHaveBeenCalledWith(processId, lang);
  });

  describe('setDamageList', () => {
    it('should set liquidated damage properties from the provided data for setDamageList', () => {
      const data = {
        damagesList: [
          {
            damagesPercentage: 10,
            damagesMaxPercentage: 20,
            damagesPaymentFrequency: 2,
            damagesType: 1,
          },
        ],
      };

      const result = service.setDamageList(data);

      expect(result).toEqual({
        liquidatedDamagePercentage: 10,
        liquidatedDamageMaximumPercentage: 20,
        liquidatedDamagePaymentFrecuency: 2,
        liquidatedDamageType: 1,
      });
    });

    it('should use default values if the properties are not defined in damagesList', () => {
      const data = {
        damagesList: [{}],
      };

      const result = service.setDamageList(data);

      expect(result).toEqual({
        liquidatedDamagePercentage: 0,
        liquidatedDamageMaximumPercentage: 0,
        liquidatedDamagePaymentFrecuency: 0,
        liquidatedDamageType: 0,
      });
    });
  });

  describe('setBonusList', () => {
    it('should set bonus properties from the provided data', () => {
      const data = {
        bonusList: [
          {
            bonusPercentage: 5,
            bonusMaxPercentage: 10,
            bonusPaymentFrequency: 1,
            bonusType: 2,
          },
        ],
      };

      const result = service.setBonusList(data);

      expect(result).toEqual({
        bonusPercentage: 5,
        bonusMaximumPercentage: 10,
        bonusPaymentFrecuency: 1,
        bonusType: 2,
      });
    });
    it('should use default values if the properties are not defined in bonusList', () => {
      const data = {
        bonusList: [{}],
      };

      const result = service.setBonusList(data);

      expect(result).toEqual({
        bonusPercentage: 0,
        bonusMaximumPercentage: 0,
        bonusPaymentFrecuency: 0,
        bonusType: 0,
      });
    });
  });
});
