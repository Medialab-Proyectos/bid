import { AppState } from '@core/store/store.reducers';
import { MenuItem } from '@core/models';
import { createReducer, on } from '@ngrx/store';
import * as sidebarActions from '../actions/sidebar.actions';
export interface SidebarState {
  sidebar: MenuItem[];
  loaded: boolean;
  loading: boolean;
  error: unknown;
}

export interface AppStateWithSidebar extends AppState {
  sidebar: SidebarState;
}

export const sidebarInitialState: SidebarState = {
  sidebar: [],
  loaded: false,
  loading: false,
  error: null,
};

const _sidebarReducer = createReducer(
  sidebarInitialState,
  on(sidebarActions.getSidebar, (state) => ({ ...state, loading: true })),
  on(sidebarActions.getSidebarSucces, (state, { sidebar }) => ({
    ...state,
    loading: false,
    loaded: true,
    sidebar: [...sidebar],
  })),
  on(sidebarActions.getSidebarError, (state, { payload }) => ({
    ...state,
    loading: false,
    loaded: true,
    error: payload,
  }))
);
export function sidebarReducer(state, action) {
  return _sidebarReducer(state, action);
}
