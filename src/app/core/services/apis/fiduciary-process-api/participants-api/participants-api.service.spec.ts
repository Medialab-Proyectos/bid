import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  Participant,
  ParticipantAddRequest,
  ParticipantsAwardedResponse,
} from '@core/models';
import { environment } from '@fiduciary-interface/environments/environment';
import { HttpRequestController } from '@fiduciary-interface-test';
import { ParticipantsApiService } from './participants-api.service';

const basePath = environment.hostApi.fiduciaryProcessApi.endpoint;

describe('ParticipantsApiService', () => {
  let service: ParticipantsApiService;
  let httpMock: HttpRequestController;
  const procurementProcessId = 'a1b1c1';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpRequestController],
    });
    service = TestBed.inject(ParticipantsApiService);
    httpMock = TestBed.inject(HttpRequestController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create participant', () => {
    const mockResponse = { message: 'created' };

    const participant: ParticipantAddRequest = {
      biddingProcessBidderId: '123456789',
      weighedTechScore: 20,
      weighedFinancialScore: 30,
      totalScore: 50,
      amount: 100000,
      currency: 'USD',
      result: 1,
    } as any;

    service
      .createParticipant(participant, procurementProcessId)
      .subscribe((response) => {
        expect(mockResponse).toEqual(response);
      });
    const uri = `/api/v2/procurement-process/${procurementProcessId}/participants`;

    httpMock.mockRequest(`${basePath}${uri}`, 'post', mockResponse);
  });

  it('should update participant', () => {
    const mockResponse = { message: 'Success' };

    const participant: ParticipantAddRequest = {
      biddingProcessBidderId: '123456789',
      result: 1,
      weighedTechScore: 20,
      weighedFinancialScore: 30,
      totalScore: 50,
      amount: 100000,
      currency: 'USD',
    } as any;

    const biddingProcessParticipantId = '1234567890';

    service
      .updateParticipant(
        participant,
        biddingProcessParticipantId,
        procurementProcessId
      )
      .subscribe((response) => {
        expect(mockResponse).toEqual(response);
      });
    const uri = `/api/v2/procurement-process/${procurementProcessId}/participants/${biddingProcessParticipantId}`;
    httpMock.mockRequest(`${basePath}${uri}`, 'put', mockResponse);
  });

  it('should delete participant', () => {
    const mockResponse = { message: 'deleted' };
    const biddingProcessParticipantId = '1234567890';
    service
      .deleteParticipant(biddingProcessParticipantId, procurementProcessId)
      .subscribe((response) => {
        expect(mockResponse).toEqual(response);
      });
    const uri = `/api/biddingProcessProcurementProcesses/${procurementProcessId}/biddingProcessParticipants/${biddingProcessParticipantId}`;
    httpMock.mockRequest(`${basePath}${uri}`, 'delete', mockResponse);
  });

  it('should get participants ', () => {
    const mockResponse = [];
    service.getParticipants(procurementProcessId).subscribe((response) => {
      expect(mockResponse).toEqual(response);
    });

    const uri = `/api/v2/procurement-process/${procurementProcessId}/participants`;
    httpMock.mockRequest(`${basePath}${uri}`, 'get', mockResponse);
  });

  it('should create participant request', () => {
    const participant: Participant = {
      biddingProcessBidderId: '123456789',
      weighedTechScore: 20,
      weighedFinancialScore: 30,
      totalScore: 50,
      amount: 100000,
      currency: 'USD',
      result: 1,
    } as any;

    const request = (service as any).getParticipantRequest(participant);
    expect(request).toEqual({
      biddingProcessBidderId: '123456789',
      weighedTechScore: 20,
      weighedFinancialScore: 30,
      totalScore: 50,
      amount: 100000,
      currency: 'USD',
      result: 1,
    });
  });

  it('should get awarded participants', async () => {
    const procurementProcessId = '123456789';
    const responseMock: ParticipantsAwardedResponse = {
      procurementProcessId: '1',
      participantsAwarded: [],
    };
    service
      .getAwardedParticipants(procurementProcessId)
      .subscribe((response) => {
        expect(responseMock).toEqual(response);
      });

    const url = `${basePath}/api/biddingProcessProcurementProcesses/${procurementProcessId}/biddingProcessParticipantsAwarded`;
    httpMock.mockRequest(url, 'get', responseMock);
  });
});
