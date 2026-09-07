import { TestBed } from '@angular/core/testing';
import { ProcurementDownloadService } from './procurement-download.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpRequestController } from '@fiduciary-interface-test';
import { environment } from '@fiduciary-interface/environments/environment';

describe('ProcurementDownloadService', () => {
  let service: ProcurementDownloadService;
  let httpMock: HttpRequestController;
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpRequestController],
    });
    service = TestBed.inject(ProcurementDownloadService);
    httpMock = TestBed.inject(HttpRequestController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call http.get with the correct endpoint', () => {
    const biddingProcessPlanId = 'exampleId';
    const url = `${environment.hostApi.fiduciaryProcessApi.endpoint}/api/biddingProcessPlans/${biddingProcessPlanId}/rawData`;
    const responseMock = new ArrayBuffer(10);

    service.downloadRawData(biddingProcessPlanId).subscribe((response) => {
      expect(response).toEqual(responseMock);
    });
    httpMock.mockRequest(url, 'get', responseMock);
  });
});