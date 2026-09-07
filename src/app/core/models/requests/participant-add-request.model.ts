export interface ParticipantAddRequest {
  biddingProcessBidderId: string;
  result: number;
  weighedTechScore: number;
  weighedFinancialScore: number;
  totalScore: number;
  amount: number;
  currency: string;
  amountUsd: number;
  rejectedReason: number[];
  justificationEligibility: string;
}
