import { CanActivateFn, Router } from '@angular/router';
import { ContractsService } from '../services/contracts.service';
import { inject } from '@angular/core';

export const moduleContractGuard: CanActivateFn = (route, state) => {
  console.log(route);
  console.log(state);
  const contractsService = inject(ContractsService);
  const router = inject(Router);
  //TODO implement guard to not allow create legacy contract if there are no previous contracts
  if (contractsService.hasExistingContracts()) {
    return true;
  } else {
    router.navigate(['/']);
    return false;
  }
};
