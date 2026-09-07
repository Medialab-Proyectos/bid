import { createReducer, on } from '@ngrx/store';
import * as rolesActions from '../actions/roles.actions';
import { AppState } from '@core/store/store.reducers';
import { RolesResponse } from '@core/enums';

export interface RolesState {
  rolesResponse: RolesResponse;
  loaded: boolean;
  loading: boolean;
  error: unknown;
}
export interface AppStateWithRoles extends AppState {
  roles: RolesState;
}
export const rolesInitialState: RolesState = {
  rolesResponse: null,
  loaded: false,
  loading: true,
  error: null,
};

const _roleReducer = createReducer(
  rolesInitialState,
  on(rolesActions.getRoles, (state) => ({ ...state, loading: true })),
  on(rolesActions.getRolesSuccess, (state, { roles }) => ({
    ...state,
    loading: false,
    loaded: true,
    rolesResponse: roles,
  })),
  on(rolesActions.getRolesError, (state, { payload }) => ({
    ...state,
    loading: false,
    loaded: false,
    error: payload,
  }))
);

export function roleReducer(state, action) {
  return _roleReducer(state, action);
}
