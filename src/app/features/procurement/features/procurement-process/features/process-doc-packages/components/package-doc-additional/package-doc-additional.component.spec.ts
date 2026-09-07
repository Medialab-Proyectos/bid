import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PackageDocAdditionalComponent } from './package-doc-additional.component';
import {
  NotificationModule,
  NotificationService,
} from '@progress/kendo-angular-notification';
import { TranslatePipe } from '@ngx-translate/core';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { TranslateEnumPipe } from '@fiduciary-interface/app/shared/pipes/translate-enum.pipe';
import { AnimationBuilder } from '@angular/animations';

describe('PackageDocAdditionalComponent', () => {
  let component: PackageDocAdditionalComponent;
  let fixture: ComponentFixture<PackageDocAdditionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PackageDocAdditionalComponent, TranslateEnumPipe],

      imports: [
        MsalTestModule,
        DateInputsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        NotificationModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [
        provideMockStore({}),
        TranslatePipe,
        NotificationService,
        { provide: 'windowObject', useValue: window },
        { provide: AnimationBuilder, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PackageDocAdditionalComponent);
    component = fixture.componentInstance;
    component.item = {
      id: 'test-id',
      status: 0,
      code: 0,
      totalMandatoryDocuments: 0,
      totalUploadedDocuments: 0,
      totalComments: 0,
      order: 0,
      requireNonObjection: false,
      actualDate: new Date(),
      isOptional: false,
      biddingProcessDocumentGroups: [],
      documentsToUpload: [],
      groupsState: { loading: false },
      documentsState: { loading: false },
      actualDateState: { loading: false },
      isReadOnly: false,
      uploadedDocAfterCompletionExist: false,
      bidValidityExtensionDate: new Date(),
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
