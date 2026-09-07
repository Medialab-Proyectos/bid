import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

import { provideWindowSizeMock } from '@fiduciary-interface-test';
import { provideMockStore } from '@ngrx/store/testing';
import { render } from '@testing-library/angular';

import { DocumentDetailComponent } from '../../components/document-detail/document-detail.component';
import { FilesListComponent } from '@fiduciary-interface/app/shared/components/documents/components/files-list/files-list.component';
import { FinishedDocsComponent } from '@fiduciary-interface/app/shared/components/documents/components/finished-docs/finished-docs.component';
import { DocumentsTabComponent } from './documents-tab.component';
import {
  TablesModule,
  AccordionModule,
  PipeModule,
  DirectivesModule,
} from '@fiduciary-interface/app/shared';
import { NotificationService } from '@progress/kendo-angular-notification';
import { AlertComponent } from '@fiduciary-interface/app/shared/components/notification/components/alert/alert.component';
import { TranslatePipe } from '@ngx-translate/core';
import { PackageDocComponent } from '../../components/package-doc/package-doc.component';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { ActivatedRoute } from '@angular/router';
import {
  BiddingProcessDocumentPackage,
  GetBiddingProcessDocumentGroupsByDocumentPackageIdResponse,
  GetFiduciaryProcessDocumentsIdResponse,
  KeyValueInput,
} from '@core/models';
import { of } from 'rxjs';
import {
  BiddingProcessPlanState,
  ContactState,
  EnumState,
  UsrPreferencesState,
} from '@core/store';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { BussinessRulesFormService } from '@fiduciary-interface/app/features/forms/services/bussiness-rules/bussiness-rules.service';
import { DatePipe } from '@angular/common';
import { SettingType, DocumentPackagesStatus } from '@core/enums';

