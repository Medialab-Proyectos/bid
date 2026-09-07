import { createAction, props } from '@ngrx/store';
import { TempDoc } from '../model/tempDoc.model';

export const addDoc = createAction(
  '[TempDocs] Set tempDocs',
  props<{ doc: TempDoc[] }>()
);

export const addDocSuccess = createAction(
  '[TempDocs] Set tempDocs Success',
  props<{ doc: TempDoc[] }>()
);

export const addDocError = createAction(
  '[TempDocs] Set tempDocs error',
  props<{ payload: any }>()
);
