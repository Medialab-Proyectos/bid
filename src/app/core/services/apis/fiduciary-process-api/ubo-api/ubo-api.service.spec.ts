import { TestBed } from '@angular/core/testing';

import { UboApiService } from './ubo-api.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UBOBiddersResponse } from '@core/models/responses/ubo-response.model';
import { HttpRequestController } from '@fiduciary-interface/test/requests';
import { environment } from '@fiduciary-interface/environments/environment';
import { UBOBiddersRequest, UBOData } from '@core/models/ubo.model';

describe('UboApiService', () => {
  let service: UboApiService;
  let httpMock: HttpRequestController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpRequestController],
    });
    service = TestBed.inject(UboApiService);
    httpMock = TestBed.inject(HttpRequestController);
  });
  afterEach(() => {
    httpMock?.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should retrieve bidders for a given processId', () => {
    const mockResponse: UBOBiddersResponse = {
      bidders: [],
    };
    const processId = '123';

    service.getUBOBidders(processId).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });
    const url = `${environment.hostApi.fiduciaryProcessApi.endpoint}/api/v2/procurement-process/${processId}/property-effective/bidders`;
    httpMock.mockRequest(url, 'get', mockResponse);
  });

  it('should post UBO bidders and return the response', () => {
    const packageId = '123';
    const bidders: UBOBiddersRequest = {
      bidders: [],
      executor: '',
    };
    const mockResponse = 'Success';

    service.postUBOEmails(packageId, bidders).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });
    const url = `${environment.hostApi.fiduciaryProcessApi.endpoint}/api/v2/document-packages/${packageId}/property-effective/emails`;
    httpMock.mockRequest(url, 'post', mockResponse);
  });

  it('should return UBOData when getUBO is called for the first time', () => {
    const mockData: UBOData = {};

    service.getUBO().subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    const url = 'assets/json/uboRules.json';
    httpMock.mockRequest(url, 'get', mockData);
  });
});
