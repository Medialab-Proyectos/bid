export interface WorkflowDocument {
  id: string;
  name: string;
  created: Date;
  description: string;
  newDescription?: string;
  visibility: number;
}

export interface UpdateWorkflowDocument {
  description?: string;
  visibility?: number;
}
