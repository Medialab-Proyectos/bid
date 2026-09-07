import { enumReducer, EnumState } from './enums.reducer';
import * as actions from '../actions/enums.actions';
import { Enums } from '@core/models';

describe('enums reducer', () => {
  it('Action get Enum', () => {
    expect(
      enumReducer(initialState, {
        enumType: Enums.biddingContractBonusPaymentFrequency,
        type: '[Enums] get Enum',
      })
    ).toEqual({
      ...initialState,
      loading: true,
      enumsLoaded: {
        biddingContractBonusPaymentFrequency: false,
      },
      enumsLoading: {
        biddingContractBonusPaymentFrequency: true,
      },
    });
  });

  it('should save enums into state', () => {
    const action = actions.getEnumsSuccess({
      enums: {
        enumerator: [
          { id: 1, name: 'FI.CNVG.FP.ENUM.LITERAL_KEY' },
          { id: 1, name: 'FI.CNVG.FP.ENUM.ANOTHER_KEY' },
        ],
      },
      enumType: Enums.biddingContractBonusTypes,
    });

    const updatedState = { ...initialState };
    updatedState.biddingContractBonusTypes = [
      { id: 1, name: 'ENUM.LITERAL_KEY' },
      { id: 1, name: 'ENUM.ANOTHER_KEY' },
    ];
    updatedState.enumsLoaded = {
      biddingContractBonusTypes: true,
    };
    updatedState.enumsLoading = {
      biddingContractBonusTypes: false,
    };

    updatedState.loaded = true;
    expect(enumReducer(initialState, action)).toEqual(updatedState);
  });

  it('Action get Enum Error', () => {
    expect(
      enumReducer(initialState, {
        type: '[Enums] get Enums Error',
        payload: payload,
        enumType: Enums.biddingContractBonusPaymentFrequency,
      })
    ).toEqual(errorState);
  });

  describe('getEnumsSuccess', () => {
    it('should save enums into state for biddingProcessProcurementProcessCategories', () => {
      const action = actions.getEnumsSuccess({
        enums: {
          enumerator: [
            { id: 1, name: 'FI.CNVG.FP.ENUM.PROCUREMENT.CATEGORIES.CATEGORY1' },
            { id: 2, name: 'FI.CNVG.FP.ENUM.PROCUREMENT.CATEGORIES.CATEGORY2' },
          ],
        },
        enumType: Enums.biddingProcessProcurementProcessCategories,
      });

      const updatedState = { ...initialState };
      updatedState.biddingProcessProcurementProcessCategories = [
        { id: 1, name: 'ENUM.PROCUREMENT.CATEGORIES.CATEGORY1' },
        { id: 2, name: 'ENUM.PROCUREMENT.CATEGORIES.CATEGORY2' },
      ];
      updatedState.enumsLoaded = {
        biddingProcessProcurementProcessCategories: true,
      };
      updatedState.enumsLoading = {
        biddingProcessProcurementProcessCategories: false,
      };

      updatedState.loaded = true;
      const result = enumReducer(initialState, action);
      expect(result).toEqual(updatedState);
    });

    it('should save enums into state for biddingProcessProcurementProcessSupervisionMethods', () => {
      const action = actions.getEnumsSuccess({
        enums: {
          enumerator: [
            {
              id: 1,
              name: 'FI.CNVG.FP.ENUM.PROCUREMENT.SUPERVISION_METHOD.METHOD1',
            },
            { id: 2, name: 'FI.CNVG.FP.ENUM.SUPERVISION_METHOD.METHOD2' },
          ],
        },
        enumType: Enums.biddingProcessProcurementProcessSupervisionMethods,
      });

      const updatedState = { ...initialState };
      updatedState.biddingProcessProcurementProcessSupervisionMethods = [
        { id: 1, name: 'ENUM.PROCUREMENT.SUPERVISION_METHOD.METHOD1' },
        { id: 2, name: 'ENUM.SUPERVISION_METHOD.METHOD2' },
      ];
      updatedState.enumsLoaded = {
        biddingProcessProcurementProcessSupervisionMethods: true,
      };
      updatedState.enumsLoading = {
        biddingProcessProcurementProcessSupervisionMethods: false,
      };

      updatedState.loaded = true;
      const result = enumReducer(initialState, action);
      expect(result).toEqual(updatedState);
    });

    it('should save enums into state for biddingProcessProcurementProcessProcurementMethods', () => {
      const action = actions.getEnumsSuccess({
        enums: {
          enumerator: [
            {
              id: 1,
              name: 'METHOD1',
            },
            { id: 2, name: 'METHOD2' },
          ],
        },
        enumType: Enums.biddingProcessProcurementProcessProcurementMethods,
      });

      const updatedState = { ...initialState };
      updatedState.biddingProcessProcurementProcessProcurementMethods = [
        { id: 1, name: 'PROCUREMENT.PROCUREMENT_METHOD.METHOD1' },
        { id: 2, name: 'PROCUREMENT.PROCUREMENT_METHOD.METHOD2' },
      ];
      updatedState.enumsLoaded = {
        biddingProcessProcurementProcessProcurementMethods: true,
      };
      updatedState.enumsLoading = {
        biddingProcessProcurementProcessProcurementMethods: false,
      };

      updatedState.loaded = true;
      const result = enumReducer(initialState, action);
      expect(result).toEqual(updatedState);
    });
  });
});

