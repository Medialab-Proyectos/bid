import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { render } from '@testing-library/angular';

import { DocumentGroupComponent } from './document-group.components';
import {
  BiddingProcessDocumentPackage,
  FiduciaryProcessDocument,
  FiduciaryProcessDocumentGroup,
} from '@core/models';

import { BiddingProcessProcurementProcessStatuses } from '@core/enums';
import { ActivatedRoute } from '@angular/router';
import {
  MatDialogProviders,
  mockActivatedRoute,
  mockDatePipe,
  mockNotificationService,
  MockTranslateEnumPipe,
  mockTranslateService,
  MsalProviders,
} from '../../../../../../test/test-helpers';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { NotificationService } from '@progress/kendo-angular-notification';
import { TranslateEnumPipe } from '../../../../pipes/translate-enum.pipe';
import { EventDocument } from '../../../../../features/procurement/features/procurement-process/features/process-doc-packages/models/event-document.model';

const document = {
  description: '',
  relationalId: 'string',
  id: 'string',
  status: 0,
  type: 0,
  operationsDocumentId: 0,
  ezshareNumber: 'string',
  name: 'string',
  created: new Date(),
  createdBy: 'string',
  modified: new Date(),
};

const eventDocument: EventDocument = {
  groupCode: 1,
  item: document,
  packageCode: 0,
};

