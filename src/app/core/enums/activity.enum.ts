export enum ActivityStatusEnum {
  Running,
  Finished,
  Suspended,
  Faulted,
  Cancelled,
  Completed,
}

export enum entityType {
  Project_Institution = 0,
  Procurement_Plan = 1,
  Procurement_Process = 2,
  Document_Package = 3,
  BiddingContractAmendment = 5,
  FinancialTransaction = 6,
}

//Se tiene que ocupar este enum
export enum StepTaskEnum {
  Default = 0, // iniciador del enum este no exite en el flujo
  Approve = 1,
  Complete = 2,
  Enter = 3,
  Expert_Opinion = 4,
  NA = 5,
  Non_Objection = 6,
  Receive = 7,
  Review_CAP = 8,
  Review_FMP = 9,
  Terminate = 10,
  Validate = 11,
}

export enum RolEnum {
  Team_Member = '1',
  Team_Leader = '2',
  Consultant = '16',
  Alternate_TeamLeader = '21',
  Procurement_Fiduciary_Specialist = '23',
  Project_Assistant = '15',
  Operational_Analyst = '25',
  Fiduciary_FinancialManagement_Specialist = '22',
  Procurement_Certified_Personnel = '202',
  Fiduciary_Tasks_Support = 'FTS',
  VPC_Manager = '186',
  VPS_Manager = '193',
  President_CAP = '194',
  FMS = '195',
  Secretary_CAP = '196',
  //values below this line are for external users only
  External_Coordinator = 'Coordinator',
  External_Procurement_Specialist = 'Procurement Specialist'
}

export enum OnlineDisburmentWorkflowStepsEnum {
  EnterAndSubmit = 0,
  Validate = 1,
  Review = 2,
  Authorize = 3,
  FinalAuthorize = 4,
}

export enum WorkflowODActionsEnum {
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
  InProgress = 1010,
}
