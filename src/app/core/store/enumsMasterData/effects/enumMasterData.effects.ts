import { Injectable } from '@angular/core';
import { EnumsApiService } from '@core/services/apis';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import * as enumMasterDataActions from '@core/store/enumsMasterData/actions/enumMasterData.actions';
import { MasterDataEnum } from '@core/models';

@Injectable()
export class EnumMasterDataEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly enumApiSvc: EnumsApiService
  ) {}

  getEnum$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(enumMasterDataActions.getMasterData),
      mergeMap((action) => {
        return this.enumApiSvc
          .getEnumMasterDataType(action.masterDataType, action.v1)
          .pipe(
            map((enums: MasterDataEnum[]) => {
              return enumMasterDataActions.getMasterDataSuccess({
                enumsMasterData: enums,
                enumMasterDataType: action.masterDataType,
              });
            }),
            catchError(() =>
              of(
                enumMasterDataActions.getMasterDataError({
                  enumType: action.masterDataType,
                })
              )
            )
          );
      })
    );
  });
}
