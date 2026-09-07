import { TestBed } from '@angular/core/testing';

import { CommentsEventBussService } from './comments-event-buss.service';

describe('CommentsEventBussService', () => {
  let service: CommentsEventBussService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommentsEventBussService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
