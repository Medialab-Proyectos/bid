import { TestBed } from '@angular/core/testing';

import { LoadProjectDataService } from './load-project-data.service';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { commonTestProviders } from '@fiduciary-interface/test/test-helpers';

describe('LoadProjectDataService', () => {
  let service: LoadProjectDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [provideMockStore({}), ...commonTestProviders],
    });
    service = TestBed.inject(LoadProjectDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
