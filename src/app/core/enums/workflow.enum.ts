export enum WorkflowEntityScreen {
  PROCUREMENT_PLAN = 'ProcurementPlan',
  DOC_PACKAGES = 'BiddingProcessPackage',
  CONTRACT_AMENDMENT = 'BiddingContractAmendment',
  GENERAL_PROCUREMENT_NOTICE = 'GeneralProcurementNotice',
  FINANCIAL_TRANSACTION = 'FinancialTransaction',
  DOC_UNSUCESSFULL_PROC = 'BiddingProcessPackage-UnsuccesReject',
  BID_VALIDITY_EXTENSION = 'BidValidityExtension',
}

export enum WorkflowModuleEnum {
  BIDDING_PROCESS = 'BP',
  ONLINE_DISBURSEMENT = 'OD',
  GENERAL_PROCUREMENT_NOTICE = 'GPN',
}

export enum WorkflowIdEntityType {
  PROJECT_INSTITUTION = 0,
  PROCUREMENT_PLAN = 1,
  PROCUREMENT_PROCESS = 2,
  DOCUMENT_PACKAGE = 3,
  PROJECT_BUCKET = 4,
  BIDDING_CONTRACT_AMENDMENT = 5,
  FINANCIAL_TRANSACTION = 6,
  BIDDING_CONTRACT = 7,
}

export enum WorkflowProcurementActionEnum {
  APPROVE = 0,
  CONFIRM_CONTRACT = 1,
  CONFIRM_CONTRACT_AMENDMENT = 2,
  CONFIRM_TERMINATION = 3,
  FAVORABLE_EXPERT_OPINION = 4,
  FAVORABLE_EXPERT_OPINION_CONDITIONAL = 5,
  NON_FAVORABLE_EXPERT_OPINION = 6,
  NON_OBJECTION = 7,
  RECEIVE = 8,
  RETURN_TO_RECEIVE = 9,
  RETURN_WITH_COMMENTS = 10,
  REVIEW_CAP = 11,
  REVIEW_FMP = 12,
  SUBMIT = 13,
  VALIDATE = 14,
  CONDITIONAL_NON_OBJECTION = 23,
  CONDITIONAL_APPROVE = 24,
  EXPERT_OPINION_WITH_OBSERVATIONS = 25,
  SEND_FOR_PROCUREMENT_REVIEW = 26,
  CONDITIONAL_APPROVAL = 27,
  APPROVED = 28,
}

export enum WorkflowStepEnum {
  EnterAndSubmit = 0,
  Validate = 1,
  Review = 2,
  Authorize = 3,
  FinalAuthorize = 4,
  InternalReturn = 5,
  InternalReject = 6,
  ReturnedByIDB = 7,
  RejectedByIDB = 8,
  SentToIDB = 9,
}

export enum WorkflowCommentStatusEnum {
  COMPLETED = 'Completed',
}

export enum WorkflowLaunchModuleEnum {
  PROCUREMENT = 'Procurement',
}

export enum WorkflowLaunchTableEnum {
  TYPE_CONDITIONS = 'WorkflowTypeConditions',
}

export enum WorkflowLaunchNameEnum {
  PROCUREMENT_WORKFLOW_TYPE = 'ProcurementWorflowType',
}

export enum WorkflowDocumentVisibility {
  PUBLIC = 0,
  PRIVATE = 1,
}
