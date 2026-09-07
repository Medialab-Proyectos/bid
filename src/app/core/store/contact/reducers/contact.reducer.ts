import { createReducer, on } from '@ngrx/store';
import { Contact } from '@core/models';
import * as contactActions from '../actions/contact.actions';
import { AppState } from '@core/store/store.reducers';

export interface ContactState {
  contact: Contact;
  loaded: boolean;
  loading: boolean;
  error: unknown;
}
export interface AppStateWithContact extends AppState {
  contact: ContactState;
}
export const contactInitialState: ContactState = {
  contact: null,
  loaded: false,
  loading: false,
  error: null,
};

const _contactReducer = createReducer(
  contactInitialState,
  on(contactActions.getContact, (state) => ({ ...state, loading: true })),
  on(
    contactActions.getContactSucces,
    contactActions.setContactSucces,
    (state, { contact }) => ({
      ...state,
      loading: false,
      loaded: true,
      contact,
    })
  ),
  on(contactActions.getContactError, (state, { payload }) => ({
    ...state,
    loading: false,
    loaded: false,
    error: payload,
  })),
  on(contactActions.setContact, (state) => ({ ...state, loading: true })),
  on(contactActions.setContactError, (state, { payload }) => ({
    ...state,
    loading: false,
    loaded: true,
    error: payload,
  })),
  on(contactActions.setContactInternal, (state, { category }) => ({
    ...state,
    contact: {
      ...state.contact,
      is_internal: category,
    },
  }))
);

export function contactReducer(state, action) {
  return _contactReducer(state, action);
}
