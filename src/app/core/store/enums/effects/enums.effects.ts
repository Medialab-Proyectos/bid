import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as enumsActions from '../actions/enums.actions';
import { EnumsApiService } from '@core/services/apis';
import {
  GetEnumsResponse,
  GetEnumsLocationResponse,
  ContractsMasterData,
} from '@core/models';

@Injectable()
export class EnumEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly enumApiSvc: EnumsApiService
  ) {}

  getEnum$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(enumsActions.getEnum),
      mergeMap((action) =>
        this.enumApiSvc.getEnumType(action.enumType).pipe(
          map((enums: GetEnumsResponse) =>
            enumsActions.getEnumsSuccess({
              enums,
              enumType: action.enumType,
            })
          ),
          catchError(() =>
            of(enumsActions.getEnumsError({ enumType: action.enumType }))
          )
        )
      )
    );
  });

  getEnumsContracts$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(enumsActions.getContractEnums),
      mergeMap((action) =>
        this.enumApiSvc.getContractsEnumMasterData(action.enumType).pipe(
          map((enums: ContractsMasterData[]) =>
            enumsActions.getContractEnumsSucces({
              enums,
              enumType: action.enumType,
            })
          ),
          catchError(() =>
            of(
              enumsActions.getContractEnumsError({ enumType: action.enumType })
            )
          )
        )
      )
    );
  });

  getLocations$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(enumsActions.getLocations),
      mergeMap((action) =>
        this.enumApiSvc.getLocationEnums(action.enumType).pipe(
          map((enums: GetEnumsLocationResponse) =>
            enumsActions.getLocationSuccess({
              enums,
              enumType: action.enumType,
            })
          ),
          catchError(() =>
            of(enumsActions.getEnumsError({ enumType: action.enumType }))
          )
        )
      )
    );
  });
}
