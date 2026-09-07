export interface GetEnumsResponse<T = Enumerator[]> {
  enumerator: T;
}
export interface GetEnumsLocationResponse<T = EnumeratorCodeName[]> {
  enumerator: T;
}

export interface Enumerator {
  id: number;
  name: string;
}

export interface EnumeratorCodeName {
  code: string;
  name: string;
}

export interface Country {
  id: string;
  name: string;
}

export interface ContractsMasterData {
  id?: number;
  nameEn?: string;
  nameEs?: string;
  nameFr?: string;
  namePt?: string;
}

export enum Enums {
  biddingContractStatuses = 'biddingContractStatuses',
  biddingContractTypes = 'biddingContractTypes',
  biddingContractBonusTypes = 'biddingContractBonusTypes',
  biddingContractConflictResolutionMethods = 'biddingContractConflictResolutionMethods',
  biddingContractLiquidatedDamageTypes = 'biddingContractLiquidatedDamageTypes',
  biddingContractBonusPaymentFrequency = 'biddingContractBonusPaymentFrequency',
  biddingContractSecurityTypes = 'biddingContractSecurityTypes',
  biddingContractDocumentGroupCodes = 'biddingContractDocumentGroupCodes',
  biddingContractDocumentGroupVisibilities = 'biddingContractDocumentGroupVisibilities',
  biddingContractAmendmentDocumentGroupCodes = 'biddingContractAmendmentDocumentGroupCodes',

  biddingProcessBidderEconomicSectors = 'biddingProcessBidderEconomicSectors',
  biddingProcessBidderTypes = 'biddingProcessBidderTypes',
  biddingProcessDocumentGroupCodes = 'biddingProcessDocumentGroupCodes',
  biddingProcessDocumentgroupResults = 'biddingProcessDocumentgroupResults',
  biddingProcessDocumentGroupVisibilities = 'biddingProcessDocumentGroupVisibilities',
  biddingProcessDocumentPackageCodes = 'biddingProcessDocumentPackageCodes',
  biddingProcessDocumentPackageStatuses = 'biddingProcessDocumentPackageStatuses',
  biddingProcessMilestoneCodes = 'biddingProcessMilestoneCodes',
  biddingProcessMilestoneStatuses = 'biddingProcessMilestoneStatuses',
  biddingProcessParticipantResults = 'biddingProcessParticipantResults',
  biddingProcessPlanStatuses = 'biddingProcessPlanStatuses',
  biddingProcessProcurementProcessProcurementMethods = 'biddingProcessProcurementProcessProcurementMethods',
  biddingProcessProcurementProcessGoodsReferences = 'biddingProcessProcurementProcessGoodsReferences',
  biddingProcessProcurementProcessCategories = 'biddingProcessProcurementProcessCategories',
  biddingProcessProcurementProcessStatuses = 'biddingProcessProcurementProcessStatuses',
  biddingProcessProcurementProcessSupervisionMethods = 'biddingProcessProcurementProcessSupervisionMethods',
  biddingProcessProcurementProcessSustainabilities = 'biddingProcessProcurementProcessSustainabilities',

  fiduciaryProcessDocumentsStatuses = 'fiduciaryProcessDocumentsStatuses',
  fiduciaryProcessDocumentsTypes = 'fiduciaryProcessDocumentsTypes',

  workflowActions = 'workflowActions',
  onlineDisburmentWorkflowSteps = 'onlineDisburmentWorkflowSteps',
  onlineDisburmentWorkflowActions = 'onlineDisburmentWorkflowActions',
  workflowSteps = 'workflowSteps',
  workflowRoles = 'workflowRoles',
  workflowTypes = 'workflowTypes',
  WorkFlowDocumentVisibilities = 'WorkFlowDocumentVisibilities',

  transactionDocumentGroupCodes = 'transactionDocumentGroupCodes',
  TransactionStatuses = 'TransactionStatuses',

  commentSources = 'commentSources',
  commentStatuses = 'commentStatuses',
  commentVisibilities = 'commentVisibilities',
  projectTaskTypes = 'projectTaskTypes',
  documentDomain = 'documentDomain',
  projectBucketStatuses = 'projectBucketStatuses',
  projectTaskStatuses = 'projectTaskStatuses',
  contractsTypes = 'contractsTypes',
  contractsBonusTypes = 'contractsBonusTypes',
  contractsConflictResolutionMethods = 'contractsConflictResolutionMethods',
  contractsGuaranteeTypes = 'contractsGuaranteeTypes',
  contractsStatuses = 'contractsStatuses',
  contractsLiquidationDamageTypes = 'contractsLiquidationDamageTypes',
  contractsPaymentDistributions = 'contractsPaymentDistributions',
  contractsPaymentFrequencies = 'contractsPaymentFrequencies',
  contractsPaymentRequests = 'contractsPaymentRequests',
}

export enum ContractsEnum {
  BONUS = 'bonus-types',
  CONFLICT_RESOLUTION_METHOD = 'conflict-resolution-method-types',
  CONTRACT_STATUS = 'contract-status',
  CONTRACT_TYPE = 'contract-types',
  GUARANTEE = 'guarantee-types',
  LIQUIDATION_DAMAGE = 'liquidation-of-damage-types',
  PAYMENT_DISTRIBUTION = 'payment-distribution-types',
  PAYMENT_FREQUENCY = 'payment-frequency-types',
  PAYMENT_REQUEST = 'payment-request-types',
}

export function enumValues(): string[] {
  return Object.keys(Enums);
}

export enum LocationEnums {
  countries = 'countries',
  beneficiaryCountries = 'beneficiaryCountries',
  memberCountries = 'memberCountries',
}

export function enumLocationValues(): string[] {
  return Object.keys(LocationEnums);
}

export enum OtherEnums {
  commentSources = 'commentSources',
  commentStatuses = 'commentStatuses',
  commentVisibilities = 'commentVisibilities',
  projectTaskTypes = 'projectTaskTypes',
  documentDomain = 'documentDomain',
  projectBucketStatuses = 'projectBucketStatuses',
  projectTaskStatuses = 'projectTaskStatuses',
}

export function enumOthersValues(): string[] {
  return Object.keys(OtherEnums);
}

export enum AuditTrailActionVisibleInFI {
  'TRANSACTION.AUDIT_TRAIL.ACTIONS.ACK',
  'TRANSACTION.AUDIT_TRAIL.ACTIONS.ACK ERROR',
  'TRANSACTION.AUDIT_TRAIL.ACTIONS.VALUE DATE',
  'TRANSACTION.AUDIT_TRAIL.ACTIONS.REJECT BY IDB',
  'TRANSACTION.AUDIT_TRAIL.ACTIONS.RETURN BY IDB',
}
