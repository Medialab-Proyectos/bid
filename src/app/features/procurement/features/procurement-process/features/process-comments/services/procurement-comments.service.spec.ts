import { TestBed } from '@angular/core/testing';

import { ProcurementCommentsService } from './procurement-comments.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideMockStore } from '@ngrx/store/testing';

describe('ProcurementCommentsService', () => {
  let service: ProcurementCommentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [provideMockStore({})],
    });
    service = TestBed.inject(ProcurementCommentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
