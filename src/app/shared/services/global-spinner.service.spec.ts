import { TestBed } from '@angular/core/testing';

import { GlobalSpinnerService } from './global-spinner.service';

describe('GlobalSpinnerService', () => {
  let service: GlobalSpinnerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalSpinnerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
