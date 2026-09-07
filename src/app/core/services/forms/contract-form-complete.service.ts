import { Injectable } from '@angular/core';
import {
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
} from '@angular/forms';
import {
  BiddingContractCurrenciesResponse,
  BiddingContractDetail,
  BiddingContractDocumentsResponse,
  BiddingContractLocationsResponse,
  BiddingContractLotsResponse,
  BiddingContractResponse,
  BiddingContractsAwarded,
  BiddingContractSecuritiesResponse,
  ErrorResponse,
  ParticipantAwardedAndWinner,
  ParticipantsAwardedResponse,
} from '@core/models';
import {
  createBonusGroup,
  createDamagesGroup,
  createSecurityGroup,
} from '@fiduciary-interface/app/features/procurement/features/procurement-process/features/process-contracts/components/aditional-information/aditional-information.form';
import { createCurrencyGroup } from '@fiduciary-interface-contracts/components/contract-general-information/contract-general-information.form';
import { createLotGroup } from '@fiduciary-interface/app/features/procurement/features/procurement-process/features/process-contracts/components/contract-lots/contract-lots.form';
import { createWinnerInformationGroup } from '@fiduciary-interface-contracts/components/winner-information/winner-information-form.form';
import { of, forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  BiddingContractApiService,
  CommonApiService,
  ParticipantsApiService,
} from '../apis';
import {
  BiddingProcessPlanStoreService,
  EnumsStoreService,
} from '../store-services';
import {
  AdditionalInformation,
  BiddingContractLots,
  BiddingContractsPutRequest,
  BiddingContractsRequest,
  Bonus,
  CostDistribution,
  Currencies,
  GeneralInformationModel,
  LiquidatedDamage,
  LocationModel,
  Securities,
} from '@core/models/requests/bidding-contracts-request.model';
import { ProcessConfiguration } from '../process-configuration.service';
import { FormValidationService } from '../validation';

@Injectable({
  providedIn: 'root',
})
export class ContractFormCompleteService {
  formBuilder: UntypedFormBuilder;
  contractForm: UntypedFormGroup;
  processCode: string;
  contractAux: Observable<BiddingContractResponse>;

  constructor(
    readonly participantApi: ParticipantsApiService,
    readonly configSvc: ProcessConfiguration,
    readonly commonApi: CommonApiService,
    readonly validationSvc: FormValidationService,
    readonly enumStore: EnumsStoreService,
    readonly biddingContractApiService: BiddingContractApiService,
    private readonly biddingStoreSvc: BiddingProcessPlanStoreService
  ) {
    this.biddingStoreSvc.biddingProcessPlan().subscribe((data) => {
      if (data.selectedBiddingProcessProcurementProcess) {
        this.processCode = data.selectedBiddingProcessProcurementProcess.code;
      }
    });
  }

  get winnerInformationForm(): UntypedFormGroup {
    return this.contractForm.get('winnerInformation') as UntypedFormGroup;
  }

  get winnerList(): UntypedFormArray {
    return this.winnerInformationForm.get('winnerList') as UntypedFormArray;
  }

  get generalInfoCurrencies(): UntypedFormArray {
    return this.contractForm
      .get('generalInformation')
      .get('currencyList') as UntypedFormArray;
  }

  get lots(): UntypedFormArray {
    return this.contractForm.get('lots') as UntypedFormArray;
  }

  get bonus(): UntypedFormArray {
    return this.contractForm
      .get('aditionalInformation')
      .get('bonusList') as UntypedFormArray;
  }

  get damages(): UntypedFormArray {
    return this.contractForm
      .get('aditionalInformation')
      .get('damagesList') as UntypedFormArray;
  }

  get securities(): UntypedFormArray {
    return this.contractForm
      .get('aditionalInformation')
      .get('securityList') as UntypedFormArray;
  }

