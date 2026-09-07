import { TestBed } from '@angular/core/testing';

import { DelayedMilestoneTableService } from './delayed-milestone-table.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DelayedMilestoneTableService', () => {
  let service: DelayedMilestoneTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(DelayedMilestoneTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
