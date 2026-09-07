import { GetWorkflowDocumentResponse } from './workflow-response.model';

export interface ActivitiesActiveObject {
  workflowInstanceId: string;
  projectBucketId: string;
  entityType: number;
  isInternalVisibility: boolean;
  createdBy: string;
  workflowCode: string;
  externalWorkflowInstance: string;
  createdAt: Date;
  lastExecution: null;
  workflowStatus: string;
  entityTypeId: string;
  Comment: WorkFlowComment[];
  task: TaskRowResponse[];
  operationNumber: string;
  contractNumber: string;
  activityCode: string;
  currentStep: number;
  showDetails: boolean;
  workflowDocuments?: GetWorkflowDocumentResponse[];
  pendingAction: number;
  pendingActionTranslated?: string;
  ActivityType?: string;
}

export interface ActivitiesActiveResponse {
  data: ActivitiesActiveObject[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

export interface WorkFlowComment {
  id: string;
  visibility: number;
  source: number;
  status: number;
  text: string;
  created?: Date;
  createdBy?: string;
}

export interface TaskRowResponse {
  step: number;
  role: string[];
  roles: string;
  user: string;
  update?: Date;
  action: string;
  linkTaskAction?: string;
  stepLiteral: string;
  actionTranslate?: string;
}
