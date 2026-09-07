import { BiddingContractStatusesEnum } from '@core/enums';
import { procurementContractsReducer } from '@core/store';
import * as actions from '../actions/procurement-contracts.action';
import { procurementContractsInitialState } from './procurement-contracts.reducers';

describe('ParticipantsReducer', () => {
  it('should set initial state', () => {
    expect(procurementContractsInitialState).toEqual({
      contractsByProcess: {},
    });
  });

  it('should get contracts by process', () => {
    const action = actions.getContracts({ processId: '1', processCode: '1' });

    const newState = procurementContractsReducer(
      procurementContractsInitialState,
      action
    );

    expect(newState).toEqual({
      contractsByProcess: {
        '1': {
          procurementContracts: [],
          error: null,
          loading: true,
          loaded: false,
        },
      },
    });
  });

  it('should save in state contracts by process', () => {
    const action = actions.getContractsSuccess({
      processId: '1',
      contracts: [],
      processCode: '',
    });

    const newState = procurementContractsReducer(
      procurementContractsInitialState,
      action
    );

    expect(newState).toEqual({
      contractsByProcess: {
        '1': {
          procurementContracts: [],
          error: null,
          loading: false,
          loaded: true,
        },
      },
    });
  });

  it('should terminate contract', () => {
    const action = actions.terminateContractSuccess({
      processId: '1',
      contractId: '1',
    });

    const procurementContracts = {
      procurementContracts: [
        {
          biddingContractId: '1',
          version: 1,
          amendments: [],
          code: '',
          parentId: null,
          visualCode: '',
          biddingContractsAwarded: [],
          contractType: 1,
          contractStatus: 1,
          nationality: '',
          idbAmount: 1,
          startDate: '',
          endDate: '',
          cofinancedAmount: 0,
          localCounterpartAmount: 0,
        },
      ],
    };

    const initialState = { ...procurementContractsInitialState };
    initialState.contractsByProcess = {
      '1': {
        ...procurementContracts,
        error: null,
        loaded: true,
        loading: false,
      },
    };
    const newState = procurementContractsReducer(initialState, action);

    expect(newState).toEqual({
      contractsByProcess: {
        '1': {
          procurementContracts: [
            {
              biddingContractId: '1',
              version: 1,
              amendments: [],
              code: '',
              parentId: null,
              visualCode: '',
              biddingContractsAwarded: [],
              contractType: 1,
              contractStatus: BiddingContractStatusesEnum.TERMINATED,
              nationality: '',
              idbAmount: 1,
              startDate: '',
              endDate: '',
              cofinancedAmount: 0,
              localCounterpartAmount: 0,
            },
          ],
          error: null,
          loading: false,
          loaded: true,
        },
      },
    });
  });

  it('should complete contract', () => {
    const action = actions.completeContractSuccess({
      processId: '1',
      contractId: '1',
    });

    const procurementContracts = {
      procurementContracts: [
        {
          biddingContractId: '1',
          version: 1,
          amendments: [],
          code: '',
          parentId: null,
          visualCode: '',
          biddingContractsAwarded: [],
          contractType: 1,
          contractStatus: 1,
          nationality: '',
          idbAmount: 1,
          startDate: '',
          endDate: '',
          cofinancedAmount: 0,
          localCounterpartAmount: 0,
        },
      ],
    };

    const initialState = { ...procurementContractsInitialState };
    initialState.contractsByProcess = {
      '1': {
        ...procurementContracts,
        error: null,
        loaded: true,
        loading: false,
      },
    };
    const newState = procurementContractsReducer(initialState, action);

    expect(newState).toEqual({
      contractsByProcess: {
        '1': {
          procurementContracts: [
            {
              biddingContractId: '1',
              version: 1,
              amendments: [],
              code: '',
              parentId: null,
              visualCode: '',
              biddingContractsAwarded: [],
              contractType: 1,
              contractStatus: BiddingContractStatusesEnum.FINISHED,
              nationality: '',
              idbAmount: 1,
              startDate: '',
              endDate: '',
              cofinancedAmount: 0,
              localCounterpartAmount: 0,
            },
          ],
          error: null,
          loading: false,
          loaded: true,
        },
      },
    });
  });

  it('should delete contract', () => {
    const action = actions.deleteContractSuccess({
      processId: '1',
      contractId: '1',
      isCopy: true,
    });

    const initialState = { ...procurementContractsInitialState };
    initialState.contractsByProcess = {
      '1': {
        procurementContracts: [
          {
            biddingContractId: '1',
            amendments: [],
            code: '',
            parentId: null,
            visualCode: '',
            version: 1,
            biddingContractsAwarded: [],
            contractType: 1,
            contractStatus: 1,
            nationality: '',
            idbAmount: 1,
            startDate: '',
            endDate: '',
            cofinancedAmount: 0,
            localCounterpartAmount: 0,
          },
        ],
        error: null,
        loaded: true,
        loading: false,
      },
    };
    const newState = procurementContractsReducer(initialState, action);

    expect(newState).toEqual({
      contractsByProcess: {
        '1': {
          procurementContracts: [],
          error: null,
          loading: false,
          loaded: true,
        },
      },
    });
  });

  it('should set error when load contracts fails', () => {
    const action = actions.getContractsError({
      processId: '1',
      payload: 'error',
    });

    const newState = procurementContractsReducer(
      procurementContractsInitialState,
      action
    );

    expect(newState).toEqual({
      contractsByProcess: {
        '1': {
          procurementContracts: [],
          error: 'error',
          loading: false,
          loaded: true,
        },
      },
    });
  });

  it('should set error when delete contracts fails', () => {
    const action = actions.deleteContractError({
      processId: '1',
      payload: 'error',
    });

    const newState = procurementContractsReducer(
      procurementContractsInitialState,
      action
    );

    expect(newState).toEqual({
      contractsByProcess: {
        '1': {
          error: 'error',
          loading: false,
          loaded: true,
        },
      },
    });
  });
});