describe('DocumentsTabComponent', () => {
  it('should render component correctly', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should ngOnit ', async () => {
    const { component, fixture } = await setup();

    jest
      .spyOn((component as any).enumsSvc, 'selectEnums')
      .mockReturnValue(of(mockEnum));

    component.checkEnumsLoaded();
    fixture.detectChanges();
    expect(component.processProcurementProcessId).toEqual(processId);
  });

  it('should loadDocumentsPackages', async () => {
    const { component, fixture } = await setup();

    jest
      .spyOn(
        (component as any).documentPackageStore,
        'getDocumentPackagesByProcess'
      )
      .mockReturnValue(of(packageState));
    component.loadDocumentsPackages();
    fixture.detectChanges();
    expect(component.processProcurementProcessId).toEqual(processId);
  });

  it('should loadDocumentsPackages return select', async () => {
    const { component, fixture } = await setup();

    jest
      .spyOn(
        (component as any).biddingStoreSvc,
        'getOrLoadSelectedBiddingProcessById'
      )
      .mockReturnValue(of(biddingProcessPlanState));
    component.loadSelectedProcurementProcess();
    fixture.detectChanges();
    expect(component.procurementProcess).toEqual(
      biddingProcessPlanState.selectedBiddingProcessProcurementProcess
    );
  });

  it('should charge store preferences and contact', async () => {
    const { component, fixture } = await setup();

    jest.spyOn(component, 'getContact').mockReturnValue(of(mockContactState));
    jest
      .spyOn(component, 'getPreferences')
      .mockReturnValue(of(mockStorePreferences));

    component.getContactInformation();
    component.getCurrentLang();
    fixture.detectChanges();
  });

  it('should expandedRows', async () => {
    const { component, fixture } = await setup();
    component.countryCode = 'ALL';
    component.category = 'CL';
    component.UBORules = {
      ALL: {
        CL: {
          CATEGORY1: {
            SUPERVISION1: {
              EXANTE: {
                value: true,
                mandatory: true,
              },
            },
          },
        },
      },
    };
    jest
      .spyOn(
        (component as any).biddingStoreSvc,
        'getOrLoadSelectedBiddingProcessById'
      )
      .mockReturnValue(of(biddingProcessPlanState));
    component.loadSelectedProcurementProcess();

    const index = 0;
    component.expandedRows[index] = false;
    component.documentPackages = biddingProcessDocumentPackage;

    jest
      .spyOn(
        (component as any).biddingProcessPackageDocuments,
        'getBiddingProcessDocumentGroups'
      )
      .mockReturnValue(
        of(biddingProcessDocumentGroupsByDocumentPackageIdResponse)
      );

    jest
      .spyOn(
        (component as any).biddingProcessPackageDocuments,
        'getFiduciaryProcessDocuments'
      )
      .mockReturnValue(of(getFiduciaryProcessDocumentsIdResponse));

    component.expandRow(index);
    fixture.detectChanges();
  });

  describe('check read only document', () => {
    it('should return false for under review status internal', async () => {
      const { component } = await setup();
      const functionSpy = jest
        .spyOn(component, 'getUserIsInternal')
        .mockReturnValue(true);

      biddingProcessDocumentPackage[0].status =
        DocumentPackagesStatus.UNDER_REVIEW;
      const value = component.shouldDisplayReadOnly(
        biddingProcessDocumentPackage[0]
      );
      expect(functionSpy).toHaveBeenCalled();
      expect(value).toBe(false);
    });
    it('should return false for amendment under review status internal', async () => {
      const { component } = await setup();
      const functionSpy = jest
        .spyOn(component, 'getUserIsInternal')
        .mockReturnValue(true);

      biddingProcessDocumentPackage[0].status =
        DocumentPackagesStatus.AMENDMENT_UNDER_REV;
      const value = component.shouldDisplayReadOnly(
        biddingProcessDocumentPackage[0]
      );
      expect(functionSpy).toHaveBeenCalled();
      expect(value).toBe(false);
    });
    it('should return true for not started status internal', async () => {
      const { component } = await setup();
      const functionSpy = jest
        .spyOn(component, 'getUserIsInternal')
        .mockReturnValue(true);

      biddingProcessDocumentPackage[0].status =
        DocumentPackagesStatus.NOT_STARTED;
      const value = component.shouldDisplayReadOnly(
        biddingProcessDocumentPackage[0]
      );
      expect(functionSpy).toHaveBeenCalled();
      expect(value).toBe(true);
    });
  });
  describe('getFirstNotStartedOrReturnedPackages', () => {
    it('should return 1 for status not started', async () => {
      const { component } = await setup();
      biddingProcessDocumentPackage[0].status =
        DocumentPackagesStatus.NOT_STARTED;
      biddingProcessDocumentPackage[0].order = 1;
      component.documentPackages = [...biddingProcessDocumentPackage];

      const value = component.getFirstNotStartedOrReturnedPackages();
      expect(value).toBe(1);
    });

    it('should -1 for status COMPLETE', async () => {
      const { component } = await setup();
      biddingProcessDocumentPackage[0].status = DocumentPackagesStatus.COMPLETE;
      biddingProcessDocumentPackage[0].order = 1;
      component.documentPackages = [...biddingProcessDocumentPackage];

      const value = component.getFirstNotStartedOrReturnedPackages();
      expect(value).toBe(-1);
    });
  });

  describe('getBooleanStatusCompleteOrAmendmentReturned', () => {
    it('should true for status COMPLETE', async () => {
      const { component } = await setup();
      biddingProcessDocumentPackage[0].status =
        DocumentPackagesStatus.AMENDMENT_RETURNED;
      const value = component.getBooleanStatusCompleteOrAmendmentReturned(
        biddingProcessDocumentPackage[0]
      );
      expect(value).toBe(true);
    });
    it('should true for status COMPLETE', async () => {
      const { component } = await setup();
      biddingProcessDocumentPackage[0].status = DocumentPackagesStatus.COMPLETE;
      const value = component.getBooleanStatusCompleteOrAmendmentReturned(
        biddingProcessDocumentPackage[0]
      );
      expect(value).toBe(true);
    });
  });

  describe('checkFirstPakage', () => {
    it('should return false', async () => {
      const { component } = await setup();
      biddingProcessDocumentPackage[0].status =
        DocumentPackagesStatus.NOT_STARTED;
      biddingProcessDocumentPackage[0].biddingProcessDocumentGroups = [
        ...biddingProcessDocumentGroupsByDocumentPackageIdResponse.biddingProcessDocumentGroups,
      ];
      const value = component.checkFirstPakage(
        biddingProcessDocumentPackage[0]
      );
      expect(value).toBe(false);
    });
    it('should return true', async () => {
      const { component } = await setup();
      biddingProcessDocumentPackage[0].status = DocumentPackagesStatus.COMPLETE;
      biddingProcessDocumentPackage[0].biddingProcessDocumentGroups = [
        ...biddingProcessDocumentGroupsByDocumentPackageIdResponse.biddingProcessDocumentGroups,
      ];
      biddingProcessDocumentPackage[0].biddingProcessDocumentGroups[0].documentGroupConfiguration.isAmendment = true;
      component.documentPackages = [...biddingProcessDocumentPackage];
      const value = component.checkFirstPakage(
        biddingProcessDocumentPackage[0]
      );
      expect(value).toBe(true);
    });
  });

  describe('checkPreviousPackageStatus', () => {
    it('should return true for first package', async () => {
      const { component } = await setup();
      const value = component.checkPreviousPackageStatus(
        biddingProcessDocumentPackage[0]
      );
      expect(value).toBe(true);
    });
  });

  describe('checkFirstNotStartedOrReturned', () => {
    it('should return true', async () => {
      const { component } = await setup();
      biddingProcessDocumentPackage[0].order =
        DocumentPackagesStatus.NOT_STARTED;
      const eventSpy = jest
        .spyOn(component, 'getFirstNotStartedOrReturnedPackages')
        .mockReturnValue(1);
      const value = component.checkFirstNotStartedOrReturned(
        biddingProcessDocumentPackage[0]
      );
      expect(value).toBe(true);
      expect(eventSpy).toHaveBeenCalled();
    });

    it('should return false', async () => {
      const { component } = await setup();
      biddingProcessDocumentPackage[0].status =
        DocumentPackagesStatus.NOT_STARTED;
      const value = component.checkFirstNotStartedOrReturned(
        biddingProcessDocumentPackage[0]
      );
      expect(value).toBe(false);
    });
  });

  describe('checkLastCompletedOrAmendmentReturnedOrCompleteWithAmendments', () => {
    it('should return true IF documentPackages has document package with status COMPLETE', async () => {
      const { component } = await setup();
      biddingProcessDocumentPackage[0].status = DocumentPackagesStatus.COMPLETE;
      component.documentPackages = [...biddingProcessDocumentPackage];
      const value =
        component.checkLastCompletedOrAmendmentReturnedOrCompleteWithAmendments(
          biddingProcessDocumentPackage[0]
        );
      expect(value).toBe(true);
    });
    it('should return true IF documentPackages has document package with status COMPLETE_AMENDMENT', async () => {
      const { component } = await setup();
      biddingProcessDocumentPackage[0].status =
        DocumentPackagesStatus.COMPLETE_AMENDMENT;
      component.documentPackages = [...biddingProcessDocumentPackage];
      const value =
        component.checkLastCompletedOrAmendmentReturnedOrCompleteWithAmendments(
          biddingProcessDocumentPackage[0]
        );
      expect(value).toBe(true);
    });
    it('should return true IF documentPackages has document package with status AMENDMENT_RETURNED ', async () => {
      const { component } = await setup();
      biddingProcessDocumentPackage[0].status =
        DocumentPackagesStatus.AMENDMENT_RETURNED;
      component.documentPackages = [...biddingProcessDocumentPackage];
      const value =
        component.checkLastCompletedOrAmendmentReturnedOrCompleteWithAmendments(
          biddingProcessDocumentPackage[0]
        );
      expect(value).toBe(true);
    });

    it('should return false', async () => {
      const { component } = await setup();
      const value =
        component.checkLastCompletedOrAmendmentReturnedOrCompleteWithAmendments(
          biddingProcessDocumentPackage[0]
        );
      expect(value).toBe(false);
    });
  });

  describe('getBooleanExPostRules', () => {
    it('should return true if package status is complete and has any document with configuration is amendment', async () => {
      const { component } = await setup();
      biddingProcessDocumentPackage[0].status = DocumentPackagesStatus.COMPLETE;
      biddingProcessDocumentPackage[0].biddingProcessDocumentGroups[0].documentGroupConfiguration.isAmendment = true;
      const value = component.getBooleanExPostRules(
        biddingProcessDocumentPackage[0]
      );
      expect(value).toBe(true);
    });
    it('should return true if package status is complete and has any document with configuration is amendment', async () => {
      const { component } = await setup();
      biddingProcessDocumentPackage[0].status =
        DocumentPackagesStatus.AMENDMENT_RETURNED;
      biddingProcessDocumentPackage[0].biddingProcessDocumentGroups[0].documentGroupConfiguration.isAmendment = true;
      const value = component.getBooleanExPostRules(
        biddingProcessDocumentPackage[0]
      );
      expect(value).toBe(true);
    });
    it('should return true if package status is complete and has any document with configuration is amendment', async () => {
      const { component } = await setup();
      biddingProcessDocumentPackage[0].status =
        DocumentPackagesStatus.COMPLETE_AMENDMENT;
      biddingProcessDocumentPackage[0].biddingProcessDocumentGroups[0].documentGroupConfiguration.isAmendment = true;
      const value = component.getBooleanExPostRules(
        biddingProcessDocumentPackage[0]
      );
      expect(value).toBe(true);
    });
    it('should return false if package status is RETURNED', async () => {
      const { component } = await setup();
      biddingProcessDocumentPackage[0].status = DocumentPackagesStatus.RETURNED;
      biddingProcessDocumentPackage[0].biddingProcessDocumentGroups[0].documentGroupConfiguration.isAmendment = true;
      const value = component.getBooleanExPostRules(
        biddingProcessDocumentPackage[0]
      );
      expect(value).toBe(false);
    });
  });
  it('btnClicked', async () => {
    const { component } = await setup();
    component.btnClicked(0);
    expect(component.isBtnClicked[0]).toBe(true);
  });
  it('hideDetails', async () => {
    const { component } = await setup();
    const eventSpy = jest.spyOn(
      component.visibilitySvc,
      'setVisiblityProcessHeader'
    );
    component.hideDetails();
    expect(component.selectedDocument).toBe(null);
    expect(eventSpy).toHaveBeenCalledWith(true);
  });
  it('buildResultQueryParams', async () => {
    const { component } = await setup();
    component.procurementProcess = {
      isMigrated: false,
      packagesUnderReview: false,
      biddingProcessPlanId: 'b4952feb-3947-4d10-bd3c-923d4adbbbd7',
      code: 'PN-L1095-P00127',
      description: 'CFI-6759-8',
      sustainabilityDescription: '',
      totalComments: 0,
      advanceMilestone: {
        totalCompleted: 1,
        total: 10,
        delayed: true,
      },
      componentName: 'Componente 1. Electrificación rural en red',
      bafo: null,
      sepaPeclaId: '',
      lots: null,
      category: {
        name: 'PROCT_WORKS',
        id: 5,
      },
      procurementMethod: {
        name: 'PROCT_CBSSTEWP',
        id: 79,
      },
      supervisionMethod: {
        name: 'ExPost',
        id: 1,
      },
      status: 7,
      sustainability: null,
      goodsReference: null,
      id: '49a2f749-2ed1-4fa3-8ebc-0abbf707a9fc',
      manualId: '',
      name: 'CFI-6759-8',
      projectAmount: {
        estimatedAmount: 666,
        localCounterpartAmount: 222,
        idbAmount: 222,
        cofinancedAmount: 222,
        costJustification: null,
      },
      subExecutor: '',
      justification: '',
    };

    const attributeDocPackageCode: KeyValueInput = {
      key: 'PackageCode',
      value: 1,
    };
    const attributeDocumentCode: KeyValueInput = {
      key: 'DocumentCode',
      value: 1,
    };
    const attributeCategory: KeyValueInput = {
      key: 'category',
      value: component.procurementProcess.category.id,
    };
    const attributeProcurementMethod: KeyValueInput = {
      key: 'procurementMethod',
      value: component.procurementProcess.procurementMethod.id,
    };
    const attributeSupervisionMethod: KeyValueInput = {
      key: 'supervisionMethod',
      value: component.procurementProcess.supervisionMethod.name,
    };
    const eventSpy = jest.spyOn(component.utilsSvc, 'buildAttributesArray');
    component.buildResultQueryParams(1, 1);
    expect(eventSpy).toHaveBeenCalledWith(
      SettingType.ResultOptions,
      null,
      attributeCategory,
      attributeProcurementMethod,
      null,
      attributeSupervisionMethod,
      null,
      attributeDocPackageCode,
      attributeDocumentCode
    );
  });
});

