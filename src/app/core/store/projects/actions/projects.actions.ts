import { PreferencesModel, Project } from '@core/models';
import { createAction, props } from '@ngrx/store';

export const getProjects = createAction(
  '[Projects] Get projects',
  props<{ preferences: PreferencesModel }>()
);

export const getProjectsSuccess = createAction(
  '[Projects] get Projects success',
  props<{ projects: Project[] }>()
);
export const getProjectsError = createAction(
  '[Projects] get Projects Error',
  props<{ payload: unknown }>()
);
export const setLoading = createAction(
  '[Projects] set Loading',
  props<{ loading: boolean }>()
);

export const getNewProjects = createAction(
  '[Projects] Get new projects',
  props<{ initialData: boolean }>()
);

export const getNewProjectsSuccess = createAction(
  '[Projects] Get new projects Success',
  props<{
    projects: Project[];
    totalPages: number;
    lastCursor: string;
    hasFavourites: boolean;
  }>()
);

export const getNewProjectsError = createAction(
  '[Projects] Get new projects Error'
);

export const loadMoreProjects = createAction(
  '[Projects] Load More projects',
  props<{ lastCursor: string }>()
);

export const loadMoreProjectsSuccess = createAction(
  '[Projects] Load More projects Success',
  props<{ projects: Project[]; lastCursor: string }>()
);

export const loadMoreProjectsError = createAction(
  '[Projects] Load More projects Error'
);

export const addOrRemoveFavoriteProjects = createAction(
  '[Projects] Add or remove Favorite Projects',
  props<{ contractNumber: string }>()
);

export const setProjectsOnSearch = createAction(
  '[Projects] Add projects on search',
  props<{ projects: Project[] }>()
);
