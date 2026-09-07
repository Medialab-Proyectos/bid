import {
  BiddingProcessPlanStatus,
  BiddingProcessProcurementProcessStatuses,
} from '@core/enums';
import {
  BiddingProcessPlan,
  BiddingProcessProcurementProcess,
  SelectedFilterForBiddingProcess,
} from '@core/models';
import { createReducer, on } from '@ngrx/store';
import * as actions from '../actions/bidding-process-plan.actions';

export interface BiddingProcessPlanState {
  biddingProcessPlan: BiddingProcessPlan;
  biddingProcessProcurementProcesses: BiddingProcessProcurementProcess[];
  filteredBiddingProcessProcurementProcesses: BiddingProcessProcurementProcess[];
  selectedBiddingProcessProcurementProcess: BiddingProcessProcurementProcess;
  selectedFilterForBiddingProcess: SelectedFilterForBiddingProcess;
  loaded: boolean;
  loading: boolean;
  processScreenLoaded: boolean;
  processScreenLoading: boolean;

  isSelectedProcessLoaded: boolean;
  isSelectedProcessLoading: boolean;
  loadingProcess: boolean;
  error: unknown;
}
export interface AppStateWithBiddingProcessPlan {
  biddingProcessPlan: BiddingProcessPlanState;
}

export const BiddingProcessPlanInitialState: BiddingProcessPlanState = {
  biddingProcessPlan: null,
  biddingProcessProcurementProcesses: [],
  filteredBiddingProcessProcurementProcesses: [],
  selectedBiddingProcessProcurementProcess: null,
  selectedFilterForBiddingProcess: null,
  loaded: false,
  loading: false,
  processScreenLoaded: false,
  processScreenLoading: false,
  isSelectedProcessLoaded: false,
  isSelectedProcessLoading: false,
  loadingProcess: false,
  error: null,
};

