import { Injectable } from '@angular/core';

import { AppState } from '@core/store';
import { Store } from '@ngrx/store';
import { EnumsStoreService } from '@core/services/store-services';
import { ContractsEnum, MasterDataType } from '../models';
import { EnumsmasterdataStoreService } from '../services/store-services/enumsMasterData/enumsmasterdata-store.service';

@Injectable({
  providedIn: 'root',
})
export class ContractsResolverResolver {
  constructor(
    readonly store: Store<AppState>,
    readonly enumStore: EnumsStoreService,
    readonly enumsMasterDataStore: EnumsmasterdataStoreService
  ) {}

  enums = [
    'biddingContractStatuses',
    'biddingContractTypes',
    'biddingContractBonusTypes',
    'biddingContractConflictResolutionMethods',
    'biddingContractLiquidatedDamageTypes',
    'biddingContractBonusPaymentFrequency',
    'biddingContractSecurityTypes',
    'biddingContractDocumentGroupCodes',
    'biddingContractDocumentGroupVisibilities',
    'biddingContractAmendmentDocumentGroupCodes',
  ];

  contractEnums = [
    ContractsEnum.BONUS,
    ContractsEnum.CONFLICT_RESOLUTION_METHOD,
    ContractsEnum.GUARANTEE,
    ContractsEnum.CONTRACT_STATUS,
    ContractsEnum.CONTRACT_TYPE,
    ContractsEnum.LIQUIDATION_DAMAGE,
    ContractsEnum.PAYMENT_DISTRIBUTION,
    ContractsEnum.PAYMENT_FREQUENCY,
    ContractsEnum.PAYMENT_REQUEST,
  ];

  enumsV1 = [MasterDataType.Countries];

  resolve(): void {
    this.enumStore.loadEnum(this.enums);
    this.enumStore.loadContractEnums(this.contractEnums);
    this.enumsMasterDataStore.loadEnumMasterData(this.enumsV1);
  }
}
