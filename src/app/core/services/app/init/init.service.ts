import { PreferencesModel } from '@core/models';
import { Injectable } from '@angular/core';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { Store } from '@ngrx/store';
import { AppState } from '@core/store';
import { filter, take } from 'rxjs/operators';
import { InteractionStatus } from '@azure/msal-browser';
import { LanguagesCode, LanguagesName } from '@core/enums';
import { UserPreferencesService } from '@core/services/apis';
import { EnumsStoreService } from '@core/services/store-services';
import * as preferencesActions from '@core/store/preferences/actions/preferences.actions';

@Injectable({
  providedIn: 'root',
})
export class InitService {
  constructor(
    readonly msal: MsalService,
    readonly store: Store<AppState>,
    private msalBroadcastService: MsalBroadcastService,
    readonly preferencesSvc: UserPreferencesService,
    readonly enumStore: EnumsStoreService
  ) {}

  email: string;

  DEFAULT_LANGUAGE_CODE = LanguagesCode.ENGLISH;
  DEFAULT_LANGUAGE_NAME = LanguagesName.ENGLISH;

  public async initializeFunction(): Promise<any> {
    let account;
    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status) => status === InteractionStatus.None),
        take(1)
      )
      .subscribe((status) => {
        if (
          status === InteractionStatus.None &&
          this.msal.instance.getActiveAccount() !== undefined &&
          this.msal.instance.getActiveAccount() !== null
        ) {
          setTimeout(() => {
            account = this.msal.instance.getActiveAccount();
          }, 1000);
          this.email = account?.idTokenClaims.email as string;
          setTimeout(() => {
            this.preferencesSvc
              .getPreferences()
              .subscribe((data: PreferencesModel) => {
                this.store.dispatch(
                  preferencesActions.getPreferencesSuccess({
                    preferences: data,
                  })
                );
              });
          }, 2500);
        }
      });
  }
}
