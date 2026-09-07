import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, exhaustMap } from 'rxjs/operators';
import * as projectBalancesActions from '../actions/project-Balances.actions';
import { TransactionHeaderBalances } from '../../../models';
import { FiTransactionsApiService } from '../../../services';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class ProjectsBalancesEffects {
  constructor(
    readonly actions$: Actions,
    readonly fiTransactionsApiService: FiTransactionsApiService,
    readonly notificationGlobalService: NotificationGlobalService,
    private readonly translate: TranslateService
  ) {}

  getTransactionsBalances$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(projectBalancesActions.getProjectBalances),
      exhaustMap((data) => {
        return this.fiTransactionsApiService
          .getProjectBalances(data.projectBucketId)
          .pipe(
            map((response: TransactionHeaderBalances) => {
              return projectBalancesActions.getProjectBalancesSuccess({
                projectBalances: response,
                projectBucketId: data.projectBucketId,
              });
            }),
            catchError((err) => {
              const msg = this.translate.instant(
                'TRANSACTION.ERRORS.GET_BALANCES'
              );
              this.notificationGlobalService.showError(msg);
              return of(
                projectBalancesActions.getProjectBalancesError({ payload: err })
              );
            })
          );
      })
    );
  });
}
