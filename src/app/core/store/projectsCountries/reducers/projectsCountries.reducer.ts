import { createReducer, on } from '@ngrx/store';
import * as projectCountriesActions from '../actions/projectsCountries.actions';
import { AppState } from '@core/store/store.reducers';
import { CountryEffectResponse } from '@core/models';

export interface ProjectCountriesState {
  countries: CountryEffectResponse[];
  loading: boolean;
  loaded: boolean;
}
export interface AppStateWithProjectsCountries extends AppState {
  countries: ProjectCountriesState;
}
export const projectsCountriesInitialState: ProjectCountriesState = {
  countries: null,
  loading: false,
  loaded: false,
};

const _projectsCountriesReducer = createReducer(
  projectsCountriesInitialState,
  on(projectCountriesActions.getProjectsCountries, (state) => ({
    ...state,
    loading: true,
  })),
  on(
    projectCountriesActions.getProjectsCountriesSuccess,
    (state, { countries }) => ({
      ...state,
      loading: false,
      loaded: true,
      countries: countries,
    })
  ),
  on(
    projectCountriesActions.getProjectsCountriesError,
    (state, { payload }) => ({
      ...state,
      loading: false,
      loaded: true,
      error: payload,
    })
  )
);
export function projectsCountriesReducer(state, action) {
  return _projectsCountriesReducer(state, action);
}
