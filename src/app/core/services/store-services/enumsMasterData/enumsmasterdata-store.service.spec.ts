import { TestBed } from '@angular/core/testing';

import { EnumsmasterdataStoreService } from './enumsmasterdata-store.service';
import { provideMockStore } from '@ngrx/store/testing';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('EnumsmasterdataStoreService', () => {
  let service: EnumsmasterdataStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MsalTestModule, HttpClientTestingModule],
      providers: [provideMockStore({})],
    });
    service = TestBed.inject(EnumsmasterdataStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
