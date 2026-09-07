import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { FilesListComponent } from './files-list.component';
import { TranslateEnumPipe } from '../../../../pipes/translate-enum.pipe';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { provideMockStore } from '@ngrx/store/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { render } from '@testing-library/angular';
import {
  BiddingProcessDocumentGroup,
  BiddingProcessDocumentPackage,
  BiddingProcessProcurementProcess,
  FiduciaryProcessDocument,
  ParticipantAwarded,
} from '@core/models';
import { enumsInitialState } from '@core/store';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NotificationService } from '@progress/kendo-angular-notification';
import { RouterTestingModule } from '@angular/router/testing';
import { DirectivesModule } from '@fiduciary-interface/app/shared/directives/directives.module';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { BiddingProcessPlanState } from '@core/store';
import { BiddingProcessProcurementProcessStatuses } from '@core/enums';
describe('FilesListComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('removeSelectedGroup', () => {
    it('should set dropdownValue null', async () => {
      const { component, fixture } = await setup();

      component.fileList = mockFiles;
      component.removeSelectedGroup(mockFiles[0]);
      fixture.detectChanges();

      expect(component.dropdownValue[0]).toBe(null);
    });
  });

  describe('donwloadErrorMessage', () => {
    it('should show error message', async () => {
      const { component, fixture } = await setup();

      const notificationSpy = jest
        .spyOn(component.notificationGlobalSvc, 'showError')
        .mockReturnValue();

      component.donwloadErrorMessage();
      fixture.detectChanges();

      expect(notificationSpy).toHaveBeenCalled();
    });
  });

  describe('onChangeDocumentType', () => {
    it('should emit event with isResult true', async () => {
      const { component, fixture } = await setup();

      component.docPackage = mockDocumentnPackage[0];

      const emitSpy = jest.spyOn(component.editFile, 'emit');
      component.onChangeDocumentType(0, mockFiles[0], 0);
      fixture.detectChanges();

      expect(emitSpy).toHaveBeenCalled();
    });
  });

  describe('donwloadDocument', () => {
    it('should download file when doc has an id', async () => {
      const { component } = await setup();
      // Arrange
      component.language = 'en';
      const doc: FiduciaryProcessDocument = {
        description: '',
        id: '123',
        name: 'file.pdf',
        biddingDocumentId: '12',
        created: new Date(),
        createdBy: '',
        ezshareNumber: '',
        modified: new Date(),
        operationsDocumentId: 1,
        relationalId: '',
        status: 1,
        type: 1,
      };

      const arrayBuffer = new ArrayBuffer(8);
      /* const blob = new Blob([arrayBuffer]); */

      jest
        .spyOn(component.fileSaverService, 'save')
        .mockImplementation(() => {});

      jest
        .spyOn(component.biddingDocumentService, 'downloadDocument')
        .mockReturnValueOnce(of(arrayBuffer));

      // Act
      component.donwloadDocument(doc);
      const spyDownloadFile = jest.spyOn(
        component.biddingDocumentService,
        'downloadDocument'
      );

      // Assert
      expect(spyDownloadFile).toHaveBeenCalledWith('123', 'en');
    });

    it('should thwrow an error when service fails', async () => {
      const { component } = await setup();
      // Arrange
      component.language = 'en';
      const doc: FiduciaryProcessDocument = {
        description: '',
        id: '123',
        name: 'file.pdf',
        biddingDocumentId: '12',
        created: new Date(),
        createdBy: '',
        ezshareNumber: '',
        modified: new Date(),
        operationsDocumentId: 1,
        relationalId: '',
        status: 1,
        type: 1,
      };

      jest
        .spyOn(component.fileSaverService, 'save')
        .mockImplementation(() => {});

      jest
        .spyOn(component.biddingDocumentService, 'downloadDocument')
        .mockReturnValueOnce(throwError({}));

      // Act
      const spyErrorDownloadFile = jest.spyOn(
        component,
        'donwloadErrorMessage'
      );
      component.donwloadDocument(doc);

      // Assert
      expect(spyErrorDownloadFile).toHaveBeenCalled();
    });
    it('should call fileServices when doc does not has an biddingDocumentId ', async () => {
      const { component } = await setup();
      // Arrange
      component.language = 'en';
      const doc: FiduciaryProcessDocument = {
        description: '',
        id: '123',
        name: 'file.pdf',
        biddingDocumentId: '',
        created: new Date(),
        createdBy: '',
        ezshareNumber: '',
        modified: new Date(),
        operationsDocumentId: 1,
        relationalId: '',
        status: 1,
        type: 1,
      };

      const arrayBuffer = new ArrayBuffer(8);

      jest
        .spyOn(component.fileServices, 'downloadFile')
        .mockReturnValueOnce(of(arrayBuffer));

      // Act
      const spyDownloadFile = jest.spyOn(
        component.fileServices,
        'downloadFile'
      );
      component.donwloadDocument(doc);

      // Assert
      expect(spyDownloadFile).toHaveBeenCalledWith('123');
    });

    it('should thwrow an error when service fails', async () => {
      const { component } = await setup();
      // Arrange
      component.language = 'en';
      const doc: FiduciaryProcessDocument = {
        description: '',
        id: '123',
        name: 'file.pdf',
        biddingDocumentId: '',
        created: new Date(),
        createdBy: '',
        ezshareNumber: '',
        modified: new Date(),
        operationsDocumentId: 1,
        relationalId: '',
        status: 1,
        type: 1,
      };

      jest
        .spyOn(component.fileServices, 'downloadFile')
        .mockReturnValueOnce(throwError({}));

      // Act
      const spyErrorDownloadFile = jest.spyOn(
        component,
        'donwloadErrorMessage'
      );
      component.donwloadDocument(doc);

      // Assert
      expect(spyErrorDownloadFile).toHaveBeenCalled();
    });
  });

  describe('dispatchChangeResult', () => {
    const mockGroup: BiddingProcessDocumentGroup = {
      id: 'group-id',
      documentGroupCode: 1,
      documentGroupConfiguration: null,
      fiduciaryProcessDocuments: [],
    };
    const mockItem: FiduciaryProcessDocument = {
      description: '',
      id: 'item-id',
      name: 'Document Name',
      created: new Date(),
      createdBy: '',
      ezshareNumber: '',
      modified: new Date(),
      operationsDocumentId: 1,
      relationalId: '',
      status: 1,
      type: 1,
    };
    const mockEvent = { result: 'success' };

    it('should call documentPackageStore with correct parameters', async () => {
      const { component } = await setup();
      component._docPackage = {
        actualDate: new Date(),
        code: 1,
        documentsToUpload: [],
        id: '',
        order: 1,
        requireNonObjection: true,
        status: 1,
        totalComments: 1,
        totalMandatoryDocuments: 1,
        totalUploadedDocuments: 1,
        bidValidityExtensionDate: new Date(),
      };

      const spy = jest.spyOn(
        component.documentPackageStore,
        'changeResultConfigActionSuccess'
      );
      component.dispatchChangeResult(mockGroup, mockItem, mockEvent);

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('awardedsChange', () => {
    const mockParticipants: ParticipantAwarded[] = [
      {
        biddingProcessBidderId: '',
        biddingProcessParticipantId: '',
        name: '',
        nationality: '',
      },
      {
        biddingProcessBidderId: '',
        biddingProcessParticipantId: '',
        name: '',
        nationality: '',
      },
    ];
    const mockDocument: FiduciaryProcessDocument = {
      description: '',
      groupCode: 1,
      created: new Date(),
      createdBy: '',
      ezshareNumber: '',
      id: '',
      modified: new Date(),
      name: '',
      operationsDocumentId: 1,
      relationalId: '',
      status: 1,
      type: 1,
      result: 1,
    };
    const mockDocPackage = {
      actualDate: new Date(),
      code: 1,
      documentsToUpload: [],
      id: '',
      order: 1,
      requireNonObjection: false,
      status: 1,
      totalComments: 1,
      totalMandatoryDocuments: 1,
      totalUploadedDocuments: 1,
      bidValidityExtensionDate: new Date(),
      biddingProcessDocumentGroups: [
        {
          documentGroupCode: 1,
          documentGroupConfiguration: null,
          id: '',
        },
      ],
    };
    const mockProcess: BiddingProcessProcurementProcess = {
      advanceMilestone: null,
      bafo: true,
      biddingProcessPlanId: '',
      category: null,
      code: '',
      componentName: '',
      description: '',
      goodsReference: 2,
      id: '',
      isMigrated: true,
      justification: '',
      lots: 1,
      manualId: '',
      name: '',
      packagesUnderReview: true,
      procurementMethod: null,
      projectAmount: null,
      sepaPeclaId: '',
      status: null,
      subExecutor: '',
      supervisionMethod: null,
      sustainability: 1,
      sustainabilityDescription: '',
      totalComments: 0,
      isUpdated: true,
      totalAcumulatedAmount: 0,
      procurementProcessComments: [],
      order: 4,
    };
    it('should call updateResultAndAwardeds method on change awardeed', async () => {
      const { component } = await setup();
      const spy = jest.spyOn(
        component.docPackageSvc,
        'updateResultAndAwardeds'
      );
      component._docPackage = mockDocPackage;
      component.awardedsChange(mockParticipants, mockDocument);
      expect(spy).toHaveBeenCalled();
    });
    it('should dispatch the action to set awardeeds', async () => {
      const { component } = await setup();
      jest
        .spyOn(component.docPackageSvc, 'updateResultAndAwardeds')
        .mockReturnValue(of({}));
      const spy = jest.spyOn(component.storePackages, 'dispatch');
      component.procurementProcess = mockProcess;
      component._docPackage = mockDocPackage;
      component.awardedsChange(mockParticipants, mockDocument);
      expect(spy).toHaveBeenCalled();
    });
    it('should check error message', async () => {
      const { component } = await setup();
      jest
        .spyOn(component.docPackageSvc, 'updateResultAndAwardeds')
        .mockReturnValue(
          throwError({
            error: {
              detail: 'at least one awarded participant',
            },
          })
        );
      const spy = jest.spyOn(component.storePackages, 'dispatch');
      component.procurementProcess = mockProcess;
      component._docPackage = mockDocPackage;
      component.awardedsChange(mockParticipants, mockDocument);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('checkPermissionTodownload', () => {
    it('should can download files for EXPECTED status if has permission', async () => {
      const { component } = await setup();
      storeBiddingProcessPlanState.selectedBiddingProcessProcurementProcess.status =
        BiddingProcessProcurementProcessStatuses.EXPECTED;
      jest
        .spyOn(component.biddingStoreSvc, 'biddingProcessPlan')
        .mockReturnValue(of(storeBiddingProcessPlanState));
      const permissionService = jest
        .spyOn(component.permissionSvc, 'haveSomePermissions')
        .mockReturnValue(true);
      component.checkPermissionTodownload();
      expect(component.hasPermissionDownloadGuest).toBe(true);
      expect(permissionService).toHaveBeenCalledWith(
        component.documentDownloadDocumentGuestPermission
      );
    });
    it('should CANT download files for EXPECTED status if NOT has permission', async () => {
      const { component } = await setup();
      storeBiddingProcessPlanState.selectedBiddingProcessProcurementProcess.status =
        BiddingProcessProcurementProcessStatuses.EXPECTED;
      jest
        .spyOn(component.biddingStoreSvc, 'biddingProcessPlan')
        .mockReturnValue(of(storeBiddingProcessPlanState));
      const permissionService = jest
        .spyOn(component.permissionSvc, 'haveSomePermissions')
        .mockReturnValue(false);
      component.checkPermissionTodownload();
      expect(component.hasPermissionDownloadGuest).not.toBe(true);
      expect(permissionService).toHaveBeenCalledWith(
        component.documentDownloadDocumentGuestPermission
      );
    });

    it('should can download files for CONTRACT UNDER EXEC status if has permission', async () => {
      const { component } = await setup();
      storeBiddingProcessPlanState.selectedBiddingProcessProcurementProcess.status =
        BiddingProcessProcurementProcessStatuses.CONTRACT_UNDER_EXECUTION;
      jest
        .spyOn(component.biddingStoreSvc, 'biddingProcessPlan')
        .mockReturnValue(of(storeBiddingProcessPlanState));
      const permissionService = jest
        .spyOn(component.permissionSvc, 'haveSomePermissions')
        .mockReturnValue(true);
      component.checkPermissionTodownload();
      expect(component.hasPermissionDownload).toBe(true);
      expect(permissionService).toHaveBeenCalledWith(
        component.documentDownloadDocumentPermission
      );
    });
    it('should can download files for CONTRACT UNDER EXEC status if has permission', async () => {
      const { component } = await setup();
      storeBiddingProcessPlanState.selectedBiddingProcessProcurementProcess.status =
        BiddingProcessProcurementProcessStatuses.CONTRACT_UNDER_EXECUTION;
      jest
        .spyOn(component.biddingStoreSvc, 'biddingProcessPlan')
        .mockReturnValue(of(storeBiddingProcessPlanState));
      const permissionService = jest
        .spyOn(component.permissionSvc, 'haveSomePermissions')
        .mockReturnValue(false);
      component.checkPermissionTodownload();
      expect(component.hasPermissionDownload).not.toBe(true);
      expect(permissionService).toHaveBeenCalledWith(
        component.documentDownloadDocumentPermission
      );
    });
  });
});
const storeBiddingProcessPlanState: BiddingProcessPlanState = {
  biddingProcessPlan: null,
  biddingProcessProcurementProcesses: null,
  error: null,
  isSelectedProcessLoaded: true,
  isSelectedProcessLoading: false,
  loaded: false,
  loading: false,
  processScreenLoaded: false,
  processScreenLoading: false,
  loadingProcess: false,
  selectedBiddingProcessProcurementProcess: {
    biddingProcessPlanId: 'bb309ef8-5192-4c47-99c8-39ca201a86f3',
    code: 'EC-L1245-P0001',
    description: 'ICB TEST 1 Normal',
    sustainabilityDescription: '',
    totalComments: 0,
    totalAcumulatedAmount: 0,
    advanceMilestone: {
      totalCompleted: 0,
      total: 0,
      delayed: false,
      currentMilestone: null,
    },
    componentName: '',
    bafo: null,
    sepaPeclaId: '',
    lots: 0,
    category: {
      name: 'PROCT_GOODS',
      id: 2,
    },
    procurementMethod: {
      name: 'PROCT_ICB',
      id: 0,
    },
    supervisionMethod: {
      name: 'ExAnte',
      id: 0,
    },
    status: BiddingProcessProcurementProcessStatuses.EXPECTED,
    sustainability: null,
    goodsReference: 0,
    id: '223647d9-37fe-4c9d-99a3-31a8052d1d29',
    manualId: '',
    name: 'ICB TEST 1 Normal',
    projectAmount: {
      estimatedAmount: 3000,
      localCounterpartAmount: 0,
      idbAmount: 3000,
      cofinancedAmount: 0,
      costJustification: '',
    },
    subExecutor: '',
    justification: '',
    isMigrated: false,
    packagesUnderReview: false,
    isUpdated: true,
    procurementProcessComments: [],
    order: 5,
  },
  selectedFilterForBiddingProcess: null,
  filteredBiddingProcessProcurementProcesses: [],
};

async function setup() {
  const initialState = getInitialState();
  const { fixture } = await render(FilesListComponent, {
    declarations: [FilesListComponent, TranslateEnumPipe],
    componentProperties: {
      files: mockFiles,
    },
    schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    imports: [
      FormsModule,
      DirectivesModule,
      DropDownsModule,
      MsalTestModule,
      HttpClientTestingModule,
      RouterTestingModule.withRoutes([]),
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    providers: [
      NotificationService,
      TranslatePipe,
      provideMockStore({ initialState }),
    ],
  });
  const component = fixture.componentInstance;
  return { component, fixture };
}

function getInitialState() {
  const enumsState = { ...enumsInitialState };
  enumsState.biddingProcessDocumentGroupCodes = [
    { id: 1, name: 'Doc 1' },
    { id: 2, name: 'Doc 2' },
  ];
  return {
    enums: enumsState,
  };
}

const mockFiles: FiduciaryProcessDocument[] = [
  {
    description: '',
    id: 'c07b2c70-190b-467b-bef7-f26eba026668',
    relationalId: 'c07b2c70-190b-467b-bef7-f26eba026668',
    status: 2,
    type: 1,
    operationsDocumentId: 1,
    ezshareNumber: '111666',
    name: 'DOC_PRUEBA_MATAMALA',
    created: new Date('2021-11-10T17:05:37.6466667'),
    createdBy: 'RPANTOJA',
    modified: new Date('2021-11-10T17:05:37.6466667'),
  },
  {
    description: '',
    id: 'c07b2c70-190b-467b-bef7-f26eba026668',
    relationalId: 'c07b2c70-190b-467b-bef7-f26eba026668',
    status: 2,
    type: 1,
    operationsDocumentId: 1,
    ezshareNumber: '111666',
    name: 'DOC_PRUEBA_RUSO',
    created: new Date('2021-11-10T17:05:37.6466667'),
    createdBy: 'RPANTOJA',
    modified: new Date('2021-11-10T17:05:37.6466667'),
  },
];

const mockDocumentnPackage: BiddingProcessDocumentPackage[] = [
  {
    documentsToUpload: [],
    isReadOnly: false,
    id: '7c9cffaa-7877-438b-9512-0e608a57e2a4',
    status: 1,
    code: 0,
    totalMandatoryDocuments: 2,
    totalUploadedDocuments: 2,
    totalComments: 0,
    order: 3,
    requireNonObjection: false,
    actualDate: new Date('2022-03-19T04:40:36.379'),
    bidValidityExtensionDate: new Date(),
    biddingProcessDocumentGroups: [
      {
        id: 'b410fee8-c85d-4993-a413-3f8bf6710a44',
        documentGroupCode: 5,
        documentGroupConfiguration: {
          id: '0b5ec587-df07-47eb-90bc-a3db836f9626',
          visibility: 1,
          result: 0,
          isMandatory: true,
          isResult: true,
          isAmendment: false,
          isClarification: false,
          isDisclosed: false,
          disclosureRequiredAmount: true,
          isUniqueDocument: true,
          isAutogenerated: true,
          systemUpload: false,
          isMandatoryPublication: null,
        },
        documentsState: {
          loading: false,
        },
        fiduciaryProcessDocuments: [
          {
            description: '',
            relationalId: '84609fe2-7f01-49de-8885-0e1b0ab28c21',
            id: 'd1b41e52-6702-48bf-ab7f-a9154b447513',
            status: 4,
            type: 2,
            operationsDocumentId: null,
            ezshareNumber: 'EZTEST-1654199927-854',
            name: 'CO-L1229-P18-BIDDINDG_DOC_NOTIFICATION_PRECUALIFICATION-PDF-test.pdf',
            created: new Date('2022-03-19T04:40:36.379'),
            createdBy: '',
            modified: new Date('2022-03-17T19:17:21.0683926'),
            groupCode: 5,
          },
        ],
      },
      {
        id: 'c2d3efb1-8873-43b0-bb6c-b6f8e71f2a54',
        documentGroupCode: 6,
        documentGroupConfiguration: {
          id: 'ae0b8aaa-98e6-44b0-8d45-9c5ff2bbea05',
          visibility: 1,
          result: 0,
          isMandatory: true,
          isResult: false,
          isAmendment: false,
          isClarification: false,
          isDisclosed: true,
          disclosureRequiredAmount: true,
          isUniqueDocument: true,
          isAutogenerated: true,
          systemUpload: false,
          isMandatoryPublication: null,
        },
        documentsState: {
          loading: false,
        },
      },
    ],
    groupsState: {
      loading: false,
    },
    documentsState: {
      loading: false,
    },
  },
];
