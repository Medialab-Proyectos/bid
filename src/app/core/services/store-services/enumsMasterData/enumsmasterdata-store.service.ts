import { Injectable } from '@angular/core';
import { PermissionService } from '@core/services/app/permission/permission.service';
import {
  AppState,
  AppStateWithMasterData,
  EnumsMasterDataState,
} from '@core/store';
import { Store } from '@ngrx/store';
import { map, Observable, switchMap, take } from 'rxjs';
import * as enumsMasterDataActions from '@core/store/enumsMasterData/actions/enumMasterData.actions';
import {
  MasterData,
  MasterDataCountry,
  MasterDataCountryEnum,
  MasterDataEnum,
  MasterDataType,
} from '@core/models';
type MasterDataReturnType<T extends MasterDataType> =
  T extends MasterDataType.Countries ? MasterDataCountry[] : MasterData[];

@Injectable({
  providedIn: 'root',
})
export class EnumsmasterdataStoreService {
  public enumsObject: EnumsMasterDataState;

  constructor(
    readonly storeEnums: Store<AppStateWithMasterData>,
    readonly store: Store<AppState>,
    private permissionSvc: PermissionService
  ) {
    this.getStoredMasterDataEnums();
  }

  public selectMasterDataEnums(): Observable<EnumsMasterDataState> {
    return this.storeEnums.select('enumsMasterData');
  }

  public getStoredMasterDataEnums() {
    this.storeEnums.select('enumsMasterData').subscribe((res) => {
      this.enumsObject = res;
    });
  }

  public getStoreMasterDataByEnum<T extends MasterDataType>(
    type: T
  ): Observable<MasterDataReturnType<T>> {
    return this.store.select('preferences').pipe(
      map((data) => data.preferences.preferredLanguage),
      switchMap((lang) => {
        return this.storeEnums.select('enumsMasterData').pipe(
          map((data) => {
            return this.mapMasterData(
              data[type],
              lang,
              type
            ) as MasterDataReturnType<T>;
          })
        );
      })
    );
  }

  private mapMasterData<T extends MasterDataType>(
    masterData: MasterDataCountryEnum[] | MasterDataEnum[],
    lang: string,
    type: T
  ): MasterDataReturnType<T> {
    return masterData.map((md) => {
      if (type === MasterDataType.Countries) {
        return {
          id: md.id,
          name: md.name[lang] as string,
          code: md.code,
          isMember: md.isMember,
          isBeneficiary: md.isBeneficiary,
        } as MasterDataCountry;
      } else {
        return {
          id: md.id,
          name: md.name[lang] as string,
          code: md.code,
        } as MasterData;
      }
    }) as MasterDataReturnType<T>;
  }

  public getStoreMasterData(type: MasterDataType) {
    return this.storeEnums.select('enumsMasterData').pipe(map((d) => d[type]));
  }

  public loadEnumMasterData(enums: any, v1 = false) {
    let loadEnums = false;
    this.selectMasterDataEnums().subscribe((data) => {
      for (const propertyName of enums) {
        let currentValue = data;
        if (currentValue.hasOwnProperty(propertyName)) {
          currentValue = currentValue[propertyName];
        } else {
          currentValue = undefined;
          break;
        }

        if (Array.isArray(currentValue) && currentValue.length === 0) {
          loadEnums = true;
        }
      }
    });

    this.permissionSvc.validateIfUserIsLogged().pipe(take(1)).subscribe(() => {
      if (loadEnums) {
        enums.forEach((url) => {
          this.store.dispatch(
            enumsMasterDataActions.getMasterData({ masterDataType: url, v1 })
          );
        });
      }
    });
  }
}
