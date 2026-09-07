import { createReducer, on } from '@ngrx/store';
import { showLoader, hideLoader } from './loader.actions';

export interface UIState {
  isLoading: boolean;
}

export const initialState: UIState = {
  isLoading: false,
};

export const uiReducer = createReducer(
  initialState,
  on(showLoader, (state) => ({ ...state, isLoading: true })),
  on(hideLoader, (state) => ({ ...state, isLoading: false }))
);
