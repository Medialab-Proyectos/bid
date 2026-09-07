import { createReducer, on } from '@ngrx/store';
import * as projectActions from '../actions/projects.actions';
import { AppState } from '@core/store/store.reducers';
import { Project } from '@core/models';

export interface ProjectState {
  projects: Project[];
  loaded: boolean;
  loading: boolean;
  error: unknown;
  newProjects: Project[];
  favouriteProjects: Project[];
  actualPage: number;
  isFetchingData: boolean;
  totalPages: number;
  lastCursor: string;
  fetchInitialData: boolean;
  hasFavourites: boolean;
}
export interface AppStateWithProjects extends AppState {
  projects: ProjectState;
}
export const projectInitialState: ProjectState = {
  projects: [],
  loaded: false,
  loading: false,
  error: null,
  newProjects: [],
  favouriteProjects: [],
  actualPage: 1,
  isFetchingData: false,
  totalPages: -1,
  lastCursor: '',
  fetchInitialData: true,
  hasFavourites: false,
};

const _projectReducer = createReducer(
  projectInitialState,
  on(projectActions.getProjects, (state) => ({ ...state, loading: true })),
  on(projectActions.getProjectsSuccess, (state, { projects }) => ({
    ...state,
    loading: false,
    loaded: true,
    projects: [...projects],
  })),
  on(projectActions.getProjectsError, (state, { payload }) => ({
    ...state,
    loading: false,
    loaded: true,
    error: payload,
  })),
  on(
    projectActions.addOrRemoveFavoriteProjects,
    (state, { contractNumber }) => ({
      ...state,
      loading: false,
      loaded: true,
      favouriteProjects: addRemoveFavoriteProject(
        state.newProjects,
        state.favouriteProjects,
        contractNumber
      ),
    })
  ),
  on(projectActions.setLoading, (state, { loading }) => ({
    ...state,
    loading: loading,
    loaded: !loading,
  })),

  on(projectActions.getNewProjects, (state) => ({
    ...state,
    isFetchingData: true,
  })),
  on(
    projectActions.getNewProjectsSuccess,
    (state, { lastCursor, projects, totalPages, hasFavourites }) => ({
      ...state,
      isFetchingData: false,
      lastCursor,
      totalPages,
      actualPage: 1,
      fetchInitialData: false,
      hasFavourites,
      newProjects: hasFavourites ? [] : [...state.newProjects, ...projects],
      favouriteProjects: hasFavourites
        ? [...state.newProjects, ...projects]
        : [...state.favouriteProjects],
    })
  ),
  on(projectActions.setProjectsOnSearch, (state, { projects }) => ({
    ...state,
    newProjects: projects,
  })),
  on(projectActions.loadMoreProjects, (state) => ({
    ...state,
    isFetchingData: true,
  })),
  on(
    projectActions.loadMoreProjectsSuccess,
    (state, { lastCursor, projects }) => ({
      ...state,
      isFetchingData: false,
      lastCursor,
      actualPage: state.actualPage + 1,
      newProjects: [...state.newProjects, ...projects],
    })
  )
);

function addRemoveFavoriteProject(
  projects: Project[],
  favoriteProjects: Project[],
  contractNumber: string
): Project[] {
  const project = projects.find((p) => p.contract === contractNumber);
  if (!project) {
    return favoriteProjects;
  }
  const updatedProject = { ...project, favorite: !project.favorite };
  const isFavorite = favoriteProjects.some(
    (fp) => fp.contract === contractNumber
  );
  return isFavorite
    ? favoriteProjects.filter((fp) => fp.contract !== contractNumber)
    : [...favoriteProjects, updatedProject];
}

export function projectReducer(state, action) {
  return _projectReducer(state, action);
}
