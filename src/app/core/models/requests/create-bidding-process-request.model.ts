export interface CreateBiddingProcessRequest {
  category: number;
  procurementMethod: number;
  supervisionType: number;
  goodsReference: number;
  sustainability: number;
  name: string;
  description: string;
  justification: string;
  bafo: boolean;
  sepaPlecaId: string;
  lots: number;
  manualId: string;
  sustainabilityDescription: string;
  subExecutor: string;

  costDistribution: AddPCostDistribution;
  outputsTask: AddOutputsTask;
  biddingProcessMilestones: AddBiddingProcessMilestone[];
  comments: AddComment[];
  countryCode: string;
}

export interface AddPCostDistribution {
  idbEstimatedAmount: number;
  localCounterpartAmount: number;
  cofinancedAmount: number;
  totalEstimatedAmount: number;
  costJustificaction: string;
}

export interface AddOutputsTask {
  componentId: string;
  outputs: Outputs[];
}

export interface Outputs {
  ouputId: string;
  percentageAssigned: number;
}

export interface AddBiddingProcessMilestone {
  id?: string;
  code: number;
  estimatedDate: string;
  reEstimatedDate: string;
  actualDate: string;
}

export interface AddComment {
  id: string;
  visibility?: number;
  status: number;
  text: string;
}
