import { TransactionHeaderBalances } from '@fiduciary-interface/app/features/transactions/models';
import { createAction, props } from '@ngrx/store';

export const getProjectBalances = createAction(
  '[ProjectBalances] get Project Balances',
  props<{ projectBucketId: string }>()
);

export const getProjectBalancesSuccess = createAction(
  '[ProjectBalances] get Project Balances Success',
  props<{
    projectBalances: TransactionHeaderBalances;
    projectBucketId: string;
  }>()
);
export const getProjectBalancesError = createAction(
  '[ProjectBalances] get Project Balances Error',
  props<{ payload: unknown }>()
);
