export interface WorkflowInstitution {
  institutions?: Institution[];
}

export interface Institution {
  institutionCode?: string;
  loanNumber?:      string;
  operationNumber?: string;
  instRoleDesc?:    string;
}
