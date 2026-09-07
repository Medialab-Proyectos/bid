import { TestBed } from '@angular/core/testing';

import { NotificationsService } from './notifications.service';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NotificationSendByEntityType } from '@core/models';
import { NotificationGlobalService } from './notification-global.service';

const notificationGlobalSvcMock = {};

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [
        NotificationsService,
        provideMockStore({}),
        {
          provide: NotificationGlobalService,
          useValue: notificationGlobalSvcMock,
        },
      ],
    });
    service = TestBed.inject(NotificationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should register bidder', () => {
    const mockRequest: NotificationSendByEntityType = {
      EntityType: 0,
      Id: '',
      ProjectBucketId: '',
    };
    service.sendNotification(mockRequest).subscribe((response) => {
      expect(response).toEqual(200);
    });
  });
});
