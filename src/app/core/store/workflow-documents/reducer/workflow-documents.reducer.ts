import { AppState } from '@core/store/store.reducers';
import { createReducer, on } from '@ngrx/store';
import * as actions from '../actions/workflow-documents.actions';
import { WorkflowDocument } from '@core/models';

export interface workflowDocumentsByInstanceState {
  workflowDocuments: WorkflowDocument[];
  loaded: boolean;
  loading: boolean;
  error: unknown;
}
export interface WorkflowDocumentsState {
  WorkflowDocumentsByInstanceId: {
    [instanceId: string]: workflowDocumentsByInstanceState;
  };
}
export interface AppStateWithWorkflowDocumentssState extends AppState {
  workflowDocuments: WorkflowDocumentsState;
}

export const workflowDocumentsInitialState: WorkflowDocumentsState = {
  WorkflowDocumentsByInstanceId: {},
};

const _workflowDocumentsReducer = createReducer(
  workflowDocumentsInitialState,
  on(
    actions.addWorkflowDocumentSuccess,
    (state, { instanceId, workflowDocument }) => {
      const docs =
        state.WorkflowDocumentsByInstanceId[instanceId].workflowDocuments;
      return {
        ...state,
        WorkflowDocumentsByInstanceId: {
          ...state.WorkflowDocumentsByInstanceId,
          [instanceId]: {
            ...state.WorkflowDocumentsByInstanceId[instanceId],
            workflowDocuments: [...docs, workflowDocument],
            error: null,
            loading: false,
            loaded: true,
          },
        },
      };
    }
  ),
  on(
    actions.setWorkFlowsDocumentsAndInstance,
    (state, { instanceId, docs }) => {
      return {
        ...state,
        WorkflowDocumentsByInstanceId: {
          [instanceId]: {
            ...state.WorkflowDocumentsByInstanceId[instanceId],
            error: null,
            loading: false,
            loaded: true,
            workflowDocuments: docs,
          },
        },
      };
    }
  ),
  on(
    actions.updateWorkflowDocumentDescription,
    (state, { instanceId, docId, newDescription }) => {
      const docs =
        state.WorkflowDocumentsByInstanceId[instanceId].workflowDocuments;
      return {
        ...state,
        WorkflowDocumentsByInstanceId: {
          ...state.WorkflowDocumentsByInstanceId,
          [instanceId]: {
            ...state.WorkflowDocumentsByInstanceId[instanceId],
            workflowDocuments: updateDescDoc(docs, docId, newDescription),
            error: null,
            loading: false,
            loaded: true,
          },
        },
      };
    }
  ),
  on(
    actions.updateWorkflowDocumentNewDescriptionSuccess,
    (state, { instanceId, docId, newDescription }) => {
      const docs =
        state.WorkflowDocumentsByInstanceId[instanceId].workflowDocuments;
      return {
        ...state,
        WorkflowDocumentsByInstanceId: {
          ...state.WorkflowDocumentsByInstanceId,
          [instanceId]: {
            ...state.WorkflowDocumentsByInstanceId[instanceId],
            workflowDocuments: updateDescription(docs, docId, newDescription),
            error: null,
            loading: false,
            loaded: true,
          },
        },
      };
    }
  ),
  on(
    actions.deleteWorkflowDocument,
    actions.updateWorkflowDocumentNewDescription,
    (state, { instanceId }) => {
      return {
        ...state,
        WorkflowDocumentsByInstanceId: {
          [instanceId]: {
            ...state.WorkflowDocumentsByInstanceId[instanceId],
            error: null,
            loading: true,
            loaded: false,
          },
        },
      };
    }
  ),
  on(
    actions.deleteWorkflowDocumentSuccess,
    (state, { instanceId, workflowDocumentId }) => {
      return {
        ...state,
        WorkflowDocumentsByInstanceId: {
          [instanceId]: {
            ...state.WorkflowDocumentsByInstanceId[instanceId],
            workflowDocuments: state.WorkflowDocumentsByInstanceId[
              instanceId
            ].workflowDocuments.filter((doc) => doc.id !== workflowDocumentId),
            error: null,
            loading: false,
            loaded: true,
          },
        },
      };
    }
  ),
  on(actions.deleteWorkflowDocumentError, (state, { instanceId, payload }) => {
    return {
      ...state,
      WorkflowDocumentsByInstanceId: {
        [instanceId]: {
          ...state.WorkflowDocumentsByInstanceId[instanceId],
          error: payload,
          loading: false,
          loaded: true,
        },
      },
    };
  }),
  on(actions.updateWorkflowDocumentVisilibity, (state, { instanceId }) => {
    return {
      ...state,
      WorkflowDocumentsByInstanceId: {
        [instanceId]: {
          ...state.WorkflowDocumentsByInstanceId[instanceId],
          error: null,
          loading: true,
          loaded: false,
        },
      },
    };
  }),
  on(
    actions.updateWorkflowDocumentVisilibitySuccess,
    (state, { instanceId, workflowDocumentId, newVisibility }) => {
      const docs =
        state.WorkflowDocumentsByInstanceId[instanceId].workflowDocuments;
      return {
        ...state,
        WorkflowDocumentsByInstanceId: {
          [instanceId]: {
            ...state.WorkflowDocumentsByInstanceId[instanceId],
            workflowDocuments: updatVisiblity(
              docs,
              workflowDocumentId,
              newVisibility
            ),
            error: null,
            loading: false,
            loaded: true,
          },
        },
      };
    }
  ),
  on(
    actions.updateWorkflowDocumentVisilibityError,
    (state, { instanceId, payload }) => {
      const docs =
        state.WorkflowDocumentsByInstanceId[instanceId].workflowDocuments;
      return {
        ...state,
        WorkflowDocumentsByInstanceId: {
          [instanceId]: {
            ...state.WorkflowDocumentsByInstanceId[instanceId],
            workflowDocuments: [...docs],
            error: payload,
            loading: false,
            loaded: true,
          },
        },
      };
    }
  )
);

export function updateDescDoc(
  docs: WorkflowDocument[],
  docId: string,
  newDescription: string
): WorkflowDocument[] {
  return docs.map((d) => {
    if (d.id === docId) {
      return { ...d, newDescription: newDescription };
    } else {
      return d;
    }
  });
}

export function updateDescription(
  docs: WorkflowDocument[],
  docId: string,
  newDescription: string
): WorkflowDocument[] {
  return docs.map((d) => {
    if (d.id === docId) {
      return {
        ...d,
        description: newDescription,
        newDescription: newDescription,
      };
    } else {
      return d;
    }
  });
}

export function updatVisiblity(
  docs: WorkflowDocument[],
  docId: string,
  newVisibility: number
): WorkflowDocument[] {
  return docs.map((doc) => {
    if (doc.id === docId) {
      return {
        ...doc,
        visibility: newVisibility,
      };
    } else {
      return doc;
    }
  });
}

export function workflowDocumentsReducer(state, action) {
  return _workflowDocumentsReducer(state, action);
}
