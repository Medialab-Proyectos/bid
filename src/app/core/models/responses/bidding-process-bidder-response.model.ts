import { BiddingProcessBidderRequest } from '..';
import { Bidder } from '../bidder.model';

export interface BiddingProcessBidderResponse
  extends BiddingProcessBidderRequest {
  id: string;
  type: number;
  economicSector: number;
  name: string;
  nationality: number;
  legalRepresentative: string;
  beneficiaryOwner: string;
  biddersJointVenture?: string[];
}
export interface GetBiddingProcessBidderResponse {
  biddingProcessBidder: Bidder;
}
export interface GetBiddingProcessBiddersResponse {
  biddingProcessBidders: Bidder[];
}

export interface BiddingProcessBidderLocationResponse {
  locations: Locations[];
}

export interface Locations {
  address: string;
  zipCode: string;
  country: string;
  id: string;
}
