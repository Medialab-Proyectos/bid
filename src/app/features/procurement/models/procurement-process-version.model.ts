export interface ProcurementProcessVersion {
  biddingProcessProcurementProcessUpdateModel: BiddingProcessProcurementProcessUpdateModel;
  entityType: number;
  procurementPlanVersion: number;
}

export interface BiddingProcessProcurementProcessUpdateModel {
  name: Change;
  manualId: Change;
  description: Change;
  subExecutor: Change;
  category: Change;
  procurementMethod: Change;
  supervisionMethod: Change;
  estimatedTotalAmount: Change;
  idbAmount: Change;
  totalCounterPartAmount: Change;
  coFinancingAmount: Change;
  sustainabilityLabel: Change;
  sustainabilityDescription: Change;
  component: Change;
  outputs: Change;
  milestones: Change;
  lots: Change;
  sepaID: Change;
  bafo: Change;
  goods: Change;
  biddingProcessProcurementProcessId: string;
}

export interface Change {
  lastModification: string | number | MilestoneObject | OutputObject[];
  modified: string;
  modifiedBy: string;
  name: string;
  previousValue: string | number | MilestoneObject | OutputObject[];
}

export interface ChangeDetail {
  key: string;
  value: string | number;
  isUpdated: boolean;
}

export interface MilestoneObject {
  milestones: MilestoneArray[];
  modified: string;
  modifiedBy: string;
}

export interface MilestoneArray {
  code: ChangeDetail;
  estimatedDate: ChangeDetail;
  reEstimateDate: ChangeDetail;
  actualDate: ChangeDetail;
  order: ChangeDetail;
}

export interface OutputObject {
  output: ChangeDetail;
  amount: ChangeDetail;
}
