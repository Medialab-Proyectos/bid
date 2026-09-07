import { RolesResponse } from '@core/enums';
import { RoleRequest } from '@core/models';
import { createAction, props } from '@ngrx/store';

export const getRoles = createAction(
  '[Roles] Get roles',
  props<{ body: RoleRequest }>()
);

export const getRolesSuccess = createAction(
  '[Roles] get Roles success',
  props<{ roles: RolesResponse }>()
);
export const getRolesError = createAction(
  '[Roles] get Roles Error',
  props<{ payload: unknown }>()
);
