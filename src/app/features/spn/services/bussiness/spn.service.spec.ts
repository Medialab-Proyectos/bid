import { TestBed } from '@angular/core/testing';

import { SpnService } from './spn.service';

describe('SpnService', () => {
  let service: SpnService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpnService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