/* it('should charge BusinessRules', async () => {
  const { component, fixture } = await setup();

  jest
    .spyOn(
      (component as any).biddingProcessPackageDocuments,
      'getFiduciaryProcessDocuments'
    )
    .mockReturnValue(of(getFiduciaryProcessDocumentsIdResponse));

  jest
    .spyOn((component as any).workflowApi, 'getLastStep')
    .mockReturnValue(of(workflowLastStepResponse));

  jest
    .spyOn((component as any).brFormService, 'getFunction')
    .mockReturnValue(of(bussinessRulesFormResponse));

  component.checkBusinessRules(
    biddingProcessDocumentPackageBuss,
    biddingProcessDocumentGroup
  );
  component.getWorkflowNextStep(biddingProcessDocumentPackageBuss);
  fixture.detectChanges();
});*/

async function setup(mobileView = false, empty = false) {
  const initialState = getInitialState();
  if (empty) {
    initialState.documents.documents = [];
  }

  const { fixture } = await render(DocumentsTabComponent, {
    componentProperties: {
      isEnumLoaded: true,
    },
    declarations: [
      DocumentDetailComponent,
      FilesListComponent,
      FinishedDocsComponent,
      PackageDocComponent,
      AlertComponent,
    ],
    imports: [
      MsalTestModule,
      DirectivesModule,
      TablesModule,
      AccordionModule,
      HttpClientTestingModule,
      RouterTestingModule,
      PipeModule,
      RouterTestingModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    providers: [
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: { params: { processId: processId } },
        },
      },
      TranslatePipe,
      BussinessRulesFormService,
      DatePipe,
      NotificationService,
      provideMockStore({ initialState }),
      provideWindowSizeMock({ mobileView }),
    ],
  });
  const component = fixture.debugElement.componentInstance;
  return {
    fixture,
    component,
  };
}

