import { createReducer, on } from '@ngrx/store';
import { TempDoc } from '../model/tempDoc.model';
import * as tempDocActions from '../actions/tempDoc.actions';
import { AppState } from '@core/store/store.reducers';

export interface TempDocState {
  docs: TempDoc[];
  loaded: boolean;
  loading: boolean;
  error: unknown;
}

export interface AppStateWithTempDocs extends AppState {
  docs: TempDocState;
}

export const initialState: TempDocState = {
  docs: [],
  loaded: false,
  loading: false,
  error: null,
};

const _tempReducer = createReducer(
  initialState,
  on(tempDocActions.addDoc, (state) => ({ ...state, loading: true })),
  on(tempDocActions.addDocSuccess, (state, { doc }) => ({
    ...state,
    loading: false,
    loaded: true,
    docs: [...doc],
  })),
  on(tempDocActions.addDocError, (state, { payload }) => ({
    ...state,
    loading: false,
    loaded: true,
    error: payload,
  }))
);

export function tempReducer(state, action) {
  return _tempReducer(state, action);
}
