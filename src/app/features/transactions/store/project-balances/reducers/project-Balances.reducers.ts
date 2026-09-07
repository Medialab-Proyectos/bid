import { AppState } from '@core/store/store.reducers';
import { TransactionHeaderBalances } from '@fiduciary-interface/app/features/transactions/models';
import { createReducer, on } from '@ngrx/store';
import * as projectBalancesActions from '../actions/project-Balances.actions';

export interface ProjectBalanceState {
  projectBalances: TransactionHeaderBalances;
  loaded: boolean;
  loading: boolean;
  projectBucketId: string;
  error: unknown;
}
export interface AppStateWithProjectBalance extends AppState {
  projectBalances: ProjectBalanceState;
}

export const projectBalanceInitialState: ProjectBalanceState = {
  projectBalances: null,
  loaded: false,
  loading: false,
  projectBucketId: null,
  error: null,
};

const _projectBalances = createReducer(
  projectBalanceInitialState,
  on(
    projectBalancesActions.getProjectBalances,
    (state, { projectBucketId }) => ({
      ...state,
      loading: true,
      projectBucketId,
    })
  ),
  on(
    projectBalancesActions.getProjectBalancesSuccess,
    (state, { projectBalances, projectBucketId }) => ({
      ...state,
      loading: false,
      loaded: true,
      projectBalances,
      projectBucketId,
    })
  ),
  on(projectBalancesActions.getProjectBalancesError, (state, { payload }) => ({
    ...state,
    loading: false,
    loaded: true,
    error: payload,
  }))
);

export function projectBalancesReducer(state, action) {
  return _projectBalances(state, action);
}
