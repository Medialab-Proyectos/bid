import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { PreferencesEffects } from './preferences.effects';
import * as preferencesActions from '../actions/preferences.actions';
import { TranslateService } from '@ngx-translate/core';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import { UserPreferencesService } from '@core/services/apis';
import { PreferencesService } from '@core/services/app';
import { PreferencesModel } from '@core/models';
import { provideMockStore } from '@ngrx/store/testing';

const PreferencesServiceMock = {
  updateFavoriteProjecPreferences: jest.fn(),
  updatePreferedLanguagePreferences: jest.fn(),
};
const UserPreferencesServiceMock = {
  getPreferences: jest.fn(),
  updatePreferences: jest.fn(),
};
const TranslateServiceMock = {
  instant: jest.fn(),
};
const NotificationGlobalServiceMock = {
  showError: jest.fn(),
  showSuccess: jest.fn(),
};

describe('AddRemoveFavoriteProjectEffects', () => {
  let actions$: Observable<any>;
  let effects: PreferencesEffects;
  let preferencesApiSvc: UserPreferencesService;
  let preferencesManageSvc: PreferencesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PreferencesEffects,
        provideMockStore({}),

        provideMockActions(() => actions$),
        {
          provide: PreferencesService,
          useValue: PreferencesServiceMock,
        },
        {
          provide: UserPreferencesService,
          useValue: UserPreferencesServiceMock,
        },
        {
          provide: TranslateService,
          useValue: TranslateServiceMock,
        },
        {
          provide: NotificationGlobalService,
          useValue: NotificationGlobalServiceMock,
        },
      ],
    });

    effects = TestBed.inject(PreferencesEffects);
    preferencesApiSvc = TestBed.inject(UserPreferencesService);
    preferencesManageSvc = TestBed.inject(PreferencesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('changePreferedLanguage$', () => {
    const lang = 'en';
    const actualPreferences: PreferencesModel = {
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
    const updatedPreferences: PreferencesModel = {
      defaultLanguage: 'en',
      preferredLanguage: 'en',
      projects: [
        {
          operationNumber: 'operationNumber1',
          contractNumber: '',
          projectBucket: '',
        },
      ],
      procurementPreferences: null,
    };

    it('should dispatch changePreferedLanguageSuccess action on successful update', () => {
      jest
        .spyOn(preferencesManageSvc, 'updatePreferedLanguagePreferences')
        .mockReturnValue(updatedPreferences);
      jest
        .spyOn(preferencesApiSvc, 'updatePreferences')
        .mockReturnValue(of(null));

      const expectedAction = preferencesActions.changePreferedLanguageSuccess({
        preferences: updatedPreferences,
      });

      actions$ = of(
        preferencesActions.changePreferedLanguage({ lang, actualPreferences })
      );

      return effects.changePreferedLanguage$
        .toPromise()
        .then((resultAction) => {
          expect(
            preferencesManageSvc.updatePreferedLanguagePreferences
          ).toHaveBeenCalledWith(lang, actualPreferences);
          expect(preferencesApiSvc.updatePreferences).toHaveBeenCalledWith(
            updatedPreferences
          );
          expect(resultAction).toEqual(expectedAction);
        });
    });

    it('should dispatch changePreferedLanguageError action on update failure', () => {
      const error = new Error('Update error');

      jest
        .spyOn(preferencesManageSvc, 'updatePreferedLanguagePreferences')
        .mockReturnValue(updatedPreferences);
      jest
        .spyOn(preferencesApiSvc, 'updatePreferences')
        .mockReturnValue(throwError(error));

      const expectedAction = preferencesActions.changePreferedLanguageError({
        payload: error,
      });

      actions$ = of(
        preferencesActions.changePreferedLanguage({ lang, actualPreferences })
      );

      return effects.changePreferedLanguage$
        .toPromise()
        .then((resultAction) => {
          expect(
            preferencesManageSvc.updatePreferedLanguagePreferences
          ).toHaveBeenCalledWith(lang, actualPreferences);
          expect(preferencesApiSvc.updatePreferences).toHaveBeenCalledWith(
            updatedPreferences
          );
          expect(resultAction).toEqual(expectedAction);
        });
    });
  });
});
