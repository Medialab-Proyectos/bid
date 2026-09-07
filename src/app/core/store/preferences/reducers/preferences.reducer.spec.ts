import {
  preferencesReducer,
  usrPreferencesInitialState,
} from './preferences.reducer';
import * as actions from '../actions/preferences.actions';
import { CodeNameEnum, PreferencesModel } from '@core/models';

describe('preferencesReducer', () => {
  it('should update the state when setSelectedLanguage action is dispatched', () => {
    const initialState = usrPreferencesInitialState;
    const selectedLanguage: CodeNameEnum = {
      code: 'en',
      name: 'english',
    };
    const action = actions.setSelectedLanguage({ selectedLanguage });

    const result = preferencesReducer(initialState, action);

    expect(result.loading).toBe(false);
    expect(result.loaded).toBe(true);
  });

  it('should update the state when getPreferencesSuccess action is dispatched', () => {
    const initialState = usrPreferencesInitialState;
    const preferences: PreferencesModel = {
      defaultLanguage: 'es',
      preferredLanguage: 'es',
      projects: [
        {
          operationNumber: 'operationNumber1X',
          contractNumber: '',
          projectBucket: '',
        },
      ],
      procurementPreferences: null,
    };
    const action = actions.getPreferencesSuccess({ preferences });

    const result = preferencesReducer(initialState, action);

    expect(result.loading).toBe(false);
    expect(result.loaded).toBe(true);
    expect(result.preferences).toEqual(preferences);
  });

  it('should update the state when addRemovefavoriteProjectSuccess action is dispatched', () => {
    const initialState = usrPreferencesInitialState;
    const preferences: PreferencesModel = {
      defaultLanguage: 'es',
      preferredLanguage: 'es',
      projects: [
        {
          operationNumber: 'operationNumber1X',
          contractNumber: '',
          projectBucket: '',
        },
      ],
      procurementPreferences: null,
    };
    const action = actions.updateProjectPreferencesSuccess({ preferences });

    const result = preferencesReducer(initialState, action);

    expect(result.loading).toBe(false);
    expect(result.loaded).toBe(true);
    expect(result.preferences).toEqual(preferences);
  });
});
