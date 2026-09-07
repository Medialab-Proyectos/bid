import { Injectable } from '@angular/core';
import { AppStateWithParticipants } from '@core/store';
import { select, Store } from '@ngrx/store';
import { filter, map } from 'rxjs/operators';
import * as participantsActions from '@core/store/participants/actions/participants.actions';
import { Participant, ParticipantAddRequest } from '@core/models';

@Injectable({
  providedIn: 'root',
})
export class ParticipantsStoreService {
  constructor(private readonly store: Store<AppStateWithParticipants>) {}

  private get state$() {
    return this.store.pipe(select('participants'));
  }

  getStateByProcess$(processId: string) {
    return this.state$.pipe(
      filter((state) => Boolean(state.participantsByProcess[processId])),
      map((state) => state.participantsByProcess[processId])
    );
  }

  deleteParticipantAction(processId: string, participantId: string) {
    this.store.dispatch(
      participantsActions.deleteParticipants({
        biddingProcessParticipantId: participantId,
        processId,
      })
    );
  }

  updateParticipantAction(
    processId: string,
    participantRequest: ParticipantAddRequest,
    participant: Participant
  ) {
    this.store.dispatch(
      participantsActions.updateParticipant({
        participantRequest,
        processId,
        participant,
      })
    );
  }

  getParticipantsAction(processId: string) {
    this.store.dispatch(
      participantsActions.getParticipants({
        processId,
      })
    );
  }
}
