import { ContractAmountData, ContractSecurities, ContractsLotsData } from '..';
import {
  Bonus,
  LiquidatedDamage,
} from '../requests/bidding-contracts-request.model';

export interface AmendmentLastResponse {
  id: string;
  version: number;
  name: string;
  object: string;
  status: number;
  signatureDate: Date;
  startDate: Date;
  endDate: Date;
  idbAmount: number;
  localCounterpartAmount: number;
  cofinancedAmount: number;
  controlNumber: string;
  contractType: number;
  hasAdvancedPayment: boolean;
  conflictResolutionMethod: number;
  applicableLaw: string;
  liquidatedDamage: LiquidatedDamage;
  bonus: Bonus;
  currencies: ContractAmountData[];
  biddingContractLots: ContractsLotsData[];
  securities: ContractSecurities[];
}
