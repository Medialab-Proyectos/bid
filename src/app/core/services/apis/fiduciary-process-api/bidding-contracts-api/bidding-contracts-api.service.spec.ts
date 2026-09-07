import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BiddingContractsRequest } from '@core/models/requests/bidding-contracts-request.model';
import { BiddingContractAwardees } from '@core/models/responses/bidding-contracts-response.model';
import { HttpRequestController } from '@fiduciary-interface-test';
import { environment } from '@fiduciary-interface/environments/environment';

import { BiddingContractApiService } from './bidding-contracts-api.service';

const basePath = `${environment.hostApi.fiduciaryProcessApi.endpoint}/api/biddingContracts`;

describe('BiddingProcessDocumentPackagesApiService', () => {
  let service: BiddingContractApiService;
  let http: HttpRequestController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpRequestController],
    });
    service = TestBed.inject(BiddingContractApiService);
    http = TestBed.inject(HttpRequestController);
  });

  it('should save contract', () => {
    const request: BiddingContractsRequest = null;
    const responseMock = 'response';
    service.postBiddingContracts(request).subscribe((response) => {
      expect(response).toEqual(responseMock);
    });

    http.mockRequest(basePath, 'post', responseMock);
  });

  it('should confirm contract', () => {
    const contractId = '1234578';
    const responseMock = 'response';
    service.putConfirmContract(contractId, 'EN').subscribe((response) => {
      expect(response).toEqual(responseMock);
    });

    http.mockRequest(
      basePath + `/${contractId}/confirm?lang=EN`,
      'put',
      responseMock
    );
  });

  it('should terminate contract', () => {
    const contractId = '1234578';
    const responseMock = 'response';
    service.terminateContract(contractId, 'EN').subscribe((response) => {
      expect(response).toEqual(responseMock);
    });

    http.mockRequest(
      basePath + `/${contractId}/statuses/terminated?lang=EN`,
      'put',
      responseMock
    );
  });

  it('should get awardees', () => {
    const projectBucketId = 'id';
    const responseMock: BiddingContractAwardees[] = [
      {
        name: 'string',
        nationality: 2,
      },
    ];

    service.getContractAwardees(projectBucketId).subscribe((response) => {
      expect(response).toEqual(responseMock);
    });
    const url = `${basePath}/${projectBucketId}/awardees`;
    http.mockRequest(url, 'get', responseMock);
  });

  it('should get bidding contract locations', () => {
    const projectBucketId = 'id';
    const responseMock = 'response';
    service
      .getBiddingContractLocations(projectBucketId)
      .subscribe((response) => {
        expect(response).toEqual(responseMock);
      });
    const url = `${basePath}/${projectBucketId}/biddingContractLocations/locations`;
    http.mockRequest(url, 'get', responseMock);
  });

  it('should get contract Currencies', () => {
    const projectBucketId = 'id';
    const responseMock = 'response';
    service
      .getBiddingContractCurrencies(projectBucketId)
      .subscribe((response) => {
        expect(response).toEqual(responseMock);
      });
    const url = `${basePath}/${projectBucketId}/biddingContractCurrencies`;
    http.mockRequest(url, 'get', responseMock);
  });

  it('should get bidding contract lots', () => {
    const projectBucketId = 'id';
    const responseMock = 'response';

    service.getBiddingContractLots(projectBucketId).subscribe((response) => {
      expect(response).toEqual(responseMock);
    });
    const url = `${basePath}/${projectBucketId}/biddingContractLots`;
    http.mockRequest(url, 'get', responseMock);
  });

  it('should get bidding contract securities', () => {
    const projectBucketId = 'id';
    const responseMock = 'response';

    service
      .getBiddingContractSecurities(projectBucketId)
      .subscribe((response) => {
        expect(response).toEqual(responseMock);
      });
    const url = `${basePath}/${projectBucketId}/biddingContractSecurities`;
    http.mockRequest(url, 'get', responseMock);
  });

  it('should get bidding contract documents', () => {
    const projectBucketId = 'id';
    const responseMock = 'response';

    service
      .getBiddingContractDocuments(projectBucketId)
      .subscribe((response) => {
        expect(response).toEqual(responseMock);
      });
    const url = `${basePath}/${projectBucketId}/biddingContractDocuments`;
    http.mockRequest(url, 'get', responseMock);
  });

  it('should get bidding contract by id', () => {
    const biddingContractId = 'id';
    const responseMock = 'response';

    service.getContractById(biddingContractId).subscribe((response) => {
      expect(response).toEqual(responseMock);
    });
    const url = `${basePath}/${biddingContractId}`;
    http.mockRequest(url, 'get', responseMock);
  });

  it('should post amendment', () => {
    const biddingContractId = 'id';
    const amendment = null;
    const responseMock = 'response';

    service
      .postAmendment(biddingContractId, amendment)
      .subscribe((response) => {
        expect(response).toEqual(responseMock);
      });
    const url = `${basePath}/${biddingContractId}/amendments`;
    http.mockRequest(url, 'post', responseMock);
  });

  it('should update amendment', () => {
    const amendmentId = 'id';
    const amendment = null;
    const responseMock = 'response';

    service.putAmendment(amendmentId, amendment).subscribe((response) => {
      expect(response).toEqual(responseMock);
    });
    const url = `${basePath}/amendments/${amendmentId}`;
    http.mockRequest(url, 'put', responseMock);
  });

  it('should get amendment by id', () => {
    const amendmentId = 'id';
    const responseMock = 'response';

    service.getAmendmentById(amendmentId).subscribe((response) => {
      expect(response).toEqual(responseMock);
    });
    const url = `${basePath}/${amendmentId}/amendment`;
    http.mockRequest(url, 'get', responseMock);
  });

  it('should update put confirm amendment', () => {
    const amendmentId = 'id';
    const responseMock = 'response';

    service
      .putConfirmAmendment(amendmentId, 'EN', false)
      .subscribe((response) => {
        expect(response).toEqual(responseMock);
      });
    const url = `${basePath}/amendments/${amendmentId}/confirm?lang=EN&isAmendmentForNonObjection=false`;
    http.mockRequest(url, 'put', responseMock);
  });

  it('should update put complete contract', () => {
    const biddingContractId = 'id';
    const responseMock = null;

    service.completeContract(biddingContractId, 'EN').subscribe((response) => {
      expect(response).toEqual(responseMock);
    });
    const url = `${basePath}/${biddingContractId}/complete?lang=EN`;
    http.mockRequest(url, 'put', responseMock);
  });
});
