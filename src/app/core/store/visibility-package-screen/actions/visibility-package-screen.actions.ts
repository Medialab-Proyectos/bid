import { createAction, props } from '@ngrx/store';
export const setPackageScreenVisibility = createAction(
  '[Package screen Visiblity] set visibility',
  props<{ isVisible: boolean }>()
);
