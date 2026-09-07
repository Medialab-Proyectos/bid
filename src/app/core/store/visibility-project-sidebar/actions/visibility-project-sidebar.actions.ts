import { createAction, props } from '@ngrx/store';
export const setProjectSidebarVisibility = createAction(
  '[Project Sidebar Visiblity] set visibility',
  props<{ isVisible: boolean }>()
);
