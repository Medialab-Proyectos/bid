import { createReducer, on } from '@ngrx/store';
import { AppState } from '@core/store/store.reducers';
import * as actions from '../actions/procurement-contracts.action';
import { BiddingContractByProcess } from '@core/models';
import { BiddingContractStatusesEnum } from '@core/enums';
export interface ProcurementContractsState {
  contractsByProcess: {
    [processId: string]: {
      procurementContracts: BiddingContractByProcess[];
      loaded: boolean;
      loading: boolean;
      error: unknown;
    };
  };
}
export interface AppStateWithProcurementContracts extends AppState {
  procurementContracts: ProcurementContractsState;
}

export const procurementContractsInitialState: ProcurementContractsState = {
  contractsByProcess: {},
};

const _procurementContractsReducer = createReducer(
  procurementContractsInitialState,
  on(actions.getContracts, (state, { processId }) => ({
    ...state,
    contractsByProcess: {
      ...state.contractsByProcess,
      [processId]: {
        ...state.contractsByProcess[processId],
        procurementContracts: [],
        error: null,
        loading: true,
        loaded: false,
      },
    },
  })),
  on(
    actions.terminateContract,
    actions.completeContract,
    actions.deleteContract,
    (state, { processId }) => ({
      ...state,
      contractsByProcess: {
        ...state.contractsByProcess,
        [processId]: {
          ...state.contractsByProcess[processId],
          error: null,
          loading: true,
          loaded: false,
        },
      },
    })
  ),
  on(
    actions.getContractsSuccess,
    (state, { processId, contracts, processCode }) => ({
      ...state,
      contractsByProcess: {
        ...state.contractsByProcess,
        [processId]: {
          ...state.contractsByProcess[processId],
          procurementContracts: separateContracts(contracts, processCode),
          error: null,
          loading: false,
          loaded: true,
        },
      },
    })
  ),
  on(actions.terminateContractSuccess, (state, { processId, contractId }) => {
    const contractsByProcess: BiddingContractByProcess[] =
      state.contractsByProcess[processId].procurementContracts;
    const newContracts = contractsByProcess.map(
      (c: BiddingContractByProcess) => {
        const newContract: BiddingContractByProcess = { ...c };
        if (newContract.biddingContractId === contractId) {
          newContract.contractStatus = BiddingContractStatusesEnum.TERMINATED;
        }
        return newContract;
      }
    );
    return {
      ...state,
      contractsByProcess: {
        ...state.contractsByProcess,
        [processId]: {
          ...state.contractsByProcess[processId],
          procurementContracts: newContracts,
          error: null,
          loading: false,
          loaded: true,
        },
      },
    };
  }),
  on(actions.completeContractSuccess, (state, { processId, contractId }) => {
    const contractsByProcess: BiddingContractByProcess[] =
      state.contractsByProcess[processId].procurementContracts;
    const newContracts = contractsByProcess.map(
      (c: BiddingContractByProcess) => {
        const newContract: BiddingContractByProcess = { ...c };
        if (newContract.biddingContractId === contractId) {
          newContract.contractStatus = BiddingContractStatusesEnum.FINISHED;
        }
        return newContract;
      }
    );
    return {
      ...state,
      contractsByProcess: {
        ...state.contractsByProcess,
        [processId]: {
          ...state.contractsByProcess[processId],
          procurementContracts: newContracts,
          error: null,
          loading: false,
          loaded: true,
        },
      },
    };
  }),
  on(actions.deleteContractSuccess, (state, { processId, contractId }) => {
    const contracts: BiddingContractByProcess[] =
      state.contractsByProcess[processId].procurementContracts;
    const index = contracts.findIndex(
      (i) => i.biddingContractId === contractId
    );
    const newContracts = [...contracts];
    if (index !== -1) {
      newContracts.splice(index, 1);
    }
    return {
      ...state,
      contractsByProcess: {
        ...state.contractsByProcess,
        [processId]: {
          ...state.contractsByProcess[processId],
          procurementContracts: newContracts,
          error: null,
          loading: false,
          loaded: true,
        },
      },
    };
  }),
  on(actions.getContractsError, (state, { processId, payload }) => ({
    ...state,
    contractsByProcess: {
      ...state.contractsByProcess,
      [processId]: {
        ...state.contractsByProcess[processId],
        procurementContracts: [],
        loading: false,
        loaded: true,
        error: payload,
      },
    },
  })),
  on(
    actions.deleteContractError,
    actions.completeContractError,
    actions.terminateContractError,
    (state, { processId, payload }) => ({
      ...state,
      contractsByProcess: {
        ...state.contractsByProcess,
        [processId]: {
          ...state.contractsByProcess[processId],
          loading: false,
          loaded: true,
          error: payload,
        },
      },
    })
  )
);

