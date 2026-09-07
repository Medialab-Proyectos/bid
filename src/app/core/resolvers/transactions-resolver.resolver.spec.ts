import { TestBed } from '@angular/core/testing';

import { StoreModule } from '@ngrx/store';
import { EnumsStoreService } from '@core/services/store-services';
import { TransactionsResolver } from './transactions-resolver.resolver';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('TransactionsResolver', () => {
  let resolver: TransactionsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MsalTestModule,
        StoreModule.forRoot({}),
      ],
      providers: [EnumsStoreService],
    });
    resolver = TestBed.inject(TransactionsResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
