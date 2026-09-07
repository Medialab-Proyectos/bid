import {
  BiddingProcessProcurementProcess,
  Currency,
  Enumerator,
  FiduciaryProcessDocument,
  FiduciaryProcessDocumentGroup,
  MasterDataCountryEnum,
  ParticipantAwardedV2,
  Project,
  ProjectTask,
} from '@core/models';

export interface ContractDocumentState {
  pendingDocs: FiduciaryProcessDocument[];
  persistedDocs: FiduciaryProcessDocument[];
  availableTypes: FiduciaryProcessDocumentGroup[];
  groupsWDocuments: FiduciaryProcessDocumentGroup[];
  groupEnum: Enumerator[];
  loading: boolean;
}

export interface ContractLotsModel {
  lots: Lots[];
}

export interface Lots {
  name: string;
  amount: number;
  currency: string;
  unit: number;
}

export interface ContractAditionalInfoModel {
  guarantees: GuaranteeModel[];
  damages: DamagesModel[];
  bonus: BonusModel[];
}

export interface DamagesModel {
  liquidatedDamageType: number;
  paymentFrequencyType: number;
  percentage: number;
  maximumPercentage: number;
}

export interface BonusModel {
  liquidatedDamageType: number;
  paymentFrequencyType: number;
  percentage: number;
  maximumPercentage: number;
}

export interface GuaranteeModel {
  guaranteeType: number;
  amount: number;
  currency: string;
  usdEquivalentAmount: number;
  startDate: string;
  endDate: string;
}

export interface ContractParticipants {
  selectedParticipantId: string;
}

export interface ContractsFeesModel {
  fees: Fee[];
}

export interface Fee {
  concept: string;
  hours: number;
  currency: string;
  usdEquivalent: number;
  subtotal: number;
}

export interface Contract {
  participants: ContractParticipants;
  generalInfo: ContractsGeneralInfoModel;
  costDistribution: ContractCostDitribution;
  lots: ContractLotsModel;
  fees: ContractsFeesModel;
  executionPlace: ContractExecutionPlace;
  additionalInformation: ContractAditionalInfoModel;
}

export interface ContractsGeneralInfoModel {
  contractName: string;
  contractObjective: string;
  signatureDate: string;
  startDate: string;
  endDate: string;
  internalControlNumber: string;
  contractType: number;
  hasAdvancePayment: boolean;
  conflictResolutionMethod: number;
  applicableLaw: string;
  goodsSource?: string[];
  justification?: string;
  conflictResolutionJustification?: string | null;
}

export interface ContractProduct {
  output: string;
  bidAmount: number;
  localCounterPartAmount: number;
  cofinancingAmount: number;
  totalAmount: number;
  totalEquivalent: number;
}

export interface ContractComponent {
  component: string;
  products: ContractProduct[];
  totalAmountBid: number;
  totalCounterpartAmount: number;
  totalCofinaningAmount: number;
  totalAmount: number;
  totalEquivalentAmount: number;
}

export interface ContractCurrency {
  currency: string;
  equivalentUsd: number;
  equivalentUsdApproval: number;
  numberOfDecimal: number;
  componentsArray: ContractComponent[];
  totalAmountBid: number;
  totalCounterpartAmount: number;
  totalCofinaningAmount: number;
  totalAmount: number;
  totalEquivalentAmount: number;
}

export interface ContractCostDitribution {
  currencies: ContractCurrency[];
}

export interface ContractExecutionPlace {
  locations: ExecutionLocation[];
}

export interface ExecutionLocation {
  address: string;
  zipCode: string;
  country: string;
  id: string;
  locality: string;
}

export interface ContractPostModel {
  procurementProcess: string;
  processParticipant: string;
  generalInformation: GeneralInformationPostModel;
  costDistributions: CostDistributionPostModel[];
  lots: LotsPostModel[];
  fees: FeesPostModel[];
  executionOfWorks: ExecutionOfWorksPostModel[];
  additionalInformation: {
    guarantees: GuaranteesPostModel[];
    liquidationOfDamage: DamagesPostModel;
    bonus: BonusPostModel;
  };
}

export interface GeneralInformationPostModel {
  name: string;
  objective: string;
  signatureDate: string;
  startDate: string;
  endDate: string;
  internalControlNumber: string;
  contractType: number;
  hasAdvancedPayment: boolean;
  conflictResolutionMethod: number;
  applicableLaw: string;
  goodsOrigins: string[];
  justification: string;
  conflictResolutionJustification: string | null;
}

export interface CostDistributionDetailPostModel {
  productId: string;
  idbTotal: number;
  lcTotal: number;
  cfTotal: number;
  idbUsdEquivalent: number;
  lcUsdEquivalent: number;
  cfUsdEquivalent: number;
  idbEquivalentCurrency: number;
  lcEquivalentCurrency: number;
  cfEquivalentCurrency: number;
}

