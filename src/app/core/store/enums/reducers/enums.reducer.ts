import { AppState } from '@core/store/store.reducers';
import { createReducer, on } from '@ngrx/store';
import * as enumsActions from '../actions/enums.actions';

import {
  ContractsEnum,
  ContractsMasterData,
  Enumerator,
  EnumeratorCodeName,
  Enums,
} from '@core/models';

export interface EnumState {
  biddingContractStatuses: Enumerator[];
  biddingContractTypes: Enumerator[];
  biddingContractBonusTypes: Enumerator[];
  biddingContractConflictResolutionMethods: Enumerator[];
  biddingContractLiquidatedDamageTypes: Enumerator[];
  biddingContractBonusPaymentFrequency: Enumerator[];
  biddingContractSecurityTypes: Enumerator[];
  biddingContractDocumentGroupCodes: Enumerator[];
  biddingContractDocumentGroupVisibilities: Enumerator[];
  biddingProcessBidderEconomicSectors: Enumerator[];
  biddingProcessBidderTypes: Enumerator[];
  biddingProcessDocumentGroupCodes: Enumerator[];
  biddingProcessDocumentgroupResults: Enumerator[];
  biddingProcessDocumentGroupVisibilities: Enumerator[];
  biddingProcessDocumentPackageCodes: Enumerator[];
  biddingProcessDocumentPackageStatuses: Enumerator[];
  biddingProcessMilestoneCodes: Enumerator[];
  biddingProcessMilestoneStatuses: Enumerator[];
  biddingProcessParticipantResults: Enumerator[];
  biddingProcessPlanStatuses: Enumerator[];
  biddingProcessProcurementProcessProcurementMethods: Enumerator[];
  biddingProcessProcurementProcessGoodsReferences: Enumerator[];
  biddingProcessProcurementProcessCategories: Enumerator[];
  biddingProcessProcurementProcessStatuses: Enumerator[];
  biddingProcessProcurementProcessSupervisionMethods: Enumerator[];
  biddingProcessProcurementProcessSustainabilities: Enumerator[];
  commentSources: Enumerator[];
  commentStatuses: Enumerator[];
  commentVisibilities: Enumerator[];
  fiduciaryProcessDocumentsStatuses: Enumerator[];
  fiduciaryProcessDocumentsTypes: Enumerator[];
  projectBucketStatuses: Enumerator[];
  projectTaskStatuses: Enumerator[];
  projectTaskTypes: Enumerator[];
  countries: EnumeratorCodeName[];
  beneficiaryCountries: EnumeratorCodeName[];
  memberCountries: Enumerator[];
  documentDomain: Enumerator[];
  workflowActions: Enumerator[];
  onlineDisburmentWorkflowSteps: Enumerator[];
  onlineDisburmentWorkflowActions: Enumerator[];
  transactionDocumentGroupCodes: Enumerator[];
  TransactionStatuses: Enumerator[];
  workflowSteps: Enumerator[];
  workflowRoles: Enumerator[];
  workflowTypes: Enumerator[];
  WorkFlowDocumentVisibilities: Enumerator[];
  contractsTypes: ContractsMasterData[];
  contractsBonusTypes: ContractsMasterData[];
  contractsConflictResolutionMethods: ContractsMasterData[];
  contractsGuaranteeTypes: ContractsMasterData[];
  contractsStatuses: ContractsMasterData[];
  contractsLiquidationDamageTypes: ContractsMasterData[];
  contractsPaymentDistributions: ContractsMasterData[];
  contractsPaymentFrequencies: ContractsMasterData[];
  contractsPaymentRequests: ContractsMasterData[];
  enumsLoaded: {
    [enumType: string]: boolean;
  };
  enumsLoading: {
    [enumType: string]: boolean;
  };
  loaded: boolean;
  loading: boolean;
  error: unknown;
}
export interface AppStateWithEnums extends AppState {
  enums: EnumState;
}

export const enumsInitialState: EnumState = {
  biddingContractStatuses: [],
  biddingContractTypes: [],
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
  documentDomain: [],
  countries: [],
  beneficiaryCountries: [],
  memberCountries: [],
  workflowActions: [],
  onlineDisburmentWorkflowSteps: [],
  onlineDisburmentWorkflowActions: [],
  transactionDocumentGroupCodes: [],
  TransactionStatuses: [],
  workflowSteps: [],
  workflowRoles: [],
  workflowTypes: [],
  WorkFlowDocumentVisibilities: [],
  contractsBonusTypes: [],
  contractsConflictResolutionMethods: [],
  contractsGuaranteeTypes: [],
  contractsStatuses: [],
  contractsTypes: [],
  contractsLiquidationDamageTypes: [],
  contractsPaymentDistributions: [],
  contractsPaymentFrequencies: [],
  contractsPaymentRequests: [],
  enumsLoaded: {},
  enumsLoading: {},
  loaded: false,
  loading: false,
  error: null,
};

