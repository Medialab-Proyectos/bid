import { WorkflowEntityScreen, WorkflowIdEntityType } from '@core/enums';

export interface WorkflowLaunchRequest {
  entityTypeId: string;
  isInternalVisibility: boolean;
  projectBucketId: string;
  instAcronym: string;
  packageId?: string;
  biddingContract?: string;
  businessRulesRequest: WorkflowLaunchRequestBR;
  workflowComment: WorkflowComment;
  role?: string;
}
export interface WorkflowComment {
    visibility: boolean;
    status: string;
    text: string;
  };

export interface WorkflowLaunchRequestBR {
  module?: string;
  table?: string;
  name?: string;
  factors: WorkflowLaunchRequestFactors;
}

export interface WorkflowLaunchRequestFactors
  extends WorkflowLaunchRequestSteps {
  workflowSection: WorkflowEntityScreen;
  categoryCode?: string;
  procurementCode?: string;
  totalAmountProcurementProcess?: string;
  totalAmountContractAmendments?: string;
  resultPackageType?: string;
  updateContractDates?: string;
  percentAmountContractAmendments?: string;
}

export interface WorkflowLaunchRequestSteps {
  secondStep?: string;
  thirdStep?: string;
  fourthStep?: string;
  fifthStep?: string;
}

export interface WorkflowLastStepRequestBody {
  entityTypeId: string;
  projectBucketId: string;
  idEntityType: WorkflowIdEntityType;
}

export interface NotificationSendByEntityType {
  Id: string;
  ProjectBucketId: string;
  EntityType: WorkflowIdEntityType;
}
export interface WorkflowTriggerRequestBody {
  projectBucketId: string;
  instAcronym: string;
  roleId: string;
  workflowInstanceId: string;
  actionSelected: string;
  packageId?: string;
  biddingContract?: string;
  workflowComment?: {
    visibility: boolean;
    status: string;
    text: string;
  };
}

export interface WorkflowLastStepRequest {
  body: WorkflowLastStepRequestBody;
  projectContractId: string;
  instAcronym: string;
}
