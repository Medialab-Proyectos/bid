import {
  workflowReducer,
  workflowInitialState,
  WorkflowState,
} from './workflow.reducers';
import * as actions from '../actions/workflow.actions';
import { WorkflowConfig, WorkflowInstitution } from '../../../models';

describe('workflowReducer', () => {
  it('should update the state when getWorkflow action is dispatched', () => {
    const initialState = workflowInitialState;
    const projectBucketId = '1';
    const action = actions.getWorkflow({ projectBucketId });

    const result = workflowReducer(initialState, action);

    expect(result.workflowStepsLoading).toBe(true);
  });

  it('should update the state when getWorkflowSuccess action is dispatched', () => {
    const initialState = workflowInitialState;
    const projectWorkflow = { ...mockWfConfigWithUser };

    const action = actions.getWorkflowSuccess({
      projectWorkflow,
    });

    const result = workflowReducer(initialState, action);

    expect(result.workflowStepsLoaded).toBe(true);
    expect(result.workflowStepsLoading).toBe(false);
    expect(result.workflowSteps).toEqual(projectWorkflow.workFlowConfig);
    expect(result.usersInstitutionUpdated).toBe(
      projectWorkflow.usersInstitutionUpdated
    );
    expect(result.usersRolUpdated).toBe(projectWorkflow.usersRolUpdated);
  });

  it('should update the state when getWorkflowError action is dispatched', () => {
    const initialState = workflowInitialState;
    const payload = 'Error fetching workflow';
    const action = actions.getWorkflowError({ payload });

    const result = workflowReducer(initialState, action);

    expect(result.workflowStepsLoaded).toBe(true);
    expect(result.workflowStepsLoading).toBe(false);
    expect(result.workflowStepsError).toBe(payload);
  });

  it('should reset workflow to initial state', () => {
    const initialState = workflowInitialState;

    const action = actions.resetWorkflow();

    const result = workflowReducer(workflowStateMock, action);

    expect(result).toEqual(initialState);
  });

  it('should update the state when getWorkflowInstitution action is dispatched', () => {
    const initialState = workflowInitialState;
    const projectBucketId = '1';

    const action = actions.getWorkflowInstitution({ projectBucketId });

    const result = workflowReducer(initialState, action);

    expect(result.workflowInstitutionsLoading).toBe(true);
  });

  it('should update the state when getWorkflowInstitutionSuccess action is dispatched', () => {
    const initialState = workflowInitialState;
    const workflowInstitution: WorkflowInstitution = {
      institutions: [
        {
          institutionCode: 'institutionCode',
          loanNumber: 'loanNumber',
          operationNumber: 'operationNumber',
          instRoleDesc: 'instRoleDesc',
        },
      ],
    };
    const action = actions.getWorkflowInstitutionSuccess({
      workflowInstitution,
    });

    const result = workflowReducer(initialState, action);

    expect(result.workflowInstitutionsLoaded).toBe(true);
    expect(result.workflowInstitutionsLoading).toBe(false);
    expect(result.workflowInstitutions).toEqual(
      workflowInstitution.institutions
    );
  });

  it('should update the state when getWorkflowInstitutionError action is dispatched', () => {
    const initialState = workflowInitialState;
    const payload = 'Error fetching workflow institutions';
    const action = actions.getWorkflowInstitutionError({ payload });

    const result = workflowReducer(initialState, action);

    expect(result.workflowInstitutionsLoaded).toBe(true);
    expect(result.workflowInstitutionsLoading).toBe(false);
    expect(result.workflowInstitutionsError).toBe(payload);
  });
});

const mockWfConfigWithUser: WorkflowConfig = {
  workFlowConfig: [
    {
      id: 'string',
      step: 0,
      institutionCode: 'string',
      order: 0,
      assignedUsers: [
        {
          userName: 'string',
          email: 'string',
          fullName: 'string',
          roleIdCode: 'string',
        },
      ],
      taskDescription: 'string',
      lastUpdate: new Date(),
      isMandatory: false,
    },
  ],
  usersInstitutionUpdated: ['1', '2'],
  usersRolUpdated: ['USER 1', 'USER 2'],
};
export const workflowStateMock: WorkflowState = {
  workflowSteps: [],
  workflowStepsLoaded: true,
  workflowStepsLoading: false,
  workflowStepsError: null,
  workflowInstitutions: [],
  workflowInstitutionsLoaded: true,
  workflowInstitutionsLoading: false,
  workflowInstitutionsError: null,
  usersInstitutionUpdated: ['1111', '2222'],
  usersRolUpdated: ['USER 33', 'USER 222'],
};
