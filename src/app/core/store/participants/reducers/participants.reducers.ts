import { createReducer, on } from '@ngrx/store';
import { Bidder, Participant } from '@core/models';
import * as participantsActions from '../actions/participants.actions';
import { AppState } from '@core/store/store.reducers';

export interface ParticipantState {
  participantsByProcess: {
    [processId: string]: {
      participants: Participant[];
      loaded: boolean;
      loading: boolean;
      error: unknown;
    };
  };
}
export interface AppStateWithParticipants extends AppState {
  participants: ParticipantState;
}
export const participantsInitialState: ParticipantState = {
  participantsByProcess: {},
};

const _participantsReducer = createReducer(
  participantsInitialState,
  on(participantsActions.getParticipants, (state, { processId }) => ({
    ...state,
    participantsByProcess: {
      ...state.participantsByProcess,
      [processId]: {
        loading: true,
        loaded: false,
        error: null,
        participants: [],
      },
    },
  })),
  on(
    participantsActions.getParticipantsSuccess,
    (state, { processId, participants }) => {
      return {
        ...state,
        participantsByProcess: {
          ...state.participantsByProcess,
          [processId]: {
            loading: false,
            loaded: true,
            error: null,
            ...state.participantsByProcess[processId],
            participants,
          },
        },
      };
    }
  ),
  on(
    participantsActions.updateParticipantSuccess,
    (state, { processId, participant }) => {
      const participants = [
        ...state.participantsByProcess[processId].participants,
      ];
      const index = participants.findIndex(
        (i) => i.biddingProcessBidderId === participant.biddingProcessBidderId
      );

      participants.splice(index, 1, participant);

      return {
        participantsByProcess: {
          ...state.participantsByProcess,
          [processId]: {
            ...state.participantsByProcess[processId],
            participants: [...participants],
          },
        },
      };
    }
  ),
  on(
    participantsActions.getParticipantsError,
    (state, { processId, payload }) => ({
      ...state,
      participantsByProcess: {
        ...state.participantsByProcess,
        [processId]: {
          ...state.participantsByProcess[processId],
          loading: false,
          loaded: true,
          error: payload,
        },
      },
    })
  ),
  on(
    participantsActions.deleteParticipantsSuccess,
    (state, { processId, participantId }) => ({
      ...state,
      participantsByProcess: {
        ...state.participantsByProcess,
        [processId]: {
          ...state.participantsByProcess[processId],
          participants: removeByParticipant(participantId, [
            ...state.participantsByProcess[processId].participants,
          ]),
        },
      },
    })
  ),
  on(
    participantsActions.addBidderToParticipantSuccess,
    (state, { processId, bidder }) => {
      const updatedParticipants = updateParticipantBybiddingProcessBidderId(
        [...state.participantsByProcess[processId].participants],
        bidder
      );

      const isLoading = updatedParticipants.some(
        (participant) => !participant.bidder
      );

      return {
        ...state,
        participantsByProcess: {
          ...state.participantsByProcess,
          [processId]: {
            ...state.participantsByProcess[processId],
            loading: isLoading,
            loaded: !isLoading,
            participants: updatedParticipants,
          },
        },
      };
    }
  )
);

export function removeByParticipant(
  participant: string,
  participants: Participant[]
): Participant[] {
  return participants.filter((el) => {
    return el.biddingProcessParticipantId !== participant;
  });
}

export function participantsReducer(state, action) {
  return _participantsReducer(state, action);
}

export function updateParticipantBybiddingProcessBidderId(
  participants: Participant[],
  bidder: Bidder
) {
  return participants.map((participant) => {
    const newParticipant: Participant = { ...participant };
    if (participant.biddingProcessBidderId === bidder.id) {
      newParticipant.bidder = bidder;
    }
    return newParticipant;
  });
}
