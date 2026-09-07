import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as bidderActions from '../actions/bidder.actions';
import { catchError, exhaustMap, map, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { BiddingProcessBidderRequest } from '@core/models';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared/services/notification-global.service';
import { BidderApiService } from '@core/services/apis/';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class BidderEffects {
  private newBidder: BiddingProcessBidderRequest;

  constructor(
    private readonly actions$: Actions,
    private readonly notificationGlobalService: NotificationGlobalService,
    private readonly biddersApi: BidderApiService,
    private readonly translateSvc: TranslateService
  ) {}

  addBidder$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(bidderActions.addBidder),
      tap((data) => {
        this.newBidder = data.bidder;
      }),
      exhaustMap(() => {
        return this.biddersApi.registerBidder(this.newBidder).pipe(
          map((response: any) => {
            if (response.errors !== null) {
              const msg = this.translateSvc.instant('BIDDER.SAVE_ERROR');
              this.notificationGlobalService.showError(
                msg,
                'right',
                'top',
                7000
              );
            } else {
              const msg = this.translateSvc.instant('BIDDER.SAVE_SUCCESS');
              this.notificationGlobalService.showSuccess(
                msg,
                'right',
                'top',
                7000
              );
            }
            return bidderActions.addBidderSuccess({
              bidder: response.data.bidder,
            });
          }),
          catchError((err) => {
            return of(bidderActions.addBidderError({ payload: err }));
          })
        );
      })
    );
  });
}
