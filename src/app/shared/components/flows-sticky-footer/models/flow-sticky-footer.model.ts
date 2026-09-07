import { DocumentPackagesStatus, WorkflowIdEntityType } from '@core/enums';
import { WorkflowTriggerRequestBody } from '@core/models';
import { TransactionsTypes } from '@fiduciary-interface/app/features/transactions/enums';

export interface WorkflowButtonAction {
  id: number;
  text?: string;
  order?: number;
  idEntityType: WorkflowIdEntityType;
  mandatoryComment: boolean;
  mandatoryMFA: boolean;
  body: WorkflowTriggerRequestBody;
  loading: boolean;
}

export interface WorkflowTriggerExtraInfo {
  transactionId?: number;
  processId?: string;
  docPackageStatus?: DocumentPackagesStatus;
  operationNumber?: string;
  transactionType?: TransactionsTypes;
  transactionIdsATJ?: number[];
}