  getContractDetail(
    biddingContractId: string,
    biddingProcurementProcessId: string
  ): Observable<BiddingContractDetail> {
    const contract = this.biddingContractApiService
      .getContractById(biddingContractId)
      .pipe(
        map((response: BiddingContractResponse) => {
          return response;
        })
      );
    const participants = this.participantApi
      .getAwardedParticipants(biddingProcurementProcessId)
      .pipe(
        map((response: ParticipantsAwardedResponse) => {
          return response.participantsAwarded;
        })
      );
    const awardees = this.biddingContractApiService
      .getContractAwardees(biddingContractId)
      .pipe(
        map((response: BiddingContractsAwarded[]) => {
          return response;
        })
      );
    const locations = this.biddingContractApiService
      .getBiddingContractLocations(biddingContractId)
      .pipe(
        map((response: BiddingContractLocationsResponse) => {
          return response.locations;
        })
      );
    const currencies = this.biddingContractApiService
      .getBiddingContractCurrencies(biddingContractId)
      .pipe(
        map((response: BiddingContractCurrenciesResponse) => {
          return response.biddingContractCurrency;
        })
      );
    const lots = this.biddingContractApiService
      .getBiddingContractLots(biddingContractId)
      .pipe(
        map((response: BiddingContractLotsResponse) => {
          return response.biddingContractLots;
        })
      );
    const securities = this.biddingContractApiService
      .getBiddingContractSecurities(biddingContractId)
      .pipe(
        map((response: BiddingContractSecuritiesResponse) => {
          return response.biddingContractSecurities.map((r) => {
            r.expirationDate = new Date(r.expirationDate);
            return r;
          });
        })
      );
    const documents = this.biddingContractApiService
      .getBiddingContractDocuments(biddingContractId)
      .pipe(
        map((response: BiddingContractDocumentsResponse) => {
          return response.biddingContractDocuments;
        })
      );
    const participantsAndWinners = of([]);
    const visualCode = of('');
    return forkJoin({
      contract,
      participants,
      awardees,
      locations,
      currencies,
      lots,
      securities,
      documents,
      participantsAndWinners,
      visualCode,
    }).pipe(
      map((response: BiddingContractDetail) => {
        response.participantsAndWinners =
          this.updateParticipantsWithWinner(response);
        response.visualCode = this.formatCode(
          this.processCode,
          response.contract.code,
          response.contract.version
        );
        return response;
      })
    );
  }

  updateParticipantsWithWinner(
    contractDetail: BiddingContractDetail
  ): ParticipantAwardedAndWinner[] {
    const awardeds = contractDetail.awardees;
    contractDetail.participants.forEach((participant) => {
      const obj = awardeds.find(
        (awardeds) =>
          awardeds.biddingProcessParticipantId ===
          participant.biddingProcessParticipantId
      );
      const index = awardeds.indexOf(obj);
      const participantWithWinner: ParticipantAwardedAndWinner = {
        ...participant,
        checked: index === -1 ? false : true,
      };
      contractDetail.participantsAndWinners.push(participantWithWinner);
    });
    return contractDetail.participantsAndWinners;
  }

  formatCode(processCode: string, code: string, version: number): string {
    if (version === 0) {
      if (Number(code) < 10) {
        return `${processCode}-C0${code}`;
      } else {
        return `${processCode}-C${code}`;
      }
    } else {
      if (Number(code) < 10) {
        return `${processCode}-C0${code}-${version}`;
      } else {
        return `${processCode}-C${code}-${version}`;
      }
    }
  }

