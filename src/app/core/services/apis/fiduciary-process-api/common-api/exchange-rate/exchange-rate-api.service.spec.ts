import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ExchangeRateApiService } from '@core/services/apis/fiduciary-process-api/common-api/exchange-rate/exchange-rate-api.service';
import { environment } from '@fiduciary-interface/environments/environment';

const basePath = environment.hostApi.fiduciaryProcessApi.endpoint;

describe('ExchangeRateApiService', () => {
  let service: ExchangeRateApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ExchangeRateApiService);
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

  it('Should convert a given currency', () => {
    const fromCurrency = 'EUR';
    const responseMock = {
      fromCurrency: 'EUR',
      toCurrency: 'USD',
      exchangeRate: 0.82112,
    };

    service.convert(fromCurrency).subscribe((conversion) => {
      expect(conversion).toEqual(responseMock);
    });

    mockRequest(
      `/api/common/exchangerate/usd/converter?fromCurrency=${fromCurrency}`,
      'get',
      responseMock
    );
  });
});