describe('DocumentGroupComponent', () => {
  it('should render component correctly', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('writeValue', () => {
    it('should set the selected value IN is not undefined', async () => {
      const { component, fixture } = await setup();
      component.writeValue('value');
      fixture.detectChanges();

      expect(component.selected).toEqual('value');
    });

    it('should not set the selected value', async () => {
      const { component, fixture } = await setup();
      component.writeValue(null);
      fixture.detectChanges();

      expect(component.selected).toEqual('IN');
    });
  });

  describe('editFileAction', () => {
    it('should emit editFile', async () => {
      const { component, fixture } = await setup();

      jest.spyOn(component.editFile, 'emit');
      component.editFileAction(eventDocument);
      fixture.detectChanges();
      expect(component.editFile.emit).toHaveBeenCalled();
    });
  });

  describe('deleteFileAction', () => {
    it('should emit deleteFile', async () => {
      const { component, fixture } = await setup();

      jest.spyOn(component.deleteFile, 'emit');
      component.deleteFileAction(document);
      fixture.detectChanges();
      expect(component.deleteFile.emit).toHaveBeenCalled();
    });
  });

  describe('handlerFilesChanged', () => {
    it('should emit fileChange', async () => {
      const { component, fixture } = await setup();

      jest.spyOn(component.fileChange, 'emit');
      component.handlerFilesChanged(document);
      fixture.detectChanges();
      expect(component.fileChange.emit).toHaveBeenCalled();
    });
  });

  describe('check is AmendmendOrClarification', () => {
    it('check is registerOnTouched is fn', async () => {
      const { component, fixture } = await setup();

      component.registerOnTouched('texto');
      fixture.detectChanges();
      expect(component.onTouched).toMatch('texto');
    });

    it('check is registerOnChange is fn', async () => {
      const { component, fixture } = await setup();
      component.registerOnChange(false);
      fixture.detectChanges();
      expect(typeof component.onChanged).toBe('boolean');
    });
  });
});

async function setup() {
  const { fixture } = await render(DocumentGroupComponent, {
    declarations: [],
    componentProperties: {
      groups: mockGroups,
      docPackage: docPackage,
      procurementProcess: {
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
        order: 0,
      },
    },
    imports: [HttpClientTestingModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    providers: [
      { provide: ActivatedRoute, useValue: mockActivatedRoute },
      { provide: TranslateService, useValue: mockTranslateService },
      { provide: DatePipe, useValue: mockDatePipe },
      { provide: NotificationService, useValue: mockNotificationService },
      { provide: TranslateEnumPipe, useValue: MockTranslateEnumPipe },
      ...MsalProviders,
      ...MatDialogProviders,

      provideMockStore({}),
    ],
  });
  const component = fixture.componentInstance;
  return {
    fixture,
    component,
  };
}

const docPackage: BiddingProcessDocumentPackage = {
  actualDate: null,
  biddingProcessDocumentGroups: [
    {
      documentGroupCode: 0,
      documentGroupConfiguration: {
        disclosureRequiredAmount: false,
        id: '313181ba-80e4-402e-848a-211d84980950',
        isAmendment: false,
        isAutogenerated: true,
        isClarification: false,
        isDisclosed: false,
        isMandatory: true,
        isResult: false,
        isUniqueDocument: true,
        result: 0,
        visibility: 1,
        systemUpload: false,
        isMandatoryPublication: null,
      },
      documentsState: { loading: false },
      fiduciaryProcessDocuments: [
        {
          description: '',
          created: new Date('2021-12-15T19:39:07.9939219'),
          createdBy: '',
          ezshareNumber: '',
          groupCode: 0,
          id: 'b8540300-de57-4d68-9e24-567193af0ea0',
          modified: new Date('2021-12-15T19:39:54.4722004'),
          name: 'CO-L1229-P18-BIDDINDG_DOC_PREQUALIFICATION-FIDUCIARY_CONFIGURATIONS_V5.xlsx',
          operationsDocumentId: null,
          relationalId: '8703425b-3f16-4d2f-95f8-4dbcf9348e56',
          status: 1,
          type: 2,
        },
        {
          description: '',
          created: new Date('2021-12-20T18:03:47.0317602'),
          createdBy: '',
          ezshareNumber: '',
          groupCode: 0,
          id: '9de71919-e8c8-44c1-9199-e281107fc367',
          modified: new Date('2021-12-23T20:13:35.9512905'),
          name: 'CO-L1229-P18-BIDDINDG_DOC_PREQUALIFICATION-Actuaciones_1696566 (5).xls',
          operationsDocumentId: null,
          relationalId: '32eaa2d7-b5a5-4dda-8ef0-f7159dab2f4a',
          status: 1,
          type: 2,
        },
      ],
      id: '2793940e-42c2-432f-8da5-3225547013c5',
    },
    {
      documentGroupCode: 1,
      documentGroupConfiguration: {
        disclosureRequiredAmount: false,
        id: '2802596b-d277-47c8-8b7f-089d499275b9',
        isAmendment: true,
        isAutogenerated: true,
        isClarification: false,
        isDisclosed: false,
        isMandatory: true,
        isResult: false,
        isUniqueDocument: true,
        result: 0,
        visibility: 1,
        systemUpload: false,
        isMandatoryPublication: null,
      },
      documentsState: { loading: false },
      fiduciaryProcessDocuments: [
        {
          description: '',
          created: new Date('2022-02-10T15:38:57.4665326'),
          createdBy: '',
          ezshareNumber: 'EZTEST-1654199927-842',
          groupCode: 1,
          id: '77ea0625-fa6c-43e1-89bf-8b3811407c85',
          modified: new Date('2022-02-17T17:25:24.3559133'),
          name: 'CO-L1229-P18-BIDDINDG_DOC_INVITATION-FIDUCIARY_CONFIGURATIONS_V5.xlsx',
          operationsDocumentId: null,
          relationalId: '1281cbcb-e38e-4e88-af9e-5ab24980b3b3',
          status: 3,
          type: 2,
        },
        {
          description: '',
          created: new Date('2021-12-15T19:39:26.0071326'),
          createdBy: '',
          ezshareNumber: 'EZTEST-130319487-47',
          groupCode: 1,
          id: '7159e37a-3967-4875-b234-2de09a6bba5c',
          modified: new Date('2021-12-22T16:15:36.6644278'),
          name: 'CO-L1229-P18-BIDDINDG_DOC_OTHER-FIDUCIARY_CONFIGURATIONS_V5 (1).xlsx',
          operationsDocumentId: null,
          relationalId: '3b5a59ac-8103-4c77-8928-bc69b345951f',
          status: 3,
          type: 2,
        },
      ],
      id: 'ea536ef4-044b-45df-bb8f-3b082ffb5c32',
    },
  ],
  code: 0,
  documentsState: { loading: false },
  groupsState: { loading: false },
  id: '7c9cffaa-7877-438b-9512-0e608a57e2a4',
  order: 3,
  requireNonObjection: false,
  status: 1,
  totalComments: 0,
  totalMandatoryDocuments: 2,
  totalUploadedDocuments: 1,
  documentsToUpload: [],
  bidValidityExtensionDate: new Date(),
};

const mockDocumentGroup1: FiduciaryProcessDocument[] = [
  {
    description: '',
    created: new Date('2022-01-28T20:30:25.6696514'),
    createdBy: '',
    ezshareNumber: '',
    groupCode: 5,
    id: '9b7b5801-11eb-4f25-a6c9-b1a897261e14',
    modified: new Date('2022-01-28T20:30:25.6696077'),
    name: 'CO-L1229-P18-BIDDINDG_DOC_NOTIFICATION_PRECUALIFICATION-13-01-22.xlsx',
    operationsDocumentId: null,
    relationalId: 'f5fc74f8-7bab-429e-a8ac-067f9c95b7a0',
    status: 0,
    type: 2,
  },
];

const mockDocumentGroup2: FiduciaryProcessDocument[] = [
  {
    description: '',
    created: new Date('2022-02-03T16:34:42.2066912'),
    createdBy: '',
    ezshareNumber: '',
    groupCode: 5,
    id: '2e8e3c15-710c-47aa-a793-25c402507bd3',
    modified: new Date('2022-02-03T16:34:42.2064737'),
    name: 'CO-L1229-P18-BIDDINDG_DOC_PREQUALIFICATION_REPORT-CO-L1229-P18-BIDDINDG_DOC_NOTIFICATION_PRECUALIFICATION-12-01-22.xlsx',
    operationsDocumentId: null,
    relationalId: '1eae3221-084f-4e27-abce-2310796ee66a',
    status: 0,
    type: 2,
  },
];

const mockDocumentGroup3: FiduciaryProcessDocument[] = [
  {
    description: '',
    created: new Date('2022-01-14T13:13:55.8875668'),
    createdBy: '',
    ezshareNumber: '',
    groupCode: 5,
    id: 'fef1f954-896e-4773-b2cf-f05396776b7a',
    modified: new Date('2022-01-20T12:40:09.1702452'),
    name: 'CO-L1229-P18-BIDDINDG_DOC_NOTIFICATION_PRECUALIFICATION-RusoTest(1).docx',
    operationsDocumentId: null,
    relationalId: '5e7944a4-7777-4a75-b2b1-29ba99130387',
    status: 2,
    type: 2,
  },
];

const mockGroups: FiduciaryProcessDocumentGroup[] = [
  {
    id: '1',
    groupCode: 1,
    isMandatory: true,
    fiduciaryProcessDocuments: mockDocumentGroup1,
  },
  {
    id: '2',
    groupCode: 45,
    isMandatory: true,
    fiduciaryProcessDocuments: mockDocumentGroup2,
  },
  {
    id: '3',
    groupCode: 3,
    isMandatory: false,
    fiduciaryProcessDocuments: mockDocumentGroup3,
  },
];
