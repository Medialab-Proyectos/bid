import { createReducer, on } from '@ngrx/store';

import * as commentsFilterActions from '../actions/commentsFilter.actions';
import { AppState } from '@core/store/store.reducers';

export interface FilterCommentData {
  user: string;
  updatedBy: string;
  visibility: string;
  dateRange: {
    initialDate: string;
    endDate: string;
  };
  updateDateRange: {
    initialDate: string;
    endDate: string;
  };
  activeVersion: boolean;
  dropdownSelection: string;
}
export interface CommentsFilterState {
  form: FilterCommentData;
  loaded: boolean;
  loading: boolean;
}

export interface AppStateWithCommentsFilter extends AppState {
  commentsFilterForm: CommentsFilterState;
}
export const CommentsFilterFormInitialState: CommentsFilterState = {
  form: {
    user: '',
    updatedBy: '',
    visibility: '',
    dateRange: {
      initialDate: '',
      endDate: '',
    },
    updateDateRange: {
      initialDate: '',
      endDate: '',
    },
    activeVersion: true,
    dropdownSelection: '',
  },
  loaded: false,
  loading: false,
};

const _commentsFilterReducer = createReducer(
  CommentsFilterFormInitialState,
  on(commentsFilterActions.updateForm, (state, { form }) => ({
    ...state,
    form: form,
    loading: false,
    loaded: true,
  })),
  on(commentsFilterActions.setVersionToggle, (state, { versions }) => ({
    ...state,
    form: setVersions(state.form, versions),
    loading: false,
    loaded: true,
  }))
);

function setVersions(
  form: FilterCommentData,
  versions: boolean
): FilterCommentData {
  const newForm: FilterCommentData = {
    user: form.user,
    updatedBy: form.updatedBy,
    visibility: form.visibility,
    dateRange: {
      initialDate: form.dateRange.initialDate,
      endDate: form.dateRange.endDate,
    },
    updateDateRange: {
      initialDate: form.updateDateRange.initialDate,
      endDate: form.updateDateRange.endDate,
    },
    activeVersion: versions,
    dropdownSelection: form.dropdownSelection,
  };
  return newForm;
}

export function commentsFilterReducer(state, action) {
  return _commentsFilterReducer(state, action);
}
