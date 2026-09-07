import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { DocEnum } from '@core/enums';
import {
  Enums,
  FiduciaryProcessDocument,
  FiduciaryProcessDocumentGroup,
} from '@core/models';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { DocumentGroupSectionContractComponent } from './document-group-section-contract.component';
import { EnumState, enumsInitialState } from '@core/store';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NotificationService } from '@progress/kendo-angular-notification';
import {
  MatDialogProviders,
  mockNotificationService,
  MsalProviders,
} from '../../../../../../test/test-helpers';
import { provideMockStore } from '@ngrx/store/testing';

const mockEnumState: EnumState = enumsInitialState;

describe('DocumentGroupSectionContractComponent', () => {
  describe('getGroupIdByCode', () => {
    const groups = [
      { groupCode: 1, id: 'group-1' },
      { groupCode: 2, id: 'group-2' },
      { groupCode: 3, id: 'group-3' },
    ];
    it('should return the correct group ID', async () => {
      const { component } = await setup();
      component.control.setValue(groups);
      const code = 2;
      const expectedId = 'group-2';
      const result = component.getGroupIdByCode(code);
      expect(result).toEqual(expectedId);
    });

    it('should throw an error if group code not found', async () => {
      const { component } = await setup();
      component.control.setValue(groups);
      const code = 4;
      expect(() => component.getGroupIdByCode(code)).toThrowError();
    });
  });
  describe('getGroupById', () => {
    const mockGroups = [
      {
        id: 'group1',
        name: 'Group 1',
        groupCode: 1,
      },
      {
        id: 'group2',
        name: 'Group 2',
        groupCode: 2,
      },
      {
        id: 'group3',
        name: 'Group 3',
        groupCode: 3,
      },
    ];
    it('should return the correct group based on its id', async () => {
      const { component } = await setup();
      component.control.setValue(mockGroups);

      const expectedGroup = {
        id: 'group2',
        name: 'Group 2',
        groupCode: 2,
      };

      const actualGroup = component.getGroupById('group2');

      expect(actualGroup).toEqual(expectedGroup);
    });

    it('should return undefined when no group is found with the given id', async () => {
      const { component } = await setup();

      component.control.setValue(mockGroups);

      const actualGroup = component.getGroupById('invalid-id');

      expect(actualGroup).toBeUndefined();
    });
  });

  describe('checkAllDataNeeded', () => {
    it('should set the correct enum value if all data is loaded and mode is CONTRACTS', async () => {
      const { component } = await setup();
      const data: EnumState = {
        ...mockEnumState,
        enumsLoaded: {
          [Enums.biddingContractDocumentGroupCodes]: true,
          [Enums.biddingContractAmendmentDocumentGroupCodes]: true,
          [Enums.biddingProcessDocumentPackageStatuses]: true,
          [Enums.biddingProcessDocumentGroupCodes]: true,
        },
        biddingContractDocumentGroupCodes: [
          {
            id: 1,
            name: 'code1',
          },
        ],
      };
      component.mode = DocEnum.CONTRACTS;
      component.checkAllDataNeeded(data);
      expect(component.enumBiddingProcessDocumentGroupCodes).toEqual([
        {
          id: 1,
          name: 'code1',
        },
      ]);
    });

    it('should set the correct enum value if all data is loaded and mode is AMENDMENTS', async () => {
      const { component } = await setup();
      const data = {
        ...mockEnumState,
        enumsLoaded: {
          [Enums.biddingContractDocumentGroupCodes]: true,
          [Enums.biddingContractAmendmentDocumentGroupCodes]: true,
          [Enums.biddingProcessDocumentPackageStatuses]: true,
          [Enums.biddingProcessDocumentGroupCodes]: true,
        },
        biddingContractAmendmentDocumentGroupCodes: [
          {
            id: 1,
            name: '',
          },
        ],
      };
      component.mode = DocEnum.AMENDMENTS;
      component.checkAllDataNeeded(data);
      expect(component.enumBiddingProcessDocumentGroupCodes).toEqual([
        {
          id: 1,
          name: '',
        },
      ]);
    });

    it('should not set the enum value if all data is not loaded', async () => {
      const { component } = await setup();
      const data = {
        ...mockEnumState,
        enumsLoaded: {
          [Enums.biddingContractDocumentGroupCodes]: true,
          [Enums.biddingContractAmendmentDocumentGroupCodes]: false,
          [Enums.biddingProcessDocumentPackageStatuses]: true,
          [Enums.biddingProcessDocumentGroupCodes]: true,
        },
        biddingContractAmendmentDocumentGroupCodes: 'enumValue',
      };
      component.mode = DocEnum.AMENDMENTS;
      component.checkAllDataNeeded(data);
      expect(component.enumBiddingProcessDocumentGroupCodes).toBeUndefined();
    });
  });

  describe('errorToast', () => {
    it('should call errorMessage method with duplicateErrorMessage if error status is 500', async () => {
      const { component } = await setup();
      const error = { status: 500 };
      const errorMessageSpy = jest.spyOn(component, 'errorMessage');

      component.errorToast(error);

      expect(errorMessageSpy).toHaveBeenCalledWith(
        'SHARED.DOCUMENT.PROCESS_DOC.DOCUMENT_MESSAGES.DUPLICATE_ERROR'
      );
    });

    it('should call errorMessage method with upload error message if error status is not 500', async () => {
      const { component } = await setup();
      const error = { status: 400 };
      const errorMessageSpy = jest.spyOn(component, 'errorMessage');

      component.errorToast(error);

      expect(errorMessageSpy).toHaveBeenCalledWith(
        'PROCESS_DOC.DOCUMENT_TAB.DOCUMENT_MESSAGES.UPLOAD_ERROR'
      );
    });
  });

  describe('onFileChange', () => {
    const fakeFile = new File([''], 'test-file.pdf', {
      type: 'application/pdf',
    });
    it('should add files to documentsToUpload', async () => {
      const { component } = await setup();
      component.control.setValue([]);
      const event = { files: [fakeFile] };
      component.onFileChange(event);

      expect(component.documentsToUpload.length).toBe(1);
      expect(component.documentsToUpload[0].name).toBe('test-file.pdf');
    });

    it('should show an error message if file with same name already exists', async () => {
      const { component } = await setup();
      component.control.setValue([]);
      component.documentsToUpload = [
        {
          description: '',
          id: 'abc123',
          relationalId: 'def456',
          status: 0,
          type: 0,
          operationsDocumentId: 0,
          ezshareNumber: '',
          name: 'test-file.pdf',
          created: new Date(),
          createdBy: '',
          modified: new Date(),
          file: fakeFile,
          needBeUploaded: true,
          groupCode: null,
        },
      ];
      const event = { files: [fakeFile] };
      component.onFileChange(event);

      expect(component.documentsToUpload.length).toBe(1);
    });

    it('should show an error message if no files are selected', async () => {
      const { component } = await setup();
      const event = { files: [] };
      component.control.setValue([]);
      const spy = jest.spyOn(component, 'errorMessage');
      component.onFileChange(event);

      expect(spy).toHaveBeenCalled();
    });
  });
});

async function setup() {
  const { fixture } = await render(DocumentGroupSectionContractComponent, {
    declarations: [],
    componentProperties: {
      groups: mockGroups,
      documentsToUpload: [],
      domain: 0,
    },
    imports: [
      TranslateTestingModule.withTranslations('en', {}).withDefaultLanguage(
        'en'
      ),
      HttpClientTestingModule,
    ],
    providers: [
      {
        provide: NotificationService,
        useValue: mockNotificationService,
      },
      provideMockStore({}),
      ...MsalProviders,
      ...MatDialogProviders,
    ],
    schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
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
