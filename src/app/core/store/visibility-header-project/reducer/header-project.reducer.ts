import { AppState } from '@core/store/store.reducers';
import { createReducer, on } from '@ngrx/store';
import * as headerActions from '../actions/header-project.actions'

export interface HeaderProjectState {
  headerProject: boolean;
}
export interface AppStateWithHeaderProject extends AppState {
  headerProject: HeaderProjectState;
}
export const headerProjectInitialState: HeaderProjectState = {
  headerProject: null,
};

const _headerProjectReducer = createReducer(
  headerProjectInitialState,
  on(headerActions.setHeaderProjectVisibility, (state, { visibility }) => ({
    ...state,
    headerProject: visibility,
  })),
);

export function headerProjectReducer(state, action) {
  return _headerProjectReducer(state, action);
}
