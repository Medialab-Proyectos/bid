import { currenciesReducer, CurrencieState } from './currencies.reducer';
import * as actions from '../actions/currencies.actions';
import { Currency } from '@core/models';

describe('currenciesReducer', () => {
  it('should update the state when getCurrencies action is dispatched', () => {
    const action = actions.getCurrencies();

    const result = currenciesReducer(currenciesStateMock, action);
    const resultExpected = JSON.parse(JSON.stringify(currenciesStateMock));
    resultExpected.loading = true;
    expect(result).toEqual(resultExpected);
  });

  it('should update the state when getCurrenciesSuccess action is dispatched', () => {
    const currencies: Currency[] = [
      {
        currency: 'EUR',
        isHard: true,
        isBorrowing: false,
        numberOfDecimals: 2,
      },
      {
        currency: 'GPB',
        isHard: true,
        isBorrowing: false,
        numberOfDecimals: 2,
      },
    ];
    const action = actions.getCurrenciesSuccess({ currencies });

    const result = currenciesReducer(currenciesStateMock, action);
    const resultExpected = JSON.parse(JSON.stringify(currenciesStateMock));
    resultExpected.loading = false;
    resultExpected.loaded = true;
    resultExpected.currencies = currencies;

    expect(result).toEqual(resultExpected);
  });

  it('should update the state when getCurrenciesError action is dispatched', () => {
    const error = 'Error message';
    const action = actions.getCurrenciesError({ payload: error });

    const result = currenciesReducer(currenciesStateMock, action);
    const resultExpected = JSON.parse(JSON.stringify(currenciesStateMock));
    resultExpected.loading = false;
    resultExpected.loaded = true;
    resultExpected.error = error;

    expect(result).toEqual(resultExpected);
  });
});

const currenciesStateMock: CurrencieState = {
  currencies: [
    {
      currency: 'USD',
      isHard: true,
      isBorrowing: false,
      numberOfDecimals: 2,
    },
    {
      currency: 'CLP',
      isHard: true,
      isBorrowing: false,
      numberOfDecimals: 2,
    },
  ],
  loaded: true,
  loading: false,
  error: null,
};
