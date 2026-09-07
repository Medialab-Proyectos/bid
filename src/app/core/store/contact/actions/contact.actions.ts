import { createAction, props } from '@ngrx/store';
import { Contact } from '@core/models';

export const getContact = createAction('[Contact Component] get Contact');

export const getContactSucces = createAction(
  '[Contact Component] get Contact success',
  props<{ contact: Contact }>()
);
export const getContactError = createAction(
  '[Contact Component] get Contact Error',
  props<{ payload: unknown }>()
);

export const setContact = createAction('[Contact Component] set Contact');

export const setContactSucces = createAction(
  '[Contact Component] set Contact success',
  props<{ contact: Contact }>()
);
export const setContactError = createAction(
  '[Contact Component] set Contact Error',
  props<{ payload: unknown }>()
);
export const setContactInternal = createAction(
  '[Contact Component] set Contact Category',
  props<{ category: boolean }>()
);
