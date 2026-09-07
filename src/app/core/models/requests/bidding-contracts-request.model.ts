export interface BiddingContractsRequest {
  biddingProcessParticipants: string[];
  generalInformationModel: GeneralInformationModel;
  costDistribution: CostDistribution;
  biddingContractLots: BiddingContractLots[];
  location: LocationModel;
  additionalInformation: AdditionalInformation;
  documents: [];
}

export interface BiddingContractsPutRequest {
  biddingProcessParticipants: string[];
  biddingProcurementProcessId: string;
  contractType: number;
  conflictResolutionMethod: number;
  goodsSource: string;
  name: string;
  object: string;
  signatureDate: Date;
  startDate: Date;
  endDate: Date;
  controlNumber: string;
  contractTypeDesignation: string;
  hasAdvancedPayment: boolean;
  applicableLaw: string;
  currencies: Currencies[];
  costDistribution: CostDistribution;
  biddingContractLots: BiddingContractLots[];
  location: LocationModel;
  securities: Securities[];
  liquidatedDamage: LiquidatedDamage;
  bonus: Bonus;
  documents: [];
}

export interface GeneralInformationModel {
  biddingProcurementProcessId: string;
  contractType: number;
  conflictResolutionMethod: number;
  goodsSource: string;
  name: string;
  object: string;
  signatureDate: Date;
  startDate: Date;
  endDate: Date;
  controlNumber: string;
  hasAdvancedPayment: boolean;
  applicableLaw: string;
  currencies: Currencies[];
  contractTypeDesignation: string;
}

export interface Currencies {
  currency: string;
  totalAmount: number;
  usdEquivalentAmount: number;
  id?: string;
}

export interface CostDistribution {
  totalEstimatedAmount: number;
  idbAmount: number;
  localCounterpartAmount: number;
  cofinancedAmount: number;
  justification: string;
}

export interface BiddingContractLots {
  name: string;
  units: number;
  amount: number;
  id?: string;
}

export interface LocationModel {
  address: string;
  zipCode: number;
  country: number;
  id?: string;
}

export interface AdditionalInformation {
  securities: Securities[];
  liquidatedDamage: LiquidatedDamage;
  bonus: Bonus;
}

export interface Securities {
  securityType: number;
  currency: string;
  amount: number;
  usdEquivalentAmount: number;
  expirationDate: Date;
}

export interface LiquidatedDamage {
  liquidatedDamagePercentage: number;
  liquidatedDamageMaximumPercentage: number;
  liquidatedDamagePaymentFrecuency: number;
  liquidatedDamageType: number;
}

export interface Bonus {
  bonusPercentage: number;
  bonusMaximumPercentage: number;
  bonusPaymentFrecuency: number;
  bonusType: number;
}