export interface CostDistributionPostModel {
  componentId: string;
  currency: string;
  costDistributionDetails: CostDistributionDetailPostModel[];
}

export interface LotsPostModel {
  lotNumber: string;
  unit: number;
  currency: string;
  amount: number;
}

export interface FeesPostModel {
  concept: string;
  hours: number;
  currency: string;
  usdEquivalent: number;
  order: number;
}

export interface ExecutionOfWorksPostModel {
  address: string;
  postalCode: string;
  countryCode: string;
  locality: string;
}

export interface GuaranteesPostModel {
  guaranteeTypeId: number;
  currency: string;
  amount: number;
  usdEquivalentAmount: number;
  issueDate: string;
  endDate: string;
}

export interface DamagesPostModel {
  liquidationOfDamageTypeId: number;
  paymentFrequencyTypeId: number;
  percentage: number;
  maximumPercentage: number;
}

export interface BonusPostModel {
  bonusTypeId: number;
  paymentFrequencyTypeId: number;
  percentage: number;
  maximumPercentage: number;
}

export interface ContractLocationResponse {
  address: string;
  postalCode: string;
  countryCode: string;
  locality: string;
}

export interface ContractGeneralInfoResponse {
  name: string;
  objective: string;
  signatureDate: string;
  startDate: string;
  endDate: string;
  internalControlNumber: string;
  contractType: number;
  hasAdvancedPayment: boolean;
  conflictResolutionMethod: number;
  applicableLaw: string;
  goodsOrigin: string[];
  justification: string;
  conflictResolutionJustification: string | null;
}

export interface ContractGuaranteeResponse {
  guaranteeTypeId: number;
  currency: string;
  amount: number;
  usdEquivalentAmount: number;
  issueDate: string;
  endDate: string;
}

export interface ContractBonusResponse {
  bonusTypeId: number;
  paymentFrequencyTypeId: number;
  percentage: number;
  maximumPercentage: number;
}

export interface ContractDamagesResponse {
  liquidationOfDamageTypeId: number;
  paymentFrequencyTypeId: number;
  percentage: number;
  maximumPercentage: number;
}

export interface ContractLotResponse {
  lotNumber: string;
  amount: number;
  currency: string;
  unit: number;
}

export interface ContractProductResponse {
  id: string;
  productId: string;
  idbTotal: number;
  lcTotal: number;
  cfTotal: number;
}

export interface ContractComponentResponse {
  detail: ContractProductResponse[];
  id: string;
  componentId: string;
  order: number;
  currency: string;
}

//TODO fees
export interface ContractResponse {
  id: string;
  processId: string;
  participantAwardedId: string;
  generalInformation: ContractGeneralInfoResponse;
  lots: ContractLotResponse[];
  executionsOfWork: ContractLocationResponse[];
  fees: FeesPostModel[];
  additionalInformation: {
    guarantees: ContractGuaranteeResponse[];
    liquidationOfDamage: ContractDamagesResponse;
    bonus: ContractBonusResponse;
  };
  costDistribution: ContractComponentResponse[];
}

export interface NeededData {
  enums: {
    biddingContractTypes: Enumerator[];
    biddingContractConflictResolutionMethods: Enumerator[];
    memberCountries: Enumerator[];
    biddingContractSecurityTypes: Enumerator[];
    biddingContractBonusPaymentFrequency: Enumerator[];
    biddingContractLiquidatedDamageTypes: Enumerator[];
    biddingContractBonusTypes: Enumerator[];
    contractsPaymentRequests: Enumerator[];
    biddingContractDocumentGroupCodes: Enumerator[];
  };
  enumsMasterData: {
    countries: MasterDataCountryEnum[];
  };
  currencies: {
    id: string;
    currency: string;
    numberOfDecimals: number;
    exchangeRate: any;
  }[];
  participantsAwardeed: ParticipantAwardedV2[];
  costDistributionData: {
    project: Project;
    currencies: Currency[];
    components: ProjectTask[];
  };
  procurementProcess: BiddingProcessProcurementProcess;
  contractId: string;
  operationCurrencyCode: string;
}

export interface SourceDetail {
  id: string;
  productId: string;
  idbTotal: number;
  lcTotal: number;
  cfTotal: number;
}

export interface SourceItem {
  id: string;
  componentId: string;
  currency: string;
  order: number;
  detail: SourceDetail[];
}

//TODO Use on payment component
export interface ContractPaymentScheduleResponse {
  paymentNumber: number;
  paymentRequestTypeId: number;
  componentId: string;
  productId: string;
  description: string;
  estimatedDate: string;
  currency: string;
  idbAmount: number;
  lcAmount: number;
  cfAmount: number;
  paymentAmount: number;
}

export type ContractPaymentScheduleRequest = Omit<
  ContractPaymentScheduleResponse,
  'paymentNumber' | 'paymentAmount'
>;
