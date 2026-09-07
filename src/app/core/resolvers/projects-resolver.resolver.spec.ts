import { TestBed } from '@angular/core/testing';

import { ProjectsResolverResolver } from './projects-resolver.resolver';
import { StoreModule } from '@ngrx/store';
import { EnumsStoreService } from '@core/services/store-services';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ProjectsResolverResolver', () => {
  let resolver: ProjectsResolverResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MsalTestModule,
        StoreModule.forRoot({}),
      ],
      providers: [EnumsStoreService],
    });
    resolver = TestBed.inject(ProjectsResolverResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
