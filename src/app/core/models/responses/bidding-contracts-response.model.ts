import { BiddingContractStatusesEnum } from '@core/enums';
import { BiddingContractByProcess } from '..';

export interface BiddingContractAwardees {
  name: string;
  nationality: number;
}

export interface BiddingContractLocationsResponse {
  locations: BiddingContractLocations[];
}

export interface BiddingContractLocations {
  address: string;
  zipCode: string;
  country: number;
  id: string;
}

export interface BiddingContractCurrenciesResponse {
  biddingContractCurrency: BiddingContractCurrencies[];
}

export interface BiddingContractCurrencies {
  currency: string;
  totalAmount: number;
  usdEquivalentAmount: number;
  id: string;
}

export interface BiddingContractLotsResponse {
  biddingContractLots: BiddingContractLots[];
}

export interface BiddingContractLots {
  name: string;
  units: number;
  amount: number;
  id: string;
}

export interface BiddingContractSecuritiesResponse {
  biddingContractSecurities: BiddingContractSecurities[];
}

export interface BiddingContractSecurities {
  securityType: number;
  currency: string;
  amount: number;
  usdEquivalentAmount: number;
  expirationDate: Date;
  id: string;
}

export interface BiddingContractDocumentsResponse {
  biddingContractDocuments: BiddingContractDocuments[];
}

export interface BiddingContractDocuments {
  documentType: number;
  ezshareNumber: string;
  documentStatus: number;
  id: string;
}

export interface BiddingContractResponse {
  biddingProcurementProcessId: string;
  amendmentsTotalAmount: number;

  // General information
  name: string;
  object: string;
  signatureDate: Date;
  startDate: Date;
  endDate: Date;
  controlNumber: string;
  contractType: number;
  hasAdvancedPayment: boolean;
  conflictResolutionMethod: number;
  applicableLaw: string;
  goodsSource: number;
  contractTypeDesignation: string;

  /**
   * @fromEnum BiddingContractStatusesEnum
   */
  contractStatus: BiddingContractStatusesEnum;

  // Cost distribution
  contractTotalAmount: number;
  idbAmount: number;
  localCounterpartAmount: number;
  cofinancedamount: number;
  justification: string;

  // Damages
  liquidatedDamagePercentage: number;
  liquidatedDamageMaximumPercentage: number;
  bonusPercentage: number;
  bonusMaximumPercentage: number;

  // Bonus
  liquidatedDamageType: number;
  bonusType: number;
  liquidatedDamagePaymentFrecuency: number;
  bonusPaymentFrecuency: number;
  code: string;
  version: number;
}

export interface BiddingContractsResponse {
  biddingContracts: BiddingContractByProcess[];
}

export interface BiddingContractApprovalCurrencyResponse {
  contractNumber: string;
  operationNumber: string;
  id: number;
  code: string;
  shortCode: string;
  name: {
    en: string;
    es: string;
    pt: string;
    fr: string;
  };
}
