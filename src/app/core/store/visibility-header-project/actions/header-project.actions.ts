import { createAction, props } from '@ngrx/store';

export const setHeaderProjectVisibility = createAction(
  '[Header Project Visiblity] get visibility',
  props<{ visibility: boolean }>()
);
