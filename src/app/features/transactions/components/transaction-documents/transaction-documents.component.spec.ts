import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import {
  FiduciaryProcessDocumentObj,
  GetFiduciaryProcessDocumentsIdResponse,
} from '@core/models';
import {
  DocumentsModule,
  LoaderModule,
  NotificationModule,
  PipeModule,
} from '@fiduciary-interface/app/shared';
import { DirectivesModule } from '@fiduciary-interface/app/shared/directives/directives.module';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslatePipe } from '@ngx-translate/core';
import { IconsModule } from '@progress/kendo-angular-icons';
import { LayoutModule } from '@progress/kendo-angular-layout';
import {
  NotificationService,
  NOTIFICATION_CONTAINER,
} from '@progress/kendo-angular-notification';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { of, throwError } from 'rxjs';
import { TransactionsTypes } from '../../enums';
import {
  TransactionDocumentGroup,
  TransactionDocumentGroupResponse,
  TransactionEventDocument,
} from '../../models';
import { TransactionDocumentsComponent } from './transaction-documents.component';

describe('TransactionDocumentsComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('onEditDocumentEvent', () => {
    it('should call changeGroupOfDocument when document already has an ID', async () => {
      const { component, fixture } = await setup();

      const modifyDocumentSpy = jest
        .spyOn(component.documentApi, 'changeGroupOfDocument')
        .mockReturnValue(of({}));

      component.onEditDocumentEvent({
        document: mockDocuments[0],
        documentGroupCode: 17,
      });

      fixture.detectChanges();
      expect(modifyDocumentSpy).toHaveBeenCalled();
    });

    it('should call errorMessage when throw error', async () => {
      const { component } = await setup();

      const doc: TransactionEventDocument = {
        document: mockDocuments[0],
        documentGroupCode: 17,
      };

      const errorMessageSpy = jest.spyOn(component, 'errorMessage');
      jest
        .spyOn(component.documentApi, 'changeGroupOfDocument')
        .mockReturnValue(throwError('error'));

      component.modifyDocument(doc);

      expect(errorMessageSpy).toHaveBeenCalled();
    });
  });

  describe('onDeleteDocumentEvent', () => {
    it('should call deleteGeneralProcurementDocument when deleting a document', async () => {
      const { component, fixture } = await setup();

      const deleteDocumentSpy = jest
        .spyOn(component.documentApi, 'deleteGeneralProcurementDocument')
        .mockReturnValue(of({}));

      component.onDeleteDocumentEvent(mockDocuments[1]);

      fixture.detectChanges();
      expect(deleteDocumentSpy).toHaveBeenCalled();
    });
  });

  describe('getDocuments', () => {
    it('should call getFiduciaryProcessDocuments', async () => {
      const { component } = await setup();

      const response: GetFiduciaryProcessDocumentsIdResponse = {
        fiduciaryProcessDocuments: [mockDocuments[0]],
        parentId: '123',
      };

      jest
        .spyOn(component.documentsApi, 'getFiduciaryProcessDocuments')
        .mockReturnValue(of(response));

      component
        .getDocuments(mockDocumentGroups[0])
        .subscribe((data) => expect(data).toEqual(response));
    });
  });

  describe('getPopulatedDocuments', () => {
    it('should call getFiduciaryProcessDocuments', async () => {
      const { component } = await setup();

      const response: GetFiduciaryProcessDocumentsIdResponse = {
        fiduciaryProcessDocuments: [mockDocuments[0]],
        parentId: '123',
      };

      jest
        .spyOn(component.documentsApi, 'getFiduciaryProcessDocuments')
        .mockReturnValue(of(response));

      component
        .getPopulatedDocuments(mockDocumentGroups[0])
        .subscribe((data) => expect(data).toEqual(response));
    });
  });

  describe('getDocumentGroups', () => {
    it('should return an observable of TransactionDocumentGroup[]', async () => {
      const { component } = await setup();

      const response: TransactionDocumentGroupResponse = {
        transactionsDocumentGroups: mockDocumentGroups,
      };

      jest
        .spyOn(component.transactionsApi, 'getDocumentGroups')
        .mockReturnValue(of(response));

      component
        .getDocumentGroups(1, TransactionsTypes.ANJ)
        .subscribe((data) => expect(data).toEqual(response));
    });
  });
});

