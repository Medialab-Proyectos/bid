export interface WorkflowLastStepResponse {
  currentStep: string;
  nextStep: string;
  nextActions: WorkflowAction[];
  nextActors: string[];
  nextUsers: string[];
  workflowInstanceId: string;
  actionSelected: string;
  workflowDocument: boolean;
}

export interface WorkflowAction {
  id: number;
  name: string;
  order: number;
  requireComments: boolean;
  requireMFA: boolean;
}

export interface PostWorkflowDocumentResponse {
  CreationDate: Date;
  Description: string;
  Id: string;
  NewFileName: string;
  Visibility: number;
}

export interface GetWorkflowDocumentResponse {
  created: Date;
  description: string;
  fiduciaryProcessDocumentId: string;
  fileName: string;
  visibility: number;
}
