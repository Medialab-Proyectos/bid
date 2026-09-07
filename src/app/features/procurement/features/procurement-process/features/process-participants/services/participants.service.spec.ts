import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TranslateTestingModule } from 'ngx-translate-testing';

import { ParticipantsService } from './participants.service';
import { provideMockStore } from '@ngrx/store/testing';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';

const initialState = {
  enums: {
    memberCountries: {
      id: 0,
      name: 'ENUM.COUNTRY.AR',
    },
  },
};
describe('ContractsService', () => {
  let service: ParticipantsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MsalTestModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [provideMockStore({ initialState })],
    });
    service = TestBed.inject(ParticipantsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
