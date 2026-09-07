import { createAction, props } from '@ngrx/store';
import {
  GetEnumsResponse,
  Enums,
  GetEnumsLocationResponse,
  ContractsMasterData,
  ContractsEnum,
} from '@core/models';

export const getEnum = createAction(
  '[Enums] get Enum',
  props<{ enumType: Enums }>()
);

export const getEnumsSuccess = createAction(
  '[Enums] get Enums Success',
  props<{ enums: GetEnumsResponse; enumType: Enums }>()
);
export const getEnumsError = createAction(
  '[Enums] get Enums Error',
  props<{ enumType: Enums }>()
);

export const getLocations = createAction(
  '[Enums] get locations',
  props<{ enumType: Enums }>()
);

export const getLocationSuccess = createAction(
  '[Enums] get locations success',
  props<{ enums: GetEnumsLocationResponse; enumType: Enums }>()
);

export const getContractEnums = createAction(
  '[Enums] get contrat Enums',
  props<{ enumType: ContractsEnum }>()
);

export const getContractEnumsSucces = createAction(
  '[Enums] get contract Enum success',
  props<{
    enums: ContractsMasterData[];
    enumType: ContractsEnum;
  }>()
);

export const getContractEnumsError = createAction(
  '[Enums] get contract Enum Error',
  props<{ enumType: ContractsEnum }>()
);
