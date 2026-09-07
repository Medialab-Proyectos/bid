import { TestBed } from '@angular/core/testing';

import { ProcurementNoticesService } from './procurement-notices.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ProcurementNoticesService', () => {
  let service: ProcurementNoticesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ProcurementNoticesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
