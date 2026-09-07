import { of, Observable, throwError } from 'rxjs';
import { BiddingProcessDocumentPackagesEffects } from './bidding-process-document-packages.effects';
import * as actions from '../actions/bidding-process-document-packages.actions';
import { TestBed } from '@angular/core/testing';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StoreModule } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { BiddingProcessDocumentPackagesApiService } from '@core/services/apis';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared/services/notification-global.service';
import { TranslateService } from '@ngx-translate/core';
const translateServiceMock = {
  instant: jest.fn(),
};
const notificationGlobalSvcMock = {
  showError: jest.fn(),
  showSuccess: jest.fn(),
};
describe('PermissionEffects', () => {
  let effects: BiddingProcessDocumentPackagesEffects;
  let actions$: Observable<any>;
  let documentsApi: BiddingProcessDocumentPackagesApiService;
  let translateService: TranslateService;
  let notificationGlobalService: NotificationGlobalService;
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
        BiddingProcessDocumentPackagesEffects,
        provideMockStore({}),
        provideMockActions(() => actions$),
        BiddingProcessDocumentPackagesApiService,
        {
          provide: NotificationGlobalService,
          useValue: notificationGlobalSvcMock,
        },
        {
          provide: TranslateService,
          useValue: translateServiceMock,
        },
      ],
    });
    effects = TestBed.inject(BiddingProcessDocumentPackagesEffects);
    documentsApi = TestBed.inject(BiddingProcessDocumentPackagesApiService);
    translateService = TestBed.inject(TranslateService);
    notificationGlobalService = TestBed.inject(NotificationGlobalService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('getBiddingProcessDocumentPackages$', () => {
    it('should dispatch getDocumentPackagesSuccess action with document packages when successful', () => {
      const processId = 'your-process-id';
      const isOptional = true;
      const documentPackages = {
        biddingProcessDocumentPackage: [
          {
            actualDate: new Date('2022-06-04T04:00:00'),
            actualDateState: {
              loading: false,
            },
            biddingProcessDocumentGroups: [],
            code: 25,
            documentsState: {
              loading: false,
            },
            groupsState: {
              loading: false,
            },
            id: '79eeb620-46aa-4f77-4471-08da46966764',
            isReadOnly: false,
            order: 1,
            requireNonObjection: true,
            status: 1,
            totalComments: 0,
            totalUploadedDocuments: 2,
            totalMandatoryDocuments: 1,
            documentsToUpload: [],
            isOptional: true,
            bidValidityExtensionDate: null,
          },
        ],
        lastBidValidityExtensionDate: null,
      };
      const action = actions.getDocumentPackages({ processId, isOptional });
      const completion = actions.getDocumentPackagesSuccess({
        processId,
        biddingProcessDocumentPackages:
          documentPackages.biddingProcessDocumentPackage,
        lastBidValidityExtensionDate: null,
      });
      actions$ = of(action);
      jest
        .spyOn(documentsApi, 'getBiddingProcessDocumentPackages')
        .mockReturnValue(of(documentPackages));
      return effects.getBiddingProcessDocumentPackages$
        .toPromise()
        .then((resultAction) => {
          expect(resultAction).toEqual(completion);
          expect(
            documentsApi.getBiddingProcessDocumentPackages
          ).toHaveBeenCalledWith(processId, true);
        });
    });
    it('should dispatch getDocumentPackagesSuccess action with empty document packages when there is an error', () => {
      const processId = 'your-process-id';
      const isOptional = true;
      const error = new Error('your-error-message');
      const action = actions.getDocumentPackages({ processId, isOptional });
      const completion = actions.getDocumentPackagesSuccess({
        processId,
        biddingProcessDocumentPackages: [],
        lastBidValidityExtensionDate: null,
      });
      actions$ = of(action);
      jest
        .spyOn(documentsApi, 'getBiddingProcessDocumentPackages')
        .mockReturnValue(throwError(error));
      return effects.getBiddingProcessDocumentPackages$
        .toPromise()
        .then((resultAction) => {
          expect(resultAction).toEqual(completion);
          expect(
            documentsApi.getBiddingProcessDocumentPackages
          ).toHaveBeenCalledWith(processId, true);
        });
    });
  });
  describe('updateAcualDate$', () => {
    it('should dispatch changePackageActualDateSuccess action when actual date update is successful', () => {
      const actualDate = new Date('2023-03-04T04:00:00');
      const prevDate = new Date('2022-03-04T04:00:00');
      const packageId = 'your-package-id';
      const processId = 'your-process-id';
      const action = actions.changePackageActualDate({
        actualDate,
        packageId,
        processId,
        lang: 'en',
        prevDate,
      });
      const completion = actions.changePackageActualDateSuccess({
        actualDate,
        packageId,
        processId,
      });
      actions$ = of(action);
      jest
        .spyOn(documentsApi, 'updateDocumentPackageActualDate')
        .mockReturnValue(of(null));
      jest
        .spyOn(translateService, 'instant')
        .mockReturnValue('your-success-message');
      jest.spyOn(notificationGlobalService, 'showSuccess').mockImplementation();
      return effects.updateAcualDate$.toPromise().then((resultAction) => {
        expect(resultAction).toEqual(completion);
        expect(
          documentsApi.updateDocumentPackageActualDate
        ).toHaveBeenCalledWith(actualDate, packageId, 'en');
        expect(translateService.instant).toHaveBeenCalledWith(
          'PROCESS_DOC.DOCUMENT_TAB.ACTUAL_DATE_UPDATE.SUCCESS'
        );
        expect(notificationGlobalService.showSuccess).toHaveBeenCalledWith(
          'your-success-message'
        );
      });
    });
    it('should dispatch changePackageActualDateError action when actual date update fails', () => {
      const actualDate = new Date('2023-03-04T04:00:00');
      const prevDate = new Date('2022-03-04T04:00:00');
      const packageId = 'your-package-id';
      const processId = 'your-process-id';
      const error = new Error('your-error-message');
      const action = actions.changePackageActualDate({
        actualDate,
        packageId,
        processId,
        lang: 'en',
        prevDate,
      });
      const completion = actions.changePackageActualDateError({
        packageId,
        processId,
        prevDate,
      });
      actions$ = of(action);
      jest
        .spyOn(documentsApi, 'updateDocumentPackageActualDate')
        .mockReturnValue(throwError(error));
      jest
        .spyOn(translateService, 'instant')
        .mockReturnValue('your-error-message');
      jest.spyOn(notificationGlobalService, 'showError').mockImplementation();
      return effects.updateAcualDate$.toPromise().then((resultAction) => {
        expect(resultAction).toEqual(completion);
        expect(
          documentsApi.updateDocumentPackageActualDate
        ).toHaveBeenCalledWith(actualDate, packageId, 'en');
        expect(translateService.instant).toHaveBeenCalledWith(
          'PROCESS_DOC.DOCUMENT_TAB.ACTUAL_DATE_UPDATE.ERROR'
        );
        expect(notificationGlobalService.showError).toHaveBeenCalledWith(
          'your-error-message'
        );
      });
    });
  });
});
