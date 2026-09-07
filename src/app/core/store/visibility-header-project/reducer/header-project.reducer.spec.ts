import {
  headerProjectReducer,
  headerProjectInitialState,
} from './header-project.reducer';
import * as actions from '../actions/header-project.actions';

describe('headerProjectReducer', () => {
  it('should update the state when setHeaderProjectVisibility action is dispatched', () => {
    const initialState = headerProjectInitialState;
    const visibility = true;
    const action = actions.setHeaderProjectVisibility({ visibility });

    const result = headerProjectReducer(initialState, action);

    expect(result.headerProject).toBe(visibility);
  });
});
