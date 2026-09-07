import * as participantsActions from '../actions/participants.actions';
import { GetParticipantsResponse, ParticipantResponse } from '@core/models';
import { ParticipantsApiService } from '@core/services/apis/';
import { TestBed } from '@angular/core/testing';
import { ParticipantsEffects } from './participants.effects';
import { of, Observable, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  ScannedActionsSubject,
  StateObservable,
  Store,
  ReducerManager,
  ActionsSubject,
  StoreModule,
} from '@ngrx/store';
import { NotificationService } from '@progress/kendo-angular-notification';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Participant, ParticipantAddRequest } from '@core/models';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared/services/notification-global.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
const notificationGlobalSvcMock = {
  showError: jest.fn(),
  showSuccess: jest.fn(),
};
const translateServiceMock = {
  instant: jest.fn(),
};
describe('getParticipants$', () => {
  let participantsApiService: ParticipantsApiService;
  let effects: ParticipantsEffects;
  let actions$: Observable<any>;
  let notificationService: NotificationGlobalService;
  let translateService: TranslateService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        StoreModule.forRoot({}),
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [
        ParticipantsEffects,
        NotificationService,
        Store,
        ReducerManager,
        StateObservable,
        ActionsSubject,
        ParticipantsApiService,
        { provide: ScannedActionsSubject, useValue: {} },
        provideMockStore({}),
        provideMockActions(() => actions$),
        {
          provide: NotificationGlobalService,
          useValue: notificationGlobalSvcMock,
        },
        {
          provide: TranslateService,
          useValue: translateServiceMock,
        },
      ],
    });
    participantsApiService = TestBed.inject(ParticipantsApiService);
    effects = TestBed.inject(ParticipantsEffects);
    notificationService = TestBed.inject(NotificationGlobalService);
    translateService = TestBed.inject(TranslateService);
  });
  describe('getParticipants$', () => {
    it('should dispatch getParticipantsSuccess action on successful API response', async () => {
      const processId = 'exampleProcessId';
      const participants: ParticipantResponse[] = [];
      const response: GetParticipantsResponse = {
        procurementProcessId: 'example',
        participantsDetail: participants,
      };
      const getParticipantsSpy = jest
        .spyOn(participantsApiService, 'getParticipants')
        .mockReturnValue(of(response));
      actions$ = of(participantsActions.getParticipants({ processId }));
      return effects.getParticipants$.toPromise().then((resultAction) => {
        expect(resultAction).toEqual(
          participantsActions.getParticipantsSuccess({
            processId: processId,
            participants: response.participantsDetail as ParticipantResponse[],
          })
        );
        expect(getParticipantsSpy).toHaveBeenCalledWith(processId);
      });
    });
    it('should dispatch getParticipantsError action on failed API call', async () => {
      const processId = 'exampleProcessId';
      const error = new Error('API Error');
      const getParticipantsSpy = jest
        .spyOn(participantsApiService, 'getParticipants')
        .mockReturnValue(throwError(error));
      actions$ = of(participantsActions.getParticipants({ processId }));
      return effects.getParticipants$.toPromise().catch((resultAction) => {
        expect(resultAction).toEqual(
          participantsActions.getParticipantsError({
            payload: error,
            processId: processId,
          })
        );
        expect(getParticipantsSpy).toHaveBeenCalledWith(processId);
      });
    });
  });
  describe('updateParticipant$', () => {
    it('should dispatch updateParticipantSuccess action on successful API call', async () => {
      const processId = '123';
      const participant: Participant = {
        biddingProcessBidderId: 'participant-id-1',
        amount: 0,
        bidder: {
          id: '',
          name: 'manuel',
          searchName: '',
          type: 1,
          nationality: 0,
          legalRepresentative: 'tony',
          economicSector: 0,
          beneficiaryOwner: 'raul',
          address: 'address #788',
          zipCode: '',
          country: null,
          // biddersOfJointVenture: []
        },
        biddingProcessParticipantId: 'participant-id-1',
        currency: 'US',
        result: null,
        totalScore: 0,
        weighedFinancialScore: 0,
        weighedTechScore: 0,
        amountUsd: 10,
      };
      const participantAddRequest: ParticipantAddRequest = {
        biddingProcessBidderId: participant.biddingProcessParticipantId,
        result: 0,
        weighedTechScore: participant.weighedTechScore,
        weighedFinancialScore: participant.weighedFinancialScore,
        totalScore: participant.totalScore,
        amount: participant.amount,
        currency: participant.currency,
        amountUsd: 10,
        rejectedReason: [],
        justificationEligibility: '',
      };
      const updateParticipantSpy = jest
        .spyOn(participantsApiService, 'updateParticipant')
        .mockReturnValue(of(undefined));
      const notificationServiceSpy = jest
        .spyOn(notificationService, 'showSuccess')
        .mockReturnValue();
      const spyTranslate = jest
        .spyOn(translateService, 'instant')
        .mockReturnValue('xd');
      const dispatchSpy = jest.spyOn(effects.store, 'dispatch');
      actions$ = of(
        participantsActions.updateParticipant({
          participantRequest: participantAddRequest,
          processId,
          participant,
        })
      );
      return effects.updateParticipant$.toPromise().then((resultAction) => {
        expect(resultAction).toEqual(
          participantsActions.updateParticipantSuccess({
            participant: participant,
            processId: processId,
          })
        );
        expect(updateParticipantSpy).toHaveBeenCalledWith(
          participantAddRequest,
          participant.biddingProcessParticipantId,
          processId
        );
        expect(notificationServiceSpy).toHaveBeenCalled();
        expect(spyTranslate).toHaveBeenCalledWith(
          'PARTICIPANT.SUBMIT_MSG.SUCCESS.UPDATE'
        );
        expect(dispatchSpy).toHaveBeenCalledWith(
          participantsActions.getParticipants({ processId: processId })
        );
      });
    });
    it('should dispatch updateParticipantError action on failed API call', async () => {
      const processId = '123';
      const error = {
        error: {
          status: 500,
        },
      };
      const participant: Participant = {
        biddingProcessBidderId: 'participant-id-1',
        amount: 0,
        bidder: {
          id: '',
          name: 'manuel',
          searchName: '',
          type: 1,
          nationality: 0,
          legalRepresentative: 'tony',
          economicSector: 0,
          beneficiaryOwner: 'raul',
          address: 'address #788',
          zipCode: '',
          country: null,
          // biddersOfJointVenture: []
        },
        biddingProcessParticipantId: 'participant-id-1',
        currency: 'US',
        result: null,
        totalScore: 0,
        weighedFinancialScore: 0,
        weighedTechScore: 0,
        amountUsd: 10,
      };
      const participantAddRequest: ParticipantAddRequest = {
        biddingProcessBidderId: participant.biddingProcessParticipantId,
        result: 0,
        weighedTechScore: participant.weighedTechScore,
        weighedFinancialScore: participant.weighedFinancialScore,
        totalScore: participant.totalScore,
        amount: participant.amount,
        currency: participant.currency,
        amountUsd: 10,
        rejectedReason: [],
        justificationEligibility: '',
      };
      const notificationServiceSpy = jest
        .spyOn(notificationService, 'showError')
        .mockReturnValue();
      const updateParticipantSpy = jest
        .spyOn(participantsApiService, 'updateParticipant')
        .mockReturnValue(throwError(error));
      actions$ = of(
        participantsActions.updateParticipant({
          participantRequest: participantAddRequest,
          processId,
          participant,
        })
      );
      return effects.updateParticipant$.toPromise().catch((resultAction) => {
        expect(resultAction).toEqual(
          participantsActions.updateParticipantError({
            processId: processId,
            payload: error,
          })
        );
        expect(updateParticipantSpy).toHaveBeenCalledWith(
          participantAddRequest,
          participant.biddingProcessParticipantId,
          processId
        );
        expect(notificationServiceSpy).toHaveBeenCalled();
      });
    });
  });
  describe('removeParticipant$', () => {
    it('should dispatch deleteParticipantsSuccess action on successful API call', async () => {
      const processId = '123';
      const participantId = 'participantId';
      const deleteParticipantSpy = jest
        .spyOn(participantsApiService, 'deleteParticipant')
        .mockReturnValue(of(undefined));
      const notificationServiceSpy = jest
        .spyOn(notificationService, 'showSuccess')
        .mockReturnValue();
      actions$ = of(
        participantsActions.deleteParticipants({
          biddingProcessParticipantId: participantId,
          processId,
        })
      );
      return effects.removeParticipant$.toPromise().then((resultAction) => {
        expect(resultAction).toEqual(
          participantsActions.deleteParticipantsSuccess({
            participantId: participantId,
            processId: processId,
          })
        );
        expect(notificationServiceSpy).toHaveBeenCalled();
        expect(deleteParticipantSpy).toHaveBeenCalledWith(
          participantId,
          processId
        );
      });
    });
    it('should dispatch deleteParticipantsError action on failed API call', async () => {
      const processId = '123';
      const error = {
        error: {
          status: 500,
        },
      };
      const biddingProcessParticipantId = 'participantId';
      const deleteParticipantSpy = jest
        .spyOn(participantsApiService, 'deleteParticipant')
        .mockReturnValue(throwError(error));
      const errorMsgSpy = jest.spyOn(notificationService, 'showError');
      actions$ = of(
        participantsActions.deleteParticipants({
          biddingProcessParticipantId,
          processId,
        })
      );
      return effects.removeParticipant$.toPromise().catch((resultAction) => {
        expect(resultAction).toEqual(
          participantsActions.deleteParticipantsError({
            payload: error,
            processId: processId,
          })
        );
        expect(deleteParticipantSpy).toHaveBeenCalledWith({
          biddingProcessParticipantId,
          processId,
        });
        expect(errorMsgSpy).toHaveBeenCalledWith(error);
      });
    });
  });
  describe('sucessMsg', () => {
    it('should show call showSuccess', async () => {
      const message = 'success';
      jest.spyOn(effects, 'sucessMsg');
      effects.sucessMsg(message);
      const notificationServiceSpy = jest
        .spyOn(notificationService, 'showSuccess')
        .mockReturnValue();
      expect(notificationServiceSpy).toHaveBeenCalled();
    });
  });
  describe('errorMsg', () => {
    it('should show error message for status 500', async () => {
      const error: HttpErrorResponse = {
        error: { status: 500 },
      } as HttpErrorResponse;
      jest.spyOn(effects, 'errorMsg');
      effects.errorMsg(error);
      const notificationServiceSpy = jest
        .spyOn(notificationService, 'showError')
        .mockReturnValue();
      const translateServiceSpy = jest
        .spyOn(translateService, 'instant')
        .mockReturnValue('a');
      expect(notificationServiceSpy).toHaveBeenCalled();
      expect(translateServiceSpy).toHaveBeenCalledWith(
        'PARTICIPANT.SUBMIT_MSG.ERROR.500'
      );
    });
    it('should show error message for status different of 500', async () => {
      const error: HttpErrorResponse = {
        error: { status: 400 },
      } as HttpErrorResponse;
      jest.spyOn(effects, 'errorMsg');
      effects.errorMsg(error);
      const notificationServiceSpy = jest
        .spyOn(notificationService, 'showError')
        .mockReturnValue();
      const translateServiceSpy = jest
        .spyOn(translateService, 'instant')
        .mockReturnValue('a');
      expect(notificationServiceSpy).toHaveBeenCalled();
      expect(translateServiceSpy).toHaveBeenCalledWith(
        'PARTICIPANT.SUBMIT_MSG.ERROR.GENERIC'
      );
    });
  });
  describe('addDisabledProperty', () => {
    it('should set allowToEdit to false for participants with biddingContractAwarded in true', () => {
      const participants: ParticipantResponse[] = [
        {
          biddingProcessBidderId: 'participant-id-1',
          amount: 0,
          bidder: null,
          biddingProcessParticipantId: 'participant-id-8',
          currency: 'US',
          result: null,
          totalScore: 0,
          weighedFinancialScore: 0,
          weighedTechScore: 0,
          biddingContractAwarded: true,
          biddingProcessDocumentAwarded: false,
          amountUsd: 10,
          justificationEligibility: '',
        },
      ];
      const expectedParticipants: ParticipantResponse[] = [
        {
          biddingProcessBidderId: 'participant-id-1',
          amount: 0,
          bidder: null,
          biddingProcessParticipantId: 'participant-id-8',
          currency: 'US',
          result: null,
          totalScore: 0,
          weighedFinancialScore: 0,
          weighedTechScore: 0,
          biddingContractAwarded: true,
          biddingProcessDocumentAwarded: false,
          allowToEdit: false,
          amountUsd: 10,
          justificationEligibility: '',
        },
      ];
      const result = effects.addDisabledProperty(participants);
      expect(result).toEqual(expectedParticipants);
    });
    it('should set allowToEdit to true for participants with biddingContractAwarded in false', () => {
      const participants: ParticipantResponse[] = [
        {
          biddingProcessBidderId: 'participant-id-1',
          amount: 0,
          bidder: null,
          biddingProcessParticipantId: 'participant-id-8',
          currency: 'US',
          result: null,
          totalScore: 0,
          weighedFinancialScore: 0,
          weighedTechScore: 0,
          biddingContractAwarded: false,
          biddingProcessDocumentAwarded: false,
          amountUsd: 10,
          justificationEligibility: '',
        },
      ];
      const expectedParticipants: ParticipantResponse[] = [
        {
          biddingProcessBidderId: 'participant-id-1',
          amount: 0,
          bidder: null,
          biddingProcessParticipantId: 'participant-id-8',
          currency: 'US',
          result: null,
          totalScore: 0,
          weighedFinancialScore: 0,
          weighedTechScore: 0,
          biddingContractAwarded: false,
          biddingProcessDocumentAwarded: false,
          allowToEdit: true,
          amountUsd: 10,
          justificationEligibility: '',
        },
      ];
      const result = effects.addDisabledProperty(participants);
      expect(result).toEqual(expectedParticipants);
    });
  });
});