const mockContactState: ContactState = {
  contact: {
    contactId: '26b4adc6-9457-4b11-b012-88edfc54c6ea',
    name: 'Fiduciary Interface BP',
    username: 'undefined',
    email: 'fiduciaryinterface_bp@outlook.com',
    family_name: 'BP',
    given_name: 'Fiduciary Interface',
    is_internal: false,
  },
  loaded: true,
  loading: false,
  error: null,
};

const mockStorePreferences: UsrPreferencesState = {
  preferences: null,
  loaded: true,
  loading: false,
  error: null,
};

const processId = '223647d9-37fe-4c9d-99a3-31a8052d1d29';

const biddingProcessDocumentPackage: BiddingProcessDocumentPackage[] = [
  {
    actualDate: new Date('2022-06-04T04:00:00'),
    actualDateState: {
      loading: false,
    },
    biddingProcessDocumentGroups: [],
    code: 25,
    documentsState: {
      loading: false,
    },
    groupsState: {
      loading: false,
    },
    id: '79eeb620-46aa-4f77-4471-08da46966764',
    isReadOnly: false,
    order: 1,
    requireNonObjection: true,
    status: 1,
    totalComments: 0,
    totalUploadedDocuments: 2,
    totalMandatoryDocuments: 1,
    documentsToUpload: [],
    bidValidityExtensionDate: new Date(),
  },
];

