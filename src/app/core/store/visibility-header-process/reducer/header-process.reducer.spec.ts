import {
  headerProcessReducer,
  headerProcessInitialState,
} from './header-process.reducer';
import * as actions from '../actions/header-process.actions';

describe('headerProcessReducer', () => {
  it('should update the state when setHeaderProcessVisibility action is dispatched', () => {
    const initialState = headerProcessInitialState;
    const visibility = true;
    const action = actions.setHeaderProcessVisibility({ visibility });

    const result = headerProcessReducer(initialState, action);

    expect(result.headerProcess).toBe(visibility);
  });

  it('should update the state when setHeaderProcessSetLoading action is dispatched', () => {
    const initialState = headerProcessInitialState;
    const loading = true;
    const action = actions.setHeaderProcessSetLoading({ loading });

    const result = headerProcessReducer(initialState, action);

    expect(result.isLoading).toBe(loading);
  });
});
