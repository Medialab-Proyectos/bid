import {
  procurementProcessHeaderReducer,
  ProcurementProcessHeaderState,
  ProcurementProcessHeaderStateInitialState,
} from './procurementProcessHeader.reducer';
import * as actions from '../actions/procurementProcessHeader.actions';

describe('ProcurementProcessHeaderReducer', () => {
  it('should set initial state', () => {
    expect(ProcurementProcessHeaderStateInitialState).toEqual({
      FocusComments: false,
    });
  });
  describe('setFocusComments', () => {
    it('should update FocusComments in the state', () => {
      const initialState: ProcurementProcessHeaderState = {
        FocusComments: false,
      };
      const action = actions.setFocusComments({ FocusComments: true });

      const result = procurementProcessHeaderReducer(initialState, action);

      expect(result.FocusComments).toBe(true);
    });

    it('should not modify the state for unknown actions', () => {
      const initialState: ProcurementProcessHeaderState = {
        FocusComments: false,
      };
      const action = { type: 'UNKNOWN_ACTION' };

      const result = procurementProcessHeaderReducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });
});
