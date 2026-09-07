import { UserToken } from '@core/models';
import * as actions from '../actions/user-token.actions';

import { userTokenReducer, UserTokenState } from './user-token.reducer';

const initialState: UserTokenState = {
  userToken: null,
};

describe('UserTokenReducer', () => {
  it('should reduce set usertoken', () => {
    const newUser: UserToken = {
      email: 'email@example.com',
    };
    expect(
      userTokenReducer(
        { ...initialState },
        actions.setUserToken({ userToken: newUser })
      )
    ).toEqual({
      userToken: newUser,
    });
  });
});