  fillFormData(
    form: UntypedFormGroup,
    data: BiddingContractDetail,
    mode: 'edit' | 'detail'
  ) {
    this.contractForm = form;
    //clear currencies
    this.generalInfoCurrencies.clear();
    data.currencies.forEach(() => {
      this.generalInfoCurrencies.push(createCurrencyGroup());
    });
    //clear lots
    this.lots.clear();
    data.lots.forEach(() => {
      this.lots.push(createLotGroup());
    });
    //clear securities
    this.securities.clear();
    data.securities.forEach(() => {
      this.securities.push(createSecurityGroup());
    });
    //clear bonus
    this.bonus.clear();
    if (data.contract.bonusType !== null) {
      this.bonus.push(createBonusGroup());
    }
    //clear damages
    this.damages.clear();
    if (data.contract.liquidatedDamageType !== null) {
      this.damages.push(createDamagesGroup());
    }

    let winnerList;
    if (mode === 'edit') {
      //clear winner list
      this.winnerList.clear();
      data.participantsAndWinners.forEach(() => {
        this.winnerList.push(createWinnerInformationGroup());
      });
      winnerList = data.participantsAndWinners;
    } else {
      if (mode === 'detail') {
        this.winnerList.clear();
        data.awardees.forEach(() => {
          this.winnerList.push(createWinnerInformationGroup());
        });
        winnerList = data.awardees;
      }
    }

    const newFormData = {
      winnerInformation: {
        winnerList,
      },
      generalInformation: {
        applicableLaw: data.contract.applicableLaw,
        conflictResolutionMethod: data.contract.conflictResolutionMethod,
        contractType: data.contract.contractType,
        controlNumber: data.contract.controlNumber,
        currencyList: data.currencies,
        endDate: new Date(data.contract?.endDate),
        signatureDate: new Date(data.contract?.signatureDate),
        startDate: new Date(data.contract?.startDate),
        hasAdvancedPayment: data.contract.hasAdvancedPayment,
        name: data.contract?.name,
        objective: data.contract?.object,
        goodsSource: data.contract?.goodsSource,
        typeDesignation: data.contract?.contractTypeDesignation,
      },
      costDistribution: {
        bidAmount: data.contract.idbAmount,
        cofinancingAmount: data.contract.cofinancedamount,
        contractTotalAmount: data.contract.contractTotalAmount,
        justification: data.contract.justification,
        localCounterpartAmount: data.contract.localCounterpartAmount,
      },
      lots: data.lots,
      destinationPlace: data.locations[0],
      aditionalInformation: {
        bonusList: [
          {
            bonusMaxPercentage: data.contract.bonusMaximumPercentage,
            bonusPaymentFrequency: data.contract.bonusPaymentFrecuency,
            bonusPercentage: data.contract.bonusPercentage,
            bonusType: data.contract.bonusType,
          },
        ],
        damagesList: [
          {
            damagesMaxPercentage:
              data.contract.liquidatedDamageMaximumPercentage,
            damagesPaymentFrequency:
              data.contract.liquidatedDamagePaymentFrecuency,
            damagesPercentage: data.contract.liquidatedDamagePercentage,
            damagesType: data.contract.liquidatedDamageType,
          },
        ],
        securityList: data.securities,
      },
    };
    form.patchValue(newFormData);
  }

  setPostModelInformation(
    form: UntypedFormGroup,
    processId: string,
    contractTypeDesignation = false
  ): BiddingContractsRequest {
    let biddingProcessRequest: BiddingContractsRequest = null;
    biddingProcessRequest = {
      biddingProcessParticipants: this.setBiddingProcessParticipants(
        form.controls['winnerInformation'].value
      ),
      generalInformationModel: this.setGeneralInformation(
        form.controls['generalInformation'].value,
        processId,
        contractTypeDesignation
      ),
      costDistribution: this.setCostDistribution(
        (form.controls['costDistribution'] as UntypedFormGroup).getRawValue()
      ),
      biddingContractLots: this.setBiddingContractLots(
        form.controls['lots'].value
      ),
      location: this.setLocation(form.controls['destinationPlace'].value),
      additionalInformation: this.setAditionalInformation(
        form.controls['aditionalInformation'].value
      ),
      documents: [],
    };
    return biddingProcessRequest;
  }

