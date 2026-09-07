import { Injectable } from '@angular/core';

import { AppState } from '@core/store';
import { Store } from '@ngrx/store';
import { EnumsStoreService } from '@core/services/store-services';
import { EnumsmasterdataStoreService } from '@core/services/store-services/enumsMasterData/enumsmasterdata-store.service';
import { MasterDataType } from '@core/models';

@Injectable({
  providedIn: 'root',
})
export class ParticipantsResolver {
  constructor(
    readonly store: Store<AppState>,
    readonly enumStore: EnumsStoreService,
    readonly enumsMasterDataStore: EnumsmasterdataStoreService
  ) {}

  enums = [
    'biddingProcessParticipantResults',
    'biddingProcessBidderEconomicSectors',
    'biddingProcessBidderTypes',
  ];

  enumsV2 = [
    MasterDataType.ParticipantRejectedReason,
    MasterDataType.ParticipantResult,
  ];

  enumsV1 = [MasterDataType.Countries];

  resolve(): void {
    this.enumStore.loadEnum(this.enums);
    this.enumsMasterDataStore.loadEnumMasterData(this.enumsV2);
    this.enumsMasterDataStore.loadEnumMasterData(this.enumsV1);
  }
}
