import { AppState } from '@core/store/store.reducers';
import { createReducer, on } from '@ngrx/store';
import * as headerActions from '../actions/header-process.actions';

export interface HeaderProcessState {
  headerProcess: boolean;
  isLoading: boolean;
}
export interface AppStateWithHeaderProcess extends AppState {
  headerProcess: HeaderProcessState;
}
export const headerProcessInitialState: HeaderProcessState = {
  headerProcess: null,
  isLoading: true,
};

const _headerProcessReducer = createReducer(
  headerProcessInitialState,
  on(headerActions.setHeaderProcessVisibility, (state, { visibility }) => ({
    ...state,
    headerProcess: visibility,
  })),
  on(headerActions.setHeaderProcessSetLoading, (state, { loading }) => ({
    ...state,
    isLoading: loading,
  }))
);

export function headerProcessReducer(state, action) {
  return _headerProcessReducer(state, action);
}
