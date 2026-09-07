import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { map } from 'rxjs';
import { BiddingProcessPlanService } from '@core/services/apis';

export const contractVersion: CanActivateFn = (route, state) => {
  const processSvc = inject(BiddingProcessPlanService);
  const processId = route.paramMap.get('processId');
  if (!processId) return false;
  const isCreateRoute = state.url.endsWith('/create');
  const isNewCreateRoute = state.url.endsWith('/new-create');
  return processSvc.getBiddingContracts(processId).pipe(
    map((data) => {
      if (isCreateRoute) {
        return data.biddingContracts.some((c) => !c.isCopy);
      }
      if (isNewCreateRoute) {
        return data.biddingContracts.every((c) => c.isCopy);
      }
      return true;
    })
  );
};
