import { BiddingProcessPlan, BiddingProcessProcurementProcess } from '..';

export interface GetBiddingProcessPlanResponse {
  biddingProcessPlan: BiddingProcessPlan;
}

export interface GetBiddingProcessPlanResponseV3 {
  id: string;
  status: number;
  approvedDate: string;
  approvedBy: string;
}

export interface GetBiddingProcurementProcessByIdResponse {
  biddingProcessProcurementProcess: BiddingProcessProcurementProcess;
}

export type GetBiddingProcurementProcessesByProcessPlanIdResponse =
  BiddingProcessProcurementProcess[];
