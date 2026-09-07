export interface ActivityTableRow {
  workflowInstanceId: string;
  projectBucketId: string;
  entityType: number;
  isInternalVisibility: boolean;
  createdBy: string;
  workflowCode: string;
  externalWorkflowInstance: string;
  createdAt: Date;
  lastExecution: Date;
  workflowStatus: string;
  entityTypeId: string;
  comment: WorkFlowComment[];
  task: TaskRowResponse[];
}

export interface WorkFlowComment {
  id: string;
  visibility: number;
  source: number;
  status: number;
  text: string;
  created?: Date;
}

export interface TaskRowResponse {
  step: number;
  role: string[];
  roles: string;
  user: string[];
  users: string;
  update?: Date;
  action: string;
  linkTaskAction: string;
  stepLiteral: string;
}

export interface ActivityTaskRowAction {
  isActive: boolean;
  accion: string;
  url: string;
  id: string;
}
