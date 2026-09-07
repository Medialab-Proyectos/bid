import { TestBed } from '@angular/core/testing';
import { participantsInitialState } from '@core/store';
import { provideMockStore } from '@ngrx/store/testing';

import { ParticipantsStoreService } from './participants-store.service';

describe('ParticipantsStoreService', () => {
  let service: ParticipantsStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideMockStore({ initialState })],
    });
    service = TestBed.inject(ParticipantsStoreService);
    (service as any).store.dispatch = jest.fn();
  });

  it('should get state by process id', () => {
    service.getStateByProcess$('process-id-1').subscribe((state) => {
      expect(state).toEqual(participantsInitialState);
    });
  });

  it('should call get participants action', () => {
    service.getParticipantsAction('process-id-2');

    expect((service as any).store.dispatch).toHaveBeenCalled();
  });

  it('should call delete participant action', () => {
    service.deleteParticipantAction('process-id-3', 'participant-id-4');

    expect((service as any).store.dispatch).toHaveBeenCalled();
  });

  it('should call update participant action', () => {
    service.updateParticipantAction(
      'process-id-5',
      {
        biddingProcessBidderId: 'participant-id-7',
        amount: 0,
        currency: 'US',
        result: 0,
        totalScore: 0,
        weighedFinancialScore: 0,
        weighedTechScore: 0,
        amountUsd: 0,
        rejectedReason: [],
        justificationEligibility: '',
      },
      null
    );

    expect((service as any).store.dispatch).toHaveBeenCalled();
  });
});

const initialState = { participants: { ...participantsInitialState } };
initialState.participants.participantsByProcess = {
  'process-id-1': {
    participants: [
      {
        biddingProcessBidderId: '12345',
        biddingProcessParticipantId: '12345',
        weighedTechScore: 0,
        weighedFinancialScore: 0,
        totalScore: 0,
        amount: 0,
        currency: '12345',
        result: null,
        bidder: null,
        amountUsd: 0,
      },
    ],
    error: null,
    loaded: true,
    loading: false,
  },
};
