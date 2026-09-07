import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@progress/kendo-angular-notification';
import { TranslateTestingModule } from 'ngx-translate-testing';

import { BiddingDocumentService } from './bidding-document.service';

describe('BiddingDocumentService', () => {
  let service: BiddingDocumentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [NotificationService],
    });
    service = TestBed.inject(BiddingDocumentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
