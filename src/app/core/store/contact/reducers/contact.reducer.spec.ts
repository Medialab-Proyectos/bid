import { contactReducer, ContactState } from './contact.reducer';
import * as actions from '../actions/contact.actions';
import { Contact } from '@core/models';

describe('contactReducer', () => {
  it('should update the state when getContact action is dispatched', () => {
    const action = actions.getContact();

    const result = contactReducer(contactStateMock, action);

    expect(result.loading).toBe(true);
  });
  it('should update the state when getContactSuccess action is dispatched', () => {
    const contact: Contact = {
      username: 'username',
      email: 'email@gmail.com',
      name: 'name',
      given_name: 'given_name',
      family_name: 'family_name',
      is_internal: true,
      contactId: 'contactId',
    };
    const action = actions.getContactSucces({ contact });

    const result = contactReducer(contactStateMock, action);

    expect(result.loading).toBe(false);
    expect(result.loaded).toBe(true);
    expect(result.contact).toEqual(contact);
  });

  it('should update the state when getContactError action is dispatched', () => {
    const error = 'Error message';
    const action = actions.getContactError({ payload: error });

    const result = contactReducer(contactStateMock, action);

    expect(result.loading).toBe(false);
    expect(result.loaded).toBe(false);
    expect(result.error).toBe(error);
  });

  it('should update the state when setContact action is dispatched', () => {
    const action = actions.setContact();

    const result = contactReducer(contactStateMock, action);
    const resultExpected = JSON.parse(JSON.stringify(contactStateMock));

    expect(result).toEqual({
      ...resultExpected,
      loading: true,
    });
  });

  it('should update the state when setContactError action is dispatched', () => {
    const error = 'Error message';
    const action = actions.setContactError({ payload: error });

    const result = contactReducer(contactStateMock, action);
    const resultExpected = JSON.parse(JSON.stringify(contactStateMock));
    expect(result).toEqual({
      ...resultExpected,
      loading: false,
      loaded: true,
      error: error,
    });
  });
});

const contactStateMock: ContactState = {
  contact: {
    username: 'username1',
    email: 'email@gmail.com1',
    name: 'name1',
    given_name: 'given_name1',
    family_name: 'family_name1',
    is_internal: false,
    contactId: 'contactId1',
  },
  loaded: true,
  loading: false,
  error: null,
};
