import { TestBed } from '@angular/core/testing';

import { UndbProjectInfoService } from './undb-project-info.service';
import { commonTestProviders } from '@fiduciary-interface/test/test-helpers';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('UndbProjectInfoService', () => {
  let service: UndbProjectInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [...commonTestProviders],
    });
    service = TestBed.inject(UndbProjectInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
