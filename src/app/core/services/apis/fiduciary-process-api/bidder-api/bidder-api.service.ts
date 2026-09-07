import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@fiduciary-interface/environments/environment';
import {
  GetBiddingProcessBiddersResponse,
  GetBiddingProcessBidderResponse,
  BiddingProcessBidderRequest,
  BiddingProcessBidderLocationResponse,
  ErrorResponse,
} from '@core/models';

@Injectable({
  providedIn: 'root',
})
export class BidderApiService {
  private readonly config = environment.hostApi.fiduciaryProcessApi;
  private readonly basePath = this.config.endpoint;

  constructor(private readonly httpClient: HttpClient) {}

  searchBidderByName(
    searchText: string
  ): Observable<GetBiddingProcessBiddersResponse> {
    const searchTextEncoded = encodeURIComponent(searchText);

    return this.httpClient.get<GetBiddingProcessBiddersResponse>(
      `${this.basePath}/api/biddingProcessBidders?searchText=${searchTextEncoded}`
    );
  }

  searchFirmOrSmeByName(
    textSearch: string
  ): Observable<GetBiddingProcessBiddersResponse> {
    return this.httpClient.get<GetBiddingProcessBiddersResponse>(
      `${this.basePath}/api/biddingProcessBidders/smeOrFirm?textSearch=${textSearch}`
    );
  }

  searchBidderById(
    biddingProcessBidderId: string
  ): Observable<GetBiddingProcessBidderResponse> {
    const url = `${this.basePath}/api/biddingProcessBidders/${biddingProcessBidderId}`;
    return this.httpClient.get<GetBiddingProcessBidderResponse>(url);
  }

  searchBidderLocationsById(
    biddingProcessBidderId: string
  ): Observable<BiddingProcessBidderLocationResponse> {
    const url = `${this.basePath}/api/biddingProcessBidders/${biddingProcessBidderId}/locations`;
    return this.httpClient.get<BiddingProcessBidderLocationResponse>(url);
  }

  registerBidder(bidder: BiddingProcessBidderRequest): Observable<string> {
    return this.httpClient.post<string>(
      `${this.basePath}/api/biddingProcessBidders`,
      bidder
    );
  }

  registerBidderJointVentureBidders(
    biddingProcessBidderId: string,
    biddingProcessBidderJointVentures: string[]
  ): Observable<unknown> {
    return this.httpClient.put<unknown>(
      `${this.basePath}/api/biddingProcessBidders/${biddingProcessBidderId}/biddingProcessBidderJointVentures`,
      biddingProcessBidderJointVentures
    );
  }

  updateBidder(
    biddingProcessBidderId: string,
    bidder: BiddingProcessBidderRequest
  ): Observable<unknown | ErrorResponse> {
    return this.httpClient.put<unknown | ErrorResponse>(
      `${this.basePath}/api/biddingProcessBidders/${biddingProcessBidderId}`,
      bidder
    );
  }

  updateBidderJointVentures(
    biddingProcessBidderId: string,
    jointVentures: string[]
  ): Observable<unknown | ErrorResponse> {
    return this.httpClient.put<unknown | ErrorResponse>(
      `${this.basePath}/api/biddingProcessBidders/${biddingProcessBidderId}/biddingProcessBidderJointVentures`,
      jointVentures
    );
  }
}
