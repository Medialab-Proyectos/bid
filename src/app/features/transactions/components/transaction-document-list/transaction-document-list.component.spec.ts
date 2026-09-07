import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { provideMockStore } from '@ngrx/store/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { enumsInitialState } from '@core/store';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NotificationService } from '@progress/kendo-angular-notification';
import { RouterTestingModule } from '@angular/router/testing';
import { DirectivesModule } from '@fiduciary-interface/app/shared/directives/directives.module';

import { TransactionDocumentListComponent } from './transaction-document-list.component';
import { TranslateEnumPipe } from '@fiduciary-interface/app/shared/pipes/translate-enum.pipe';
import { FiduciaryProcessDocumentObj } from '@core/models';
import { of, throwError } from 'rxjs';
import { LoaderModule } from '@fiduciary-interface/app/shared';
import { TransactionDocumentGroup } from '../../models';
import { FormsModule } from '@angular/forms';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';

describe('TransactionDocumentListComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the document name correctly', async () => {
    await setup();
    expect(screen.getByText(/DOC_PRUEBA_FELIPE_ORTIZ/)).toBeInTheDocument();
  });

  it('should display delete button', async () => {
    const { fixture } = await setup();
    const someElement =
      fixture.nativeElement.querySelector('#Btn_Delete_doc_1');
    expect(someElement).not.toBe(null);
  });

  describe('downloadDocument', () => {
    it('should call downloadDocument', async () => {
      const { component, fixture } = await setup();

      const donwloadDocumentSpy = jest
        .spyOn(component.fileServices, 'downloadFile')
        .mockReturnValue(of(new ArrayBuffer(0)));
      const fileSaverSpy = jest
        .spyOn(component.fileSaverService, 'save')
        .mockReturnValue();

      component.downloadDocument(mockDocuments[0]);
      fixture.detectChanges();

      expect(donwloadDocumentSpy).toHaveBeenCalled();
      expect(fileSaverSpy).toHaveBeenCalled();
    });

    it('should show error msg when has an error donwloadDocument', async () => {
      const { component } = await setup();

      jest.spyOn(component.fileServices, 'downloadFile').mockReturnValue(
        throwError({
          error: {
            error: 'error',
          },
        })
      );
      const showErrorSpy = jest
        .spyOn(component.transactionFormService, 'showErrorToast')
        .mockReturnValue();
      component.downloadDocument(mockDocuments[0]);

      expect(showErrorSpy).toHaveBeenCalled();
    });
  });

  describe('onChangeDocumentType', () => {
    it('should emit event when a group has been selected', async () => {
      const { component, fixture } = await setup();

      const emitSpy = jest.spyOn(component.editDocumentEvent, 'emit');
      component.onChangeDocumentType(0, mockDocuments[0]);
      fixture.detectChanges();

      expect(emitSpy).toHaveBeenCalled();
    });
  });

  describe('onDeleteDocument', () => {
    it('should emit event when a detele button has been pressed', async () => {
      const { component, fixture } = await setup();

      const deleteSpy = jest.spyOn(component.deleteDocumentEvent, 'emit');
      component.onDeleteDocument(mockDocuments[0]);
      fixture.detectChanges();

      expect(deleteSpy).toHaveBeenCalled();
    });
  });

  describe('rollBackSelectedGroup', () => {
    it('should set dropdownValue with the values of the file.groupCode of the parameter', async () => {
      const { component, fixture } = await setup();

      component.rollBackSelectedGroup(mockDocuments[0]);
      fixture.detectChanges();

      expect(component.dropdownValue[0]).toBe(mockDocuments[0].groupCode);
    });
  });

  describe('removeSelectedGroup', () => {
    it('should filter documents with the parameter received in the function', async () => {
      const { component, fixture } = await setup();
      component.documents = mockDocuments;

      component.removeSelectedGroup(mockDocuments[0]);
      fixture.detectChanges();

      expect(component.documents[0].groupCode).toBe(null);
    });
  });

  describe('itemDisabled', () => {
    it('should return true when the item is systemGenerated', async () => {
      const { component } = await setup();

      const item: {
        dataItem: TransactionDocumentGroup;
        index: number;
      } = {
        dataItem: {
          documentGroupCode: 1,
          id: '1',
          isCanDuplicated: true,
          isMandatory: true,
          order: 1,
          systemGenerated: true,
        },
        index: 1,
      };

      expect(component.itemDisabled(item)).toBe(true);
    });
  });
});

async function setup() {
  const initialState = getInitialState();
  const { fixture } = await render(TransactionDocumentListComponent, {
    declarations: [TransactionDocumentListComponent, TranslateEnumPipe],
    componentProperties: {
      documents: mockDocuments,
    },
    schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    imports: [
      MsalTestModule,
      FormsModule,
      DirectivesModule,
      DropDownsModule,
      HttpClientTestingModule,
      LoaderModule,
      RouterTestingModule.withRoutes([]),
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../assets/i18n/en.json')
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
  enumsState.transactionDocumentGroupCodes = [
    { id: 1, name: 'Group code 1' },
    { id: 2, name: 'Group code 2' },
  ];
  return {
    enums: enumsState,
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
    id: 'c07b2c70-190b-467b-bef7-f26eba026669',
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
];
