import { TestBed } from '@angular/core/testing';

import { EoiApiService } from './eoi-api.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('EoiApiService', () => {
  let service: EoiApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(EoiApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
