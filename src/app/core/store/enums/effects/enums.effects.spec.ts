import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { of, throwError } from 'rxjs';
import { EnumsApiService } from '@core/services/apis';
import { EnumEffects } from './enums.effects';
import * as enumsActions from '../actions/enums.actions';
import { Enums } from '@core/models';

const nenumApiServiceMock = {
  getEnumType: jest.fn(),
  getLocationEnums: jest.fn(),
};

describe('EnumEffects', () => {
  let actions$: any;
  let effects: EnumEffects;
  let enumApiService: EnumsApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EnumEffects,
        provideMockActions(() => actions$),
        { provide: EnumsApiService, useValue: nenumApiServiceMock },
      ],
    });

    effects = TestBed.inject(EnumEffects);
    enumApiService = TestBed.inject(EnumsApiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getEnum$', () => {
    it('should dispatch getEnumsSuccess action when getEnumType is successful', () => {
      const enumType = Enums.biddingContractStatuses;
      const response = {
        enumerator: [
          { id: 1, name: 'name' },
          { id: 2, name: 'name2' },
        ],
      };

      const action = enumsActions.getEnum({ enumType });
      const completion = enumsActions.getEnumsSuccess({
        enums: response,
        enumType,
      });

      actions$ = of(action);
      jest.spyOn(enumApiService, 'getEnumType').mockReturnValue(of(response));

      return effects.getEnum$.toPromise().then((resultAction) => {
        expect(resultAction).toEqual(completion);
        expect(enumApiService.getEnumType).toHaveBeenCalledWith(enumType);
      });
    });

    it('should dispatch getEnumsError action when getEnumType fails', () => {
      const enumType = Enums.biddingContractStatuses;
      const error = new Error('your-error-message');

      const action = enumsActions.getEnum({ enumType });
      const completion = enumsActions.getEnumsError({ enumType });

      actions$ = of(action);
      jest
        .spyOn(enumApiService, 'getEnumType')
        .mockReturnValue(throwError(error));

      return effects.getEnum$.toPromise().then((resultAction) => {
        expect(resultAction).toEqual(completion);
        expect(enumApiService.getEnumType).toHaveBeenCalledWith(enumType);
      });
    });
  });

  describe('getLocations$', () => {
    it('should dispatch getLocationSuccess action when getLocationEnums is successful', () => {
      const enumType = Enums.biddingContractStatuses;
      const response = {
        enumerator: [
          { code: 'code1', name: 'name' },
          { code: 'code2', name: 'name2' },
        ],
      };

      const action = enumsActions.getLocations({ enumType });
      const completion = enumsActions.getLocationSuccess({
        enums: response,
        enumType,
      });

      actions$ = of(action);
      jest
        .spyOn(enumApiService, 'getLocationEnums')
        .mockReturnValue(of(response));

      return effects.getLocations$.toPromise().then((resultAction) => {
        expect(resultAction).toEqual(completion);
        expect(enumApiService.getLocationEnums).toHaveBeenCalledWith(enumType);
      });
    });

    it('should dispatch getEnumsError action when getLocationEnums fails', () => {
      const enumType = Enums.biddingContractStatuses;
      const error = new Error('your-error-message');

      const action = enumsActions.getLocations({ enumType });
      const completion = enumsActions.getEnumsError({ enumType });

      actions$ = of(action);
      jest
        .spyOn(enumApiService, 'getLocationEnums')
        .mockReturnValue(throwError(error));

      return effects.getLocations$.toPromise().then((resultAction) => {
        expect(resultAction).toEqual(completion);
        expect(enumApiService.getLocationEnums).toHaveBeenCalledWith(enumType);
      });
    });
  });
});
