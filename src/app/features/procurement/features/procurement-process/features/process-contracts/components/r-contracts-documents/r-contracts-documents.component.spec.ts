import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RContractsDocumentsComponent } from './r-contracts-documents.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NotificationService } from '@progress/kendo-angular-notification';
import { mockNotificationService } from '../../../../../../../../../test/test-helpers';
import { TranslateTestingModule } from 'ngx-translate-testing';

describe('RContractsDocumentsComponent', () => {
  let component: RContractsDocumentsComponent;
  let fixture: ComponentFixture<RContractsDocumentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RContractsDocumentsComponent],
      imports: [
        HttpClientTestingModule,
        TranslateTestingModule.withTranslations('en', {}).withDefaultLanguage(
          'en'
        ),
      ],
      providers: [
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    });
    fixture = TestBed.createComponent(RContractsDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
