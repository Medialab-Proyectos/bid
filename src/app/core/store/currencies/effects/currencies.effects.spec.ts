import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Observable, of, throwError } from 'rxjs';
import { TranslateStore } from '@ngx-translate/core';
import { CurrenciesEffects } from './currencies.effects';
import * as currenciesActions from '../actions/currencies.actions';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StoreModule, Store } from '@ngrx/store';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { CommonApiService } from '@core/services/apis';
import { Currency } from '@core/models';
describe('ProcurementContractsEffects', () => {
  let actions$: Observable<any>;
  let effects: CurrenciesEffects;
  let commonApiService: CommonApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        StoreModule.forRoot({}),
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [
        CurrenciesEffects,
        TranslateStore,
        provideMockActions(() => actions$),
        provideMockStore(),
        Store,
      ],
    });

    effects = TestBed.inject(CurrenciesEffects);
    commonApiService = TestBed.inject(CommonApiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrencies$', () => {
    it('should dispatch getCurrenciesSuccess action on success', () => {
      const currencies: Currency[] = [
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
      ];
      const action = currenciesActions.getCurrencies();
      const completion = currenciesActions.getCurrenciesSuccess({ currencies });

      jest
        .spyOn(commonApiService, 'getCurrencies')
        .mockReturnValue(of(currencies));

      actions$ = of(action);

      return effects.getCurrencies$.toPromise().then((resultAction) => {
        expect(resultAction).toEqual(completion);
        expect(commonApiService.getCurrencies).toHaveBeenCalled();
      });
    });

    it('should dispatch getCurrenciesError action on error', () => {
      const error = new Error('Error fetching currencies');
      const action = currenciesActions.getCurrencies();
      const completion = currenciesActions.getCurrenciesError({
        payload: error,
      });

      jest
        .spyOn(commonApiService, 'getCurrencies')
        .mockReturnValueOnce(throwError(error));

      actions$ = of(action);

      return effects.getCurrencies$.toPromise().then((resultAction) => {
        expect(resultAction).toEqual(completion);
        expect(commonApiService.getCurrencies).toHaveBeenCalled();
      });
    });
  });
});
