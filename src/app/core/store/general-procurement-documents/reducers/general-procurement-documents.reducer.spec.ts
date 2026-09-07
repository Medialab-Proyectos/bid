import {
  GeneralProcurementDocumentsState,
  generalProcurementDocumentsReducer,
} from './general-procurement-documents.reducer';
import * as actions from '../actions/general-procurement-documents.action';
import { FiduciaryProcessDocument } from '@core/models';

const initialState: GeneralProcurementDocumentsState = {
  generalProcurementDocuments: [],
  loaded: false,
  loading: false,
};

describe('GeneralProcurementDocumentsReducer', () => {
  it('should reduce get procurement documents', () => {
    expect(
      generalProcurementDocumentsReducer(
        { ...initialState },
        actions.getProcurementDocuments({ projectBucketId: '', domain: 4 })
      )
    ).toEqual({
      generalProcurementDocuments: [],
      loading: true,
      loaded: false,
    });
  });

  it('should reduce get procurement documents success ', () => {
    const documents: FiduciaryProcessDocument[] = [
      {
        description: '',
        id: '1',
        relationalId: '',
        ezshareNumber: '',
        name: '',
        operationsDocumentId: 3,
        status: 1,
        type: 1,
        modified: new Date(),
        created: new Date(),
        createdBy: '',
      },
    ];

    const action = actions.getProcurementDocumentsSuccess({
      generalProcurementDocuments: documents,
    });
    expect(
      generalProcurementDocumentsReducer({ ...initialState }, action)
    ).toEqual({
      loading: false,
      loaded: true,
      generalProcurementDocuments: documents,
    });
  });

  describe('delete document', () => {
    it('should delete procurement document set loading on ', () => {
      const action = actions.deleteProcurementDocument({
        documentId: '1',
      });

      const caseState = { ...initialState };

      expect(
        generalProcurementDocumentsReducer({ caseState }, action).loading
      ).toBe(true);
    });

    it('should delete procurement document set loading off on success ', () => {
      const documents: FiduciaryProcessDocument[] = [
        {
          description: '',
          id: '1',
          relationalId: '',
          ezshareNumber: '',
          name: '',
          operationsDocumentId: 3,
          status: 1,
          type: 1,
          modified: new Date(),
          created: new Date(),
          createdBy: '',
        },
      ];

      const caseState = { ...initialState };
      caseState.generalProcurementDocuments = documents;

      const action = actions.deleteProcurementDocumentSuccess({
        documentId: '1',
      });

      const state = generalProcurementDocumentsReducer(
        { ...caseState },
        action
      );
      expect(state.loading).toBe(false);

      expect(state.generalProcurementDocuments).toEqual([]);
    });

    it('should delete procurement document set loading off on error ', () => {
      const caseState = { ...initialState };
      caseState.loading = true;

      const action = actions.deleteProcurementDocumentError();
      expect(
        generalProcurementDocumentsReducer({ ...caseState }, action).loading
      ).toBe(false);
    });
  });

  it('should update document status', () => {
    const documents: FiduciaryProcessDocument[] = [
      {
        description: '',
        id: '1',
        relationalId: '',
        ezshareNumber: '',
        name: '',
        operationsDocumentId: 3,
        status: 1,
        type: 1,
        modified: new Date(),
        created: new Date(),
        createdBy: '',
      },
      {
        description: '',
        id: '2',
        relationalId: '',
        ezshareNumber: '',
        name: '',
        operationsDocumentId: 3,
        status: 1,
        type: 1,
        modified: new Date(),
        created: new Date(),
        createdBy: '',
      },
    ];
    const caseState = { ...initialState };
    caseState.generalProcurementDocuments = documents;

    const action = actions.changeStatus({
      id: '1',
      status: 5,
    });
    const state = generalProcurementDocumentsReducer({ ...caseState }, action);

    const document = state.generalProcurementDocuments[0];
    expect(document.status).toEqual(5);
  });
});
