import { IFDatePipe } from '@fiduciary-interface/app/shared/pipes/if-date-pipe.pipe';
import { DatePipe } from '@angular/common';
import { NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnumsStoreService } from '@core/services/store-services';
import { PipeModule } from '@fiduciary-interface/app/shared';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { HistoricChangesContainerComponent } from './historic-changes-container.component';
import {
  MilestoneChange,
  MilestonesChanges,
  ProcurementProcessVersion,
} from '../../models';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const componentsMock = {
  previousValues: {
    componentId: '1',
    componentName: 'Test previous',
    outputs: [
      {
        outputId: '1',
        outputName: 'Test previous output',
        modificationDate: '2020-02-24T00:00:00',
        modifiedBy: 'Test',
        percentageAssigned: 10,
      },
    ],
  },
  newValues: {
    componentId: '1',
    componentName: 'Test new',
    outputs: [
      {
        outputId: '2',
        outputName: 'Test new output',
        modificationDate: '2020-02-24T00:00:00',
        modifiedBy: 'Test',
        percentageAssigned: 10,
      },
    ],
  },
};

const initialState = {
  enums: {
    biddingProcessProcurementProcessCategories: [
      {
        id: 0,
        name: 'PROCUREMENT.CATEGORIES.PROCT_CSTFRM',
      },
    ],
    biddingProcessProcurementProcessProcurementMethods: [
      {
        id: 0,
        name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_ICB',
      },
      {
        id: 1,
        name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_ICBWP',
      },
      {
        id: 2,
        name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_CRLP',
      },
    ],
    biddingProcessProcurementProcessSupervisionMethods: [
      {
        id: 0,
        name: 'PROCUREMENT.SUPERVISION_METHOD.ExAnte',
      },
      {
        id: 1,
        name: 'PROCUREMENT.SUPERVISION_METHOD.ExPost',
      },
    ],
    biddingProcessProcurementProcessSustainabilities: [
      {
        id: 0,
        name: 'ENUM.PROCESS.SUSTAINABILITY.ECONOMIC_CONSIDERATIONS',
      },
      {
        id: 1,
        name: 'ENUM.PROCESS.SUSTAINABILITY.ENVIROMENTAL_CONSIDERATIONS',
      },
    ],
    biddingProcessProcurementProcessGoodsReferences: [
      {
        id: 0,
        name: 'ENUM.PROCESS.GOODS.REFERENCE.NEW',
      },
      {
        id: 1,
        name: 'ENUM.PROCESS.GOODS.REFERENCE.LEASE',
      },
    ],
    biddingProcessMilestoneCodes: [
      {
        id: 0,
        name: 'CHK_MI_BD',
      },
      {
        id: 1,
        name: 'CHK_MI_BD_F',
      },
      {
        id: 2,
        name: 'CHK_MI_BD_T',
      },
    ],
  },
};