const biddingProcessPlanState: BiddingProcessPlanState = {
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
    status: 7,
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
    order: 4,
  },
  selectedFilterForBiddingProcess: null,
  filteredBiddingProcessProcurementProcesses: [],
};

const packageState = {
  biddingProcessDocumentPackages: biddingProcessDocumentPackage,
  error: null,
  loading: true,
  loafed: false,
};

function getInitialState() {
  return {
    documents: {
      documents: [
        {
          id: '1',
          packageName: 'Publication of SPN',
          actualDate: 1626464134595,
          currentFiles: 1,
          maximumFiles: 2,
          state: 'Completado',
          commentsCount: 3,
          enable: true,
          documents: [
            {
              id: '1',
              name: 'Final Version of Bidding Documents (RFP / RFB)',
              required: true,
              state: 'Archivo subido',
              uploaded: false,
            },
            {
              id: '2',
              name: 'Specific Procurement Notice',
              required: false,
              state: 'Archivo subido',
              uploaded: false,
            },
          ],
          files: [
            {
              id: '1',
              name: 'BID 2020 Revisado.docx',
              types: [
                'Final Version of Bidding Documents (RFP / RFB)',
                'Specific Procurement Notice',
              ],
              ezShareId: 'EZShare 0189399382',
            },
            {
              id: '2',
              name: 'BID 2020 Revisado v2.docx',
              types: [
                'Final Version of Bidding Documents (RFP / RFB)',
                'Specific Procurement Notice',
              ],
              ezShareId: 'EZShare 0189399382',
            },
          ],
        },
        {
          id: '2',
          packageName: 'BID Opening Record',
          actualDate: 1626464223737,
          currentFiles: 0,
          maximumFiles: 2,
          state: 'No Iniciado',
          commentsCount: 0,
          enable: true,
          files: [],
        },
      ],
    },
  };
}

const biddingProcessDocumentGroupsByDocumentPackageIdResponse: GetBiddingProcessDocumentGroupsByDocumentPackageIdResponse =
  {
    biddingProcessDocumentGroups: [
      {
        id: 'c238ec1d-58d3-40cb-0986-08da4696676b',
        documentGroupCode: 48,
        documentGroupConfiguration: {
          id: '04dc8ca2-740a-4ad6-9eba-08da4696676f',
          visibility: 0,
          result: 3,
          isMandatory: true,
          isResult: false,
          isAmendment: false,
          isClarification: false,
          isDisclosed: false,
          disclosureRequiredAmount: false,
          isUniqueDocument: false,
          isAutogenerated: false,
          systemUpload: false,
          isMandatoryPublication: null,
        },
      },
      {
        id: '5f829995-8219-4ad5-0987-08da4696676b',
        documentGroupCode: 45,
        documentGroupConfiguration: {
          id: 'a0f5e00c-1cc2-42b7-9ebb-08da4696676f',
          visibility: 0,
          result: 3,
          isMandatory: true,
          isResult: false,
          isAmendment: false,
          isClarification: false,
          isDisclosed: true,
          disclosureRequiredAmount: false,
          isUniqueDocument: false,
          isAutogenerated: true,
          systemUpload: false,
          isMandatoryPublication: null,
        },
      },
      {
        id: 'd8c7101e-7b8b-443d-0988-08da4696676b',
        documentGroupCode: 2,
        documentGroupConfiguration: {
          id: '420cf356-7571-4ae9-9ebc-08da4696676f',
          visibility: 0,
          result: 3,
          isMandatory: false,
          isResult: false,
          isAmendment: true,
          isClarification: false,
          isDisclosed: false,
          disclosureRequiredAmount: false,
          isUniqueDocument: true,
          isAutogenerated: false,
          systemUpload: false,
          isMandatoryPublication: null,
        },
      },
      {
        id: '107578ee-08b5-40ad-0989-08da4696676b',
        documentGroupCode: 10,
        documentGroupConfiguration: {
          id: 'd06746fe-7a04-4aaa-9ebd-08da4696676f',
          visibility: 0,
          result: 3,
          isMandatory: false,
          isResult: false,
          isAmendment: false,
          isClarification: true,
          isDisclosed: false,
          disclosureRequiredAmount: false,
          isUniqueDocument: true,
          isAutogenerated: false,
          systemUpload: false,
          isMandatoryPublication: null,
        },
      },
      {
        id: 'eccdd916-c415-4bc2-098a-08da4696676b',
        documentGroupCode: 33,
        documentGroupConfiguration: {
          id: '0c455ed5-6e0e-499c-9ebe-08da4696676f',
          visibility: 0,
          result: 3,
          isMandatory: false,
          isResult: false,
          isAmendment: false,
          isClarification: false,
          isDisclosed: false,
          disclosureRequiredAmount: false,
          isUniqueDocument: true,
          isAutogenerated: false,
          systemUpload: false,
          isMandatoryPublication: null,
        },
      },
      {
        id: '3e11100d-9a29-4069-098b-08da4696676b',
        documentGroupCode: 5,
        documentGroupConfiguration: {
          id: 'aecb5b96-c866-4257-9ebf-08da4696676f',
          visibility: 1,
          result: 3,
          isMandatory: false,
          isResult: false,
          isAmendment: false,
          isClarification: false,
          isDisclosed: false,
          disclosureRequiredAmount: false,
          isUniqueDocument: true,
          isAutogenerated: false,
          systemUpload: false,
          isMandatoryPublication: null,
        },
      },
    ],
  };

