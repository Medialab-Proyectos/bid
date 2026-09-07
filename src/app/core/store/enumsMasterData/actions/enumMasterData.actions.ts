import { MasterDataEnum, MasterDataType } from '@core/models';
import { createAction, props } from '@ngrx/store';

export const getMasterData = createAction(
  '[MasterData] get Master Data',
  props<{ masterDataType: MasterDataType; v1: boolean }>()
);

export const getMasterDataSuccess = createAction(
  '[MasterData] get Master Data Success',
  props<{
    enumsMasterData: MasterDataEnum[];
    enumMasterDataType: MasterDataType;
  }>()
);
export const getMasterDataError = createAction(
  '[MasterData] get Master Data Error',
  props<{ enumType: MasterDataType }>()
);
