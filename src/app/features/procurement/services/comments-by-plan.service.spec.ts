import { TestBed } from '@angular/core/testing';

import { CommentsByPlanService } from './comments-by-plan.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CommentsByPlanService', () => {
  let service: CommentsByPlanService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(CommentsByPlanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
