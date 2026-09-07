export interface BiddingProcurementProcessMilestones {
  id: string;
  biddingProcessProcurementProcessId: string;
  status: number;
  code: number;
  order: number;
  estimatedDate: Date;
  reEstimateDate: Date;
  actualDate: Date;
  packageStatus: number;
}
