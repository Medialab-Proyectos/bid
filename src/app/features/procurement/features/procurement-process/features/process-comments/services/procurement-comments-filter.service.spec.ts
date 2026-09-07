import { TestBed } from '@angular/core/testing';

import { ProcurementCommentsFilterService } from './procurement-comments-filter.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StoreModule } from '@ngrx/store';

describe('ProcurementCommentsFilterService', () => {
  let service: ProcurementCommentsFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, StoreModule.forRoot({})],
    });
    service = TestBed.inject(ProcurementCommentsFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
