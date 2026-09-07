import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as participantsActions from '../actions/participants.actions';
import { catchError, concatMap, exhaustMap, map, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { GetParticipantsResponse, ParticipantResponse } from '@core/models';
import { BidderApiService, ParticipantsApiService } from '@core/services/apis/';
import { Store } from '@ngrx/store';
import { AppStateWithParticipants } from '@core/store';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared/services/notification-global.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class ParticipantsEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly participantsApi: ParticipantsApiService,
    private readonly notificationGlobalService: NotificationGlobalService,
    readonly store: Store<AppStateWithParticipants>,
    private readonly bidderApi: BidderApiService,
    private readonly translateSvc: TranslateService
  ) {}

  getParticipants$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(participantsActions.getParticipants),
      exhaustMap((data) => {
        return this.participantsApi.getParticipants(data.processId).pipe(
          map((response: GetParticipantsResponse) => {
            const participants = this.addDisabledProperty(
              response.participantsDetail as ParticipantResponse[]
            );
            return participantsActions.getParticipantsSuccess({
              processId: data.processId,
              participants,
            });
          }),

          tap((response) => {
            response.participants.forEach((participant) => {
              this.store.dispatch(
                participantsActions.addBidderToParticipant({
                  participant,
                  processId: data.processId,
                })
              );
            });
          }),
          catchError((err) => {
            return of(
              participantsActions.getParticipantsError({
                payload: err,
                processId: data.processId,
              })
            );
          })
        );
      })
    );
  });

  updateParticipant$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(participantsActions.updateParticipant),
      exhaustMap((data) => {
        return this.participantsApi
          .updateParticipant(
            data.participantRequest,
            data.participant.biddingProcessParticipantId,
            data.processId
          )
          .pipe(
            map(() => {
              this.sucessMsg('PARTICIPANT.SUBMIT_MSG.SUCCESS.UPDATE');
              return participantsActions.updateParticipantSuccess({
                participant: data.participant,
                processId: data.processId,
              });
            }),
            catchError((err) => {
              this.errorMsg(err);
              return of(
                participantsActions.updateParticipantError({
                  processId: data.processId,
                  payload: err,
                })
              );
            }),
            tap(() => {
              this.store.dispatch(
                participantsActions.getParticipants({
                  processId: data.processId,
                })
              );
            })
          );
      })
    );
  });

  removeParticipant$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(participantsActions.deleteParticipants),
      exhaustMap((data) => {
        return this.participantsApi
          .deleteParticipant(data.biddingProcessParticipantId, data.processId)
          .pipe(
            map(() => {
              this.sucessMsg('PARTICIPANT.SUBMIT_MSG.SUCCESS.REMOVE');
              return participantsActions.deleteParticipantsSuccess({
                participantId: data.biddingProcessParticipantId,
                processId: data.processId,
              });
            }),
            catchError((err) => {
              this.errorMsg(err);
              return of(
                participantsActions.deleteParticipantsError({
                  payload: err,
                  processId: data.processId,
                })
              );
            })
          );
      })
    );
  });

  getBidderByParticipant$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(participantsActions.addBidderToParticipant),
      concatMap((data) => {
        return this.bidderApi
          .searchBidderById(data.participant.biddingProcessBidderId)
          .pipe(
            concatMap((bidderResponse) => {
              return this.bidderApi
                .searchBidderLocationsById(
                  data.participant.biddingProcessBidderId
                )
                .pipe(
                  map((locationResponse) => {
                    bidderResponse.biddingProcessBidder.address =
                      locationResponse.locations.length > 0
                        ? locationResponse.locations[0].address
                        : '';
                    bidderResponse.biddingProcessBidder.zipCode =
                      locationResponse.locations.length > 0
                        ? locationResponse.locations[0].zipCode
                        : '';
                    bidderResponse.biddingProcessBidder.country =
                      locationResponse.locations.length > 0
                        ? locationResponse.locations[0].country
                        : null;

                    return participantsActions.addBidderToParticipantSuccess({
                      bidder: bidderResponse.biddingProcessBidder,
                      processId: data.processId,
                    });
                  })
                );
            }),
            catchError((err) => {
              console.error(err);
              return of(
                participantsActions.addBidderToParticipantError({
                  payload: err,
                  processId: data.processId,
                })
              );
            })
          );
      })
    );
  });

  sucessMsg(message: string): void {
    const msg = this.translateSvc.instant(message);
    this.notificationGlobalService.showSuccess(msg, 'right', 'top', 7000);
  }

  errorMsg(error: HttpErrorResponse): void {
    if (error.error.status === 500) {
      const msg = this.translateSvc.instant('PARTICIPANT.SUBMIT_MSG.ERROR.500');
      this.notificationGlobalService.showError(msg, 'right', 'top', 7000);
    } else {
      const msg = this.translateSvc.instant(
        'PARTICIPANT.SUBMIT_MSG.ERROR.GENERIC'
      );
      this.notificationGlobalService.showError(msg, 'right', 'top', 7000);
    }
  }

  /**
   * Returns an array of participants with the new property (allowToEdit) that will define if the user is allow to edit this participant
   * @param {ParticipantResponse} participants - a array of participants
   */
  addDisabledProperty(
    participants: ParticipantResponse[]
  ): ParticipantResponse[] {
    return participants.map((p: ParticipantResponse) => {
      p.allowToEdit = !(
        p.biddingContractAwarded || p.biddingProcessDocumentAwarded
      );
      return p;
    });
  }
}
