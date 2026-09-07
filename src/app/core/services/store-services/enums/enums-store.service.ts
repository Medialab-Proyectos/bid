import { Observable, take } from 'rxjs';
import { Injectable } from '@angular/core';
import {
  AppState,
  AppStateWithEnums,
  EnumsMasterDataState,
  EnumState,
  getContractEnumStateKey,
} from '@core/store';
import * as enumActions from '@core/store/enums/actions/enums.actions';
import { Store } from '@ngrx/store';
import { ContractsEnum, Enums } from '@core/models';
import { PermissionService } from '@core/services/app/permission/permission.service';

@Injectable({
  providedIn: 'root',
})
export class EnumsStoreService {
  public enumsObject: EnumState;

  constructor(
    readonly storeEnums: Store<AppStateWithEnums>,
    readonly store: Store<AppState>,
    private permissionSvc: PermissionService
  ) {
    this.getStoredEnums();
  }

  public selectEnums(): Observable<EnumState> {
    return this.storeEnums.select('enums');
  }

  public selectEnumsMasterData(): Observable<EnumsMasterDataState> {
    return this.storeEnums.select('enumsMasterData');
  }

  public getStoredEnums() {
    this.storeEnums.select('enums').subscribe((res) => {
      this.enumsObject = res;
    });
  }

  public loadEnum(enums: any) {
    let loadEnums = false;
    this.selectEnums().subscribe((data) => {
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

    this.permissionSvc
      .validateIfUserIsLogged()
      .pipe(take(1))
      .subscribe(() => {
        if (loadEnums) {
          enums.forEach((url) => {
            this.store.dispatch(
              enumActions.getEnum({ enumType: url as Enums })
            );
          });
        }
      });
  }

  public loadContractEnums(contractEnums: ContractsEnum[]) {
    let loadEnums = false;

    this.selectEnums().subscribe((data) => {
      for (const enumType of contractEnums) {
        const stateKey = getContractEnumStateKey(enumType);

        if (stateKey && data.hasOwnProperty(stateKey)) {
          const currentValue = data[stateKey];

          if (Array.isArray(currentValue) && currentValue.length === 0) {
            loadEnums = true;
            break;
          }
        }
      }
    });

    this.permissionSvc
      .validateIfUserIsLogged()
      .pipe(take(1))
      .subscribe(() => {
        if (loadEnums) {
          contractEnums.forEach((enumType) => {
            this.store.dispatch(enumActions.getContractEnums({ enumType }));
          });
        }
      });
  }
}
