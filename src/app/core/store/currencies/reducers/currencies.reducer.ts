import { createReducer, on } from '@ngrx/store';
import { Currency } from '@core/models';
import * as currenciesActions from '../actions/currencies.actions';
import { AppState } from '@core/store/store.reducers';

export interface CurrencieState {
  currencies: Currency[];
  loaded: boolean;
  loading: boolean;
  error: unknown;
}
export interface AppStateWithCurrencies extends AppState {
  currencies: CurrencieState;
}
export const currenciesInitialState: CurrencieState = {
  currencies: [],
  loaded: false,
  loading: false,
  error: null,
};

const _currenciesReducer = createReducer(
  currenciesInitialState,
  on(currenciesActions.getCurrencies, (state) => ({ ...state, loading: true })),
  on(currenciesActions.getCurrenciesSuccess, (state, { currencies }) => ({
    ...state,
    loading: false,
    loaded: true,
    currencies: [...currencies],
  })),
  on(currenciesActions.getCurrenciesError, (state, { payload }) => ({
    ...state,
    loading: false,
    loaded: true,
    error: payload,
  }))
);

export function currenciesReducer(state, action) {
  return _currenciesReducer(state, action);
}