export function procurementContractsReducer(state, action) {
  return _procurementContractsReducer(state, action);
}

function separateContracts(
  contracts: BiddingContractByProcess[],
  processCode: string
): BiddingContractByProcess[] {
  let groupedContracts = groupAmendments(contracts);
  const pendingSignatureContracts = formatContractsCode(
    groupedContracts.filter(
      (c) => c.contractStatus === BiddingContractStatusesEnum.PENDING_SIGNATURE
    ),
    processCode,
    true
  );
  const notPendingSignatureContracts = formatContractsCode(
    groupedContracts.filter(
      (c) => c.contractStatus !== BiddingContractStatusesEnum.PENDING_SIGNATURE
    ),
    processCode,
    false
  );
  return [...pendingSignatureContracts, ...notPendingSignatureContracts];
}

function groupAmendments(
  contracts: BiddingContractByProcess[]
): BiddingContractByProcess[] {
  const destructuredContracts = [...contracts];
  const contractsParents = destructuredContracts
    .map((c) => {
      if (c.parentId === null) {
        return { ...c, amendments: [] };
      } else {
        return c;
      }
    })
    .filter((c) => c.parentId === null);
  const contractsAmendments = destructuredContracts
    .filter((c) => c.parentId !== null)
    .map((contract) => {
      return { ...contract };
    });
  contractsAmendments.forEach((amendment) => {
    return contractsParents.map((c) => {
      if (c.biddingContractId === amendment.parentId) {
        c.amendments.push(amendment);
      }
    });
  });
  return addTotalAccumulatedAmountProp(contractsParents);
}

function addTotalAccumulatedAmountProp(
  contracts: BiddingContractByProcess[]
): BiddingContractByProcess[] {
  const newContracts = orderAmendmentsByVersion(contracts);
  newContracts.forEach((c) => {
    const contractTotalAmount =
      c.idbAmount + c.localCounterpartAmount + c.cofinancedAmount;
    c.totalAccumulatedAmount = contractTotalAmount;
    if (c.amendments.length >= 1) {
      c.amendments.forEach((a, index) => {
        const amendmentTotalAmount =
          a.idbAmount + a.localCounterpartAmount + a.cofinancedAmount;
        if (index === 0) {
          a.totalAccumulatedAmount = amendmentTotalAmount + contractTotalAmount;
        } else {
          a.totalAccumulatedAmount =
            amendmentTotalAmount +
            c.amendments[index - 1].totalAccumulatedAmount;
        }
        return a;
      });
    }
    return c;
  });
  return newContracts;
}

function orderAmendmentsByVersion(
  contracts: BiddingContractByProcess[]
): BiddingContractByProcess[] {
  contracts.forEach((c) => {
    if (c.amendments.length >= 1) {
      c.amendments = c.amendments.sort((a, b) => {
        return a.version - b.version;
      });
    }
    return c;
  });
  return contracts;
}

function formatCode(
  c: BiddingContractByProcess,
  processCode: string,
  isPendingSignature: boolean,
  index: number
): BiddingContractByProcess {
  let prefix = isPendingSignature ? 'T' : 'C';
  if (c.parentId === null) {
    if (index < 10) {
      c.visualCode = `${processCode}-${prefix}0${c.code}`;
    } else {
      c.visualCode = `${processCode}-${prefix}${c.code}`;
    }
    return c;
  } else {
    if (index < 10) {
      c.visualCode = `${processCode}-${prefix}0${c.code}-${c.version}`;
    } else {
      c.visualCode = `${processCode}-${prefix}${c.code}-${c.version}`;
    }
    return c;
  }
}

function formatContractsCode(
  contracts: BiddingContractByProcess[],
  processCode: string,
  isPendingSignature: boolean
): BiddingContractByProcess[] {
  const formatedContracts = [...contracts];
  formatedContracts.forEach((c, index) => {
    formatCode(c, processCode, isPendingSignature, index);
    if (c.amendments.length >= 1) {
      c.amendments.forEach((a) => {
        formatCode(a, processCode, isPendingSignature, index);
      });
    }
  });
  return formatedContracts;
}
