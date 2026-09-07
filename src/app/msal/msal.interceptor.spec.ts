import { TestBed } from '@angular/core/testing';
import { MsalInterceptor } from './msal.interceptor';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { SharingService } from '@core/services/app/scopes/sharing.service';

describe('MsalInterceptor', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [MsalInterceptor, SharingService],
      imports: [MsalTestModule],
    })
  );
  it('should be created', () => {
    const interceptor: MsalInterceptor = TestBed.inject(MsalInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
