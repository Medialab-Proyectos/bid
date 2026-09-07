import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { moduleContractGuard } from './module-contract.guard';

describe('moduleContractGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => moduleContractGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
