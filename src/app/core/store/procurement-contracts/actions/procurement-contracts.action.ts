import { BiddingContractByProcess } from '@core/models';
import { createAction, props } from '@ngrx/store';

export const getContracts = createAction(
  '[BiddingContract] get contract',
  props<{ processId: string; processCode: string }>()
);

export const getContractsSuccess = createAction(
  '[BiddingContract] get contract Success',
  props<{
    processId: string;
    contracts: BiddingContractByProcess[];
    processCode: string;
  }>()
);
export const getContractsError = createAction(
  '[BiddingContract] get contract Error',
  props<{ processId: string; payload: unknown }>()
);

export const terminateContract = createAction(
  '[Contract] terminate contract',
  props<{ processId: string; contractId: string; lang }>()
);

export const terminateContractSuccess = createAction(
  '[Contract] terminate contract Success',
  props<{ processId: string; contractId: string }>()
);
export const terminateContractError = createAction(
  '[Contract] terminate contract Error',
  props<{ processId: string; payload: unknown }>()
);

export const completeContract = createAction(
  '[Contract] complete contract',
  props<{ processId: string; contractId: string; lang: string }>()
);

export const completeContractSuccess = createAction(
  '[Contract] complete contract Success',
  props<{ processId: string; contractId: string }>()
);
export const completeContractError = createAction(
  '[Contract] complete contract Error',
  props<{ processId: string; payload: unknown }>()
);

export const deleteContract = createAction(
  '[Contract] delete contract',
  props<{ processId: string; contractId: string; isCopy: boolean }>()
);

export const deleteContractSuccess = createAction(
  '[Contract] delete contract Success',
  props<{ processId: string; contractId: string; isCopy: boolean }>()
);
export const deleteContractError = createAction(
  '[Contract] delete contract Error',
  props<{ processId: string; payload: unknown }>()
);