  setPutModelInformation(
    form: UntypedFormGroup,
    processId: string,
    contractTypeDesignation = false
  ): BiddingContractsPutRequest {
    let biddingProcessRequest: BiddingContractsPutRequest = null;
    biddingProcessRequest = {
      biddingProcessParticipants: this.setBiddingProcessParticipants(
        form.controls['winnerInformation'].value
      ),
      biddingProcurementProcessId: processId,
      contractType: form.controls['generalInformation'].value.contractType,
      conflictResolutionMethod:
        form.controls['generalInformation'].value.conflictResolutionMethod,
      name: form.controls['generalInformation'].value.name,
      object: form.controls['generalInformation'].value.objective,
      signatureDate: form.controls['generalInformation'].value.signatureDate,
      startDate: form.controls['generalInformation'].value.startDate,
      endDate: form.controls['generalInformation'].value.endDate,
      controlNumber: form.controls['generalInformation'].value.controlNumber,
      contractTypeDesignation: contractTypeDesignation
        ? form.controls['generalInformation'].value.typeDesignation
        : null,
      hasAdvancedPayment:
        form.controls['generalInformation'].value.hasAdvancedPayment,
      applicableLaw: form.controls['generalInformation'].value.applicableLaw,
      goodsSource: form.controls['generalInformation'].value.goodsSource,
      currencies: this.setCurrencies(form.controls['generalInformation'].value),
      costDistribution: this.setCostDistribution(
        (form.controls['costDistribution'] as UntypedFormGroup).getRawValue()
      ),
      biddingContractLots: this.setBiddingContractLots(
        form.controls['lots'].value
      ),
      location: this.setLocation(form.controls['destinationPlace'].value),
      securities:
        form.controls['aditionalInformation'].value.securityList !==
          undefined &&
        form.controls['aditionalInformation'].value.securityList.length > 0
          ? this.setSecurityList(form.controls['aditionalInformation'].value)
          : [],
      liquidatedDamage:
        form.controls['aditionalInformation'].value.damagesList[0] !==
          undefined &&
        form.controls['aditionalInformation'].value.damagesList.length > 0
          ? this.setDamageList(form.controls['aditionalInformation'].value)
          : null,
      bonus:
        form.controls['aditionalInformation'].value.bonusList[0] !==
          undefined &&
        form.controls['aditionalInformation'].value.bonusList.length > 0
          ? this.setBonusList(form.controls['aditionalInformation'].value)
          : null,
      documents: [],
    };

    return biddingProcessRequest;
  }

  setGeneralInformation(
    data,
    processId: string,
    contractTypeDesignation: boolean
  ): GeneralInformationModel {
    let generalInformation: GeneralInformationModel = null;

    generalInformation = {
      biddingProcurementProcessId: processId,
      contractType: data.contractType,
      conflictResolutionMethod: data.conflictResolutionMethod,
      name: data?.name,
      object: data.objective,
      signatureDate: data.signatureDate,
      startDate: data?.startDate,
      endDate: data?.endDate,
      controlNumber: data.controlNumber,
      hasAdvancedPayment: data.hasAdvancedPayment,
      goodsSource: data.goodsSource,
      applicableLaw: data.applicableLaw,
      currencies: this.setCurrencies(data),
      contractTypeDesignation: contractTypeDesignation
        ? data.typeDesignation
        : null,
    };

    return generalInformation;
  }

  setAditionalInformation(data) {
    let additionalInformation: AdditionalInformation = null;
    let securities: Array<Securities> = [];
    let liquidatedDamage: LiquidatedDamage = null;
    let bonus: Bonus = null;

    if (data.securityList !== undefined && data.securityList.length > 0) {
      securities = this.setSecurityList(data);
    }

    if (data.damagesList[0] !== undefined && data.damagesList.length > 0) {
      liquidatedDamage = this.setDamageList(data);
    }

    if (data.bonusList[0] !== undefined && data.bonusList.length > 0) {
      bonus = this.setBonusList(data);
    }

    additionalInformation = {
      securities,
      liquidatedDamage,
      bonus,
    };
    return additionalInformation;
  }

  setBiddingProcessParticipants(data) {
    const biddingProcessParticipants = [];
    data.winnerList.forEach((c) => {
      if (c.checked) {
        biddingProcessParticipants.push(c.biddingProcessParticipantId);
      }
    });
    return biddingProcessParticipants;
  }

  setCurrencies(data) {
    const currencies: Array<Currencies> = [];

    data.currencyList.forEach((c) => {
      if (c.id !== undefined && c.id !== null) {
        currencies.push({
          currency: c.currency,
          totalAmount: c.totalAmount,
          usdEquivalentAmount: c.usdEquivalentAmount,
          id: c.id,
        });
      } else {
        currencies.push({
          currency: c.currency,
          totalAmount: c.totalAmount,
          usdEquivalentAmount: c.usdEquivalentAmount,
        });
      }
    });

    return currencies;
  }

  setCostDistribution(data) {
    let costDistribution: CostDistribution = null;
    costDistribution = {
      totalEstimatedAmount: this.parseToDecimals(data.contractTotalAmount),
      idbAmount: data.bidAmount,
      localCounterpartAmount: data.localCounterpartAmount,
      cofinancedAmount: data.cofinancingAmount,
      justification: data.justification,
    };
    return costDistribution;
  }

