import {
  FiduciaryProcessDocument,
  FiduciaryProcessDocumentGroup,
} from '@core/models';

import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { of, throwError } from 'rxjs';
import { DocumentGroupSectionComponent } from './document-group-section.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  MatDialogProviders,
  mockNotificationService,
  MsalProviders,
} from '../../../../../../test/test-helpers';
import { NotificationService } from '@progress/kendo-angular-notification';
import { provideMockStore } from '@ngrx/store/testing';

describe('DocumentGroupSectionComponent', () => {
  describe('onEditFile', () => {
    it('should uploadDocument the document', async () => {
      const { component } = await setup();

      component.control.setValue(mockGroups);

      const spy = jest
        .spyOn(component.documentApi, 'setGeneralProcurementDocument')
        .mockReturnValue(throwError(''));
      component.documentsToUpload = documentsToUpload;

      jest.spyOn(component, 'getGroupIdByCode').mockReturnValue('1');

      component.onEditFile(editFileObject2);
      expect(spy).toHaveBeenCalled();
      expect(component.documentsToUpload.length).toBe(3);
    });

    it('should call changeGroupDocument', async () => {
      const { component } = await setup();

      component.control.setValue(mockGroups);

      const spy = jest
        .spyOn(component.documentApi, 'changeGroupOfDocument')
        .mockReturnValue(of(''));
      component.documentsToUpload = documentsToUpload;

      jest.spyOn(component, 'getGroupIdByCode').mockReturnValue('1');

      component.onEditFile(editFileObject1);
      expect(spy).toHaveBeenCalled();
    });
  });
});

async function setup() {
  const { fixture } = await render(DocumentGroupSectionComponent, {
    declarations: [],
    componentProperties: {
      groups: mockGroups,
      documentsToUpload: [],
      domain: 0,
    },
    imports: [
      HttpClientTestingModule,
      TranslateTestingModule.withTranslations('en', {}).withDefaultLanguage(
        'en'
      ),
    ],
    providers: [
      provideMockStore({}),
      ...MatDialogProviders,
      ...MsalProviders,
      { provide: NotificationService, useValue: mockNotificationService },
    ],
    schemas: [],
  });
  const component = fixture.componentInstance;
  return {
    fixture,
    component,
  };
}

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
    groupCode: 2,
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

const editFileObject1: any = {
  event: {
    groupId: 3,
    item: {
      created: new Date('2022-01-28T20:30:25.6696514'),
      createdBy: '',
      ezshareNumber: '',
      groupCode: 5,
      id: '9b7b5801-11eb-4f25-a6c9-b1a897261e14',
      modified: new Date('2022-01-28T20:30:25.6696077'),
      name: 'CO-L1229-P18-BIDDINDG_DOC_NOTIFICATION_PRECUALIFICATION-13-01-22.xlsx',
      needBeUploaded: false,
      operationsDocumentId: null,
      relationalId: 'f5fc74f8-7bab-429e-a8ac-067f9c95b7a0',
      status: 0,
      type: 2,
    },
  },
  parentId: '1630d0e6-49a9-4788-bb9a-fe968979140b',
};

const editFileObject2: any = {
  event: {
    groupId: 3,
    item: {
      created: new Date('2022-01-28T20:30:25.6696514'),
      createdBy: '',
      ezshareNumber: '',
      groupCode: 5,
      id: '9b7b5801-11eb-4f25-a6c9-b1a897261e14',
      modified: new Date('2022-01-28T20:30:25.6696077'),
      name: 'CO-L1229-P18-BIDDINDG_DOC_NOTIFICATION_PRECUALIFICATION-13-01-22.xlsx',
      needBeUploaded: true,
      operationsDocumentId: null,
      relationalId: 'f5fc74f8-7bab-429e-a8ac-067f9c95b7a0',
      status: 0,
      type: 2,
    },
  },
  parentId: '1630d0e6-49a9-4788-bb9a-fe968979140b',
};

let documentsToUpload: any[] = [
  {
    id: 'fef1f954-896e-4773-b2cf-f05396776b7a',
    name: '1 (1).docx',
  },
  {
    id: '9b7b5801-11eb-4f25-a6c9-b1a897261e14',
    name: 'CO-L1229-P18-13-01-23.xlsx',
  },
  {
    id: '2e8e3c15-710c-47aa-a793-25c402507bd3',
    name: 'CO-L1229-P18-13-01-24.xlsx',
  },
];
