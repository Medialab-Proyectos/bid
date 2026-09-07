import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as projectsActions from '../actions/projects.actions';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ProjectsApiService } from '@core/services/apis';
import { ContractOperation, Project } from '@core/models';
import { UserPreferencesService } from '@core/services/apis';
import { AppState } from '@core/store';
import { Store } from '@ngrx/store';
import {
  EMPTY_GUID,
  REGISTER_PER_PAGES,
} from '@fiduciary-interface/app/features/projects/projects.env';

@Injectable()
export class ProjectsEffects {
  constructor(
    readonly actions$: Actions,
    readonly projectsSvc: ProjectsApiService,
    readonly preferencesSvc: UserPreferencesService,
    readonly store: Store<AppState>
  ) {}

  REGISTER_PER_PAGES = REGISTER_PER_PAGES;
  EMPTY_GUID = EMPTY_GUID;

  getNewProjects$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(projectsActions.getNewProjects),
      mergeMap((data) => {
        return this.projectsSvc.getProjects(data.initialData).pipe(
          map((response) => {
            return projectsActions.getNewProjectsSuccess({
              projects: response.projects,
              lastCursor: response.lastCursor,
              totalPages: response.totalPages,
              hasFavourites: response.favorites,
            });
          }),
          catchError((err) => {
            return of(projectsActions.getProjectsError({ payload: err }));
          })
        );
      })
    );
  });

  loadMoreProjects$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(projectsActions.loadMoreProjects),
      mergeMap((data) => {
        return this.projectsSvc
          .getProjectsV2(data.lastCursor, this.REGISTER_PER_PAGES)
          .pipe(
            map((response) => {
              return projectsActions.loadMoreProjectsSuccess({
                projects: this.mapData(response.data),
                lastCursor: response.cursor,
              });
            }),
            catchError((err) => {
              return of(projectsActions.getProjectsError({ payload: err }));
            })
          );
      })
    );
  });

  getFilteredProjects(projects, preferencesprojects) {
    const result = projects.map((project) => {
      const isFavorite = preferencesprojects.some((preference) => {
        return (
          preference.contract === project.contract &&
          preference.operationNumber === project.operationNumber
        );
      });
      return { ...project, favorite: isFavorite };
    });

    return result;
  }

  mapData(data: ContractOperation[]): Project[] {
    let aux = data;
    return aux.map((d) => {
      return {
        name: d.projectName.en,
        projectName: {
          en: d.projectName.en,
          es: d.projectName.es,
          pt: d.projectName.pt,
          fr: d.projectName.fr,
        },
        nameEn: d.projectName.en,
        nameEs: d.projectName.es,
        nameFr: d.projectName.fr,
        namePt: d.projectName.pt,
        operationNumber: d.project,
        executor: d.executor,
        executorAcronym: d.executorAcronym,
        contract: d.operation,
        approvedAmount: d.originalApprovedAmount,
        countryCode: d.countryCode,
        projectBucketId: d.id,
        id: d.id,
        currentApprovedAmount: d.currentApprovedAmount,
        favorite: false,
      };
    });
  }
}
