import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { spnTypeGuard } from './spn-type.guard';

describe('spnTypeGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => spnTypeGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
