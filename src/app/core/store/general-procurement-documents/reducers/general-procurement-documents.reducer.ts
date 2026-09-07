import { FiduciaryProcessDocument } from '@core/models';
import { AppState } from '@core/store';
import { createReducer, on } from '@ngrx/store';
import * as actions from '../actions/general-procurement-documents.action';

export interface GeneralProcurementDocumentsState {
  generalProcurementDocuments: FiduciaryProcessDocument[];
  loading: boolean;
  loaded: boolean;
}

export interface AppStateWithGeneralProcurementDocuments extends AppState {
  generalProcurementDocuments: GeneralProcurementDocumentsState;
}

const generalProcurementDocumentsInitialState: GeneralProcurementDocumentsState =
  {
    generalProcurementDocuments: [],
    loaded: false,
    loading: false,
  };

const _generalProcurementDocumentsReducer = createReducer(
  generalProcurementDocumentsInitialState,
  on(actions.getProcurementDocuments, (state) => {
    return {
      ...state,
      loading: true,
      loaded: false,
      generalProcurementDocuments: [] as FiduciaryProcessDocument[],
    };
  }),
  on(
    actions.getProcurementDocumentsSuccess,
    (state, { generalProcurementDocuments }) => {
      return {
        ...state,
        generalProcurementDocuments,
        loading: false,
        loaded: true,
      };
    }
  ),
  on(actions.deleteProcurementDocument, (state) => {
    return {
      ...state,
      loading: true,
    };
  }),
  on(actions.deleteProcurementDocumentSuccess, (state, { documentId }) => {
    const generalProcurementDocuments = [
      ...state.generalProcurementDocuments,
    ].filter((doc) => doc.id !== documentId);
    return {
      ...state,
      generalProcurementDocuments,
      loading: false,
    };
  }),
  on(actions.deleteProcurementDocumentError, (state) => ({
    ...state,
    loading: false,
  })),
  on(actions.changeStatus, (state, { id, status }) => {
    const documents = [...state.generalProcurementDocuments].map((document) => {
      const newDoc = { ...document } as FiduciaryProcessDocument;
      if (newDoc.id === id) {
        newDoc.status = status;
      }
      return newDoc;
    });

    return {
      ...state,
      generalProcurementDocuments: documents,
    };
  })
);

export function generalProcurementDocumentsReducer(state, action) {
  return _generalProcurementDocumentsReducer(state, action);
}
