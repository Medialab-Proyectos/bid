import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentItemComponent } from './document-item.component';
import { DocumentStateTagComponent } from '../document-state-tag/document-state-tag.component';
import { FiduciaryProcessDocumentsStatuses } from '@core/enums';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { CommonModule, DatePipe } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { ChangeDetectorRef } from '@angular/core';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { provideWindowSizeMock } from '@fiduciary-interface-test';
import { TranslatePipe } from '@ngx-translate/core';
import {
  NotificationGlobalService,
  PipeModule,
} from '@fiduciary-interface/app/shared';
import { DocumentsPermissions, FiduciaryProcessDocument } from '@core/models';
import { DirectivesModule } from '@fiduciary-interface/app/shared/directives/directives.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { provideMockStore } from '@ngrx/store/testing';

const notificationGlobalSvcMock = {
  showError: jest.fn(),
  showSuccess: jest.fn(),
};
describe('DocumentItemComponent', () => {
  let component: DocumentItemComponent;
  let fixture: ComponentFixture<DocumentItemComponent>;

  const mockedDocumentItem: FiduciaryProcessDocument = {
    description: '',
    relationalId: '123',
    id: '123',
    status: FiduciaryProcessDocumentsStatuses.draftUploadedBlobStorage,
    type: 0,
    operationsDocumentId: 4,
    ezshareNumber: 'EZSHARE-12345-67',
    name: 'GPN_2229-OC-CO_2021.pdf',
    created: new Date(),
    createdBy: 'Juan Chavez',
    modified: new Date(),
    groupCode: 0,
  };

  let pipe = new DatePipe('en');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DocumentItemComponent, DocumentStateTagComponent],
      imports: [
        MsalTestModule,
        DirectivesModule,
        CommonModule,
        HttpClientTestingModule,
        DropDownsModule,
        ButtonsModule,
        StoreModule.forRoot({}),
        PipeModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../assets/i18n/en.json')
        ),
      ],
      providers: [
        ChangeDetectorRef,
        TranslatePipe,
        DatePipe,
        provideWindowSizeMock({ mobileView: false }),
        provideMockStore({ initialState }),
        {
          provide: NotificationGlobalService,
          useValue: notificationGlobalSvcMock,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.data = mockedDocumentItem;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should see the correct document publish date', () => {
    const rendered = fixture.nativeElement;
    fixture.detectChanges();
    const publishDate: HTMLSpanElement = rendered.querySelector(
      '.qa-document-publishDate'
    );
    expect(publishDate.innerHTML).toEqual(
      pipe.transform(mockedDocumentItem.created, 'dd MMM y')
    );
  });

  it('should see the correct document publisher', () => {
    const rendered = fixture.nativeElement;
    fixture.detectChanges();
    const publisherName: HTMLSpanElement = rendered.querySelector(
      '.qa-document-publisherName'
    );
    expect(publisherName.innerHTML).toEqual(mockedDocumentItem.createdBy);
  });

  it('should see the correct document update date', () => {
    const rendered = fixture.nativeElement;
    fixture.detectChanges();
    const updateDate: HTMLSpanElement = rendered.querySelector(
      '.qa-document-updateDate'
    );
    expect(updateDate.innerHTML).toEqual(
      pipe.transform(mockedDocumentItem.modified, 'dd MMM y')
    );
  });

  it('should see the correct ezsharenumber', () => {
    const rendered = fixture.nativeElement;
    fixture.detectChanges();
    const ezsharenumber: HTMLSpanElement = rendered.querySelector(
      '.qa-document-ezShareId'
    );
    expect(ezsharenumber.innerHTML).toContain(mockedDocumentItem.ezshareNumber);
  });

  it('should trigger the download Event', () => {
    jest.spyOn(component.downloadDocEmitter, 'emit');
    component.downloadAction();
    expect(component.downloadDocEmitter.emit).toHaveBeenCalled();
  });

  describe('previewAction', () => {
    it('should emit true', () => {
      const spy = jest
        .spyOn(component.previewDocEmitter, 'emit')
        .mockImplementation();
      component.previewAction();
      expect(spy).toHaveBeenCalledWith(true);
    });
  });

  describe('deleteAction', () => {
    it('should emit the data', () => {
      component.data = { ...fiduciaryProcessDoc };
      const spy = jest
        .spyOn(component.deleteDocEmitter, 'emit')
        .mockImplementation();
      component.deleteAction();
      expect(spy).toHaveBeenCalledWith(fiduciaryProcessDoc.id);
    });
  });

  describe('initPermissions', () => {
    //used toString to compare
    it('should set itemMenu with preview', () => {
      const permissions: DocumentsPermissions = {
        replace: false,
        delete: false,
        download: false,
      };
      component.permissions = permissions;
      component.initPermissions();
      const expectedItemMenu = [
        {
          actionName: 'SHARED.DOCUMENT.PREVIEW',
          click: () => component.previewAction(),
        },
      ];

      expect(component.itemMenu.toString()).toEqual(
        expectedItemMenu.toString()
      );
    });

    it('should set itemMenu with preview and download', () => {
      const permissions: DocumentsPermissions = {
        replace: false,
        delete: false,
        download: true,
      };
      component.permissions = permissions;
      component.initPermissions();
      const expectedItemMenu = [
        {
          actionName: 'SHARED.DOCUMENT.PREVIEW',
          click: () => component.previewAction(),
        },
        {
          actionName: 'SHARED.DOCUMENT.DOWNLOAD',
          click: () => component.downloadAction(),
        },
      ];

      expect(component.itemMenu.toString()).toEqual(
        expectedItemMenu.toString()
      );
    });

    it('should set itemMenu with preview, download and delete for external and doc status rejected', () => {
      const permissions: DocumentsPermissions = {
        replace: false,
        delete: true,
        download: true,
      };
      component.permissions = permissions;
      component.isInternalUser = false;
      component.data = {
        ...fiduciaryProcessDoc,
        status: FiduciaryProcessDocumentsStatuses.rejected,
      };

      component.initPermissions();
      const expectedItemMenu = [
        {
          actionName: 'SHARED.DOCUMENT.PREVIEW',
          click: () => component.previewAction(),
        },
        {
          actionName: 'SHARED.DOCUMENT.DOWNLOAD',
          click: () => component.downloadAction(),
        },
        {
          actionName: 'SHARED.DOCUMENT.DELETE',
          click: () => component.deleteAction(),
        },
      ];

      expect(component.itemMenu.toString()).toEqual(
        expectedItemMenu.toString()
      );
    });

    it('should set itemMenu with preview, download and delete for external and doc status errorEzshareUpload', () => {
      const permissions: DocumentsPermissions = {
        replace: false,
        delete: true,
        download: true,
      };
      component.permissions = permissions;
      component.isInternalUser = false;
      component.data = {
        ...fiduciaryProcessDoc,
        status: FiduciaryProcessDocumentsStatuses.errorEzshareUpload,
      };

      component.initPermissions();
      const expectedItemMenu = [
        {
          actionName: 'SHARED.DOCUMENT.PREVIEW',
          click: () => component.previewAction(),
        },
        {
          actionName: 'SHARED.DOCUMENT.DOWNLOAD',
          click: () => component.downloadAction(),
        },
        {
          actionName: 'SHARED.DOCUMENT.DELETE',
          click: () => component.deleteAction(),
        },
      ];

      expect(component.itemMenu.toString()).toEqual(
        expectedItemMenu.toString()
      );
    });

    it('should set itemMenu with preview, download and delete for external and doc status draftUploadedBlobStorage', () => {
      const permissions: DocumentsPermissions = {
        replace: false,
        delete: true,
        download: true,
      };
      component.permissions = permissions;
      component.isInternalUser = false;
      component.data = {
        ...fiduciaryProcessDoc,
        status: FiduciaryProcessDocumentsStatuses.draftUploadedBlobStorage,
      };

      component.initPermissions();
      const expectedItemMenu = [
        {
          actionName: 'SHARED.DOCUMENT.PREVIEW',
          click: () => component.previewAction(),
        },
        {
          actionName: 'SHARED.DOCUMENT.DOWNLOAD',
          click: () => component.downloadAction(),
        },
        {
          actionName: 'SHARED.DOCUMENT.DELETE',
          click: () => component.deleteAction(),
        },
      ];

      expect(component.itemMenu.toString()).toEqual(
        expectedItemMenu.toString()
      );
    });

    it('should set itemMenu with download and delete for external and doc status ReturnWithComment', () => {
      const permissions: DocumentsPermissions = {
        replace: false,
        delete: true,
        download: true,
      };
      component.permissions = permissions;
      component.isInternalUser = false;
      component.data = {
        ...fiduciaryProcessDoc,
        status: FiduciaryProcessDocumentsStatuses.ReturnWithComment,
        biddingDocumentId: '',
      };

      component.initPermissions();
      const expectedItemMenu = [
        {
          actionName: 'SHARED.DOCUMENT.DOWNLOAD',
          click: () => component.downloadAction(),
        },
        {
          actionName: 'SHARED.DOCUMENT.DELETE',
          click: () => component.deleteAction(),
        },
      ];

      expect(component.itemMenu.toString()).toEqual(
        expectedItemMenu.toString()
      );
    });
  });

  it('', () => {
    const spy = jest.spyOn(component, 'initPermissions');
    component.ngOnChanges();
    expect(spy).toHaveBeenCalled();
    expect(component.isInternalUser).toEqual(
      initialState.contact.contact.is_internal
    );
  });
});

const fiduciaryProcessDoc: FiduciaryProcessDocument = {
  id: '1',
  relationalId: '',
  ezshareNumber: '',
  name: '',
  operationsDocumentId: 3,
  status: FiduciaryProcessDocumentsStatuses.uploaded,
  type: 1,
  modified: new Date('30-01-2023'),
  created: new Date('10-01-2023'),
  createdBy: '',
  description: '',
};
const initialState = {
  contact: {
    contact: {
      username: 'username',
      email: 'email@idb.org',
      name: 'name',
      given_name: 'given_name',
      family_name: 'family_name',
      is_internal: true,
      contactId: 'contactId',
    },
  },
};
