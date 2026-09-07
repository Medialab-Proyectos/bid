import {
  MasterDataCountryEnum,
  MasterDataEnum,
  MasterDataType,
} from '@core/models';
import { AppState } from '@core/store/store.reducers';
import { createReducer, on } from '@ngrx/store';
import * as enumsMasterDataReducer from '../actions/enumMasterData.actions';

export interface EnumsMasterDataState {
  [MasterDataType.ParticipantRejectedReason]: MasterDataEnum[];
  [MasterDataType.ParticipantResult]: MasterDataEnum[];
  [MasterDataType.MemberCountries]: MasterDataCountryEnum[];
  [MasterDataType.Countries]: MasterDataCountryEnum[];
  masterDataLoaded: {
    [enumType: string]: boolean;
  };
  masterDataLoading: {
    [enumType: string]: boolean;
  };
  loaded: boolean;
  loading: boolean;
  error: unknown;
}

export interface AppStateWithMasterData extends AppState {
  masterData: EnumsMasterDataState;
}
export const masterDataInitialState: EnumsMasterDataState = {
  [MasterDataType.ParticipantRejectedReason]: [],
  [MasterDataType.ParticipantResult]: [],
  [MasterDataType.MemberCountries]: [],
  [MasterDataType.Countries]: [],
  masterDataLoaded: {},
  masterDataLoading: {},
  loaded: false,
  loading: false,
  error: null,
};

const _masterDataReducer = createReducer(
  masterDataInitialState,
  on(enumsMasterDataReducer.getMasterData, (state) => ({
    ...state,
    loading: true,
  })),
  on(
    enumsMasterDataReducer.getMasterDataSuccess,
    (state, { enumMasterDataType, enumsMasterData }) => {
      return {
        ...state,
        [enumMasterDataType]: enumsMasterData,
        masterDataLoaded: {
          ...state.masterDataLoaded,
          [enumMasterDataType]: true,
        },
        masterDataLoading: {
          ...state.masterDataLoading,
          [enumMasterDataType]: false,
        },
        loading: false,
        loaded: true,
      };
    }
  )
);

export function masterDataReducer(state, action) {
  return _masterDataReducer(state, action);
}
