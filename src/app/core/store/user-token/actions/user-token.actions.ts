import { UserToken } from '@core/models';
import { createAction, props } from '@ngrx/store';

export const setUserToken = createAction(
  '[User token] setUserToken',
  props<{ userToken: UserToken }>()
);
