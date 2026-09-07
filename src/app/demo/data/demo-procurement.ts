import {
  BiddingProcessPlanStatus,
  BiddingProcessProcurementProcessStatuses,
  BiddingProcurementProcessSupervisionMethods,
} from '@core/enums';
import {
  DEMO_CATEGORY_IDS,
  DEMO_MILESTONE_IDS,
  DEMO_PROCUREMENT_METHOD_IDS,
} from './demo-enums';

/** One active procurement plan per project bucket. */
export function buildDemoProcurementPlan(projectBucketId: string) {
  return {
    id: `plan-${projectBucketId}`,
    projectBucketId,
    version: 3,
    status: BiddingProcessPlanStatus.NON_OBJECTION,
    approvedDate: '2026-02-11T00:00:00',
    approvedBy: 'Ana Fiduciary',
  };
}

interface DemoProcessInput {
  index: number;
  name: string;
  categoryId: number;
  methodId: number;
  status: BiddingProcessProcurementProcessStatuses;
  milestoneId: number;
  milestonesDone: number;
  delayed: boolean;
  idbAmount: number;
}

const process = (planId: string, input: DemoProcessInput) => ({
  id: `${planId}-process-${input.index}`,
  biddingProcessPlanId: planId,
  category: { id: input.categoryId, name: '' },
  procurementMethod: { id: input.methodId, name: '' },
  supervisionMethod: {
    id: BiddingProcurementProcessSupervisionMethods.EX_ANTE,
    name: '',
  },
  status: input.status,
  goodsReference: 0,
  sustainability: 0,
  code: `PP-${String(input.index).padStart(3, '0')}`,
  name: input.name,
  description: input.name,
  justification: '',
  bafo: false,
  sepaPeclaId: `SEPA-${2000 + input.index}`,
  lots: 1,
  manualId: '',
  sustainabilityDescription: '',
  subExecutor: '',
  advanceMilestone: {
    total: 6,
    totalCompleted: input.milestonesDone,
    delayed: input.delayed,
    currentMilestone: {
      id: `${planId}-milestone-${input.index}`,
      biddingProcessProcurementProcessId: `${planId}-process-${input.index}`,
      status: 0,
      code: input.milestoneId,
      order: input.milestonesDone,
    },
  },
  projectAmount: {
    cofinancedAmount: 0,
    estimatedAmount: input.idbAmount,
    idbAmount: input.idbAmount,
    localCounterpartAmount: Math.round(input.idbAmount * 0.1),
    costJustification: '',
    totalAcumulatedAmount: input.idbAmount,
  },
  totalAcumulatedAmount: input.idbAmount,
  componentName: 'Component 1',
  totalComments: 0,
  comments: [],
  isCommentsLoaded: true,
  bidValidity: null,
  isMigrated: false,
  packagesUnderReview: false,
  isUpdated: false,
  marked: false,
  procurementProcessComments: [],
  order: input.index,
});

const DEMO_PROCESS_INPUTS: DemoProcessInput[] = [
  {
    index: 1,
    name: 'Supply of medical equipment for primary care centres',
    categoryId: DEMO_CATEGORY_IDS.GOODS,
    methodId: DEMO_PROCUREMENT_METHOD_IDS.ICB,
    status: BiddingProcessProcurementProcessStatuses.PROCESS_ONGOING,
    milestoneId: DEMO_MILESTONE_IDS.INVITATION,
    milestonesDone: 2,
    delayed: false,
    idbAmount: 2400000,
  },
  {
    index: 2,
    name: 'Rehabilitation of the urban drainage network - Stage II',
    categoryId: DEMO_CATEGORY_IDS.WORKS,
    methodId: DEMO_PROCUREMENT_METHOD_IDS.NCB,
    status: BiddingProcessProcurementProcessStatuses.UNDER_REVIEW,
    milestoneId: DEMO_MILESTONE_IDS.BIDDING_DOCUMENTS,
    milestonesDone: 1,
    delayed: true,
    idbAmount: 8750000,
  },
  {
    index: 3,
    name: 'Consulting services for the environmental impact assessment',
    categoryId: DEMO_CATEGORY_IDS.CONSULTING_FIRMS,
    methodId: DEMO_PROCUREMENT_METHOD_IDS.CQS,
    status: BiddingProcessProcurementProcessStatuses.EXPECTED,
    milestoneId: DEMO_MILESTONE_IDS.BIDDING_DOCUMENTS,
    milestonesDone: 0,
    delayed: false,
    idbAmount: 380000,
  },
  {
    index: 4,
    name: 'Supervision of civil works - Lot A',
    categoryId: DEMO_CATEGORY_IDS.CONSULTING_FIRMS,
    methodId: DEMO_PROCUREMENT_METHOD_IDS.ICB,
    status:
      BiddingProcessProcurementProcessStatuses.CONTRACT_UNDER_EXECUTION,
    milestoneId: DEMO_MILESTONE_IDS.SIGNED_CONTRACT,
    milestonesDone: 6,
    delayed: false,
    idbAmount: 1250000,
  },
  {
    index: 5,
    name: 'Acquisition of IT infrastructure and licences',
    categoryId: DEMO_CATEGORY_IDS.GOODS,
    methodId: DEMO_PROCUREMENT_METHOD_IDS.DCS,
    status: BiddingProcessProcurementProcessStatuses.PROCUREMENT_COMPLETE,
    milestoneId: DEMO_MILESTONE_IDS.AWARD,
    milestonesDone: 5,
    delayed: false,
    idbAmount: 640000,
  },
  {
    index: 6,
    name: 'Non-consulting services for community outreach campaigns',
    categoryId: DEMO_CATEGORY_IDS.NON_CONSULTING,
    methodId: DEMO_PROCUREMENT_METHOD_IDS.NCB,
    status: BiddingProcessProcurementProcessStatuses.EVAL_BID_PROPOSAL,
    milestoneId: DEMO_MILESTONE_IDS.EVALUATION,
    milestonesDone: 4,
    delayed: true,
    idbAmount: 910000,
  },
];

/** Procurement processes belonging to the active plan. */
export function buildDemoProcurementProcesses(planId: string) {
  return DEMO_PROCESS_INPUTS.map((input) => process(planId, input));
}

/**
 * `GET /api/biddingProcessProcurementProcesses/{id}` - process detail.
 *
 * The id carries the plan id as a prefix (`{planId}-process-{index}`), so the
 * detail screen can be opened directly from a deep link.
 */
export function buildDemoProcurementProcessById(processId: string) {
  const separator = processId.lastIndexOf('-process-');
  const planId =
    separator > 0 ? processId.slice(0, separator) : 'demo-plan';
  const index = Number(processId.slice(separator + '-process-'.length));
  const input =
    DEMO_PROCESS_INPUTS.find((item) => item.index === index) ??
    DEMO_PROCESS_INPUTS[0];

  return { biddingProcessProcurementProcess: process(planId, input) };
}
