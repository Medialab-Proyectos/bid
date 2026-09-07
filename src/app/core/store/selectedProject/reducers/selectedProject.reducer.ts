import { createReducer, on } from '@ngrx/store';

import * as selectedProjectActions from '../actions/selectedProject.actions';
import { AppState } from '@core/store/store.reducers';
import { Project } from '@core/models';

export interface SelectedProjectState {
  selectedProject: Project;
  loaded: boolean;
  loading: boolean;
  error: unknown;
}
export interface AppStateWithSelectedProject extends AppState {
  selectedProject: SelectedProjectState;
}
export const SelectedProjectInitialState: SelectedProjectState = {
  selectedProject: null,
  loaded: false,
  loading: false,
  error: null,
};

const _selectedProjectReducer = createReducer(
  SelectedProjectInitialState,
  on(selectedProjectActions.setSelectedProject, (state) => ({
    ...state,
    loading: true,
  })),
  on(
    selectedProjectActions.setSelectedProjectSuccess,
    (state, { SelectedProject }) => ({
      ...state,
      loading: false,
      loaded: true,
      selectedProject: SelectedProject,
    })
  ),
  on(selectedProjectActions.setSelectedProjectError, (state, { payload }) => ({
    ...state,
    loading: false,
    loaded: true,
    error: payload,
  }))
);

export function selectedProjectReducer(state, action) {
  return _selectedProjectReducer(state, action);
}
