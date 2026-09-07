export interface WorkflowActive {
  projectBucketId: string;
  idEntityType?: IdentityType;
}

export enum IdentityType {
  PROJECTINSTITUTION = 0,
  PROCUREMENTPLAN = 1,
  PROCUREMENTPROCESS = 2,
  DOCUMENTPACKAGE = 3,
  PROJECTBUCKET = 4,
  BIDDINGCONTRACTAMENDMENT = 5,
  FINANCIALTRANSACTION = 6,
}

export interface EntityTypes {
  workflowsActive: string[];
}
