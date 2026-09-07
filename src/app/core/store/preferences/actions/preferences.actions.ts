/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { createAction, props } from '@ngrx/store';
import {
  CodeNameEnum,
  OperationPreference,
  PreferencesModel,
  ProcurementPreferences,
} from '@core/models';

export const setSelectedLanguage = createAction(
  '[Preferences] Set selected language',
  props<{ selectedLanguage: CodeNameEnum }>()
);

export const getPreferences = createAction('[Preferences] Get preferences');

export const getPreferencesSuccess = createAction(
  '[Preferences] Get preferences Success',
  props<{ preferences: PreferencesModel }>()
);

export const getPreferencesError = createAction(
  '[Preferences] Get preferences Error',
  props<{ payload: any }>()
);

export const changePreferedLanguage = createAction(
  '[Preferences] Change prefered Language',
  props<{ lang: string; actualPreferences: PreferencesModel }>()
);

export const changePreferedLanguageSuccess = createAction(
  '[Preferences] Change prefered Language sucesss',
  props<{ preferences: PreferencesModel }>()
);

export const changePreferedLanguageError = createAction(
  '[Preferences] Change prefered Language error',
  props<{ payload: any }>()
);

export const updateProjectPreferences = createAction(
  '[Preferences] Update projects preferences',
  props<{
    actualPreferences: PreferencesModel;
    operationPreference: OperationPreference;
  }>()
);

export const updateProjectPreferencesSuccess = createAction(
  '[Preferences] Update projects preferences success',
  props<{ preferences: PreferencesModel }>()
);

export const updateProjectPreferencesError = createAction(
  '[Preferences] Update projects preferences error',
  props<{ payload: unknown }>()
);

export const changePreferedProcurementProcessTable = createAction(
  '[Preferences] Change prefered Procurement Process Table',
  props<{
    preferences: ProcurementPreferences;
    actualPreferences: PreferencesModel;
  }>()
);

export const changePreferedProcurementProcessTableSuccess = createAction(
  '[Preferences] Change prefered Procurement Process Table sucesss',
  props<{ preferences: PreferencesModel }>()
);

export const changePreferedProcurementProcessTableError = createAction(
  '[Preferences] Change prefered Procurement Process Table error',
  props<{ payload: any }>()
);