const getFiduciaryProcessDocumentsIdResponse: GetFiduciaryProcessDocumentsIdResponse =
  {
    parentId: '5f829995-8219-4ad5-0987-08da4696676b',
    fiduciaryProcessDocuments: [
      {
        description: '',
        relationalId: '2cfb0a5b-1368-45dd-9ab3-d3501290e4b2',
        id: 'b351d6e2-e760-44a5-ba10-73c22a6c0825',
        status: 0,
        type: 2,
        operationsDocumentId: null,
        ezshareNumber: '',
        name: 'EC-L1245-P0001-BIDDINDG_DOC_SPECIFIC-Institutions_Lliasion_Executor.xlsx',
        created: new Date('2022-06-05T01:56:44.1505928'),
        createdBy: 'fiduciaryinterface6',
        modified: new Date('2022-06-05T01:56:44.1505618'),
        biddingDocumentId: '',
      },
    ],
  };
/*
const biddingProcessDocumentPackageBuss: BiddingProcessDocumentPackage = {
  actualDate: new Date('2022-06-04T04:00:00'),
  actualDateState: {
    loading: false,
  },
  biddingProcessDocumentGroups: [],
  code: 25,
  documentsState: {
    loading: false,
  },
  groupsState: {
    loading: false,
  },
  id: '79eeb620-46aa-4f77-4471-08da46966764',
  isReadOnly: false,
  order: 1,
  requireNonObjection: true,
  status: 1,
  totalComments: 0,
  totalUploadedDocuments: 2,
  totalMandatoryDocuments: 1,
  documentsToUpload: [],
};
const biddingProcessDocumentGroup: BiddingProcessDocumentGroup[] = [
  {
    id: '107578ee-08b5-40ad-0989-08da4696676b',
    documentGroupCode: 10,
    documentGroupConfiguration: {
      id: 'd06746fe-7a04-4aaa-9ebd-08da4696676f',
      visibility: 0,
      result: 3,
      isMandatory: false,
      isResult: false,
      isAmendment: false,
      isClarification: true,
      isDisclosed: false,
      disclosureRequiredAmount: false,
      isUniqueDocument: true,
      isAutogenerated: false,
    },
    fiduciaryProcessDocuments: [],
    documentsState: {
      loading: false,
    },
    options: [],
    participantsOptions: [],
  },
  {
    id: 'eccdd916-c415-4bc2-098a-08da4696676b',
    documentGroupCode: 33,
    documentGroupConfiguration: {
      id: '0c455ed5-6e0e-499c-9ebe-08da4696676f',
      visibility: 0,
      result: 3,
      isMandatory: false,
      isResult: false,
      isAmendment: false,
      isClarification: false,
      isDisclosed: false,
      disclosureRequiredAmount: false,
      isUniqueDocument: true,
      isAutogenerated: false,
    },
    fiduciaryProcessDocuments: [],
    documentsState: {
      loading: false,
    },
    options: [],
    participantsOptions: [],
  },
  {
    id: '3e11100d-9a29-4069-098b-08da4696676b',
    documentGroupCode: 5,
    documentGroupConfiguration: {
      id: 'aecb5b96-c866-4257-9ebf-08da4696676f',
      visibility: 1,
      result: 3,
      isMandatory: false,
      isResult: false,
      isAmendment: false,
      isClarification: false,
      isDisclosed: false,
      disclosureRequiredAmount: false,
      isUniqueDocument: true,
      isAutogenerated: false,
    },
    fiduciaryProcessDocuments: [],
    documentsState: {
      loading: false,
    },
    options: [],
    participantsOptions: [],
  },
  {
    id: 'd8c7101e-7b8b-443d-0988-08da4696676b',
    documentGroupCode: 2,
    documentGroupConfiguration: {
      id: '420cf356-7571-4ae9-9ebc-08da4696676f',
      visibility: 0,
      result: 3,
      isMandatory: false,
      isResult: false,
      isAmendment: true,
      isClarification: false,
      isDisclosed: false,
      disclosureRequiredAmount: false,
      isUniqueDocument: true,
      isAutogenerated: false,
    },
    fiduciaryProcessDocuments: [],
    documentsState: {
      loading: false,
    },
    options: [],
    participantsOptions: [],
  },
  {
    id: 'c238ec1d-58d3-40cb-0986-08da4696676b',
    documentGroupCode: 48,
    documentGroupConfiguration: {
      id: '04dc8ca2-740a-4ad6-9eba-08da4696676f',
      visibility: 0,
      result: 3,
      isMandatory: true,
      isResult: false,
      isAmendment: false,
      isClarification: false,
      isDisclosed: false,
      disclosureRequiredAmount: false,
      isUniqueDocument: false,
      isAutogenerated: false,
    },
    fiduciaryProcessDocuments: [
      {
        relationalId: '1abb2eb3-5679-43c8-a586-cea1b2a16c11',
        id: '3be273a7-7918-4e99-a0c3-690336346ad1',
        status: 0,
        type: 2,
        operationsDocumentId: null,
        ezshareNumber: '',
        name: 'EC-L1245-P0001-BIDDINDG_DOC_STANDARD-Special_Funds_v1.xlsx',
        created: new Date('2022-06-05T01:56:46.0020113'),
        createdBy: 'fiduciaryinterface6',
        modified: new Date('2022-06-05T01:56:46.0020107'),
        biddingDocumentId: '',
        result: -1,
        options: [
          {
            groupCode: 48,
            options: [],
          },
        ],
        showHeaderResult: false,
        actualResults: [],
        groupCode: 48,
        participantsOptions: [],
        visibility: 0,
        mandatory: true,
      },
    ],
    documentsState: {
      loading: false,
    },
    options: [],
    participantsOptions: [],
  },
  {
    id: '5f829995-8219-4ad5-0987-08da4696676b',
    documentGroupCode: 45,
    documentGroupConfiguration: {
      id: 'a0f5e00c-1cc2-42b7-9ebb-08da4696676f',
      visibility: 0,
      result: 3,
      isMandatory: true,
      isResult: false,
      isAmendment: false,
      isClarification: false,
      isDisclosed: true,
      disclosureRequiredAmount: false,
      isUniqueDocument: false,
      isAutogenerated: true,
    },
    fiduciaryProcessDocuments: [
      {
        relationalId: '2cfb0a5b-1368-45dd-9ab3-d3501290e4b2',
        id: 'b351d6e2-e760-44a5-ba10-73c22a6c0825',
        status: 0,
        type: 2,
        operationsDocumentId: null,
        ezshareNumber: '',
        name: 'EC-L1245-P0001-BIDDINDG_DOC_SPECIFIC-Institutions_Lliasion_Executor.xlsx',
        created: new Date('2022-06-05T01:56:44.1505928'),
        createdBy: 'fiduciaryinterface6',
        modified: new Date('2022-06-05T01:56:44.1505618'),
        biddingDocumentId: '',
        result: -1,
        options: [
          {
            groupCode: 45,
            options: [],
          },
        ],
        showHeaderResult: false,
        actualResults: [],
        groupCode: 45,
        participantsOptions: [],
        visibility: 0,
        mandatory: true,
      },
    ],
    documentsState: {
      loading: false,
    },
    options: [],
    participantsOptions: [],
  },
];

const workflowLastStepResponse: WorkflowLastStepResponse = {
  nextUsers: [],
  currentStep: null,
  nextStep: null,
  workflowInstanceId: null,
  nextActions: null,
  nextActors: null,
  actionSelected: null,
};

//const projectContractId = '4788/OC-EC';

const bussinessRulesFormResponse: BussinessRulesFormResponse = {
  result: BussinessRulesFunctionEnum.GENERATE,
};*/

