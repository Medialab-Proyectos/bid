import { createReducer, on } from '@ngrx/store';

import * as activitiesSelectedProjectActions from '../actions/activitiesSelectedProject.actions';
import { AppState } from '@core/store/store.reducers';

export interface ActivitiesSelectedProjectState {
  activitiesSelectedProjectBucketId?: string;
  loaded: boolean;
  loading: boolean;
  error: unknown;
}

export interface AppStateWithActivitiesSelectedProject extends AppState {
  activitiesSelectedProjectBucketId: ActivitiesSelectedProjectState;
}
export const ActivitiesSelectedProjectInitialState: ActivitiesSelectedProjectState =
  {
    activitiesSelectedProjectBucketId: null,
    loaded: false,
    loading: false,
    error: null,
  };

const _selectedProjectReducer = createReducer(
  ActivitiesSelectedProjectInitialState,
  on(
    activitiesSelectedProjectActions.setActivitiesSelectedProjectBucketId,
    (state, { ActivitiesSelectedProjectBucketId }) => ({
      ...state,
      activitiesSelectedProjectBucketId: ActivitiesSelectedProjectBucketId,
      loading: false,
      loaded: true,
    })
  ),
  on(
    activitiesSelectedProjectActions.unSetActivitiesSelectedProjectBucketId,
    (state) => ({
      ...state,
      activitiesSelectedProjectBucketId: null,
      loading: false,
      loaded: true,
    })
  )
);

export function activitiesSelectedProjectReducer(state, action) {
  return _selectedProjectReducer(state, action);
}
