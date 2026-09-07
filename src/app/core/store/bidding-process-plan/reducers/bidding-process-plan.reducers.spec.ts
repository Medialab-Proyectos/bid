import {
  BiddingProcessPlanInitialState,
  BiddingProcessPlanState,
  biddingProcessPlanReducer,
} from './bidding-process-plan.reducers';
import * as actions from '../actions/bidding-process-plan.actions';
import {
  BiddingProcessPlan,
  BiddingProcessProcurementProcess,
  WorkflowLaunchRequest,
} from '@core/models';
import {
  BiddingProcessPlanStatus,
  BiddingProcessProcurementProcessStatuses,
  WorkflowEntityScreen,
} from '@core/enums';

describe('bidding process plan reducer', () => {
  it('initial State', () => {
    expect(biddingProcessPlanReducer(undefined, {})).toEqual(initialState);
  });

  describe('bidding process plan', () => {
    it('should get bidding process plan', () => {
      const action = actions.getBiddingProcessPlan({
        projectBucketId: '123456',
      });
      const state = biddingProcessPlanReducer(initialState, action);

      expect(state.loading).toBe(true);
    });

    it('should store bidding process plan', () => {
      const action = actions.getBiddingProcessPlanSuccess({
        biddingProcessPlan: null,
      });
      const state = biddingProcessPlanReducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.loaded).toBe(true);
      expect(state.biddingProcessPlan).toEqual({});
    });
    it('should set error requesting data', () => {
      const action = actions.getBiddingProcessPlanError({
        payload: 'error',
      });
      const state = biddingProcessPlanReducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.loaded).toBe(true);
      expect(state.error).toEqual('error');
    });
  });

  describe('bidding processes', () => {
    it('should get bidding processes', () => {
      const action = actions.getBiddingProcesses({
        biddingProcessPlanId: '123456',
      });

      const state = biddingProcessPlanReducer(initialState, action);

      expect(state.processScreenLoading).toBe(true);
      expect(state.processScreenLoaded).toBe(false);
      expect(state.biddingProcessProcurementProcesses).toEqual([]);
    });
    it('should store bidding processes', () => {
      const action = actions.getBiddingProcessesSuccess({
        biddingProcessProcurementProcesses: [
          {
            id: 'id',
            biddingProcessPlanId: 'biddingProcessPlanId',
            category: { id: 0, name: '' },
            procurementMethod: { id: 0, name: '' },
            supervisionMethod: { id: 0, name: '' },
            status: 0,
            goodsReference: 0,
            sustainability: 0,
            code: 'code',
            name: 'name',
            description: 'description',
            justification: 'justification',
            bafo: false,
            sepaPeclaId: 'sepaPeclaId',
            lots: 0,
            manualId: 'manualId',
            sustainabilityDescription: 'sustainabilityDescription',
            subExecutor: 'subExecutor',
            advanceMilestone: null,
            projectAmount: null,
            componentName: 'componentName',
            totalComments: 15,
            isMigrated: true,
            packagesUnderReview: true,
            totalAcumulatedAmount: 0,
            isUpdated: true,
            procurementProcessComments: [],
            order: 0,
          },
        ],
      });

      const state = biddingProcessPlanReducer(initialState, action);

      expect(state.processScreenLoading).toBe(false);
      expect(state.processScreenLoaded).toBe(true);
    });
  });

  describe('bidding processes comments', () => {
    it('should store bidding processes comments', () => {
      const comments = [
        {
          id: '123',
          biddingProcessProcurementProcessId: '123456',
          comment: null,
        },
      ];
      const action = actions.getBiddingProcessCommentsSuccess({
        biddingProcessComments: comments,
        biddingProcessId: '123456',
      });

      const caseState = { ...initialState };
      caseState.processScreenLoading = true;
      caseState.processScreenLoaded = false;

      caseState.biddingProcessProcurementProcesses = [
        {
          id: '123456',
          comments: [],
          isCommentsLoaded: false,
        },
      ] as any;

      const state = biddingProcessPlanReducer(caseState, action);

      expect(state.processScreenLoading).toBe(false);
      expect(state.processScreenLoaded).toBe(true);
      expect(state.biddingProcessProcurementProcesses[0].comments).toEqual(
        comments
      );
    });
    it('should store bidding processes comments', () => {
      const comments = [
        {
          id: '123',
          biddingProcessProcurementProcessId: '123456',
          comment: null,
        },
      ];
      const action = actions.getBiddingProcessCommentsSuccess({
        biddingProcessComments: comments,
        biddingProcessId: '123456',
      });

      const caseState = { ...initialState };
      caseState.processScreenLoading = true;
      caseState.processScreenLoaded = false;

      caseState.biddingProcessProcurementProcesses = [
        {
          id: '123456',
          comments: [],
          isCommentsLoaded: false,
        },
        {
          id: '123457',
          comments: [],
          isCommentsLoaded: false,
        },
      ] as any;

      const state = biddingProcessPlanReducer(caseState, action);

      expect(state.biddingProcessProcurementProcesses[0].comments).toEqual(
        comments
      );
    });
  });

  describe('bidding process by id', () => {
    it('should get bidding process', () => {
      const action = actions.getBiddingProcessById({
        biddingProcessId: '123456',
      });

      const state = biddingProcessPlanReducer(initialState, action);

      expect(state.isSelectedProcessLoading).toBe(true);
      expect(state.isSelectedProcessLoaded).toBe(false);
      expect(state.selectedBiddingProcessProcurementProcess).toBeNull();
    });
    it('should store bidding process', () => {
      const action = actions.getBiddingProcessByIdSuccess({
        biddingProcessProcurementProcess: null,
      });

      const state = biddingProcessPlanReducer(initialState, action);

      expect(state.isSelectedProcessLoading).toBe(false);
      expect(state.isSelectedProcessLoaded).toBe(true);
      expect(state.selectedBiddingProcessProcurementProcess).toBeNull();
    });
  });

  describe('remove process', () => {
    it('should remove process from state', () => {
      const action = actions.removeProcurementProcessSuccess({
        biddingProcessId: '123456',
      });

      const caseState = { ...initialState };
      caseState.biddingProcessProcurementProcesses = [
        {
          id: '123456',
        },
        {
          id: '1234567',
        },
      ] as any;

      const state = biddingProcessPlanReducer(caseState, action);

      expect(state.biddingProcessProcurementProcesses.length).toBe(1);
    });
  });

  describe('cancelling a process', () => {
    it('should start loading', () => {
      const action = actions.cancelProcurementProcess({
        biddingProcessId: '123456',
        comment: 'Test comment',
      });

      const caseState = { ...initialState };
      caseState.biddingProcessProcurementProcesses = [
        {
          id: '123456',
        },
        {
          id: '1234567',
        },
      ] as any;

      const state = biddingProcessPlanReducer(caseState, action);

      const process = state.biddingProcessProcurementProcesses[0];
      expect(process.isCancelling).toBe(true);
    });

    it('should stop loading when is cancelled successfully', () => {
      const action = actions.cancelProcurementProcessSuccess({
        biddingProcessId: '123456',
      });

      const caseState = { ...initialState };
      caseState.biddingProcessProcurementProcesses = [
        {
          id: '123456',
          isCancelling: true,
        },
        {
          id: '1234567',
          isCancelling: false,
        },
      ] as any;

      const state = biddingProcessPlanReducer(caseState, action);

      const process = state.biddingProcessProcurementProcesses[0];
      expect(process.isCancelling).toBe(false);
    });

    it('should stop loading when has an error', () => {
      const action = actions.cancelProcurementProcessError({
        biddingProcessId: '123456',
      });

      const caseState = { ...initialState };
      caseState.biddingProcessProcurementProcesses = [
        {
          id: '123456',
          isCancelling: true,
        },
        {
          id: '1234567',
          isCancelling: false,
        },
      ] as any;

      const state = biddingProcessPlanReducer(caseState, action);

      const process = state.biddingProcessProcurementProcesses[0];
      expect(process.isCancelling).toBe(false);
    });
  });

  it('should reset the bidding process plan state', () => {
    const resetAction = actions.resetBiddingProcessPlan;

    const result = biddingProcessPlanReducer(initialState, resetAction);

    expect(result).toEqual(BiddingProcessPlanInitialState);
  });

  it('should update the status of the selected bidding process procurement process', () => {
    const initialProcess: BiddingProcessProcurementProcess = {
      isMigrated: false,
      packagesUnderReview: false,
      biddingProcessPlanId: 'b4952feb-3947-4d10-bd3c-923d4adbbbd7',
      code: 'PN-L1095-P00127',
      description: 'CFI-6759-8',
      totalAcumulatedAmount: 0,
      sustainabilityDescription: '',
      totalComments: 0,
      advanceMilestone: {
        totalCompleted: 1,
        total: 10,
        delayed: true,
        currentMilestone: null,
      },
      componentName: 'Componente 1. Electrificación rural en red',
      bafo: null,
      sepaPeclaId: '',
      lots: null,
      category: {
        name: 'PROCT_WORKS',
        id: 5,
      },
      procurementMethod: {
        name: 'PROCT_CBSSTEWP',
        id: 79,
      },
      supervisionMethod: {
        name: 'ExPost',
        id: 1,
      },
      status: 7,
      sustainability: null,
      goodsReference: null,
      id: '49a2f749-2ed1-4fa3-8ebc-0abbf707a9fc',
      manualId: '',
      name: 'CFI-6759-8',
      projectAmount: {
        estimatedAmount: 666,
        localCounterpartAmount: 222,
        idbAmount: 222,
        cofinancedAmount: 222,
        costJustification: null,
      },
      subExecutor: '',
      justification: '',
      isUpdated: true,
      procurementProcessComments: [],
      order: 0,
    };
    const testInitialState: BiddingProcessPlanState = JSON.parse(
      JSON.stringify(initialState)
    );
    testInitialState.selectedBiddingProcessProcurementProcess = initialProcess;
    testInitialState.biddingProcessProcurementProcesses = [initialProcess];

    const biddingProcessId = '49a2f749-2ed1-4fa3-8ebc-0abbf707a9fc';
    const newStatus = 1;
    const countryCode = 'US';
    const expectedResult = { ...initialProcess, status: newStatus };
    const action = actions.updateProcurementStatusSuccess({
      biddingProcessId,
      newStatus,
      countryCode,
    });

    const result = biddingProcessPlanReducer(testInitialState, action);
    expect(result.selectedBiddingProcessProcurementProcess).toEqual(
      expectedResult
    );
    expect(result.biddingProcessProcurementProcesses[0]).toEqual(
      expectedResult
    );
    expect(result.loading).toBe(false);
    expect(result.loaded).toBe(true);
  });

  it('should update the state when requestApprovalSuccess action is dispatched', () => {
    const initialPlan: BiddingProcessPlan = {
      id: '123',
      projectBucketId: '123',
      version: 0,
      status: BiddingProcessPlanStatus.DRAFT,
      approvedDate: 'string',
      approvedBy: 'string',
    };

    const action = actions.requestApprovalSuccess({
      projectId: initialPlan.projectBucketId,
      launchReq,
    });

    const result = biddingProcessPlanReducer(initialState, action);

    expect(result.processScreenLoading).toBe(false);
    expect(result.processScreenLoaded).toBe(true);
    expect(result.biddingProcessPlan.status).toBe(
      BiddingProcessPlanStatus.UNDER_REVIEW
    );
  });

  it('should update the state when requestApproval action is dispatched', () => {
    const testLaunchReq = { ...launchReq };
    const projectId = 'xd';
    const lang = 'en';
    const action = actions.requestApproval({
      launchReq: testLaunchReq,
      projectId,
      lang,
    });

    const result = biddingProcessPlanReducer(initialState, action);

    expect(result.processScreenLoading).toBe(true);
    expect(result.processScreenLoaded).toBe(false);
  });

  describe('declare unsuccessful process', () => {
    it('should start loading', () => {
      const action = actions.unsuccessfulProcurementProcess({
        comment: 'xd',
        procurementProcessId: '123456',
      });

      const caseState = { ...initialState };
      caseState.biddingProcessProcurementProcesses = [
        {
          id: '123456',
        },
        {
          id: '1234567',
        },
      ] as any;

      const state = biddingProcessPlanReducer(caseState, action);

      expect(state.loading).toBe(true);
    });

    it('should stop loading when is declare unsuccessful process successfully', () => {
      const action = actions.unsuccessfulProcurementProcessSuccess({
        procurementProcessId: '123456',
      });

      const caseState = { ...initialState };
      caseState.biddingProcessProcurementProcesses = [
        {
          id: '123456',
          status: BiddingProcessProcurementProcessStatuses.PROCESS_ONGOING,
        },
        {
          id: '1234567',
        },
      ] as any;

      const state = biddingProcessPlanReducer(caseState, action);

      const process = state.biddingProcessProcurementProcesses[0];
      expect(process.status).toBe(
        BiddingProcessProcurementProcessStatuses.UNSUCCESFUL_PROCESS
      );
    });

    it('should stop loading when is declare unsuccessful process has an error', () => {
      const payloadError = 'error';
      const action = actions.unsuccessfulProcurementProcessError({
        payload: payloadError,
      });

      const caseState = { ...initialState };
      caseState.biddingProcessProcurementProcesses = [
        {
          id: '123456',
          status: BiddingProcessProcurementProcessStatuses.PROCESS_ONGOING,
        },
        {
          id: '1234567',
        },
      ] as any;

      const state = biddingProcessPlanReducer(caseState, action);

      const process = state.biddingProcessProcurementProcesses[0];
      expect(process.status).toBe(
        BiddingProcessProcurementProcessStatuses.PROCESS_ONGOING
      );
      expect(state.error).toBe(payloadError);
    });
  });
});

const initialState: BiddingProcessPlanState = {
  ...BiddingProcessPlanInitialState,
};
const launchReq: WorkflowLaunchRequest = {
  entityTypeId: 'entityTypeId',
  isInternalVisibility: false,
  projectBucketId: 'projectBucketId',
  instAcronym: 'instAcronym',
  packageId: 'packageId',
  businessRulesRequest: {
    module: 'module',
    table: 'table',
    name: 'name',
    factors: { workflowSection: WorkflowEntityScreen.PROCUREMENT_PLAN },
  },
  role: 'role',
  workflowComment: {
    status: '',
    text: '',
    visibility: true,
  },
};
