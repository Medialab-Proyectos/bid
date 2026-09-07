export enum DelayedMilestoneTableTypeEnum {
  CONTRACTS = 'contractsByDelayedMilestones',
  AMENDMENTS = 'amedmentsByDelayedMilestones',
  PROCESS = 'processByDelayedMilestones',
}

export enum DelayedMilestoneTableRowsEnum {
  EX_ANTE = 'exAnte',
  EX_POST = 'exPost',
  NATIONAL_SYSTEM = 'nationalSystem',
  LOCAL = 'local',
}

export enum DelayedMilestoneTableProcessColEnum {
  EXPECTED = 'expected',
  PROCESS_ONGOING = 'processOnGoing',
  TECH_EVA_BID_PROPROSAL = 'technicalEvaluationOfBidProposal',
  EVA_BID_PROPOSAL = 'evaluationOfBidProposal',
  CONTRACT_SIGNED = 'contractSigned',
}

export enum DelayedMilestoneTableContractsColEnum {
  PENDING_SIGNATURE = 'pendingSignature',
  SIGNED = 'signed',
  IN_EXECUTION = 'inExecution',
  EXECUTION_AMENDMENTS = 'inExecutionWithAmendments',
  EXPIRED = 'expired',
  FINISH = 'finish',
}

export enum DelayedMilestoneTableAmendmentsColEnum {
  PENDING_SIGNATURE = 'pendingSignature',
  AMENDMENT_UNDER_REVIEW = 'amendmentUnderReview',
  AMENDMENT_REVIEWED = 'amendmentReviewed',
  SIGNED = 'signed',
}

export enum AmendmentsStatisColEnum {
  'DELAYED_MILESTONE.AMENDMENTS_COL.NULL',
  'DELAYED_MILESTONE.AMENDMENTS_COL.PENDING_SIGNATURE',
  'DELAYED_MILESTONE.AMENDMENTS_COL.AMEDNMENT_UNDER_REVIEW',
  'DELAYED_MILESTONE.AMENDMENTS_COL.AMENDMENT_REVIEWED',
  'DELAYED_MILESTONE.AMENDMENTS_COL.SIGNED',
}
export enum ContractsStaticColEnum {
  'DELAYED_MILESTONE.CONTRACTS_COL.NULL',
  'DELAYED_MILESTONE.CONTRACTS_COL.PENDING_SIGNATURE',
  'DELAYED_MILESTONE.CONTRACTS_COL.SIGNED',
  'DELAYED_MILESTONE.CONTRACTS_COL.IN_EXECUTION',
  'DELAYED_MILESTONE.CONTRACTS_COL.EXECUTION_AMENDMENTS',
  'DELAYED_MILESTONE.CONTRACTS_COL.EXPIRED',
  'DELAYED_MILESTONE.CONTRACTS_COL.FINISH',
}
export enum ProcessStaticColEnum {
  'DELAYED_MILESTONE.PROCESS_COL.PROCESS_STATUS',
  'DELAYED_MILESTONE.PROCESS_COL.EXPECTED',
  'DELAYED_MILESTONE.PROCESS_COL.ON_GOING',
  'DELAYED_MILESTONE.PROCESS_COL.TECH_BID_PROPOSAL',
  'DELAYED_MILESTONE.PROCESS_COL.EVA_BID_PROPOSAL',
  'DELAYED_MILESTONE.PROCESS_COL.CONTRACT_SIGNED',
}
export enum ProcessStaticColEnum2 {
  'DELAYED_MILESTONE.PROCESS_COL.ON_TIME',
  'DELAYED_MILESTONE.PROCESS_COL.DELAYED',
}
export enum StaticRowEnum {
  'DELAYED_MILESTONE.STATIC_ROW.EX_ANTE',
  'DELAYED_MILESTONE.STATIC_ROW.EX_POST',
  'DELAYED_MILESTONE.STATIC_ROW.NATIONAL_SYSTEM',
  'DELAYED_MILESTONE.STATIC_ROW.LOCAL',
}
export enum ProcessOnTimePastDue {
  ON_TIME = 'procurementProcessOnTime',
  PAST_DUW = 'procurementProcessPastDue',
}
