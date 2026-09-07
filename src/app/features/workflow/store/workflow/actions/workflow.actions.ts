import { createAction, props } from "@ngrx/store";
import { WorkflowConfig, WorkflowInstitution } from "@fiduciary-interface/app/features/workflow/models";


export const getWorkflow = createAction(
  '[ProjectWorkflow] get Project Workflow',
  props<{ projectBucketId: string }>()
);

export const getWorkflowSuccess = createAction(
  '[ProjectWorkflow] get Project Workflow Success',
  props<{ projectWorkflow: WorkflowConfig }>()
);

export const getWorkflowError = createAction(
  '[ProjectWorkflow] get Project Workflow Error',
  props<{ payload: unknown }>()
);

export const resetWorkflow = createAction(
  '[ProjectWorkflow] reset Project Workflow'
);

export const getWorkflowInstitution = createAction(
  '[ProjectWorkflow] get Project Workflow Institution',
  props<{ projectBucketId: string }>()
);

export const getWorkflowInstitutionSuccess = createAction(
  '[ProjectWorkflow] get Project Workflow Institution Success',
  props<{ workflowInstitution: WorkflowInstitution }>()
);

export const getWorkflowInstitutionError = createAction(
  '[ProjectWorkflow] get Project Workflow Institution Error',
  props<{ payload: unknown }>()
);
