import { TestBed } from '@angular/core/testing';

import { FilteredProcurementProcessService } from './filtered-procurement-process.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('FilteredProcurementProcessService', () => {
  let service: FilteredProcurementProcessService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(FilteredProcurementProcessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
