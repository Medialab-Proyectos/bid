import { Permission } from '@core/models';
import { createAction, props } from '@ngrx/store';

export const getUserPermissionsSuccess = createAction(
  '[Permissions] Get User Permissions success',
  props<{ permissions: Permission[] }>()
);
export const getUserPermissionsError = createAction(
  '[Permissions] Get User Permissions Error',
  props<{ payload: unknown }>()
);
