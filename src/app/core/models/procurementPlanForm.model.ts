export interface ProcurementPlanFormData {
  id?: string;
  tenderName?: string;
  tenderAmount?: string;
  procurementProcessID?: string;
  procurementProcessTaskID?: string;
  procurementPlanID?: string;
  name: string;
  description: string;
  procurementMethod: string;
  supervisionMethod: string;
  justification: string;
  status: Status;
  bafo: string;
  lots: string;
  manualID: string;
  sepaId: string;
  commentsCollection: Comment[];
  component: string;
  milestoneCollection: Milestone[];
  outputsAsigned: Output[];
  distributionAmount: number;
  distributionCofinantial: number;
  distributionCost: number;
  distributionCounterpart: number;
  subexecutor: string;
  category: string;
}
export interface Comment {
  public: string;
  commentEditor: string;
}
export enum Status {
  Draft,
  UnderReview,
  Completed,
}
export interface Milestone {
  ID: string;
  name: string;
  actualDate: string;
  estimateDate: string;
  reEstimatedDate: string;
  created: Date;
  modified: Date;
  createdBy: string;
  modifiedBy: string;
}
export interface Output {
  amountAsigned: number;
  name: string;
}
