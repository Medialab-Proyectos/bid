import { Project } from '@core/models';
import { createAction, props } from '@ngrx/store';

export const setSelectedProject = createAction(
  '[SelectedProject] Get SelectedProject',
  props<{ SelectedProject: Project }>()
);
export const setSelectedProjectSuccess = createAction(
  '[SelectedProject] get SelectedProject success',
  props<{ SelectedProject: Project }>()
);
export const setSelectedProjectError = createAction(
  '[SelectedProject] get SelectedProject Error',
  props<{ payload: unknown }>()
);
