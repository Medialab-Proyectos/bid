import { Bidder, MasterDataEnum } from './';

export class Participant {
  amount: number;
  bidder: Bidder;
  biddingProcessBidderId: string;
  biddingProcessParticipantId: string;
  currency: string;
  result: MasterDataEnum;
  totalScore: number;
  weighedFinancialScore: number;
  weighedTechScore: number;
  options?: string[];
  allowToEdit?: boolean;
  amountUsd: number;
  rejectedReasons?: MasterDataEnum[];
  justificationEligibility?: string;
}
