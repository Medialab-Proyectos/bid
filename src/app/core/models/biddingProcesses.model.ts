import {
  BiddingMilestonesSchema,
  ProjectTaskSchema,
  CommentSchema,
  ComponentHistorySchema,
  DocumentPackageSchema,
  ProjectAmount,
  Advance,
} from '@core/models';
import { BiddingProcurementProcessComment } from './bidding-comments.model';
import { BiddingProcurementProcessMilestones } from './bidding-milestones.model';
import {
  BiddingProcessProcurementProcess,
  CategoryObject,
  ProcurementMethodObject,
  SupervisionMethodObject,
} from './bidding-process-plan.model';
import { Enumerator, GetBiddingProcessComponentResponse } from './responses';

export class BiddingProcesses {
  id: string;
  name: string;
  description: string;
  category: CategoryObject;
  categoryEnum?: Enumerator;
  procurementMethod: ProcurementMethodObject;
  procurementMethodEnum?: Enumerator;
  supervisionMethod: SupervisionMethodObject;
  isNotExante?: boolean;
  supervisionMethodEnum?: Enumerator;
  justification: string;
  status: number;
  statusEnum?: Enumerator;
  bafo: string;
  lots: number;
  manualId: string;
  sepaId: string;
  goodReference: string;
  processStartDate: string;
  contractSignedDate: string;
  destination: string;
  sustainabilityDescription: string;
  sustainability: string;
  components: string;
  outputs: ProjectTaskSchema[];
  deliverables: ProjectTaskSchema[];
  biddingMilestones: BiddingMilestonesSchema[];
  comments: CommentSchema[];
  componentHistories: ComponentHistorySchema[];
  documentPackages: DocumentPackageSchema[];
  created: string;
  createdBy: string;
  modified: string;
  modifiedBy: string;
  totalAmount: number;
  code: string;
  totalComments: number;
  currentMilestone?: string;

  advanceMilestone: Advance;
  subExecutor: string;
  projectAmount: ProjectAmount;
  estimatedAmountString?: string;
  totalAcumulatedAmount?: number;
  componentName: string;

  crudActions: string[];
  progress: string;
  statusTranslation?: string;
  categoryTranslation?: string;
  procurementMethodTranslation?: string;
  supervisionMethodTranslation?: string;
  isMigrated: boolean;
  packagesUnderReview: boolean;
  isUpdated: boolean;
  milestonesDelayed: string;
  marked: boolean;
  order: number;
}

export enum ProcurementProcessStatus {
  Expected = 'Expected',
  ProcessOnGoing = 'ProcessOnGoing',
  EvaluationBidProposals = 'EvaluationBidProposals',
  ContractUnderExecution = 'ContractUnderExecution',
  ContractFinished = 'ContractFinished',
}

export interface BiddingProcessProcurementProcessDetail {
  comments: BiddingProcurementProcessComment[];
  milestones: BiddingProcurementProcessMilestones[];
  outputs: GetBiddingProcessComponentResponse;
  process: BiddingProcessProcurementProcess;
}
