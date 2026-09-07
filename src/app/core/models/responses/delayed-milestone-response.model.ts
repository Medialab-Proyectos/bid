import { SelectedFilterForBiddingProcess } from '../delyedMilestoneTable.model';

export interface DelayedMilestoneEmitter {
  processIds: string[];
  selectedFilterForBiddingProcess: SelectedFilterForBiddingProcess;
}

export interface DelayedMilestoneProcessResponse {
  exAnte: ProcessStatusResponse;
  exPost: ProcessStatusResponse;
  local: ProcessStatusResponse;
  nationalSystem: ProcessStatusResponse;
}

export interface DelayedMilestoneContractsResponse {
  exAnte: ContractsStatusResponse;
  exPost: ContractsStatusResponse;
  local: ContractsStatusResponse;
  nationalSystem: ContractsStatusResponse;
}
export interface DelayedMilestoneAmendmentsResponse {
  exAnte: AmendmentsStatusResponse;
  exPost: AmendmentsStatusResponse;
  local: AmendmentsStatusResponse;
  nationalSystem: AmendmentsStatusResponse;
}

interface AmendmentsStatusResponse {
  amedmentReviewed: ContractAndAmendmentCountResponse[];
  amedmentUnderReview: ContractAndAmendmentCountResponse[];
  inExecution: ContractAndAmendmentCountResponse[];
  pendingSignature: ContractAndAmendmentCountResponse[];
  signed: ContractAndAmendmentCountResponse[];
}

interface ContractsStatusResponse {
  expired: ContractAndAmendmentCountResponse[];
  finish: ContractAndAmendmentCountResponse[];
  inExecution: ContractAndAmendmentCountResponse[];
  inExecutionWithAmedments: ContractAndAmendmentCountResponse[];
  pendingSignature: ContractAndAmendmentCountResponse[];
  signed: ContractAndAmendmentCountResponse[];
}

interface ProcessStatusResponse {
  contractSigned: PastDueOnTimeProcessIdResponse;
  evaluationOfBidProposal: PastDueOnTimeProcessIdResponse;
  expected: PastDueOnTimeProcessIdResponse;
  processOnGoing: PastDueOnTimeProcessIdResponse;
  technicalEvaluationOfBidProposal: PastDueOnTimeProcessIdResponse;
}

interface PastDueOnTimeProcessIdResponse {
  procurementProcessOnTime: string[];
  procurementProcessPastDue: string[];
}

export interface ContractAndAmendmentCountResponse {
  procurementProcessId: string;
  total: number;
}
