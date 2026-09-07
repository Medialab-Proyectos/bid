import { CommonApiService } from '@core/services/apis/fiduciary-process-api/common-api/common-api.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../../../environments/environment';

const basePath = environment.hostApi.fiduciaryProcessApi.endpoint;

describe('CommonApiService', () => {
  let service: CommonApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(CommonApiService);
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

  it('Should list all currencies', () => {
    const responseMock = [
      {
        currency: 'USD',
        isHard: false,
        isBorrowing: true,
        numberOfDecimals: 2,
      },
      {
        currency: 'EUR',
        isHard: true,
        isBorrowing: true,
        numberOfDecimals: 2,
      },
    ];

    service.getCurrencies().subscribe((currencies) => {
      expect(currencies).toEqual(responseMock);
    });

    mockRequest(`/api/common/currencies`, 'get', responseMock);
  });
});
