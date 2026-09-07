import { AssignedUser } from './assigned-user.model';

export interface WorkflowConfig {
  workFlowConfig?: WorkflowStep[];
  usersRolUpdated?: string[];
  usersInstitutionUpdated?: string[];
}

export interface WorkflowStep {
  id?: string;
  step?: number;
  institutionCode?: string;
  order?: number;
  assignedUsers?: AssignedUser[];
  taskDescription?: string;
  lastUpdate?: Date;
  lastUpdateBy?: string;
  isMandatory?: boolean;
}

export interface GetTransactionStatus {
  transactionStatusId: number;
}
