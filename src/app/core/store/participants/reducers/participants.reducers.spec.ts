import {
  participantsReducer,
  participantsInitialState,
} from './participants.reducers';
import * as actions from '../actions/participants.actions';
import { Bidder, Participant, ParticipantResponse } from '@core/models';

describe('ParticipantsReducer', () => {
  it('should set initial state', () => {
    expect(participantsInitialState).toEqual({
      participantsByProcess: {},
    });
  });

  it('should set initial state for participants ', () => {
    const action = actions.getParticipants({ processId: '1' });

    const newState = participantsReducer(participantsInitialState, action);

    expect(newState).toEqual({
      participantsByProcess: {
        '1': {
          loading: true,
          loaded: false,
          error: null,
          participants: [],
        },
      },
    });
  });

  it('should set error', () => {
    const action = actions.getParticipantsError({
      processId: '1',
      payload: 'error',
    });

    const initialState = { ...participantsInitialState };
    initialState.participantsByProcess = {
      '1': {
        loading: false,
        loaded: false,
        error: null,
        participants: [],
      },
    };
    const newState = participantsReducer(initialState, action);

    expect(newState).toEqual({
      participantsByProcess: {
        '1': {
          loading: false,
          loaded: true,
          error: 'error',
          participants: [],
        },
      },
    });
  });

  it('should get participants and set loading', () => {
    const participant: ParticipantResponse = {
      biddingProcessBidderId: 'participant-id-1',
      amount: 0,
      bidder: null,
      amountUsd: 10,
      biddingProcessParticipantId: 'participant-id-8',
      currency: 'US',
      result: null,
      totalScore: 0,
      weighedFinancialScore: 0,
      weighedTechScore: 0,
      biddingContractAwarded: false,
      biddingProcessDocumentAwarded: false,
      justificationEligibility: '',
    };
    const action = actions.getParticipantsSuccess({
      processId: '1',
      participants: [participant],
    });

    const initialState = { ...participantsInitialState };
    initialState.participantsByProcess = {
      '1': {
        loading: false,
        loaded: false,
        error: null,
        participants: [],
      },
    };
    const newState = participantsReducer(initialState, action);

    const process = newState.participantsByProcess['1'];
    expect(process).toEqual({
      loading: false,
      loaded: false,
      error: null,
      participants: [participant],
    });
  });

  it('should get participants and set loaded', () => {
    const action = actions.getParticipantsSuccess({
      processId: '1',
      participants: [],
    });

    const initialState = { ...participantsInitialState };
    initialState.participantsByProcess = {
      '1': {
        loading: false,
        loaded: false,
        error: null,
        participants: [],
      },
    };
    const newState = participantsReducer(initialState, action);

    const process = newState.participantsByProcess['1'];
    expect(process).toEqual({
      loading: false,
      loaded: false,
      error: null,
      participants: [],
    });
  });

  it('should update participant', () => {
    const participant: Participant = {
      biddingProcessBidderId: 'participant-id-1',
      amount: 0,
      bidder: null,
      biddingProcessParticipantId: 'participant-id-8',
      currency: 'US',
      result: null,
      totalScore: 0,
      weighedFinancialScore: 0,
      weighedTechScore: 0,
      amountUsd: 0,
    };
    const action = actions.updateParticipantSuccess({
      processId: '1',
      participant,
    });

    const initialState = { ...participantsInitialState };
    initialState.participantsByProcess = {
      '1': {
        loading: false,
        loaded: false,
        error: null,
        participants: [participant],
      },
    };
    const newState = participantsReducer(initialState, action);

    const process = newState.participantsByProcess['1'];
    expect(process).toEqual({
      loading: false,
      loaded: false,
      error: null,
      participants: [participant],
    });
  });

  it('should delete participant', () => {
    const participant: Participant = {
      biddingProcessBidderId: 'biddingProcessBidderId-id-1',
      amount: 0,
      bidder: null,
      biddingProcessParticipantId: 'biddingProcessParticipantId-id-1',
      currency: 'US',
      result: null,
      totalScore: 0,
      weighedFinancialScore: 0,
      weighedTechScore: 0,
      amountUsd: 0,
    };
    const action = actions.deleteParticipantsSuccess({
      processId: '1',
      participantId: 'biddingProcessParticipantId-id-1',
    });

    const initialState = { ...participantsInitialState };
    initialState.participantsByProcess = {
      '1': {
        loading: false,
        loaded: true,
        error: null,
        participants: [participant],
      },
    };
    const newState = participantsReducer(initialState, action);

    const process = newState.participantsByProcess['1'];
    expect(process).toEqual({
      loading: false,
      loaded: true,
      error: null,
      participants: [],
    });
  });

  it('should add bidder to participant', () => {
    const bidder: Bidder = {
      id: 'bidder-id-1',
      name: 'name',
      type: 1,
      nationality: 0,
      legalRepresentative: 'legalRepresentative',
      economicSector: 2,
      beneficiaryOwner: 'beneficiaryOwner',
      address: 'address',
      zipCode: 'zipCode',
      country: 'country',
    };

    const participant: Participant = {
      biddingProcessBidderId: 'bidder-id-1',
      amount: 0,
      bidder: null,
      biddingProcessParticipantId: 'biddingProcessParticipantId-id-1',
      currency: 'US',
      result: null,
      totalScore: 0,
      weighedFinancialScore: 0,
      weighedTechScore: 0,
      amountUsd: 0,
    };
    const participant2 = { ...participant };
    participant2.biddingProcessBidderId = 'bidder-id-2';

    const action = actions.addBidderToParticipantSuccess({
      processId: '1',
      bidder,
    });

    const initialState = { ...participantsInitialState };
    initialState.participantsByProcess = {
      '1': {
        loading: false,
        loaded: true,
        error: null,
        participants: [participant, participant2],
      },
    };
    const newState = participantsReducer(initialState, action);

    const process = newState.participantsByProcess['1'];
    expect(process.participants[0].bidder).toEqual(bidder);
  });
});