const initialState = {
  preferences: {
    selectedLanguage: {
      code: 'en',
      name: 'English',
    },
    loaded: true,
  },
};

async function setup() {
  const { fixture } = await render(TransactionDocumentsComponent, {
    declarations: [TransactionDocumentsComponent],
    componentProperties: {
      documentGroups: mockDocumentGroups,
      documents: mockDocuments,
      domain: 5,
    },
    imports: [
      MsalTestModule,
      PipeModule,
      DirectivesModule,
      NoopAnimationsModule,
      LayoutModule,
      IconsModule,
      FormsModule,
      LoaderModule,
      DocumentsModule,
      HttpClientTestingModule,
      NotificationModule,
      RouterTestingModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    providers: [
      NotificationService,
      TranslatePipe,
      provideMockStore({ initialState }),
      {
        provide: NOTIFICATION_CONTAINER,
        useFactory: () => {
          return { nativeElement: document.body } as ElementRef;
        },
      },
    ],
    schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
  });
  const component = fixture.componentInstance;
  return {
    fixture,
    component,
  };
}

const mockDocuments: FiduciaryProcessDocumentObj[] = [
  {
    description: '',
    id: 'c07b2c70-190b-467b-bef7-f26eba026668',
    relationalId: 'k17b2c70-190b-467b-bef7-f26eba026668',
    status: 2,
    type: 1,
    operationsDocumentId: 1,
    ezshareNumber: '111666',
    name: 'DOC_PRUEBA_FELIPE_ORTIZ',
    created: new Date('2022-05-25T17:05:37.6466667'),
    createdBy: 'FORTIZ',
    modified: new Date('2022-05-25T17:05:37.6466667'),
  },
  {
    description: '',
    id: 'c07b2c70-190b-467b-bef7-f26eba026668',
    relationalId: 'c07b2c70-190b-467b-bef7-f26eba026668',
    status: 2,
    type: 1,
    operationsDocumentId: 1,
    ezshareNumber: '111666',
    name: 'DOC_PRUEBA_2_FELIPE_ORTIZ',
    created: new Date('2022-05-25T17:05:37.6466667'),
    createdBy: 'FORTIZ',
    modified: new Date('2022-05-25T17:05:37.6466667'),
  },
  {
    description: '',
    id: null,
    relationalId: String(),
    status: 0,
    type: 0,
    operationsDocumentId: 0,
    ezshareNumber: String(),
    name: 'DOC_PRUEBA_3_FELIPE_ORTIZ',
    created: new Date('2022-05-25T17:05:37.6466667'),
    createdBy: 'FORTIZ',
    modified: new Date('2022-05-25T17:05:37.6466667'),
  },
];

const mockDocumentGroups: TransactionDocumentGroup[] = [
  {
    id: 'la7b2c70-190b-467h-bef7-k26asd026000',
    documentGroupCode: 1,
    isMandatory: false,
    documents: [{ ...mockDocuments[0] }],
    isCanDuplicated: false,
    systemGenerated: false,
    order: 1,
  },
  {
    id: 'ga7t6c70-170b-457h-jef7-m26asd088001',
    documentGroupCode: 5,
    isMandatory: false,
    documents: [{ ...mockDocuments[1] }],
    isCanDuplicated: false,
    systemGenerated: false,
    order: 1,
  },
  {
    id: 'uy7u6c09-980l-137n-kof7-m26asd661201',
    documentGroupCode: 17,
    isMandatory: false,
    documents: [],
    isCanDuplicated: false,
    systemGenerated: false,
    order: 1,
  },
];
