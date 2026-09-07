import { createReducer, on } from '@ngrx/store';

import * as procurementProcessHeaderActions from '../actions/procurementProcessHeader.actions';
import { AppState } from '@core/store/store.reducers';

export interface ProcurementProcessHeaderState {
  FocusComments: boolean;
}
export interface AppStateWithProcurementProcessHeader extends AppState {
  procurementProcessHeader: ProcurementProcessHeaderState;
}
export const ProcurementProcessHeaderStateInitialState: ProcurementProcessHeaderState =
  {
    FocusComments: false,
  };

const _procurementProcessHeaderReducer = createReducer(
  ProcurementProcessHeaderStateInitialState,
  on(
    procurementProcessHeaderActions.setFocusComments,
    (state, { FocusComments }) => ({
      ...state,
      FocusComments,
    })
  )
);

export function procurementProcessHeaderReducer(state, action) {
  return _procurementProcessHeaderReducer(state, action);
}
