import { WorkflowDocument } from '@core/models';
import { createAction, props } from '@ngrx/store';

export const setWorkFlowsDocumentsAndInstance = createAction(
  '[Workflow set Instance and Docs] set workflow instance and docs',
  props<{ instanceId: string; docs: WorkflowDocument[] }>()
);

export const addWorkflowDocumentSuccess = createAction(
  '[Workflow Documents] get workflow documents success',
  props<{
    instanceId: string;
    workflowDocument: WorkflowDocument;
  }>()
);

export const updateWorkflowDocumentDescription = createAction(
  '[Workflow Documents] update workflow document description',
  props<{
    instanceId: string;
    docId: string;
    newDescription: string;
  }>()
);

export const updateWorkflowDocumentNewDescription = createAction(
  '[Workflow Documents] update workflow document new description',
  props<{
    instanceId: string;
    docId: string;
    newDescription: string;
  }>()
);

export const updateWorkflowDocumentNewDescriptionSuccess = createAction(
  '[Workflow Documents] update workflow document new description success',
  props<{
    instanceId: string;
    docId: string;
    newDescription: string;
  }>()
);

export const updateWorkflowDocumentNewDescriptionError = createAction(
  '[Workflow Documents] update workflow document new description error',
  props<{
    instanceId: string;
    payload: any;
  }>()
);

export const deleteWorkflowDocument = createAction(
  '[Workflow Documents] delete workflow document',
  props<{
    instanceId: string;
    workflowDocumentId: string;
  }>()
);
export const deleteWorkflowDocumentError = createAction(
  '[Workflow Documents] delete workflow document Error',
  props<{
    instanceId: string;
    payload: unknown;
  }>()
);

export const deleteWorkflowDocumentSuccess = createAction(
  '[Workflow Documents] delete workflow document success',
  props<{
    instanceId: string;
    workflowDocumentId: string;
  }>()
);

export const updateWorkflowDocumentVisilibity = createAction(
  '[Workflow Documents] update workflow document visibility',
  props<{
    instanceId: string;
    workflowDocumentId: string;
    newVisibility: number;
  }>()
);

export const updateWorkflowDocumentVisilibitySuccess = createAction(
  '[Workflow Documents] update workflow document visibility success',
  props<{
    instanceId: string;
    workflowDocumentId: string;
    newVisibility: number;
  }>()
);

export const updateWorkflowDocumentVisilibityError = createAction(
  '[Workflow Documents] update workflow document visibility error',
  props<{
    instanceId: string;
    payload: unknown;
  }>()
);
