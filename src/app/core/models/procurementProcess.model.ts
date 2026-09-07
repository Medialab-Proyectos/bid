export interface OutputSchema {
  id: string;
  percentage: number;
}

export interface BiddingMilestonesSchemaInput {
  order: number;
  code: string;
  initialEstimationDate: Date;
}

export class CommentSchemaInput {
  id: string;
  text: string;
  visibility: string;
}

export class BiddingProcess {
  procurementPlanId: string;
  country: string;
  projectNumber: string;
  institutionAcronym: string;
  name: string;
  description: string;
  bafo: boolean;
  manualId: string;
  sepaId: string;
  lots: number;
  category: string;
  procurementMethod: string;
  supervisionMethod: string;
  estimatedBidAmount: number;
  estimatedLocalCounterpartAmount: number;
  estimatedCofinancingAmount: number;
  estimatedProcessAmount: number;
  justification: string;
  goodReference: string;
  outputs: OutputSchema[];
  biddingMilestones: BiddingMilestonesSchemaInput[];
  comments: CommentSchemaInput[];
}
