import { DelayedMilestoneTableTypeEnum } from '@core/enums';
import {
  BiddingProcessPlan,
  BiddingProcessProcurementProcess,
  BiddingProcurementProcessComment,
  SelectedFilterForBiddingProcess,
  WorkflowLaunchRequest,
} from '@core/models';
import { createAction, props } from '@ngrx/store';

export const getBiddingProcessPlan = createAction(
  '[BiddingProcessPlan] get BiddingProcess Plan',
  props<{ projectBucketId: string }>()
);
export const getBiddingProcessPlanSuccess = createAction(
  '[BiddingProcessPlan] get BiddingProcess Plan Success',
  props<{ biddingProcessPlan: BiddingProcessPlan }>()
);

export const getBiddingProcesses = createAction(
  '[BiddingProcessPlan] get BiddingProcessess',
  props<{ biddingProcessPlanId: string }>()
);

export const getBiddingProcessesSuccess = createAction(
  '[BiddingProcessPlan] get BiddingProcessess Success',
  props<{
    biddingProcessProcurementProcesses: BiddingProcessProcurementProcess[];
  }>()
);

export const getBiddingProcessesError = createAction(
  '[BiddingProcessPlan] get BiddingProcessess Error'
);

export const getBiddingProcessById = createAction(
  '[BiddingProcessPlan] get BiddingProcess by id',
  props<{ biddingProcessId: string }>()
);

export const getBiddingProcessByIdSuccess = createAction(
  '[BiddingProcessPlan] get BiddingProcess by id Success',
  props<{
    biddingProcessProcurementProcess: BiddingProcessProcurementProcess;
  }>()
);

export const getBiddingProcessComments = createAction(
  '[BiddingProcessPlan] get BiddingProcess comments',
  props<{ biddingProcessId: string }>()
);

export const getBiddingProcessCommentsSuccess = createAction(
  '[BiddingProcessPlan] get BiddingProcess comments Success',
  props<{
    biddingProcessId: string;
    biddingProcessComments: BiddingProcurementProcessComment[];
  }>()
);

export const getBiddingProcessCommentsError = createAction(
  '[BiddingProcessPlan] get BiddingProcess comments Success',
  props<{ biddingProcessId: string }>()
);

export const getBiddingProcessPlanError = createAction(
  '[BiddingProcessPlan] get BiddingProcess Plan Error',
  props<{ payload: unknown }>()
);

export const ineligibilityProcurementProcess = createAction(
  '[ProcurementPlan] Declare ineligibility Procurement Plan',
  props<{ comment: string; procurementProcessId: string }>()
);
export const ineligibilityProcurementProcessSuccess = createAction(
  '[ProcurementPlan] Declare ineligibility procurement status success',
  props<{ procurementProcessId: string }>()
);
export const ineligibilityProcurementStatusError = createAction(
  '[ProcurementPlan] Declare ineligibility procurement status error',
  props<{ payload: any }>()
);

export const unsuccessfulProcurementProcess = createAction(
  '[ProcurementPlan] Declare unsuccessful Procurement',
  props<{ comment: string; procurementProcessId: string }>()
);
export const unsuccessfulProcurementProcessSuccess = createAction(
  '[ProcurementPlan] Declare unsuccessful procurement status success',
  props<{ procurementProcessId: string }>()
);
export const unsuccessfulProcurementProcessError = createAction(
  '[ProcurementPlan] Declare unsuccessful procurement status error',
  props<{ payload: any }>()
);

export const removeProcurementProcess = createAction(
  '[ProcurementPlan] Remove Procurement Plan',
  props<{ id: string }>()
);
export const removeProcurementProcessSuccess = createAction(
  '[ProcurementPlan] Remove Procurement Plan Success',
  props<{ biddingProcessId: string }>()
);
export const removeProcurementProcessError = createAction(
  '[ProcurementPlan] Remove Procurement Plan Error',
  props<{ payload: any }>()
);

export const cancelProcurementProcess = createAction(
  '[ProcurementPlan] cancel Procurement process',
  props<{ biddingProcessId: string; comment: string }>()
);
export const cancelProcurementProcessSuccess = createAction(
  '[ProcurementPlan] cancel Procurement process Success',
  props<{ biddingProcessId: string }>()
);
export const cancelProcurementProcessError = createAction(
  '[ProcurementPlan] cancel Procurement process Error',
  props<{ biddingProcessId: string }>()
);

export const reloadProcesses = createAction(
  '[BiddingProcessPlan] reload BiddingProcess'
);

export const requestApproval = createAction(
  '[ProcurementPlan] Request approval',
  props<{ launchReq: WorkflowLaunchRequest; projectId: string; lang: string }>()
);
export const requestApprovalSuccess = createAction(
  '[ProcurementPlan] Request approval Success',
  props<{ launchReq: WorkflowLaunchRequest; projectId: string }>()
);
export const requestApprovalError = createAction(
  '[ProcurementPlan] Request approvaln Error',
  props<{ payload: any }>()
);

export const updateProcurementStatus = createAction(
  '[ProcurementPlan] Update procurement status',
  props<{ biddingProcessId: string; newStatus: number; countryCode: string }>()
);
export const updateProcurementStatusSuccess = createAction(
  '[ProcurementPlan] Update procurement status success',
  props<{ biddingProcessId: string; newStatus: number; countryCode: string }>()
);
export const updateProcurementStatusError = createAction(
  '[ProcurementPlan] Update procurement status error',
  props<{ payload: any }>()
);

export const completeContractsSuccess = createAction(
  '[ProcurementProcess] Update procurement process status on complete Contract',
  props<{ biddingProcessId: string; newStatus: number }>()
);

export const resetBiddingProcessPlan = createAction(
  '[ProcurementPlan] Empty procurement table'
);

export const setFilteredProcurementProcess = createAction(
  '[ProcurementPlan set filteredProcess] Set filtered processes',
  props<{
    filteredBiddingProcessProcurementProcesses: BiddingProcessProcurementProcess[];
    selectedOpt: SelectedFilterForBiddingProcess;
  }>()
);

export const resetSelectedFilterForBiddingProcess = createAction(
  '[ProcurementPlan] Reset selected filter for bidding process'
);

export const setSelectedFilterForBiddingProcess = createAction(
  '[ProcurementPlan] set selected filter for bidding process',
  props<{
    selectedRow: number;
    selectedCol: number;
    selectedTableType: DelayedMilestoneTableTypeEnum;
  }>()
);
