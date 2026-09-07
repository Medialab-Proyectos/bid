import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared/services/notification-global.service';
import { TranslateTestingModule } from 'ngx-translate-testing';
import {
  MsalBroadcastService,
  MsalService,
  MSAL_GUARD_CONFIG,
} from '@azure/msal-angular';
import { provideMockStore } from '@ngrx/store/testing';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { AddDocumentComponent } from './add-document.component';
import { WorkflowDocument } from '@core/models';
import { WorkflowDocumentVisibility } from '@core/enums';
import { MSALGuardConfigFactory } from '@fiduciary-interface/app/msal/msal.config';

const NotificationGlobalServiceMock = {
  showError: jest.fn(),
  showSuccess: jest.fn(),
};
describe('AddDocumentComponent', () => {
  let component: AddDocumentComponent;
  let fixture: ComponentFixture<AddDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddDocumentComponent],
      imports: [
        HttpClientTestingModule,
        MsalTestModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [
        MsalBroadcastService,
        MsalService,
        {
          provide: NotificationGlobalService,
          useValue: NotificationGlobalServiceMock,
        },
        {
          provide: MSAL_GUARD_CONFIG,
          useFactory: MSALGuardConfigFactory,
        },
        provideMockStore({ initialState }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('checkDocsWithVisbilityZero', () => {
    it('should return true if there is at least one document with visibility PUBLIC', () => {
      const docs: WorkflowDocument[] = [
        {
          created: new Date('2022-12-30T03:00:00'),
          description: 'description',
          newDescription: null,
          id: '1',
          name: 'fileName-1',
          visibility: WorkflowDocumentVisibility.PRIVATE,
        },
        {
          created: new Date('2022-12-30T03:00:00'),
          description: 'description',
          newDescription: null,
          id: '1',
          name: 'fileName-1',
          visibility: WorkflowDocumentVisibility.PUBLIC,
        },
      ];

      const result = component.checkDocsWithVisbilityZero(docs);

      expect(result).toBe(true);
    });

    it('should return false if there are no documents with visibility PUBLIC', () => {
      const docs: WorkflowDocument[] = [
        {
          created: new Date('2022-12-30T03:00:00'),
          description: 'description',
          newDescription: null,
          id: '1',
          name: 'fileName-1',
          visibility: WorkflowDocumentVisibility.PRIVATE,
        },
        {
          created: new Date('2022-12-30T03:00:00'),
          description: 'description',
          newDescription: null,
          id: '1',
          name: 'fileName-1',
          visibility: WorkflowDocumentVisibility.PRIVATE,
        },
        // Add more documents as needed
      ];

      const result = component.checkDocsWithVisbilityZero(docs);

      expect(result).toBe(false);
    });

    it('should return false for an empty array of documents', () => {
      const docs: WorkflowDocument[] = [];

      const result = component.checkDocsWithVisbilityZero(docs);

      expect(result).toBe(false);
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
  contact: {},
};
