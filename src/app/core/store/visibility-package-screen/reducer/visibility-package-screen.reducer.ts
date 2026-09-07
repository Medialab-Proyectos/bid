import { AppState } from '@core/store/store.reducers';
import { createReducer, on } from '@ngrx/store';
import * as visibilityActions from '../actions/visibility-package-screen.actions';

export interface PackageScreenVisibilityState {
  packageScreen: boolean;
}
export interface AppStateWithPackageVisibility extends AppState {
  packageScreen: PackageScreenVisibilityState;
}
export const packageScreen: PackageScreenVisibilityState = {
  packageScreen: null,
};
const _packageScreenVisibilityReducer = createReducer(
  packageScreen,
  on(visibilityActions.setPackageScreenVisibility, (state, { isVisible }) => ({
    ...state,
    packageScreen: isVisible,
  }))
);
export function packageScreenVisibilityReducer(state, action) {
  return _packageScreenVisibilityReducer(state, action);
}
