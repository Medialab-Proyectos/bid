import { HttpEventType, HttpHeaders, HttpResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppState, SelectedProjectInitialState } from '@core/store';
import { provideWindowSizeMock } from '@fiduciary-interface-test';
import { IFDatePipe } from '@fiduciary-interface/app/shared/pipes/if-date-pipe.pipe';
import { TranslateEnumPipe } from '@fiduciary-interface/app/shared/pipes/translate-enum.pipe';
import { provideMockStore } from '@ngrx/store/testing';
import { NotificationService } from '@progress/kendo-angular-notification';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { of, throwError } from 'rxjs';
import { TransactionsStatus } from '../../enums';
import { AuditTrailsGetResponse } from '../../models';

import { AuditTrailComponent } from './audit-trail.component';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';

const projectBucketId = '1235678';
const selectedProjectState = { ...SelectedProjectInitialState };
selectedProjectState.loading = false;
selectedProjectState.selectedProject = {
  name: 'name',
  nameEs: 'nameES',
  nameFr: 'nameFR',
  namePt: 'namePT',
  operationNumber: 'operationNumber',
  executor: 'executor',
  executorAcronym: 'executorAcronym',
  contract: 'contract',
  approvedAmount: 0,
  location: 'location',
  status: null,
  institution: 'institution',
  operation: null,
  countryCode: 'countryCode',
  projectBucketId,
  id: '1',
  nameEn: '',
  projectName: {
    en: '',
    es: '',
    fr: '',
    pt: '',
  },
  currentApprovedAmount: 15,
  favorite: false,
};

const initialState: AppState = {
  selectedProject: selectedProjectState,
};

describe('AuditTrailComponent', () => {
  let component: AuditTrailComponent;
  let fixture: ComponentFixture<AuditTrailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AuditTrailComponent, TranslateEnumPipe, IFDatePipe],
      imports: [
        MsalTestModule,
        HttpClientTestingModule,
        RouterTestingModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [
        DatePipe,
        provideWindowSizeMock(),
        provideMockStore({ initialState }),
        NotificationService,
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditTrailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getAuditTrail', () => {
    it('should return auditTrail', () => {
      jest
        .spyOn(component.fiTransactionsApiService, 'getAuditTrails')
        .mockReturnValue(of(audiTrailMockResponse));
      component.getAuditTrail(123);
      expect(component.auditTrails).toEqual(audiTrailMockResponse);
    });
    it('should show error pop up on error response', () => {
      jest
        .spyOn(component.fiTransactionsApiService, 'getAuditTrails')
        .mockReturnValue(throwError('error'));
      const spy = jest.spyOn(component.notificationGlobalService, 'showError');
      component.getAuditTrail(123);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('downloadAudit', () => {
    it('should return auditTrail', () => {
      const response: HttpResponse<ArrayBuffer> = {
        body: new ArrayBuffer(1),
        clone: jest.fn(),
        headers: new HttpHeaders(),
        ok: true,
        status: 200,
        statusText: 'OK',
        type: HttpEventType.Response,
        url: '',
      };
      jest
        .spyOn(component.transactionForService, 'downloadAudit')
        .mockReturnValue(of(response));
      component.downloadAudit();
      expect(component.isLoading).toEqual(false);
    });
    it('should show error pop up on error response', () => {
      jest
        .spyOn(component.transactionForService, 'downloadAudit')
        .mockReturnValue(throwError('error'));
      const spy = jest.spyOn(component.transactionForService, 'showErrorToast');
      component.downloadAudit();
      expect(spy).toHaveBeenCalled();
    });
  });
});

const audiTrailMockResponse: AuditTrailsGetResponse = {
  header: {
    contractStatus: 'ED',
    partNumber: [1, 2],
    requestNumber: [3, 4],
    transactionNumber: ['OD123'],
    transactionStatusId: TransactionsStatus.COMPLETED,
    transactionTypeCode: ['ANT'],
  },
  auditTrailsContent: [
    {
      action: 'TRANSACTION.AUDIT_TRAIL.ACTIONS.REVIEW',
      comment: 'Comment',
      date: new Date(),
      time: '4 PM',
      user: 'JOSERUS',
    },
    {
      action: 'TRANSACTION.AUDIT_TRAIL.ACTIONS.AUTHORIZE',
      comment: 'Comment',
      date: new Date(),
      time: '4 PM',
      user: 'JOSERUS',
    },
    {
      action: 'TRANSACTION.AUDIT_TRAIL.ACTIONS.VALIDATE',
      comment: 'Comment',
      date: new Date(),
      time: '4 PM',
      user: 'JOSERUS',
    },
    {
      action: 'TRANSACTION.AUDIT_TRAIL.ACTIONS.ACK ERROR',
      comment: 'Comment',
      date: new Date(),
      time: '4 PM',
      user: 'JOSERUS',
    },
  ],
};