const mockEnum: EnumState = {
  biddingContractStatuses: [],
  biddingContractTypes: [],
  biddingContractBonusTypes: [],
  biddingContractConflictResolutionMethods: [],
  biddingContractLiquidatedDamageTypes: [],
  biddingContractBonusPaymentFrequency: [],
  biddingContractSecurityTypes: [],
  biddingContractDocumentGroupCodes: [],
  biddingContractDocumentGroupVisibilities: [],
  biddingProcessBidderEconomicSectors: [],
  biddingProcessBidderTypes: [],
  biddingProcessDocumentGroupCodes: [],
  biddingProcessDocumentgroupResults: [],
  biddingProcessDocumentGroupVisibilities: [],
  biddingProcessDocumentPackageCodes: [],
  biddingProcessDocumentPackageStatuses: [],
  biddingProcessMilestoneCodes: [],
  biddingProcessMilestoneStatuses: [],
  biddingProcessParticipantResults: [],
  biddingProcessPlanStatuses: [],
  biddingProcessProcurementProcessProcurementMethods: [],
  biddingProcessProcurementProcessGoodsReferences: [],
  biddingProcessProcurementProcessCategories: [],
  biddingProcessProcurementProcessStatuses: [],
  biddingProcessProcurementProcessSupervisionMethods: [],
  biddingProcessProcurementProcessSustainabilities: [],
  commentSources: [],
  commentStatuses: [],
  commentVisibilities: [],
  fiduciaryProcessDocumentsStatuses: [],
  fiduciaryProcessDocumentsTypes: [],
  projectBucketStatuses: [],
  projectTaskStatuses: [],
  projectTaskTypes: [],
  countries: [],
  beneficiaryCountries: [],
  memberCountries: [],
  documentDomain: [],
  workflowActions: [],
  onlineDisburmentWorkflowSteps: [],
  onlineDisburmentWorkflowActions: [],
  transactionDocumentGroupCodes: [],
  TransactionStatuses: [],
  workflowSteps: [],
  workflowRoles: [],
  workflowTypes: [],
  WorkFlowDocumentVisibilities: [],
  contractsBonusTypes: [],
  contractsConflictResolutionMethods: [],
  contractsGuaranteeTypes: [],
  contractsLiquidationDamageTypes: [],
  contractsPaymentDistributions: [],
  contractsPaymentFrequencies: [],
  contractsPaymentRequests: [],
  contractsStatuses: [],
  contractsTypes: [],
  enumsLoaded: {
    biddingContractStatuses: true,
    biddingContractTypes: true,
    biddingContractBonusTypes: true,
    biddingContractConflictResolutionMethods: true,
    biddingContractLiquidatedDamageTypes: true,
    biddingContractBonusPaymentFrequency: true,
    biddingContractSecurityTypes: true,
    biddingContractDocumentGroupCodes: true,
    transactionDocumentGroupCodes: true,
    biddingContractDocumentGroupVisibilities: true,
    biddingContractAmendmentDocumentGroupCodes: true,
    biddingProcessBidderEconomicSectors: true,
    biddingProcessBidderTypes: true,
    biddingProcessDocumentGroupCodes: true,
    biddingProcessDocumentgroupResults: true,
    biddingProcessDocumentGroupVisibilities: true,
    biddingProcessDocumentPackageCodes: true,
    biddingProcessDocumentPackageStatuses: true,
    biddingProcessMilestoneCodes: true,
    biddingProcessMilestoneStatuses: true,
    biddingProcessParticipantResults: true,
    biddingProcessPlanStatuses: true,
    biddingProcessProcurementProcessProcurementMethods: true,
    biddingProcessProcurementProcessGoodsReferences: true,
    biddingProcessProcurementProcessCategories: true,
    biddingProcessProcurementProcessStatuses: true,
    biddingProcessProcurementProcessSupervisionMethods: true,
    biddingProcessProcurementProcessSustainabilities: true,
    commentSources: true,
    commentStatuses: true,
    commentVisibilities: true,
    fiduciaryProcessDocumentsStatuses: true,
    fiduciaryProcessDocumentsTypes: true,
    projectBucketStatuses: true,
    projectTaskStatuses: true,
    projectTaskTypes: true,
    documentDomain: true,
    workflowActions: true,
    onlineDisburmentWorkflowSteps: true,
    onlineDisburmentWorkflowActions: true,
    TransactionStatuses: true,
    workflowSteps: true,
    workflowRoles: true,
    workflowTypes: true,
    countries: true,
    beneficiaryCountries: true,
    memberCountries: true,
    WorkFlowDocumentVisibilities: true,
  },
  enumsLoading: {
    biddingContractStatuses: false,
    biddingContractTypes: false,
    biddingContractBonusTypes: false,
    biddingContractConflictResolutionMethods: false,
    biddingContractLiquidatedDamageTypes: false,
    biddingContractBonusPaymentFrequency: false,
    biddingContractSecurityTypes: false,
    biddingContractDocumentGroupCodes: false,
    transactionDocumentGroupCodes: false,
    biddingContractDocumentGroupVisibilities: false,
    biddingContractAmendmentDocumentGroupCodes: false,
    biddingProcessBidderEconomicSectors: false,
    biddingProcessBidderTypes: false,
    biddingProcessDocumentGroupCodes: false,
    biddingProcessDocumentgroupResults: false,
    biddingProcessDocumentGroupVisibilities: false,
    biddingProcessDocumentPackageCodes: false,
    biddingProcessDocumentPackageStatuses: false,
    biddingProcessMilestoneCodes: false,
    biddingProcessMilestoneStatuses: false,
    biddingProcessParticipantResults: false,
    biddingProcessPlanStatuses: false,
    biddingProcessProcurementProcessProcurementMethods: false,
    biddingProcessProcurementProcessGoodsReferences: false,
    biddingProcessProcurementProcessCategories: false,
    biddingProcessProcurementProcessStatuses: false,
    biddingProcessProcurementProcessSupervisionMethods: false,
    biddingProcessProcurementProcessSustainabilities: false,
    commentSources: false,
    commentStatuses: false,
    commentVisibilities: false,
    fiduciaryProcessDocumentsStatuses: false,
    fiduciaryProcessDocumentsTypes: false,
    projectBucketStatuses: false,
    projectTaskStatuses: false,
    projectTaskTypes: false,
    documentDomain: false,
    workflowActions: false,
    onlineDisburmentWorkflowSteps: false,
    onlineDisburmentWorkflowActions: false,
    TransactionStatuses: false,
    workflowSteps: false,
    workflowRoles: false,
    workflowTypes: false,
    countries: false,
    beneficiaryCountries: false,
    memberCountries: false,
    WorkFlowDocumentVisibilities: false,
  },
  loaded: true,
  loading: false,
  error: null,
};
