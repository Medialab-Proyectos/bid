import { createAction, props } from '@ngrx/store';

export const getProjectsCountries = createAction(
  '[Projects Countries] Get projects Contries'
);
export const getProjectsCountriesSuccess = createAction(
  '[Projects Countries] Get projects Contries Success',
  props<{ countries: any[] }>()
);
export const getProjectsCountriesError = createAction(
  '[Projects Countries] Get projects Contries Error',
  props<{ payload: unknown }>()
);
