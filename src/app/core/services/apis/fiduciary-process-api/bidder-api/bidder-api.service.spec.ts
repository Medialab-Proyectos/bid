import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Bidder, BiddingProcessBidderRequest } from '@core/models';
import { environment } from '@fiduciary-interface/environments/environment';
import { HttpRequestController } from '@fiduciary-interface-test';

import { BidderApiService } from './bidder-api.service';

const basePath = environment.hostApi.fiduciaryProcessApi.endpoint;

describe('BidderApiService', () => {
  let service: BidderApiService;
  let httpMock: HttpRequestController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpRequestController],
    });
    service = TestBed.inject(BidderApiService);
    httpMock = TestBed.inject(HttpRequestController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function getBidder(): Bidder {
    return {
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
    };
  }

  it('should search bidder by name', () => {
    const bidderName = 'nelson';

    const responseMock = [getBidder(), getBidder()];

    service.searchBidderByName(bidderName).subscribe((bidder) => {
      expect(bidder).toEqual(responseMock);
    });

    httpMock.mockRequest(
      `${basePath}/api/biddingProcessBidders?searchText=${bidderName}`,
      'get',
      responseMock
    );
  });

  it('should search Firm or Sme bidder by name', () => {
    const bidderName = 'nelson';

    const responseMock = [getBidder(), getBidder()];

    service.searchFirmOrSmeByName(bidderName).subscribe((bidder) => {
      expect(bidder).toEqual(responseMock);
    });

    httpMock.mockRequest(
      `${basePath}/api/biddingProcessBidders/smeOrFirm?textSearch=${bidderName}`,
      'get',
      responseMock
    );
  });

  it('should search bidder by Id', () => {
    const bidderName = 'nelson';

    const responseMock = getBidder();

    service.searchBidderById(bidderName).subscribe((bidder) => {
      expect(bidder).toEqual(responseMock);
    });

    httpMock.mockRequest(
      `${basePath}/api/biddingProcessBidders/${bidderName}`,
      'get',
      responseMock
    );
  });

  it('should register bidder', () => {
    const mockBidder: BiddingProcessBidderRequest = null;
    const responseMock = { ...mockBidder };
    service.registerBidder(mockBidder).subscribe((bidder) => {
      expect(bidder).toEqual(responseMock);
    });

    httpMock.mockRequest(
      `${basePath}/api/biddingProcessBidders`,
      'post',
      responseMock
    );
  });

  it('should search bidder locations by id', () => {
    const bidderId = '10';
    const responseMock = null;
    service.searchBidderLocationsById(bidderId).subscribe((response) => {
      expect(response).toEqual(responseMock);
    });

    httpMock.mockRequest(
      `${basePath}/api/biddingProcessBidders/${bidderId}/locations`,
      'get',
      responseMock
    );
  });

  it('should register bidder joint ventures', () => {
    const bidderId = '10';
    const responseMock = null;
    service
      .registerBidderJointVentureBidders(bidderId, [])
      .subscribe((response) => {
        expect(response).toEqual(responseMock);
      });

    httpMock.mockRequest(
      `${basePath}/api/biddingProcessBidders/${bidderId}/biddingProcessBidderJointVentures`,
      'put',
      responseMock
    );
  });

  it('should update bidder', () => {
    const mockBidder: BiddingProcessBidderRequest = null;
    const bidderId = '10';
    const responseMock = null;
    service.updateBidder(bidderId, mockBidder).subscribe((response) => {
      expect(response).toEqual(responseMock);
    });

    httpMock.mockRequest(
      `${basePath}/api/biddingProcessBidders/${bidderId}`,
      'put',
      responseMock
    );
  });

  it('should update bidder joint ventures', () => {
    const jointVentures = ['1', '2'];
    const bidderId = '10';
    const responseMock = null;
    service
      .updateBidderJointVentures(bidderId, jointVentures)
      .subscribe((response) => {
        expect(response).toEqual(responseMock);
      });

    httpMock.mockRequest(
      `${basePath}/api/biddingProcessBidders/${bidderId}/biddingProcessBidderJointVentures`,
      'put',
      responseMock
    );
  });
});
