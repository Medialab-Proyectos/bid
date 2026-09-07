import { createReducer, on } from '@ngrx/store';
import { Permission } from '@core/models';
import * as permissionActions from '../actions/permissions.actions';
import { AppState } from '@core/store/store.reducers';

export interface PermissionState {
  permissions: Permission[];
  loaded: boolean;
  loading: boolean;
  error: unknown;
}
export interface AppStateWithPermissions extends AppState {
  permission: PermissionState;
}
export const permissionInitialState: PermissionState = {
  permissions: [],
  loaded: false,
  loading: true,
  error: null,
};

const _permissionReducer = createReducer(
  permissionInitialState,
  on(permissionActions.getUserPermissionsSuccess, (state, { permissions }) => ({
    ...state,
    loading: false,
    loaded: true,
    permissions: [...permissions],
  })),
  on(permissionActions.getUserPermissionsError, (state, { payload }) => ({
    ...state,
    loading: false,
    loaded: true,
    error: payload,
  }))
);

export function permissionReducer(state, action) {
  return _permissionReducer(state, action);
}
