import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StoreModule, Store } from '@ngrx/store';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Observable, of, throwError } from 'rxjs';
import { GeneralProcurementDocumentsEffects } from './general-procurement-documents.effect';
import * as actions from '../actions/general-procurement-documents.action';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import { GeneralProcurementDocumentsApiService } from '@core/services/apis';
import { TranslateService } from '@ngx-translate/core';
import { DocumentDomain } from '@core/enums';

const notificationGlobalSvcMock = {
  showError: jest.fn(),
  showSuccess: jest.fn(),
};
const translateServiceMock = {
  instant: jest.fn(),
};
const generalProcurementDocumentsApiServiceMock = {
  getGeneralProcurementDocuments: jest.fn(),
  setGeneralProcurementDocument: jest.fn(),
  deleteGeneralProcurementDocument: jest.fn(),
  submitForDisclosure: jest.fn(),
  sendToEditDocument: jest.fn(),
  changeGroupOfDocument: jest.fn(),
  getGroups: jest.fn(),
  sendDisclosure: jest.fn(),
};
describe('GeneralProcurementDocumentsEffects', () => {
  let actions$: Observable<any>;
  let effects: GeneralProcurementDocumentsEffects;
  let notificationGlobalService: NotificationGlobalService;
  let gpnApi: GeneralProcurementDocumentsApiService;
  let translateService: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        StoreModule.forRoot({}),
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [
        GeneralProcurementDocumentsEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        Store,
        {
          provide: NotificationGlobalService,
          useValue: notificationGlobalSvcMock,
        },
        {
          provide: GeneralProcurementDocumentsApiService,
          useValue: generalProcurementDocumentsApiServiceMock,
        },
        {
          provide: TranslateService,
          useValue: translateServiceMock,
        },
      ],
    });

    effects = TestBed.inject(GeneralProcurementDocumentsEffects);
    notificationGlobalService = TestBed.inject(NotificationGlobalService);
    gpnApi = TestBed.inject(GeneralProcurementDocumentsApiService);
    translateService = TestBed.inject(TranslateService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getGeneralProcurementDocuments$', () => {
    it('should dispatch getProcurementDocumentsSuccess action with generalProcurementDocuments', () => {
      const projectBucketId = 'bucketId';
      const domain = DocumentDomain.BIDDINGCONTRACTDOCUMENTGROUP;
      const response = {
        parentId: 'parentId',
        fiduciaryProcessDocuments: [
          {
            id: '1',
            relationalId: '',
            ezshareNumber: '',
            name: '',
            operationsDocumentId: 3,
            status: 1,
            type: 1,
            modified: new Date(),
            created: new Date(),
            createdBy: '',
            description: '',
          },
          {
            id: '2',
            relationalId: '',
            ezshareNumber: '',
            name: '',
            operationsDocumentId: 2,
            status: 2,
            type: 2,
            modified: new Date(),
            created: new Date(),
            createdBy: '',
            description: '',
          },
        ],
      };
      const action = actions.getProcurementDocuments({
        projectBucketId,
        domain,
      });
      const completion = actions.getProcurementDocumentsSuccess({
        generalProcurementDocuments: response.fiduciaryProcessDocuments,
      });
      const notificationSpy = jest.spyOn(
        notificationGlobalService,
        'showError'
      );
      const gpnApiSpy = jest
        .spyOn(gpnApi, 'getGeneralProcurementDocuments')
        .mockReturnValue(of(response));

      actions$ = of(action);

      return effects.getGeneralProcurementDocuments$
        .toPromise()
        .then((resultAction) => {
          expect(resultAction).toEqual(completion);
          expect(gpnApiSpy).toHaveBeenCalledWith(projectBucketId, domain);
          expect(notificationSpy).not.toHaveBeenCalled();
        });
    });

    it('should dispatch getProcurementDocumentsSuccess action with empty generalProcurementDocuments on error', () => {
      const projectBucketId = 'bucketId';
      const domain = DocumentDomain.BIDDINGCONTRACTDOCUMENTGROUP;
      const error = new Error('Error fetching general procurement documents');
      const action = actions.getProcurementDocuments({
        projectBucketId,
        domain,
      });
      const completion = actions.getProcurementDocumentsSuccess({
        generalProcurementDocuments: [],
      });
      const gpnApiSpy = jest
        .spyOn(gpnApi, 'getGeneralProcurementDocuments')
        .mockReturnValue(throwError(error));

      actions$ = of(action);

      return effects.getGeneralProcurementDocuments$
        .toPromise()
        .then((resultAction) => {
          expect(resultAction).toEqual(completion);
          expect(gpnApiSpy).toHaveBeenCalledWith(projectBucketId, domain);
        });
    });
  });

  describe('deleteGeneralProcurementDocument$', () => {
    it('should dispatch deleteProcurementDocumentSuccess action and show success toast on success', () => {
      const documentId = 'documentId';
      const traslatedMsg = 'Success message';
      const action = actions.deleteProcurementDocument({ documentId });
      const completion = actions.deleteProcurementDocumentSuccess({
        documentId,
      });
      const gpnApiSpy = jest
        .spyOn(gpnApi, 'deleteGeneralProcurementDocument')
        .mockReturnValue(of(null));
      const translateSpy = jest
        .spyOn(translateService, 'instant')
        .mockReturnValue(traslatedMsg);
      const notificationSpy = jest.spyOn(
        notificationGlobalService,
        'showSuccess'
      );
      actions$ = of(action);

      return effects.deleteGeneralProcurementDocument$
        .toPromise()
        .then((resultAction) => {
          expect(resultAction).toEqual(completion);
          expect(gpnApiSpy).toHaveBeenCalledWith(
            documentId,
            DocumentDomain.PROJECTBUCKET
          );
          expect(translateSpy).toHaveBeenCalled();
          expect(notificationSpy).toHaveBeenCalledWith(
            traslatedMsg,
            'right',
            'top',
            7000
          );
        });
    });

    it('should dispatch deleteProcurementDocumentError action and show error toast on error', () => {
      const documentId = 'documentId';
      const traslatedMsg = 'Error message';
      const error = new Error('Error deleting general procurement document');
      const action = actions.deleteProcurementDocument({ documentId });
      const completion = actions.deleteProcurementDocumentError();
      const gpnApiSpy = jest
        .spyOn(gpnApi, 'deleteGeneralProcurementDocument')
        .mockReturnValue(throwError(error));
      const translateSpy = jest
        .spyOn(translateService, 'instant')
        .mockReturnValue(traslatedMsg);
      const notificationSpy = jest.spyOn(
        notificationGlobalService,
        'showError'
      );
      actions$ = of(action);

      return effects.deleteGeneralProcurementDocument$
        .toPromise()
        .then((resultAction) => {
          expect(resultAction).toEqual(completion);
          expect(gpnApiSpy).toHaveBeenCalledWith(
            documentId,
            DocumentDomain.PROJECTBUCKET
          );
          expect(translateSpy).toHaveBeenCalled();
          expect(notificationSpy).toHaveBeenCalledWith(
            'Error message',
            'right',
            'top',
            7000
          );
        });
    });
  });
});