const initialState: EnumState = {
  biddingContractTypes: [],
  biddingContractStatuses: [],
  biddingContractBonusTypes: [],
  biddingContractConflictResolutionMethods: [],
  biddingContractLiquidatedDamageTypes: [],
  biddingContractBonusPaymentFrequency: [],
  biddingContractSecurityTypes: [],
  biddingContractDocumentGroupCodes: [],
  biddingContractDocumentGroupVisibilities: [],
  biddingProcessBidderEconomicSectors: [],
  biddingProcessBidderTypes: [],
  biddingProcessDocumentGroupCodes: [],
  biddingProcessDocumentgroupResults: [],
  biddingProcessDocumentGroupVisibilities: [],
  biddingProcessDocumentPackageCodes: [],
  biddingProcessDocumentPackageStatuses: [],
  biddingProcessMilestoneCodes: [],
  biddingProcessMilestoneStatuses: [],
  biddingProcessParticipantResults: [],
  biddingProcessPlanStatuses: [],
  biddingProcessProcurementProcessProcurementMethods: [],
  biddingProcessProcurementProcessGoodsReferences: [],
  biddingProcessProcurementProcessCategories: [],
  biddingProcessProcurementProcessStatuses: [],
  biddingProcessProcurementProcessSupervisionMethods: [],
  biddingProcessProcurementProcessSustainabilities: [],
  commentSources: [],
  commentStatuses: [],
  commentVisibilities: [],
  fiduciaryProcessDocumentsStatuses: [],
  fiduciaryProcessDocumentsTypes: [],
  projectBucketStatuses: [],
  projectTaskStatuses: [],
  projectTaskTypes: [],
  countries: [],
  beneficiaryCountries: [],
  memberCountries: [],
  documentDomain: [],
  enumsLoaded: {},
  enumsLoading: {},
  onlineDisburmentWorkflowSteps: [],
  onlineDisburmentWorkflowActions: [],
  TransactionStatuses: [],
  transactionDocumentGroupCodes: [],
  workflowSteps: [],
  workflowRoles: [],
  WorkFlowDocumentVisibilities: [],
  contractsBonusTypes: [],
  contractsConflictResolutionMethods: [],
  contractsGuaranteeTypes: [],
  contractsLiquidationDamageTypes: [],
  contractsPaymentFrequencies: [],
  contractsPaymentRequests: [],
  contractsStatuses: [],
  contractsTypes: [],
  contractsPaymentDistributions: [],
  workflowActions: null,
  workflowTypes: [],
  loaded: false,
  loading: false,
  error: null,
};

const payload = null;

const errorState = {
  ...initialState,
  loading: false,
  loaded: true,
  error: payload,
  enumsLoaded: {
    biddingContractBonusPaymentFrequency: true,
  },
  enumsLoading: {
    biddingContractBonusPaymentFrequency: false,
  },
};
