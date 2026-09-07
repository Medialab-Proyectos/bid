import { createAction, props } from '@ngrx/store';
import {
  Bidder,
  Participant,
  ParticipantAddRequest,
  ParticipantResponse,
} from '@core/models';

export const getParticipants = createAction(
  '[Participants] get Participants',
  props<{ processId: string }>()
);
export const getParticipantsSuccess = createAction(
  '[Participants] get Participants success',
  props<{ processId: string; participants: ParticipantResponse[] }>()
);
export const getParticipantsError = createAction(
  '[Participants] get Participants Error',
  props<{ processId: string; payload: unknown }>()
);

export const updateParticipant = createAction(
  '[Participants] update participant',
  props<{
    participantRequest: ParticipantAddRequest;
    processId: string;
    participant: Participant;
  }>()
);
export const updateParticipantSuccess = createAction(
  '[Participants] update Participant success',
  props<{ processId: string; participant: Participant }>()
);
export const updateParticipantError = createAction(
  '[Participants] update Participant Error',
  props<{ processId: string; payload: unknown }>()
);

export const deleteParticipants = createAction(
  '[Participants] delete participants',
  props<{
    biddingProcessParticipantId: string;
    processId: string;
  }>()
);
export const deleteParticipantsSuccess = createAction(
  '[Participants] delete Participants success',
  props<{ processId: string; participantId: string }>()
);

export const deleteParticipantsError = createAction(
  '[Participants] delete Participants Error',
  props<{ processId: string; payload: unknown }>()
);

export const addBidderToParticipant = createAction(
  '[Participants] add bidder prop',
  props<{ processId: string; participant: Participant }>()
);

export const addBidderToParticipantSuccess = createAction(
  '[Participants] add bidder prop sucess',
  props<{ processId: string; bidder: Bidder }>()
);

export const addBidderToParticipantError = createAction(
  '[Participants] add bidder prop Error',
  props<{ processId: string; payload: unknown }>()
);
