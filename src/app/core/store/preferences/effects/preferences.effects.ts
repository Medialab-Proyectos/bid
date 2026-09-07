import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, tap } from 'rxjs/operators';
import * as preferencesActions from '@core/store/preferences/actions/preferences.actions';
import { UserPreferencesService } from '@core/services/apis';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '@core/store/store.reducers';
import { PreferencesService } from '@core/services/app';
import { OperationPreference, PreferencesModel } from '@core/models';
import * as projectActions from '@core/store/projects/actions/projects.actions';

@Injectable()
export class PreferencesEffects {
  constructor(
    readonly actions$: Actions,
    readonly preferencesApiSvc: UserPreferencesService,
    readonly store: Store<AppState>,
    private readonly preferencesManageSvc: PreferencesService
  ) {}

  changeProcurementProcessTablePreferences$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(preferencesActions.changePreferedProcurementProcessTable),
      exhaustMap((data) => {
        let updatedPreferences =
          this.preferencesManageSvc.updateProcurementProcessTablePreferences(
            data.preferences,
            data.actualPreferences
          );
        return this.preferencesApiSvc
          .updatePreferences(updatedPreferences)
          .pipe(
            map(() => {
              return preferencesActions.changePreferedLanguageSuccess({
                preferences: updatedPreferences,
              });
            }),
            catchError((err) => {
              return of(
                preferencesActions.changePreferedLanguageError({
                  payload: err,
                })
              );
            })
          );
      })
    );
  });
  actualPreferences: PreferencesModel;

  changePreferedLanguage$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(preferencesActions.changePreferedLanguage),
      exhaustMap((data) => {
        let updatedPreferences =
          this.preferencesManageSvc.updatePreferedLanguagePreferences(
            data.lang,
            data.actualPreferences
          );
        return this.preferencesApiSvc
          .updatePreferences(updatedPreferences)
          .pipe(
            map(() => {
              return preferencesActions.changePreferedLanguageSuccess({
                preferences: updatedPreferences,
              });
            }),
            catchError((err) => {
              return of(
                preferencesActions.changePreferedLanguageError({
                  payload: err,
                })
              );
            })
          );
      })
    );
  });

  updateProjecPreferences$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(preferencesActions.updateProjectPreferences),
      tap((data) => {
        this.actualPreferences = data.actualPreferences;
      }),
      exhaustMap((data) => {
        const preferences = {
          ...data.actualPreferences,
          projects: addOrRemove(
            data.actualPreferences.projects,
            data.operationPreference
          ),
        };
        return this.preferencesApiSvc.updatePreferences(preferences).pipe(
          map(() => {
            this.store.dispatch(
              projectActions.addOrRemoveFavoriteProjects({
                contractNumber: data.operationPreference.contractNumber,
              })
            );
            return preferencesActions.updateProjectPreferencesSuccess({
              preferences,
            });
          }),
          catchError((err) => {
            if (
              err.status === 409 &&
              err.error.detail ===
                'You cannot exceed the maximum limit of 35 favorite projects.'
            ) {
              return of(
                preferencesActions.updateProjectPreferencesSuccess({
                  preferences: this.actualPreferences,
                })
              );
            } else {
              return of(
                preferencesActions.changePreferedLanguageError({
                  payload: err,
                })
              );
            }
          })
        );
      })
    );
  });
}

function addOrRemove(
  projectsList: OperationPreference[],
  opPreferences: OperationPreference
): OperationPreference[] {
  let index = projectsList.findIndex(
    (p) => p.projectBucketId === opPreferences.projectBucketId
  );
  if (index === -1) {
    let projects = [...projectsList];
    let newOp: OperationPreference = {
      projectBucketId: opPreferences.projectBucketId,
      operationNumber: opPreferences.operationNumber,
      contractNumber: opPreferences.contractNumber,
    };
    projects.push(newOp);
    return projects; // Devuelve el array actualizado
  } else {
    return projectsList.filter(
      (p) => p.projectBucketId !== opPreferences.projectBucketId
    );
  }
}
