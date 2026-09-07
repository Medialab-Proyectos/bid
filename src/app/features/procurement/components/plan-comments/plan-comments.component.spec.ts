import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanCommentsComponent } from './plan-comments.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { NotificationModule } from '@fiduciary-interface/app/shared';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared/services/notification-global.service';

const notificationServiceMock = {
  showError: jest.fn(),
  show: jest.fn(),
  someProperty: 'mocked property',
};

describe('PlanCommentsComponent', () => {
  let component: PlanCommentsComponent;
  let fixture: ComponentFixture<PlanCommentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlanCommentsComponent],
      imports: [
        NotificationModule,
        HttpClientTestingModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [
        {
          provide: NotificationGlobalService,
          useValue: notificationServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PlanCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
