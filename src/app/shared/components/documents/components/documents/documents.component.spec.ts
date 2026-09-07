import { NotificationService } from '@progress/kendo-angular-notification';
/* eslint-disable @typescript-eslint/no-var-requires */
import { DocumentsComponent } from './documents.component';
import { UploadsModule } from '@progress/kendo-angular-upload';
import { FiduciaryProcessDocument } from '@core/models';
import { FiduciaryProcessDocumentsStatuses } from '@core/enums';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { render } from '@testing-library/angular';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { BehaviorSubject } from 'rxjs';
import { DocumentItemComponent } from '@fiduciary-interface/app/shared/components/documents/components/document-item/document-item.component';
import { ContactState } from '@core/store';
import { WindowSizeService } from '@core/services/view';
import { TranslatePipe } from '@ngx-translate/core';
import { PipeModule } from '@fiduciary-interface/app/shared';
import { NotificationModule } from '../../../notification/notification.module';
import { DirectivesModule } from '@fiduciary-interface/app/shared/directives/directives.module';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';

function getState() {
  const contactState: ContactState = {
    contact: {
      is_internal: null,
      username: '',
      contactId: '',
      email: '',
      family_name: '',
      given_name: '',
      name: '',
    },
    error: '',
    loaded: true,
    loading: false,
  };

  return {
    contact: contactState,
  };
}