  parseToDecimals(x: number) {
    return Number(x.toFixed(2));
  }

  setBiddingContractLots(data) {
    const biddingContractLots: Array<BiddingContractLots> = [];

    data.forEach((contract) => {
      if (contract.id !== undefined && contract.id !== null) {
        biddingContractLots.push({
          name: contract.name,
          units: contract.units,
          amount: contract.amount,
          id: contract.id,
        });
      } else {
        biddingContractLots.push({
          name: contract.name,
          units: contract.units,
          amount: contract.amount,
        });
      }
    });

    return biddingContractLots;
  }

  setLocation(data) {
    let location: LocationModel = null;
    if (data.id !== undefined && data.id !== null) {
      location = {
        address: data.address,
        zipCode: data.zipCode,
        country: data.country,
        id: data.id,
      };
    } else {
      location = {
        address: data.address,
        zipCode: data.zipCode,
        country: data.country,
      };
    }

    return location;
  }

  setSecurityList(data) {
    const securities = [];
    data.securityList.forEach((security) => {
      if (
        security.id !== undefined &&
        security.id !== null &&
        security.id !== ''
      ) {
        securities.push({
          securityType: security.securityType,
          currency: security.currency,
          amount: security.amount,
          usdEquivalentAmount: security.usdEquivalentAmount,
          expirationDate: security.expirationDate,
          id: security.id,
        });
      } else {
        securities.push({
          securityType: security.securityType,
          currency: security.currency,
          amount: security.amount,
          usdEquivalentAmount: security.usdEquivalentAmount,
          expirationDate: security.expirationDate,
        });
      }
    });
    return securities;
  }

  setBonusList(data) {
    let bonus = null;

    bonus = {
      bonusPercentage: data.bonusList[0].bonusPercentage
        ? data.bonusList[0].bonusPercentage
        : 0,
      bonusMaximumPercentage: data.bonusList[0].bonusMaxPercentage
        ? data.bonusList[0].bonusMaxPercentage
        : 0,
      bonusPaymentFrecuency: data.bonusList[0].bonusPaymentFrequency
        ? data.bonusList[0].bonusPaymentFrequency
        : 0,
      bonusType: data.bonusList[0].bonusType ? data.bonusList[0].bonusType : 0,
    };

    return bonus;
  }

  setDamageList(data) {
    let liquidatedDamage = null;

    liquidatedDamage = {
      liquidatedDamagePercentage: data.damagesList[0].damagesPercentage
        ? data.damagesList[0].damagesPercentage
        : 0,
      liquidatedDamageMaximumPercentage: data.damagesList[0]
        .damagesMaxPercentage
        ? data.damagesList[0].damagesMaxPercentage
        : 0,
      liquidatedDamagePaymentFrecuency: data.damagesList[0]
        .damagesPaymentFrequency
        ? data.damagesList[0].damagesPaymentFrequency
        : 0,
      liquidatedDamageType: data.damagesList[0].damagesType
        ? data.damagesList[0].damagesType
        : 0,
    };

    return liquidatedDamage;
  }

  saveContract(
    biddingProcessRequest: BiddingContractsRequest
  ): Observable<string | ErrorResponse> {
    return this.biddingContractApiService.postBiddingContracts(
      biddingProcessRequest
    );
  }

  updateContract(
    biddingProcessRequest: BiddingContractsPutRequest,
    biddingContractId: string
  ): Observable<string | ErrorResponse> {
    return this.biddingContractApiService.putBiddingContracts(
      biddingProcessRequest,
      biddingContractId
    );
  }

  confirmContract(
    biddingProcessRequest: BiddingContractsRequest,
    lang: string
  ): Observable<string | ErrorResponse> {
    return this.biddingContractApiService.postConfirmContract(
      biddingProcessRequest,
      lang
    );
  }

  updateConfirm(
    biddingContractId: string,
    lang: string
  ): Observable<string | ErrorResponse> {
    return this.biddingContractApiService.putConfirmContract(
      biddingContractId,
      lang
    );
  }
}
