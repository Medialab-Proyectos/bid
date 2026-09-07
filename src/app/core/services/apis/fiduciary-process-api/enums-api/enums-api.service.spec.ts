import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@fiduciary-interface/environments/environment';
import { EnumsApiService } from './enums-api.service';

const basePath = environment.hostApi.fiduciaryProcessApi.endpoint;

describe('ProjectBucketApiService', () => {
  let service: EnumsApiService;
  let httpMock: HttpTestingController;

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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(EnumsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Should call the enum api biddingcontracts/statuses', () => {
    const url = 'biddingcontracts/statuses';
    const responseMock = [
      {
        enumerator: [
          {
            id: 0,
            name: 'string',
          },
        ],
      },
    ];

    service.getEnumType(url).subscribe((enumerator) => {
      expect(enumerator).toEqual(responseMock);
    });

    mockRequest(`/api/biddingcontracts/statuses`, 'get', responseMock);
  });
});
