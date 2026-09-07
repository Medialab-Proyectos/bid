import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as currenciesActions from '../actions/currencies.actions';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { CommonApiService } from '@core/services/apis/';
import { Currency } from '@core/models';

@Injectable()
export class CurrenciesEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly CommonApiService: CommonApiService
  ) {}

  getCurrencies$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(currenciesActions.getCurrencies),
      exhaustMap(() => {
        return this.CommonApiService.getCurrencies().pipe(
          map((response: Currency[]) => {
            return currenciesActions.getCurrenciesSuccess({
              currencies: response,
            });
          }),
          catchError((err) => {
            return of(currenciesActions.getCurrenciesError({ payload: err }));
          })
        );
      })
    );
  });
}
