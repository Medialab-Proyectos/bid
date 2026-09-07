import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import {
  FiduciaryProcessDocument,
  FiduciaryProcessDocumentGroup,
} from '@core/models';
import { EventDocument } from '@fiduciary-interface/app/features/procurement/features/procurement-process/features/process-doc-packages/models/event-document.model';
import { DocumentGroupContractComponent } from './document-group-contract.components';

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

    it('check is return group', async () => {
      const { component, fixture } = await setup();
      component._groups = [];
      component.getMandatoryGroups();
      fixture.detectChanges();
      expect(typeof component.onChanged).toBe('boolean');
    });

    it('check is return group', async () => {
      const { component, fixture } = await setup();
      component._groups = mockGroups2;
      component.getMandatoryGroups();
      fixture.detectChanges();
      expect(typeof component.onChanged).toBe('boolean');
    });
  });
});

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

async function setup() {
  const { fixture } = await render(DocumentGroupContractComponent, {
    declarations: [],
    componentProperties: {
      groups: mockGroups,
    },
    imports: [
      TranslateTestingModule.withTranslations('en', {}).withDefaultLanguage(
        'en'
      ),
    ],
    schemas: [],
    providers: [],
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

const mockDocumentGroup4: FiduciaryProcessDocument[] = [
  {
    description: '',
    created: new Date('2022-01-14T13:13:55.8875668'),
    createdBy: '',
    ezshareNumber: '',
    groupCode: 45,
    id: 'fef1f954-896e-4773-b2cf-f05396776b7a',
    modified: new Date('2022-01-20T12:40:09.1702452'),
    name: 'CO-L1229-P18-BIDDINDG_DOC_NOTIFICATION_PRECUALIFICATION-RusoTest(1).docx',
    operationsDocumentId: null,
    relationalId: '5e7944a4-7777-4a75-b2b1-29ba99130387',
    status: 2,
    type: 2,
    biddingDocumentId: 'Testing',
  },
];

const mockDocumentGroup5: FiduciaryProcessDocument[] = [
  {
    description: '',
    created: new Date('2022-01-14T13:13:55.8875668'),
    createdBy: '',
    ezshareNumber: '',
    groupCode: 49,
    id: 'fef1f954-896e-4773-b2cf-f05396776b7a',
    modified: new Date('2022-01-20T12:40:09.1702452'),
    name: 'CO-L1229-P18-BIDDINDG_DOC_NOTIFICATION_PRECUALIFICATION-RusoTest(1).docx',
    operationsDocumentId: null,
    relationalId: '5e7944a4-7777-4a75-b2b1-29ba99130387',
    status: 2,
    type: 2,
    biddingDocumentId: 'Testing',
  },
];

const mockGroups2: FiduciaryProcessDocumentGroup[] = [
  {
    id: '1',
    groupCode: 1,
    isMandatory: true,
    fiduciaryProcessDocuments: [],
  },
  {
    id: '2',
    groupCode: 2,
    isMandatory: true,
    fiduciaryProcessDocuments: [],
  },
  {
    id: '3',
    groupCode: 3,
    isMandatory: false,
    fiduciaryProcessDocuments: mockDocumentGroup3,
  },
  {
    id: '4',
    groupCode: 45,
    isMandatory: true,
    fiduciaryProcessDocuments: mockDocumentGroup4,
  },
  {
    id: '5',
    groupCode: 49,
    isMandatory: true,
    fiduciaryProcessDocuments: mockDocumentGroup5,
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
