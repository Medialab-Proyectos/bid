export interface BiddingProcessBidderRequest {
  name: string;
  type: number;
  nationality: number;
  legalRepresentative: string;
  economicSector: number;
  beneficiaryOwner: string;
  location: {
    address: string;
    zipCode: string;
    country: string;
  };
}
