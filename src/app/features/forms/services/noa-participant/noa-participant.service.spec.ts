import { NoaParticipantService } from './noa-participant.service';
import { ParticipantNoaResponse } from './../../../forms/models/response/participant-noa-response.model';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@fiduciary-interface/environments/environment';

const basePath = environment.hostApi.fiduciaryProcessApi.endpoint;

describe('NoaParticipantService', () => {
  let service: NoaParticipantService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(NoaParticipantService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function mockRequest(
    uri: string,
    method: string,
    response: unknown,
    error = null
  ) {
    const req = httpMock.expectOne(`${basePath}${uri}`);
    expect(req.request.method).toBe(method.toUpperCase());
    if (error) {
      req.flush(response, error);
    } else {
      req.flush(response);
    }
  }

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get noa participants', () => {
    const biddingProcessProcurementProcessId = 'COD-1234l-123rBG';
    const responseMock: ParticipantNoaResponse = {
      noaParticipants: [],
    };
    service
      .getNoaParticipants(biddingProcessProcurementProcessId)
      .subscribe((participantNoaResponse) => {
        expect(participantNoaResponse).toEqual(responseMock);
      });

    mockRequest(
      `/api/biddingDocuments/${biddingProcessProcurementProcessId}/noaParticipants`,
      'get',
      responseMock
    );
  });
});
