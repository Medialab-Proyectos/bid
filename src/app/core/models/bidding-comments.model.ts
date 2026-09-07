export interface BiddingProcurementProcessComment {
  id: string;
  biddingProcessProcurementProcessId: string;
  comment: BiddingProcessComment;
  marked?: boolean;
}

export interface BiddingProcessComment {
  id: string;
  visibility: number;
  source: number;
  status: number;
  text: string;
  createdBy: string;
}
