import { createAction, props } from '@ngrx/store';

export const setFocusComments = createAction(
  '[ProcurementProcessHeader] Set FocusComments',
  props<{ FocusComments: boolean }>()
);
