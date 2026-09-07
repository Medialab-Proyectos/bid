import { Currency } from '@core/models';
import { createAction, props } from '@ngrx/store';

export const getCurrencies = createAction('[Currencies] get Currencies');

export const getCurrenciesSuccess = createAction(
  '[Currencies] get Currencies Success',
  props<{ currencies: Currency[] }>()
);
export const getCurrenciesError = createAction(
  '[Currencies] get Currencies Error',
  props<{ payload: unknown }>()
);
