import { createAction, props } from '@ngrx/store';
import { FilterCommentData } from '../reducer/commentsFilter.reducer';

export const updateForm = createAction(
  '[Comments Filter] Update Form',
  props<{ form: FilterCommentData }>()
);

export const setVersionToggle = createAction(
  '[Comments Filter] set Version Toggle',
  props<{ versions: boolean }>()
);
