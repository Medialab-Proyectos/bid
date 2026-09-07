import { TestBed } from '@angular/core/testing';

import { UboService } from './ubo.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import { TranslateTestingModule } from 'ngx-translate-testing';

const notificationGlobalSvcMock = {
  showError: jest.fn(),
  showSuccess: jest.fn(),
};
describe('UboService', () => {
  let service: UboService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [
        provideMockStore({}),
        {
          provide: NotificationGlobalService,
          useValue: notificationGlobalSvcMock,
        },
      ],
    });
    service = TestBed.inject(UboService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