async function setup(mobileView = false, initialState = getState()) {
  const windowSizeServiceMock = {
    windowSizeChanged: new BehaviorSubject({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      mobileView: mobileView,
    }),
  };

  const { fixture } = await render(DocumentsComponent, {
    declarations: [DocumentItemComponent],
    imports: [
      MsalTestModule,
      DirectivesModule,
      FormsModule,
      ReactiveFormsModule,
      HttpClientTestingModule,
      UploadsModule,
      PipeModule,
      NotificationModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    providers: [
      TranslatePipe,
      NotificationService,
      provideMockStore({ initialState }),
      { provide: WindowSizeService, useValue: windowSizeServiceMock },
    ],
  });

  const component = fixture.debugElement.componentInstance;

  return { fixture, component };
}

describe('DocumentsComponent', () => {
  // const now = Date.now();
  // TODO: ckeck if is needed the param blobId
  const mockedDocuments: FiduciaryProcessDocument[] = [
    {
      description: '',
      relationalId:
        'L2ZpZHVjaWFyeS1pbnRlcmZhY2UtZG9jdW1lbnRzLzE2MjgwNDI2NDA3ODhDVi1DSEFWRVpHT05aQUxFU0ZBVklPRU5SSVFVRS5wZGY=',
      id: 'L2ZpZHVjaWFyeS1pbnRlcmZhY2UtZG9jdW1lbnRzLzE2MjgwNDI2NDA3ODhDVi1DSEFWRVpHT05aQUxFU0ZBVklPRU5SSVFVRS5wZGY=',
      status: FiduciaryProcessDocumentsStatuses.draftUploadedBlobStorage,
      type: 0,
      operationsDocumentId: 0,
      ezshareNumber: '123',
      name: 'GPN_2229-OC-CO_2021.pdf',
      created: new Date(),
      createdBy: 'Juan Chavez',

      modified: new Date(),
    },
  ];

  it('should render the component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
  describe('when I upload a document', () => {
    it('should enable the button to request publication', async () => {
      const { fixture, component } = await setup();
      component.docForm.controls.files.setValue(component.docs[0]);
      fixture.detectChanges();
      const rendered = fixture.nativeElement;
      const btnPublication = rendered.querySelector('.qa-btn-publication');
      expect(btnPublication.getAttributeNames()).not.toContain(['disabled']);
    });
  });

  describe('when there is no uploaded document', () => {
    it('should disable the request publication button', async () => {
      const { fixture, component } = await setup();
      component.documents = [];
      component.ngOnChanges();
      fixture.detectChanges();
      const rendered = fixture.nativeElement;
      const btnPublication = rendered.querySelector('.qa-btn-publication');
      expect(btnPublication.getAttributeNames()).toContain('disabled');
    });

    it('should be able to upload a document', async () => {
      const { fixture, component } = await setup();
      component.docs = [];
      fixture.detectChanges();
      const rendered = fixture.nativeElement;
      expect(rendered.querySelector('kendo-fileselect')).not.toBeNull();
    });
  });
  describe('when I upload a document', () => {
    describe('the format document', () => {
      it('should show a draft document with the correct format', async () => {
        const { fixture, component } = await setup();
        jest.spyOn(component, 'checkFormatFile');
        component.documents = [];
        fixture.detectChanges();
        const rendered = fixture.nativeElement;
        const doc = rendered.querySelectorAll('fi-document-item');
        expect(doc.length).toBe(0);
      });
    });
  });
  it('should be no memory leak when user leave this screen', async () => {
    const { component } = await setup();
    const spy = jest.spyOn(component, 'unsuscribeObservables');
    component.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
  });

  it('should no load user info', async () => {
    const initialState = getState();
    initialState.contact.contact = null;
    const { component } = await setup(false, initialState);

    expect(component.userInfo).toBe(undefined);
  });

  it('should no translate label on mobile view', async () => {
    const { component } = await setup(true);
    expect(component.labelUploadDoc).toBe('');
  });

  it('should emit publish doc event', async () => {
    const { component } = await setup();
    const spy = jest.spyOn(component.requestPublication, 'emit');
    component.publishDoc();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit replace rejected doc event', async () => {
    const { component } = await setup();
    const spy = jest.spyOn(component.requestReplace, 'emit');
    component.replaceRejectedDoc();
    expect(spy).toHaveBeenCalled();
  });

  it('should update data on changes when has documents', async () => {
    const { component } = await setup();

    component.documents = [{ id: '1' }, { id: '2' }];
    component.ngOnChanges();

    expect(component.docs).toEqual(component.documents);
  });

  it('should update data on changes when no has documents', async () => {
    const { component } = await setup();

    component.documents = [{ id: null }];
    component.ngOnChanges();

    expect(component.docs).toEqual([]);
  });

  describe('bytesToMegabytes', () => {
    it('should turn the value of bytes in megabytes', async () => {
      const { component } = await setup();

      const megabytes = component.bytesToMegabytes(1_000_000);

      expect(megabytes).toEqual(1);
    });
  });

  describe('downloadDoc', () => {
    it('should emit downloadDocEmitter', async () => {
      const { component, fixture } = await setup();

      jest.spyOn(component.downloadDocEmitter, 'emit');
      component.downloadDoc(mockedDocuments);
      fixture.detectChanges();
      expect(component.downloadDocEmitter.emit).toHaveBeenCalled();
    });
  });

  describe('deleteDoc', () => {
    it('should emit deleteDocEmitter', async () => {
      const { component, fixture } = await setup();

      jest.spyOn(component.deleteDocEmitter, 'emit');
      component.deleteDoc('id');
      fixture.detectChanges();
      expect(component.deleteDocEmitter.emit).toHaveBeenCalled();
    });
  });

  describe('publishDoc', () => {
    it('should emit requestPublication', async () => {
      const { component, fixture } = await setup();

      jest.spyOn(component.requestPublication, 'emit');
      component.publishDoc();
      fixture.detectChanges();
      expect(component.requestPublication.emit).toHaveBeenCalled();
    });
  });

  describe('replaceRejectedDoc', () => {
    it('should emit requestReplace', async () => {
      const { component, fixture } = await setup();

      jest.spyOn(component.requestReplace, 'emit');
      component.replaceRejectedDoc();
      fixture.detectChanges();
      expect(component.requestReplace.emit).toHaveBeenCalled();
    });
  });

  describe('addMessagesError', () => {
    it('should return an errorMessage object with the parametters passaed', async () => {
      const { component, fixture } = await setup();

      const expectedResponse = {
        type: 'error',
        title: 'title',
        subtitle: 'subtitle',
      };

      component.addMessagesError('title', 'subtitle');
      fixture.detectChanges();

      expect(component.errorMessage).toEqual(expectedResponse);
    });
  });

  describe('checkDocumentSize', () => {
    it('should return true if the size of the document is smaller than the maxFileSize', async () => {
      const { component } = await setup();

      const fileSize = 500;
      component.maxFileSize = 600;
      const isSmaller = component.checkDocumentSize(fileSize);

      expect(isSmaller).toBe(true);
    });
    it('should return false if the size of the document is smaller than the maxFileSize', async () => {
      const { component } = await setup();

      const fileSize = 700;
      component.maxFileSize = 600;
      const isSmaller = component.checkDocumentSize(fileSize);

      expect(isSmaller).toBe(false);
    });
  });

  describe('checkFormatFile', () => {
    const validFormats: Array<string> = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/pdf',
      'application/vnd.ms-outlook',
    ];

    it('should return true if the format is within the valid formats', async () => {
      const { component, fixture } = await setup();
      component.validFormats = validFormats;
      fixture.detectChanges();
      const isValid = component.checkFormatFile('.jpg');

      expect(isValid).toBe(true);
    });

    it('should return false if the format is within the valid formats', async () => {
      const { component, fixture } = await setup();
      component.validFormats = validFormats;
      fixture.detectChanges();
      const isValid = component.checkFormatFile('invalidFormat');

      expect(isValid).toBe(false);
    });
  });

  describe('previewDoc', () => {
    it('should emit the event', async () => {
      const { component } = await setup();

      const mockEvent = true;
      const mockEmitter = jest.spyOn(component.previewDocEmitter, 'emit');

      component.previewDoc(mockEvent);

      expect(mockEmitter).toHaveBeenCalledTimes(1);
      expect(mockEmitter).toHaveBeenCalledWith(mockEvent);
    });
  });
});
