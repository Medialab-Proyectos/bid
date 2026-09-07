import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentsFilterComponent } from './comments-filter.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StoreModule } from '@ngrx/store';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { DialogModule, DialogService } from '@progress/kendo-angular-dialog';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
const notificationGlobalSvcMock = {
  showError: jest.fn(),
  showSuccess: jest.fn(),
};
describe('CommentsFilterComponent', () => {
  let component: CommentsFilterComponent;
  let fixture: ComponentFixture<CommentsFilterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommentsFilterComponent],
      imports: [
        HttpClientTestingModule,
        DialogModule,
        MsalTestModule,
        StoreModule.forRoot({}),
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [
        DialogService,
        {
          provide: NotificationGlobalService,
          useValue: notificationGlobalSvcMock,
        },
      ],
    });
    fixture = TestBed.createComponent(CommentsFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
