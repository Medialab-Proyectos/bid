import { TestBed } from '@angular/core/testing';

import { PopupNotificationService } from './popup.service';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { NotificationService } from '@progress/kendo-angular-notification';
import { provideMockStore } from '@ngrx/store/testing';

describe('PopupService', () => {
  let service: PopupNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        DialogModule,
        HttpClientTestingModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [NotificationService, provideMockStore({})],
    });
    service = TestBed.inject(PopupNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