const _enumReducer = createReducer(
  enumsInitialState,
  on(
    enumsActions.getEnum,
    enumsActions.getLocations,
    enumsActions.getContractEnums,
    (state, { enumType }) => {
      const newState = { ...state };

      const enumsLoaded = { ...newState.enumsLoaded };
      const enumsLoading = { ...newState.enumsLoading };

      enumsLoaded[enumType] = false;
      enumsLoading[enumType] = true;

      newState.enumsLoaded = enumsLoaded;
      newState.enumsLoading = enumsLoading;

      return {
        ...newState,
        loading: true,
      };
    }
  ),
  on(enumsActions.getContractEnumsSucces, (state, { enums, enumType }) => {
    const newState = { ...state };

    const stateKey = getContractEnumStateKey(enumType);

    if (stateKey) {
      newState[stateKey] = enums;

      const enumsLoaded = { ...newState.enumsLoaded };
      const enumsLoading = { ...newState.enumsLoading };

      enumsLoaded[stateKey] = true;
      enumsLoading[stateKey] = false;

      newState.enumsLoaded = enumsLoaded;
      newState.enumsLoading = enumsLoading;
    }

    return {
      ...newState,
      loading: false,
      loaded: true,
    };
  }),
  on(
    enumsActions.getEnumsSuccess,
    enumsActions.getLocationSuccess,
    (state, { enums, enumType }) => {
      const key = enumType;
      let enumsWithPrefix = [...enums.enumerator];
      if (enumType === Enums.biddingProcessProcurementProcessCategories) {
        enumsWithPrefix = enumsWithPrefix.map((category) => {
          const categoryWithPrefix = { ...category };
          categoryWithPrefix.name = `PROCUREMENT.CATEGORIES.${categoryWithPrefix.name}`;
          return categoryWithPrefix;
        });
      }

      if (
        enumType === Enums.biddingProcessProcurementProcessSupervisionMethods
      ) {
        enumsWithPrefix = enumsWithPrefix.map((category) => {
          const categoryWithPrefix = { ...category };
          categoryWithPrefix.name = `PROCUREMENT.SUPERVISION_METHOD.${categoryWithPrefix.name}`;
          return categoryWithPrefix;
        });
      }

      if (
        enumType === Enums.biddingProcessProcurementProcessProcurementMethods
      ) {
        enumsWithPrefix = enumsWithPrefix.map((category) => {
          const categoryWithPrefix = { ...category };
          categoryWithPrefix.name = `PROCUREMENT.PROCUREMENT_METHOD.${categoryWithPrefix.name}`;
          return categoryWithPrefix;
        });
      }

      const enumsJson = parseEnumLiterals(enumsWithPrefix);

      const newEnum = { [key]: enumsJson };
      const newState = Object.assign({ ...state }, newEnum);

      const enumsLoaded = { ...newState.enumsLoaded };
      const enumsLoading = { ...newState.enumsLoading };
      enumsLoaded[key] = true;
      enumsLoading[key] = false;

      newState.enumsLoaded = enumsLoaded;
      newState.enumsLoading = enumsLoading;

      return {
        ...newState,
        loading: false,
        loaded: true,
      };
    }
  ),
  on(enumsActions.getEnumsError, (state, { enumType }) => {
    const newState = { ...state };

    const enumsLoaded = { ...newState.enumsLoaded };
    const enumsLoading = { ...newState.enumsLoading };

    enumsLoaded[enumType] = true;
    enumsLoading[enumType] = false;
    newState.enumsLoaded = enumsLoaded;
    newState.enumsLoading = enumsLoading;

    return {
      ...newState,
      loaded: true,
      loading: false,
    };
  })
);

function parseEnumLiterals(
  enumerable: (Enumerator | EnumeratorCodeName)[]
): (Enumerator | EnumeratorCodeName)[] {
  return enumerable.map((enumerator) => {
    const newEnum = { ...enumerator };
    newEnum.name = removePrefixFromLiteral(newEnum.name);
    return newEnum;
  });
}

function removePrefixFromLiteral(literal: string): string {
  const index = literal.indexOf('ENUM');
  if (index !== -1) {
    return literal.slice(literal.indexOf('ENUM'));
  } else {
    return literal;
  }
}

export function getContractEnumStateKey(enumType: ContractsEnum): string {
  const mapping = {
    [ContractsEnum.BONUS]: 'contractsBonusTypes',
    [ContractsEnum.CONFLICT_RESOLUTION_METHOD]:
      'contractsConflictResolutionMethods',
    [ContractsEnum.GUARANTEE]: 'contractsGuaranteeTypes',
    [ContractsEnum.CONTRACT_STATUS]: 'contractsStatuses',
    [ContractsEnum.CONTRACT_TYPE]: 'contractsTypes',
    [ContractsEnum.LIQUIDATION_DAMAGE]: 'contractsLiquidationDamageTypes',
    [ContractsEnum.PAYMENT_DISTRIBUTION]: 'contractsPaymentDistributions',
    [ContractsEnum.PAYMENT_FREQUENCY]: 'contractsPaymentFrequencies',
    [ContractsEnum.PAYMENT_REQUEST]: 'contractsPaymentRequests',
  };

  return mapping[enumType] || null;
}

export function enumReducer(state, action) {
  return _enumReducer(state, action);
}
