import { TestBed } from '@angular/core/testing';

import { DelayedMilestoneEventBusService } from './delayed-milestone-event-bus.service';

describe('DelayedMilestoneEventBusService', () => {
  let service: DelayedMilestoneEventBusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DelayedMilestoneEventBusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
