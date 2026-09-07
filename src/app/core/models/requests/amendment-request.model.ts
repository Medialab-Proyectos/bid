import { ContractAmountData, ContractSecurities, ContractsLotsData } from '..';

export interface AmendmentRequest {
  object: string;
  startDate: Date;
  endDate: Date;
  signatureDate: Date;
  idbAmount: number;
  localCounterpartAmount: number;
  cofinancedAmount: number;
  currencies: ContractAmountData[];
  biddingContractLots: ContractsLotsData[];
  securities: ContractSecurities[];
}
