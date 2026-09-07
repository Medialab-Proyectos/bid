import { AppState } from '@core/store/store.reducers';
import { createReducer, on } from '@ngrx/store';
import * as visibilityActions from '../actions/visibility-project-sidebar.actions';
export interface ProjectSiderbarVisibilityState {
  isVisible: boolean;
}
export interface AppStateWithProjectSiderbar extends AppState {
  projectSidebar: ProjectSiderbarVisibilityState;
}
export const projectSidebar: AppStateWithProjectSiderbar = {
  projectSidebar: null,
};
const _projectSidebarVisibilityReducer = createReducer(
  projectSidebar,
  on(visibilityActions.setProjectSidebarVisibility, (state, { isVisible }) => ({
    ...state,
    isVisible,
  }))
);
export function projectSidebarVisibilityReducer(state, action) {
  return _projectSidebarVisibilityReducer(state, action);
}
