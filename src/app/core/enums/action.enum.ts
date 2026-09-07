export enum Action {
  edit = 'Edit',
  view = 'View',
  delete = 'Delete',
}

export enum ProcessActions {
  edit = 'PROCUREMENT.PROCESS.OPTIONS.EDIT',
  view = 'PROCUREMENT.PROCESS.OPTIONS.VIEW',
  delete = 'PROCUREMENT.PROCESS.OPTIONS.DELETE',
  cancel = 'PROCUREMENT.PROCESS.OPTIONS.CANCEL',
  addComment = 'PROCUREMENT.PROCESS.OPTIONS.ADD_COMMENT',
  replicate = 'PROCUREMENT.PROCESS.OPTIONS.REPLICATE',
  ineligibility = 'PROCUREMENT.PROCESS.OPTIONS.INELIGIBILITY',
  unsuccessful = 'PROCUREMENT.PROCESS.OPTIONS.UNSUCCESSFUL',
}

export enum PermissionActions {
  VIEW_DISBURSEMENT_ACTION = 'ViewDisburmentAction',
  TRANSACTION_ACTION = 'TransactionAction',
  WORKFLOW_MANAGEMENT = 'WorkflowManagement',
  WORKFLOW_PERMISSION = 'IfUserExistsInWorkflow',
  CAN_EDIT = 'CanEdit',
  CAN_NOT_EDIT = 'CanNotEdit',
  IS_CREATE = 'IsCreate',
  IS_EDIT = 'IsEdit',
}
