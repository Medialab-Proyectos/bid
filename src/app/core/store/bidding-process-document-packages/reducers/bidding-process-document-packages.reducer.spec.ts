import {
  biddingProcessDocumentPackageReducer,
  BiddingProcessDocumentPackagesState,
} from './bidding-process-document-packages.reducer';
import * as actions from '../actions/bidding-process-document-packages.actions';

describe('Bidding document package reducer', () => {
  it('initial State', () => {
    expect(biddingProcessDocumentPackageReducer(undefined, {})).toEqual(
      initialState
    );
  });

  describe('document packages', () => {
    it('should get document packages', () => {
      const action = actions.getDocumentPackages({
        processId: '123456789',
        isOptional: false,
      });
      const state = biddingProcessDocumentPackageReducer(initialState, action);
      const processState =
        state.biddingProcessDocumentPackagesByProcess['123456789'];
      expect(processState).toEqual({
        biddingProcessDocumentPackages: [],
        error: null,
        loaded: false,
        loading: true,
      });
    });

    it('should get document packages success', () => {
      const action = actions.getDocumentPackagesSuccess({
        processId: '1',
        biddingProcessDocumentPackages: [
          {
            id: '123456',
            status: 0,
            code: 0,
            totalMandatoryDocuments: 0,
            totalUploadedDocuments: 0,
            totalComments: 0,
            order: 0,
            requireNonObjection: false,
            actualDate: new Date('2022-03-22T16:24:33.301Z'),
            biddingProcessDocumentGroups: [],
            documentsToUpload: [],
            groupsState: { loading: true },
            documentsState: { loading: true },
            bidValidityExtensionDate: new Date(),
          },
          {
            id: '1234567',
            status: 0,
            code: 0,
            totalMandatoryDocuments: 0,
            totalUploadedDocuments: 0,
            totalComments: 0,
            order: 0,
            requireNonObjection: false,
            actualDate: new Date('2022-03-22T16:24:33.301Z'),
            biddingProcessDocumentGroups: [],
            documentsToUpload: [],
            groupsState: { loading: true },
            documentsState: { loading: true },
            bidValidityExtensionDate: new Date(),
          },
        ],
        lastBidValidityExtensionDate: null,
      });

      const state = biddingProcessDocumentPackageReducer(initialState, action);
      const process = state.biddingProcessDocumentPackagesByProcess['1'];
      const biddingProcessDocumentPackages =
        process.biddingProcessDocumentPackages;
      expect(biddingProcessDocumentPackages.length).toEqual(2);
      expect(process.loading).toBe(false);
      expect(process.loaded).toBe(true);
    });
  });

  describe('document groups', () => {
    it('should get document groups success', () => {
      const caseState = { ...initialState };
      const bidValidityDate = new Date();
      caseState.biddingProcessDocumentPackagesByProcess['1'] = {
        biddingProcessDocumentPackages: [
          {
            id: '123456',
            status: 0,
            code: 0,
            totalMandatoryDocuments: 0,
            totalUploadedDocuments: 0,
            totalComments: 0,
            order: 0,
            requireNonObjection: false,
            actualDate: new Date('2022-03-22T16:13:52.049Z'),
            biddingProcessDocumentGroups: [],
            documentsToUpload: [],
            groupsState: { loading: true },
            documentsState: { loading: false },
            bidValidityExtensionDate: bidValidityDate,
          },
          {
            id: '1234567',
            status: 0,
            code: 0,
            totalMandatoryDocuments: 0,
            totalUploadedDocuments: 0,
            totalComments: 0,
            order: 0,
            requireNonObjection: false,
            actualDate: new Date('2022-03-22T16:13:52.049Z'),
            biddingProcessDocumentGroups: [],
            documentsToUpload: [],
            groupsState: { loading: true },
            documentsState: { loading: true },
            bidValidityExtensionDate: bidValidityDate,
          },
        ],
        lastBidValidityExtensionDate: null,
        error: null,
        loaded: false,
        loading: false,
      };

      const action = actions.getDocumentGroupsSuccess({
        biddingProcessDocumentPackageId: '123456',
        biddingProcessDocumentGroups: [
          {
            id: '123456',
            documentGroupCode: 0,
            documentGroupConfiguration: null,
          },
        ],
        processId: '1',
      });

      const state = biddingProcessDocumentPackageReducer(caseState, action);
      const documentPackage =
        state.biddingProcessDocumentPackagesByProcess['1']
          .biddingProcessDocumentPackages[0];

      expect(documentPackage).toEqual({
        id: '123456',
        status: 0,
        code: 0,
        totalMandatoryDocuments: 0,
        totalUploadedDocuments: 0,
        totalComments: 0,
        order: 0,
        requireNonObjection: false,
        actualDate: new Date('2022-03-22T16:13:52.049Z'),
        biddingProcessDocumentGroups: [
          {
            id: '123456',
            documentGroupCode: 0,
            documentGroupConfiguration: null,
            documentsState: { loading: false },
          },
        ],
        documentsToUpload: [],
        groupsState: { loading: false },
        documentsState: { loading: false },
        bidValidityExtensionDate: bidValidityDate,
        uploadedDocAfterCompletionExist: false,
      });
    });
  });

  describe('fiduciary documents', () => {
    it('should get fiduciary documents success', () => {
      const caseState = { ...initialState };
      caseState.biddingProcessDocumentPackagesByProcess['1'] = {
        biddingProcessDocumentPackages: [
          {
            id: '123456',
            status: 0,
            code: 0,
            totalMandatoryDocuments: 0,
            totalUploadedDocuments: 0,
            totalComments: 0,
            order: 0,
            requireNonObjection: false,
            actualDate: new Date('2022-03-22T16:24:33.301Z'),
            biddingProcessDocumentGroups: [],
            documentsToUpload: [],
            groupsState: { loading: true },
            documentsState: { loading: false },
            bidValidityExtensionDate: new Date('2023-10-17T17:12:30.477Z'),
          },
          {
            id: '1234567',
            status: 0,
            code: 0,
            totalMandatoryDocuments: 0,
            totalUploadedDocuments: 0,
            totalComments: 0,
            order: 0,
            requireNonObjection: false,
            actualDate: new Date('2022-03-22T16:24:33.301Z'),
            biddingProcessDocumentGroups: [],
            documentsToUpload: [],
            groupsState: { loading: true },
            documentsState: { loading: true },
            bidValidityExtensionDate: new Date('2023-10-17T17:12:30.477Z'),
          },
        ],
        lastBidValidityExtensionDate: null,
        error: null,
        loaded: true,
        loading: false,
      };

      const action = actions.getFiduciaryProcessDocumentsSuccess({
        biddingProcessDocumentGroupId: '123',
        fiduciaryProcessDocuments: [],
        processId: '1',
      });

      const state = biddingProcessDocumentPackageReducer(caseState, action);
      const processPackage =
        state.biddingProcessDocumentPackagesByProcess['1']
          .biddingProcessDocumentPackages[0];

      expect(processPackage).toEqual({
        id: '123456',
        status: 0,
        code: 0,
        totalMandatoryDocuments: 0,
        totalUploadedDocuments: 0,
        totalComments: 0,
        order: 0,
        requireNonObjection: false,
        actualDate: new Date('2022-03-22T16:24:33.301Z'),
        biddingProcessDocumentGroups: [],
        documentsToUpload: [],
        groupsState: { loading: true },
        documentsState: { loading: false },
        bidValidityExtensionDate: new Date('2023-10-17T17:12:30.477Z'),
      });
    });

    it('should get fiduciary documents success when has another groups loading', () => {
      const caseState = { ...initialState };
      caseState.biddingProcessDocumentPackagesByProcess['1'] = {
        biddingProcessDocumentPackages: [
          {
            id: '123456',
            status: 0,
            code: 1,
            totalMandatoryDocuments: 0,
            totalUploadedDocuments: 0,
            totalComments: 0,
            order: 0,
            requireNonObjection: false,
            actualDate: new Date('2022-03-22T16:24:33.301Z'),
            bidValidityExtensionDate: new Date(),
            biddingProcessDocumentGroups: [
              {
                id: '12345',
                documentGroupCode: 5,
                documentGroupConfiguration: null,
                fiduciaryProcessDocuments: [],
                documentsState: { loading: true },
              },
              {
                id: '12346',
                documentGroupCode: 1,
                documentGroupConfiguration: null,
                fiduciaryProcessDocuments: [],
                documentsState: { loading: true },
              },
            ],
            documentsToUpload: [],
            groupsState: { loading: true },
            documentsState: { loading: true },
          },
        ],
        lastBidValidityExtensionDate: null,
        error: null,
        loading: false,
        loaded: true,
      };

      const action = actions.getFiduciaryProcessDocumentsSuccess({
        biddingProcessDocumentGroupId: '12345',
        fiduciaryProcessDocuments: [
          {
            description: '',
            id: 'id',
            relationalId: '',
            status: 1,
            type: 1,
            operationsDocumentId: 1,
            ezshareNumber: 'ezshareNumber',
            name: 'name',
            created: new Date('2022-03-22T16:24:33.301Z'),
            createdBy: 'createdBy',
            modified: new Date('2022-03-22T16:24:33.301Z'),
          },
        ],
        processId: '1',
      });

      const state = biddingProcessDocumentPackageReducer(caseState, action);

      const documentPackage =
        state.biddingProcessDocumentPackagesByProcess['1']
          .biddingProcessDocumentPackages[0];
      const group = documentPackage.biddingProcessDocumentGroups[0];
      expect(group.documentsState.loading).toEqual(false);
      expect(documentPackage.documentsState.loading).toEqual(true);
      expect(group.fiduciaryProcessDocuments[0].groupCode).toEqual(5);
    });
  });

  it('should change package changePackageActualDate', () => {
    const caseState = { ...initialState };
    caseState.biddingProcessDocumentPackagesByProcess['1'] = {
      biddingProcessDocumentPackages: [
        {
          id: '123456',
          status: 0,
          code: 0,
          totalMandatoryDocuments: 0,
          totalUploadedDocuments: 0,
          totalComments: 0,
          order: 0,
          requireNonObjection: false,
          actualDate: new Date('2021-11-30T03:00:00'),
          biddingProcessDocumentGroups: [],
          documentsToUpload: [],
          bidValidityExtensionDate: new Date(),
        },
        {
          id: '1234567',
          status: 0,
          code: 0,
          totalMandatoryDocuments: 0,
          totalUploadedDocuments: 0,
          totalComments: 0,
          order: 0,
          requireNonObjection: false,
          actualDate: new Date('2021-11-30T03:00:00'),
          biddingProcessDocumentGroups: [],
          documentsToUpload: [],
          bidValidityExtensionDate: new Date(),
        },
      ],
      lastBidValidityExtensionDate: null,
      error: null,
      loaded: true,
      loading: false,
    };
    const action = actions.changePackageActualDate({
      packageId: '123456',
      actualDate: new Date('2022-12-30T03:00:00'),
      processId: '1',
      lang: 'EN',
      prevDate: new Date('2022-12-29T03:00:00'),
    });

    const state = biddingProcessDocumentPackageReducer(caseState, action);

    const packageDocument =
      state.biddingProcessDocumentPackagesByProcess['1']
        .biddingProcessDocumentPackages[0];
    expect(packageDocument.actualDate).toEqual(new Date('2022-12-30T03:00:00'));
  });

  describe('getFiduciaryProcessDocuments', () => {});
});

const initialState: BiddingProcessDocumentPackagesState = {
  biddingProcessDocumentPackagesByProcess: {},
};
