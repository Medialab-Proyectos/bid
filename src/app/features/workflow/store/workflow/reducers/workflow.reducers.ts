import { AppState } from '@core/store/store.reducers';
import { createReducer, on } from '@ngrx/store';
import * as workflowActions from '../actions/workflow.actions';
import {
  WorkflowStep,
  Institution,
} from '@fiduciary-interface/app/features/workflow/models';

export interface WorkflowState {
  workflowSteps: WorkflowStep[];
  workflowStepsLoaded: boolean;
  workflowStepsLoading: boolean;
  workflowStepsError: unknown;
  workflowInstitutions: Institution[];
  workflowInstitutionsLoaded: boolean;
  workflowInstitutionsLoading: boolean;
  workflowInstitutionsError: unknown;
  usersRolUpdated: string[];
  usersInstitutionUpdated: string[];
}

export interface AppStateWithWorkflow extends AppState {
  projectWorkflow: WorkflowState;
}

export const workflowInitialState: WorkflowState = {
  workflowSteps: [],
  workflowStepsLoaded: false,
  workflowStepsLoading: true,
  workflowStepsError: null,
  workflowInstitutions: [],
  workflowInstitutionsLoaded: false,
  workflowInstitutionsLoading: true,
  workflowInstitutionsError: null,
  usersInstitutionUpdated: [],
  usersRolUpdated: [],
};

const _workflow = createReducer(
  workflowInitialState,
  on(workflowActions.getWorkflow, (state) => ({
    ...state,
    workflowStepsLoading: true,
  })),
  on(workflowActions.getWorkflowSuccess, (state, { projectWorkflow }) => ({
    ...state,
    workflowStepsLoaded: true,
    workflowStepsLoading: false,
    workflowSteps: projectWorkflow.workFlowConfig,
    usersInstitutionUpdated: projectWorkflow.usersInstitutionUpdated,
    usersRolUpdated: projectWorkflow.usersRolUpdated,
  })),
  on(workflowActions.getWorkflowError, (state, { payload }) => ({
    ...state,
    workflowStepsLoaded: true,
    workflowStepsLoading: false,
    workflowStepsError: payload,
  })),
  on(workflowActions.resetWorkflow, () => ({
    workflowSteps: [],
    workflowStepsLoaded: false,
    workflowStepsLoading: true,
    workflowStepsError: null,
    workflowInstitutions: [],
    workflowInstitutionsLoaded: false,
    workflowInstitutionsLoading: true,
    workflowInstitutionsError: null,
    usersInstitutionUpdated: [],
    usersRolUpdated: [],
  })),

  on(workflowActions.getWorkflowInstitution, (state) => ({
    ...state,
    workflowInstitutionsLoading: true,
  })),
  on(
    workflowActions.getWorkflowInstitutionSuccess,
    (state, { workflowInstitution }) => ({
      ...state,
      workflowInstitutionsLoaded: true,
      workflowInstitutionsLoading: false,
      workflowInstitutions: workflowInstitution.institutions,
    })
  ),
  on(workflowActions.getWorkflowInstitutionError, (state, { payload }) => ({
    ...state,
    workflowInstitutionsLoaded: true,
    workflowInstitutionsLoading: false,
    workflowInstitutionsError: payload,
  }))
);

export function workflowReducer(state, action) {
  return _workflow(state, action);
}
