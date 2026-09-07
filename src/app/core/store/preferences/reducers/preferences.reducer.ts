/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { createReducer, on } from '@ngrx/store';
import * as usrPreferencesActions from '../actions/preferences.actions';
import { PreferencesModel } from '@core/models';
import { AppState } from '@core/store/store.reducers';

export interface UsrPreferencesState {
  preferences: PreferencesModel;
  loaded: boolean;
  loading: boolean;
  error: unknown;
}
export interface AppStateWithUsrPreferences extends AppState {
  preferences: UsrPreferencesState;
}
export const usrPreferencesInitialState: UsrPreferencesState = {
  preferences: null,
  loaded: false,
  loading: false,
  error: null,
};

const _preferencesReducer = createReducer(
  usrPreferencesInitialState,
  on(
    usrPreferencesActions.setSelectedLanguage,
    (state, { selectedLanguage }) => ({
      ...state,
      loading: false,
      loaded: true,
      selectedLanguage,
    })
  ),
  on(
    usrPreferencesActions.getPreferencesSuccess,
    usrPreferencesActions.changePreferedLanguageSuccess,
    (state, { preferences }) => ({
      ...state,
      loading: false,
      loaded: true,
      preferences,
    })
  ),
  on(usrPreferencesActions.changePreferedLanguage, (state) => ({
    ...state,
    loading: true,
    loaded: false,
  })),
  on(usrPreferencesActions.updateProjectPreferences, (state) => ({
    ...state,
    loading: true,
    loaded: false,
  })),
  on(
    usrPreferencesActions.updateProjectPreferencesSuccess,
    (state, { preferences }) => ({
      ...state,
      preferences,
      loaded: true,
      loading: false,
    })
  )
);

export function preferencesReducer(state, action) {
  return _preferencesReducer(state, action);
}
