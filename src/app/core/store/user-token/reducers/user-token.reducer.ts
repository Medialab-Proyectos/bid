import { UserToken } from '@core/models';
import { AppState } from '@core/store/store.reducers';
import { createReducer, on } from '@ngrx/store';
import * as userToken from '../actions/user-token.actions';

export interface UserTokenState {
  userToken: UserToken;
}
export interface AppStateWithUserToken extends AppState {
  userToken: UserTokenState;
}
export const userTokenInitialState: UserTokenState = {
  userToken: null,
};

const _userTokenReducer = createReducer(
  userTokenInitialState,
  on(userToken.setUserToken, (state, { userToken }) => ({
    ...state,
    userToken,
  }))
);

export function userTokenReducer(state, action) {
  return _userTokenReducer(state, action);
}
