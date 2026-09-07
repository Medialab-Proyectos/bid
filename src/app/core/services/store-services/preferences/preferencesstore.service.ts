import { Injectable } from '@angular/core';
import { CodeNameEnum, PreferencesModel } from '@core/models';
import { AppStateWithUsrPreferences, UsrPreferencesState } from '@core/store';
import * as actions from '@core/store/preferences/actions/preferences.actions';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PreferencesstoreService {
  constructor(
    private readonly storePreferences: Store<AppStateWithUsrPreferences>
  ) {}

  selectPreferences(): Observable<UsrPreferencesState> {
    return this.storePreferences.select('preferences');
  }

  setSelectedLanguageAction(selectedLanguage: CodeNameEnum): void {
    this.storePreferences.dispatch(
      actions.setSelectedLanguage({
        selectedLanguage,
      })
    );
  }

  updateLangPreference(
    lang: string,
    actualPreferences: PreferencesModel
  ): void {
    this.storePreferences.dispatch(
      actions.changePreferedLanguage({
        lang,
        actualPreferences,
      })
    );
  }
}
