import {
  CanActivateFn,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, finalize } from 'rxjs/operators';
import { inject } from '@angular/core';
import { BiddingProcessPlanService } from '@core/services/apis';
import { CategoryProcurement } from '@core/enums';
import { GetBiddingProcurementProcessByIdResponse } from '@core/models';
import { GlobalSpinnerService } from '@fiduciary-interface/app/shared/services/global-spinner.service';

export const spnTypeGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
):
  | Observable<boolean | UrlTree>
  | Promise<boolean | UrlTree>
  | boolean
  | UrlTree => {
  const router = inject(Router);
  const processPlanSvc = inject(BiddingProcessPlanService);
  const globalSpinner = inject(GlobalSpinnerService);

  const routeParams = route.params;
  const id = routeParams['processId'];

  const url = state.url;
  const lastSegment = url.substring(url.lastIndexOf('/') + 1);

  if (!id) {
    return router.createUrlTree(['/error']);
  }

  globalSpinner.showLoading();
  return processPlanSvc.getBiddingProcessProcurementProcessesById(id).pipe(
    map((respuesta: GetBiddingProcurementProcessByIdResponse) => {
      const sdoCategories = [
        CategoryProcurement.PROCT_GOODS,
        CategoryProcurement.PROCT_NCSVC,
      ];
      const sdpCategories = [CategoryProcurement.PROCT_WORKS];

      const category = respuesta.biddingProcessProcurementProcess.category
        .name as CategoryProcurement;

      if (
        sdpCategories.includes(category) &&
        (lastSegment === 'sdp' || lastSegment === 'sdo')
      ) {
        return true;
      } else if (sdoCategories.includes(category) && lastSegment === 'sdo') {
        return true;
      } else {
        return router.createUrlTree(['/error']);
      }
    }),
    catchError(() => {
      return of(router.createUrlTree(['/error']));
    }),
    finalize(() => {
      globalSpinner.hideLoading();
    })
  );
};
