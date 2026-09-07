import { TestBed } from '@angular/core/testing';

import { ContractsResolverResolver } from './contracts-resolver.resolver';
import { EnumsStoreService } from '@core/services/store-services';
import { StoreModule } from '@ngrx/store';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ContractsResolverResolver', () => {
  let resolver: ContractsResolverResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MsalTestModule,
        HttpClientTestingModule,
        StoreModule.forRoot({}),
      ],
      providers: [EnumsStoreService],
    });
    resolver = TestBed.inject(ContractsResolverResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