const mockProcurementVersion: ProcurementProcessVersion = {
  procurementPlanVersion: 97,
  entityType: 2,
  biddingProcessProcurementProcessUpdateModel: {
    biddingProcessProcurementProcessId: '0bb69faa-5afb-4dc6-8ffc-26a28fbfed8f',
    name: {
      name: 'null',
      previousValue: 'null',
      lastModification: 'null',
      modifiedBy: 'null',
      modified: 'null',
    },
    manualId: {
      name: 'null',
      previousValue: 'null',
      lastModification: 'null',
      modifiedBy: 'null',
      modified: 'null',
    },
    description: {
      name: 'null',
      previousValue: 'null',
      lastModification: 'null',
      modifiedBy: 'null',
      modified: 'null',
    },
    subExecutor: {
      name: 'null',
      previousValue: 'null',
      lastModification: 'null',
      modifiedBy: 'null',
      modified: 'null',
    },
    category: {
      name: 'null',
      previousValue: 'null',
      lastModification: 'null',
      modifiedBy: 'null',
      modified: 'null',
    },
    procurementMethod: {
      name: 'null',
      previousValue: 'null',
      lastModification: 'null',
      modifiedBy: 'null',
      modified: 'null',
    },
    supervisionMethod: {
      name: 'null',
      previousValue: 'null',
      lastModification: 'null',
      modifiedBy: 'null',
      modified: 'null',
    },
    estimatedTotalAmount: {
      name: 'null',
      previousValue: 'null',
      lastModification: 'null',
      modifiedBy: 'null',
      modified: 'null',
    },
    idbAmount: {
      name: 'null',
      previousValue: 'null',
      lastModification: 'null',
      modifiedBy: 'null',
      modified: 'null',
    },
    totalCounterPartAmount: {
      name: 'null',
      previousValue: 'null',
      lastModification: 'null',
      modifiedBy: 'null',
      modified: 'null',
    },
    coFinancingAmount: {
      name: 'null',
      previousValue: 'null',
      lastModification: 'null',
      modifiedBy: 'null',
      modified: 'null',
    },
    sustainabilityLabel: {
      name: 'null',
      previousValue: 'null',
      lastModification: 'null',
      modifiedBy: 'null',
      modified: 'null',
    },
    sustainabilityDescription: {
      name: 'FI.CNVG.FP.PROCUREMENT.SUSTAINABILITY.SUSTAINABILITY_DESCRIPTION_LABEL',
      previousValue: '555',
      lastModification: '555',
      modifiedBy: 'fiduciaryinterface_bp3',
      modified: '2023-02-27T21:55:08.399Z',
    },
    component: {
      name: 'FI.CNVG.FP.PROCUREMENT.COMPONENT',
      previousValue: '742ca1b4-bcff-4910-9987-7557fc228fa7',
      lastModification: '76945078-7293-48c6-bbbd-ea33eb90c86b',
      modifiedBy: 'fiduciaryinterface_bp3',
      modified: '2023-02-27T21:55:08.399Z',
    },
    outputs: {
      name: 'FI.CNVG.FP.PROCUREMENT.OUTPUT',
      previousValue: [
        {
          output: {
            key: 'FI.CNVG.FP.PROCUREMENT.OUTPUT',
            value: 'a66dead5-cb96-4190-ad52-f9c829823478',
            isUpdated: true,
          },
          amount: {
            key: 'FI.CNVG.FP.PROCUREMENT.%_ASSIGNED_AMOUNT',
            value: '100',
            isUpdated: true,
          },
        },
      ],
      lastModification: [
        {
          output: {
            key: 'FI.CNVG.FP.PROCUREMENT.OUTPUT',
            value: 'db4519ca-5ba4-4f82-bfb8-f3ce8e9c2e83',
            isUpdated: true,
          },
          amount: {
            key: 'FI.CNVG.FP.PROCUREMENT.%_ASSIGNED_AMOUNT',
            value: '100',
            isUpdated: true,
          },
        },
      ],
      modifiedBy: 'fiduciaryinterface_bp3',
      modified: '2023-02-27T16:20:19.26Z',
    },
    milestones: {
      name: null,
      previousValue: {
        milestones: [
          {
            code: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.MILESTONE',
              value: 31,
              isUpdated: false,
            },
            estimatedDate: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.ESTIMATED_DATE',
              value: '2023-03-24T22:41:01Z',
              isUpdated: false,
            },
            reEstimateDate: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.RE_ESTIMATED_DATE',
              value: null,
              isUpdated: false,
            },
            actualDate: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.ACTUAL_DATE',
              value: null,
              isUpdated: false,
            },
            order: {
              isUpdated: null,
              key: null,
              value: 1,
            },
          },
          {
            code: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.MILESTONE',
              value: 26,
              isUpdated: false,
            },
            estimatedDate: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.ESTIMATED_DATE',
              value: '2023-03-27T22:00:00Z',
              isUpdated: false,
            },
            reEstimateDate: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.RE_ESTIMATED_DATE',
              value: null,
              isUpdated: false,
            },
            actualDate: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.ACTUAL_DATE',
              value: null,
              isUpdated: false,
            },
            order: {
              isUpdated: null,
              key: null,
              value: 1,
            },
          },
          {
            code: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.MILESTONE',
              value: 5,
              isUpdated: false,
            },
            estimatedDate: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.ESTIMATED_DATE',
              value: '2023-03-28T22:00:00Z',
              isUpdated: false,
            },
            reEstimateDate: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.RE_ESTIMATED_DATE',
              value: null,
              isUpdated: false,
            },
            actualDate: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.ACTUAL_DATE',
              value: null,
              isUpdated: false,
            },
            order: {
              isUpdated: null,
              key: null,
              value: 1,
            },
          },
          {
            code: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.MILESTONE',
              value: 11,
              isUpdated: false,
            },
            estimatedDate: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.ESTIMATED_DATE',
              value: '2023-03-26T22:00:00Z',
              isUpdated: false,
            },
            reEstimateDate: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.RE_ESTIMATED_DATE',
              value: null,
              isUpdated: false,
            },
            actualDate: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.ACTUAL_DATE',
              value: null,
              isUpdated: false,
            },
            order: {
              isUpdated: null,
              key: null,
              value: 1,
            },
          },
          {
            code: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.MILESTONE',
              value: 0,
              isUpdated: false,
            },
            estimatedDate: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.ESTIMATED_DATE',
              value: '2023-03-25T22:00:00Z',
              isUpdated: false,
            },
            reEstimateDate: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.RE_ESTIMATED_DATE',
              value: null,
              isUpdated: false,
            },
            actualDate: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.ACTUAL_DATE',
              value: null,
              isUpdated: false,
            },
            order: {
              isUpdated: null,
              key: null,
              value: 1,
            },
          },
        ],
        modified: '',
        modifiedBy: '',
      },
      lastModification: {
        milestones: [
          {
            code: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.MILESTONE',
              value: 26,
              isUpdated: true,
            },
            estimatedDate: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.ESTIMATED_DATE',
              value: '2023-03-23T18:41:01Z',
              isUpdated: true,
            },
            reEstimateDate: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.RE_ESTIMATED_DATE',
              value: '2023-02-25T18:00:00Z',
              isUpdated: true,
            },
            actualDate: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.ACTUAL_DATE',
              value: null,
              isUpdated: true,
            },
            order: {
              isUpdated: null,
              key: null,
              value: 1,
            },
          },
          {
            code: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.MILESTONE',
              value: 5,
              isUpdated: true,
            },
            estimatedDate: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.ESTIMATED_DATE',
              value: '2023-03-24T18:00:00Z',
              isUpdated: true,
            },
            reEstimateDate: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.RE_ESTIMATED_DATE',
              value: '2023-02-25T18:50:00Z',
              isUpdated: true,
            },
            actualDate: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.ACTUAL_DATE',
              value: null,
              isUpdated: true,
            },
            order: {
              isUpdated: null,
              key: null,
              value: 1,
            },
          },
          {
            code: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.MILESTONE',
              value: 31,
              isUpdated: true,
            },
            estimatedDate: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.ESTIMATED_DATE',
              value: '2023-03-25T18:00:00Z',
              isUpdated: true,
            },
            reEstimateDate: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.RE_ESTIMATED_DATE',
              value: null,
              isUpdated: true,
            },
            actualDate: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.ACTUAL_DATE',
              value: null,
              isUpdated: true,
            },
            order: {
              isUpdated: null,
              key: null,
              value: 1,
            },
          },
          {
            code: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.MILESTONE',
              value: 0,
              isUpdated: true,
            },
            estimatedDate: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.ESTIMATED_DATE',
              value: '2023-03-26T18:00:00Z',
              isUpdated: true,
            },
            reEstimateDate: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.RE_ESTIMATED_DATE',
              value: '2023-02-25T18:00:00Z',
              isUpdated: true,
            },
            actualDate: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.ACTUAL_DATE',
              value: null,
              isUpdated: true,
            },
            order: {
              isUpdated: null,
              key: null,
              value: 1,
            },
          },
          {
            code: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.MILESTONE',
              value: 11,
              isUpdated: true,
            },
            estimatedDate: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.ESTIMATED_DATE',
              value: '2023-08-27T18:00:00Z',
              isUpdated: true,
            },
            reEstimateDate: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.RE_ESTIMATED_DATE',
              value: '2023-02-25T18:00:00Z',
              isUpdated: true,
            },
            actualDate: {
              key: 'FI.CNVG.FP.PROCUREMENT.PROCESS.ACTUAL_DATE',
              value: null,
              isUpdated: true,
            },
            order: {
              isUpdated: null,
              key: null,
              value: 1,
            },
          },
        ],
        modified: '',
        modifiedBy: '',
      },
      modifiedBy: 'fiduciaryinterface_bp3',
      modified: '2023-02-27T21:55:08.399Z',
    },
    lots: {
      name: 'null',
      previousValue: 'null',
      lastModification: 'null',
      modifiedBy: 'null',
      modified: 'null',
    },
    sepaID: {
      name: 'null',
      previousValue: 'null',
      lastModification: 'null',
      modifiedBy: 'null',
      modified: 'null',
    },
    bafo: {
      name: 'null',
      previousValue: 'null',
      lastModification: 'null',
      modifiedBy: 'null',
      modified: 'null',
    },
    goods: {
      name: 'null',
      previousValue: 'null',
      lastModification: 'null',
      modifiedBy: 'null',
      modified: 'null',
    },
  },
};
describe('HistoricChangesContainerComponent', () => {
  let component: HistoricChangesContainerComponent;
  let fixture: ComponentFixture<HistoricChangesContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HistoricChangesContainerComponent],
      imports: [
        PipeModule,
        MsalTestModule,
        HttpClientTestingModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        DatePipe,
        IFDatePipe,
        provideMockStore({
          initialState,
        }),
        EnumsStoreService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoricChangesContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('modifyMilestonesArray', () => {
    it('should transform the date fields and translate its name', () => {
      const expectedResponse: MilestoneChange[] = [
        {
          nameMilestone: 'Bid Opening Record (Technical)',
          modificationDate: '24 Feb 2020',
          modifiedBy: 'Test',
          estimatedDate: '24 Feb 2020',
          reestimatedDate: '24 Feb 2020',
          actualDate: '',
          codeMilestone: 2,
          order: 1,
        },
      ];

      const input: MilestoneChange[] = [
        {
          nameMilestone: '0',
          modificationDate: '2020-02-24T00:00:00',
          modifiedBy: 'Test',
          estimatedDate: '2020-02-24T00:00:00',
          reestimatedDate: '2020-02-24T00:00:00',
          actualDate: '',
          codeMilestone: 2,
          order: 1,
        },
      ];

      const response = component.modifyMilestonesArray(input);

      expect(response).toEqual(expectedResponse);
    });
  });

  describe('modifyComponentsArray', () => {
    it('Should modify the components array when choose previous values', () => {
      const isNewValues = false;
      const expectedResponse = {
        componentId: '1',
        componentName: 'Test previous',
        outputs: [
          {
            outputId: '1',
            outputName: 'Test previous output',
            modificationDate: '24 Feb 2020',
            modifiedBy: 'Test',
            percentageAssigned: 10,
          },
        ],
      };

      const response = component.modifyComponentsArray(
        componentsMock,
        isNewValues
      );

      expect(response).toEqual(expectedResponse);
    });

    it('Should modify the components array when choose new values', () => {
      const isNewValues = true;

      const expectedResponse = {
        componentId: '1',
        componentName: 'Test new',
        outputs: [
          {
            outputId: '2',
            outputName: 'Test new output',
            modificationDate: '24 Feb 2020',
            modifiedBy: 'Test',
            percentageAssigned: 10,
          },
        ],
      };

      const response = component.modifyComponentsArray(
        componentsMock,
        isNewValues
      );

      expect(response).toEqual(expectedResponse);
    });
  });

  describe('modifyProcessChanges', () => {
    it('should map the old and new values of the response after translate its contents', () => {
      const expectedResponse = [
        {
          modifiedBy: 'onlinebiddingprocess',
          updatedValue: 'PROCUREMENT.TEST',
          previousValue: 'Previous Test',
          newValue: 'New Test',
          modified: '24 Feb 2020',
        },
      ];

      const input = [
        {
          modifiedBy: 'onlinebiddingprocess',
          updatedValue: 'FI.CNVG.FP.PROCUREMENT.TEST',
          previousValue: 'Previous Test',
          newValue: 'New Test',
          modified: '2020-02-24T00:00:00',
        },
      ];

      const response = component.modifyProcessChanges(input);

      expect(response).toEqual(expectedResponse);
    });
  });

  describe('translateValue', () => {
    it('should translate and return the enum for CATEGORY', () => {
      const expectedResponse = 'Consulting Firms';
      const updatedKey = 'FI.CNVG.FP.PROCUREMENT.CATEGORY';
      const modifiedValue = '0';

      const response = component.translateValue(updatedKey, modifiedValue);

      expect(response).toEqual(expectedResponse);
    });

    it('should translate and return the enum for ACQUISITION_METHOD', () => {
      const expectedResponse = 'International Competitive Bidding';
      const updatedKey = 'FI.CNVG.FP.PROCUREMENT.ACQUISITION_METHOD';
      const modifiedValue = '0';

      const response = component.translateValue(updatedKey, modifiedValue);

      expect(response).toEqual(expectedResponse);
    });

    it('should translate and return the enum for MONITORING_METHOD', () => {
      const expectedResponse = 'Ex-ante';
      const updatedKey = 'FI.CNVG.FP.PROCUREMENT.MONITORING_METHOD';
      const modifiedValue = '0';

      const response = component.translateValue(updatedKey, modifiedValue);

      expect(response).toEqual(expectedResponse);
    });

    it('should translate and return the enum for SUSTAINABILITY_LABEL', () => {
      const expectedResponse = 'Economic considerations';
      const updatedKey =
        'FI.CNVG.FP.PROCUREMENT.SUSTAINABILITY.SUSTAINABILITY_LABEL';
      const modifiedValue = '0';

      const response = component.translateValue(updatedKey, modifiedValue);

      expect(response).toEqual(expectedResponse);
    });

    it('should translate and return the enum for GOODS_AND_SERVICES', () => {
      const expectedResponse = 'New';
      const updatedKey = 'FI.CNVG.FP.PROCUREMENT.GOODS_AND_SERVICES';
      const modifiedValue = '0';

      const response = component.translateValue(updatedKey, modifiedValue);

      expect(response).toEqual(expectedResponse);
    });
  });

  describe('map Data funcionality', () => {
    describe('extractMilestones', () => {
      it('should return only the modified milestone properties ', () => {
        const extractedMilestonesChanges = component.buildMilestoneObject(
          mockProcurementVersion
        );
        const expectedReturnedValue: MilestonesChanges = {
          modifiedMilestone: false,
          newMilestones: [
            {
              actualDate: null,
              codeMilestone: 26,
              estimatedDate: '2023-03-23T18:41:01Z',
              modificationDate: '',
              modifiedBy: '',
              nameMilestone: '',
              reestimatedDate: '2023-02-25T18:00:00Z',
              order: 1,
            },
            {
              actualDate: null,
              codeMilestone: 5,
              estimatedDate: '2023-03-24T18:00:00Z',
              modificationDate: '',
              modifiedBy: '',
              nameMilestone: '',
              reestimatedDate: '2023-02-25T18:50:00Z',
              order: 1,
            },
            {
              actualDate: null,
              codeMilestone: 31,
              estimatedDate: '2023-03-25T18:00:00Z',
              modificationDate: '',
              modifiedBy: '',
              nameMilestone: '',
              reestimatedDate: null,
              order: 1,
            },
            {
              actualDate: null,
              codeMilestone: 0,
              estimatedDate: '2023-03-26T18:00:00Z',
              modificationDate: '',
              modifiedBy: '',
              nameMilestone: '',
              reestimatedDate: '2023-02-25T18:00:00Z',
              order: 1,
            },
            {
              actualDate: null,
              codeMilestone: 11,
              estimatedDate: '2023-08-27T18:00:00Z',
              modificationDate: '',
              modifiedBy: '',
              nameMilestone: '',
              reestimatedDate: '2023-02-25T18:00:00Z',
              order: 1,
            },
          ],
          previousMilestones: [
            {
              actualDate: null,
              codeMilestone: 31,
              estimatedDate: '2023-03-24T22:41:01Z',
              modificationDate: '',
              modifiedBy: '',
              nameMilestone: '',
              reestimatedDate: null,
              order: 1,
            },
            {
              actualDate: null,
              codeMilestone: 26,
              estimatedDate: '2023-03-27T22:00:00Z',
              modificationDate: '',
              modifiedBy: '',
              nameMilestone: '',
              reestimatedDate: null,
              order: 1,
            },
            {
              actualDate: null,
              codeMilestone: 5,
              estimatedDate: '2023-03-28T22:00:00Z',
              modificationDate: '',
              modifiedBy: '',
              nameMilestone: '',
              reestimatedDate: null,
              order: 1,
            },
            {
              actualDate: null,
              codeMilestone: 11,
              estimatedDate: '2023-03-26T22:00:00Z',
              modificationDate: '',
              modifiedBy: '',
              nameMilestone: '',
              reestimatedDate: null,
              order: 1,
            },
            {
              actualDate: null,
              codeMilestone: 0,
              estimatedDate: '2023-03-25T22:00:00Z',
              modificationDate: '',
              modifiedBy: '',
              nameMilestone: '',
              reestimatedDate: null,
              order: 1,
            },
          ],
          updatedBy: 'fiduciaryinterface_bp3',
          updatedDate: '2023-02-27T21:55:08.399Z',
        };
        expect(extractedMilestonesChanges).toStrictEqual(expectedReturnedValue);
      });
    });
  });
});
