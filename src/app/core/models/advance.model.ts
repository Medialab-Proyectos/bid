export interface Advance {
  total: number;
  totalCompleted: number;
  delayed: boolean;
  currentMilestone: CurrentMilestone;
}

export interface CurrentMilestone {
  id: string;
  biddingProcessProcurementProcessId: string;
  status: number;
  code: number;
  order: number;
  estimatedDate: string;
  reEstimateDate: string;
  actualDate: string;
}