const _biddingProcessPlanReducer = createReducer(
  BiddingProcessPlanInitialState,
  on(actions.getBiddingProcessPlan, (state) => ({
    ...state,
    loading: true,
  })),
  on(actions.getBiddingProcessPlanSuccess, (state, { biddingProcessPlan }) => ({
    ...state,
    loading: false,
    loaded: true,
    biddingProcessPlan: { ...biddingProcessPlan },
  })),
  on(
    actions.setFilteredProcurementProcess,
    (state, { filteredBiddingProcessProcurementProcesses, selectedOpt }) => ({
      ...state,
      filteredBiddingProcessProcurementProcesses,
      selectedFilterForBiddingProcess: selectedOpt,
    })
  ),
  on(
    actions.getBiddingProcessCommentsSuccess,
    (state, { biddingProcessComments, biddingProcessId }) => {
      const newState = { ...state };

      const processes = newState.biddingProcessProcurementProcesses.map(
        (process) => {
          const newProcess = { ...process };
          if (newProcess.id === biddingProcessId) {
            newProcess.comments = biddingProcessComments;
            newProcess.isCommentsLoaded = true;
          }
          return newProcess;
        }
      );

      newState.biddingProcessProcurementProcesses = processes;

      const loadingProcesses =
        newState.biddingProcessProcurementProcesses.filter(
          (process) => process.isCommentsLoaded === false
        );

      if (loadingProcesses.length === 0) {
        newState.processScreenLoading = false;
        newState.processScreenLoaded = true;
      }

      return newState;
    }
  ),
  on(
    actions.completeContractsSuccess,
    (state, { biddingProcessId, newStatus }) => ({
      ...state,
      biddingProcessProcurementProcesses: updateProcurementProcessArray(
        state.biddingProcessProcurementProcesses,
        biddingProcessId,
        newStatus
      ),
      selectedBiddingProcessProcurementProcess:
        updateSelectedProcurementProcess(
          state.selectedBiddingProcessProcurementProcess,
          newStatus
        ),
    })
  ),
  on(actions.getBiddingProcessCommentsError, (state, { biddingProcessId }) => {
    const newState = { ...state };
    const processes = newState.biddingProcessProcurementProcesses.map(
      (process) => {
        const newProcess = { ...process };
        if (newProcess.id === biddingProcessId) {
          newProcess.isCommentsLoaded = true;
        }
        return newProcess;
      }
    );
    newState.biddingProcessProcurementProcesses = processes;
    const loadingProcesses = newState.biddingProcessProcurementProcesses.filter(
      (process) => process.isCommentsLoaded === false
    );

    if (loadingProcesses.length === 0) {
      newState.processScreenLoading = false;
      newState.processScreenLoaded = true;
    }
    return newState;
  }),
  on(
    actions.getBiddingProcessesSuccess,
    (state, { biddingProcessProcurementProcesses }) => ({
      ...state,
      processScreenLoading: false,
      processScreenLoaded: true,
      loadingProcess: false,
      biddingProcessProcurementProcesses:
        biddingProcessProcurementProcesses.map(
          (biddingProcess: BiddingProcessProcurementProcess) =>
            asignNewBiddingProcessProcurementProcess(biddingProcess)
        ),
    })
  ),
  on(actions.getBiddingProcesses, (state) => ({
    ...state,
    processScreenLoading: true,
    processScreenLoaded: false,
    loadingProcess: true,
    biddingProcessProcurementProcesses:
      [] as BiddingProcessProcurementProcess[],
  })),
  on(actions.getBiddingProcessesError, (state) => ({
    ...state,
    processScreenLoaded: true,
    processScreenLoading: false,
    loadingProcess: false,
  })),
  on(actions.getBiddingProcessById, (state) => {
    return {
      ...state,
      isSelectedProcessLoading: true,
      isSelectedProcessLoaded: false,
      selectedBiddingProcessProcurementProcess:
        null as BiddingProcessProcurementProcess,
    };
  }),
  on(
    actions.getBiddingProcessByIdSuccess,
    (state, { biddingProcessProcurementProcess }) => {
      return {
        ...state,
        isSelectedProcessLoading: false,
        isSelectedProcessLoaded: true,
        selectedBiddingProcessProcurementProcess:
          biddingProcessProcurementProcess,
      };
    }
  ),
  on(
    actions.ineligibilityProcurementProcess,
    actions.removeProcurementProcess,
    actions.updateProcurementStatus,
    actions.unsuccessfulProcurementProcess,
    (state) => ({
      ...state,
      loading: true,
      loaded: false,
    })
  ),
  on(actions.removeProcurementProcessSuccess, (state, { biddingProcessId }) => {
    const newState = { ...state };
    const processes = newState.biddingProcessProcurementProcesses.filter(
      (process) => process.id !== biddingProcessId
    );
    newState.biddingProcessProcurementProcesses = processes;

    return {
      ...state,
      ...newState,
      loading: false,
      loaded: true,
    };
  }),
  on(
    actions.ineligibilityProcurementProcessSuccess,
    (state, { procurementProcessId }) => {
      const newState = { ...state };
      const newSelected = { ...state.selectedBiddingProcessProcurementProcess };
      const processes = newState.biddingProcessProcurementProcesses.map(
        (process) => {
          const newProcess = { ...process };
          if (newProcess.id === procurementProcessId) {
            newProcess.status =
              BiddingProcessProcurementProcessStatuses.PROCUREMENT_INELIGIBLE;
          }
          return newProcess;
        }
      );
      newState.biddingProcessProcurementProcesses = processes;

      return {
        ...newState,
        ...newSelected,
        loading: false,
        loaded: true,
      };
    }
  ),
  on(
    actions.unsuccessfulProcurementProcessSuccess,
    (state, { procurementProcessId }) => {
      const newState = { ...state };
      const newSelected = { ...state.selectedBiddingProcessProcurementProcess };
      const processes = newState.biddingProcessProcurementProcesses.map(
        (process) => {
          const newProcess = { ...process };
          if (newProcess.id === procurementProcessId) {
            newProcess.status =
              BiddingProcessProcurementProcessStatuses.UNSUCCESFUL_PROCESS;
          }
          return newProcess;
        }
      );
      newState.biddingProcessProcurementProcesses = processes;

      return {
        ...newState,
        ...newSelected,
        loading: false,
        loaded: true,
      };
    }
  ),
  on(
    actions.getBiddingProcessPlanError,
    actions.removeProcurementProcessError,
    actions.ineligibilityProcurementStatusError,
    actions.updateProcurementStatusError,
    actions.unsuccessfulProcurementProcessError,
    (state, { payload }) => ({
      ...state,
      loading: false,
      loaded: true,
      error: payload,
    })
  ),
  on(actions.cancelProcurementProcess, (state, { biddingProcessId }) => {
    const newState = { ...state };
    const processes = newState.biddingProcessProcurementProcesses.map(
      (process) => {
        const newProcess = { ...process };
        if (newProcess.id === biddingProcessId) {
          newProcess.isCancelling = true;
        }
        return newProcess;
      }
    );
    newState.biddingProcessProcurementProcesses = processes;

    return {
      ...state,
      ...newState,
    };
  }),
  on(actions.cancelProcurementProcessSuccess, (state, { biddingProcessId }) => {
    const newState = { ...state };
    const processes = newState.biddingProcessProcurementProcesses.map(
      (process) => {
        const newProcess = { ...process };
        if (newProcess.id === biddingProcessId) {
          newProcess.isCancelling = false;
          newProcess.status =
            BiddingProcessProcurementProcessStatuses.PENDING_CANCELLATION;
        }
        return newProcess;
      }
    );

    newState.biddingProcessProcurementProcesses = processes;
    return {
      ...state,
      ...newState,
    };
  }),
  on(actions.cancelProcurementProcessError, (state, { biddingProcessId }) => {
    const newState = { ...state };
    const processes = newState.biddingProcessProcurementProcesses.map(
      (process) => {
        const newProcess = { ...process };
        if (newProcess.id === biddingProcessId) {
          newProcess.isCancelling = false;
        }
        return newProcess;
      }
    );
    newState.biddingProcessProcurementProcesses = processes;
    return {
      ...state,
      ...newState,
    };
  }),
  on(actions.requestApproval, (state) => ({
    ...state,
    processScreenLoading: true,
    processScreenLoaded: false,
  })),
  on(actions.requestApprovalSuccess, (state) => {
    const newProcess = { ...state };
    const newPlan: BiddingProcessPlan = { ...newProcess.biddingProcessPlan };
    newPlan.status = BiddingProcessPlanStatus.UNDER_REVIEW;
    newProcess.biddingProcessPlan = newPlan;
    return {
      ...state,
      ...newProcess,
      processScreenLoading: false,
      processScreenLoaded: true,
    };
  }),
  on(actions.requestApprovalError, (state, { payload }) => ({
    ...state,
    processScreenLoading: false,
    processScreenLoaded: true,
    error: payload,
  })),
  on(
    actions.updateProcurementStatusSuccess,
    (state, { biddingProcessId, newStatus }) => {
      const newState = { ...state };
      const newSelected = { ...state.selectedBiddingProcessProcurementProcess };
      const processes = newState.biddingProcessProcurementProcesses.map(
        (process) => {
          const newProcess = { ...process };
          if (newProcess.id === biddingProcessId) {
            newProcess.status = newStatus;
            newState.selectedBiddingProcessProcurementProcess = newProcess;
          }
          return newProcess;
        }
      );
      newState.biddingProcessProcurementProcesses = processes;

      return {
        ...newState,
        ...newSelected,
        loading: false,
        loaded: true,
      };
    }
  ),
  on(actions.resetBiddingProcessPlan, () => BiddingProcessPlanInitialState),
  on(
    actions.setSelectedFilterForBiddingProcess,
    (state, { selectedRow, selectedCol, selectedTableType }) => {
      const newState = { ...state };
      const newSelectedFilterForBiddingProcess = {
        ...state.selectedFilterForBiddingProcess,
      };
      newSelectedFilterForBiddingProcess.selectedRow = selectedRow;
      newSelectedFilterForBiddingProcess.selectedCol = selectedCol;
      newSelectedFilterForBiddingProcess.selectedTableType = selectedTableType;
      newState.selectedFilterForBiddingProcess =
        newSelectedFilterForBiddingProcess;
      return {
        ...newState,
      };
    }
  ),
  on(actions.resetSelectedFilterForBiddingProcess, (state) => {
    const newState = { ...state };
    newState.selectedFilterForBiddingProcess = null;
    return {
      ...newState,
    };
  })
);

export function biddingProcessPlanReducer(state, action) {
  return _biddingProcessPlanReducer(state, action);
}

function asignNewBiddingProcessProcurementProcess(
  biddingProcess: BiddingProcessProcurementProcess
) {
  return Object.assign({}, biddingProcess);
}

function updateProcurementProcessArray(
  processes: BiddingProcessProcurementProcess[],
  biddingProcessId: string,
  newStatus: BiddingProcessProcurementProcessStatuses
): BiddingProcessProcurementProcess[] {
  return processes.map((p) => {
    if (p.id === biddingProcessId) {
      return { ...p, status: newStatus };
    } else {
      return p;
    }
  });
}

function updateSelectedProcurementProcess(
  processes: BiddingProcessProcurementProcess,
  newStatus: BiddingProcessProcurementProcessStatuses
): BiddingProcessProcurementProcess {
  return { ...processes, status: newStatus };
}
