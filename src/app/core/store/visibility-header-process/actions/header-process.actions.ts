import { createAction, props } from '@ngrx/store';

export const setHeaderProcessVisibility = createAction(
  '[Header Process Visiblity] get visibility',
  props<{ visibility: boolean }>()
);

export const setHeaderProcessSetLoading = createAction(
  '[Header Process Set Loading] get visibility',
  props<{ loading: boolean }>()
);
