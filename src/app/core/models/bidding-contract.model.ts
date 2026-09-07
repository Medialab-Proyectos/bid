import {
  BiddingContractStatusesEnum,
  ContractMenuOptionsEnum,
} from '@core/enums';
import {
  BiddingContractDocuments,
  BiddingContractLocations,
  BiddingContractResponse,
  BiddingContractSecurities,
  ParticipantAwardedAndWinner,
} from '.';
import {
  BiddingContractLots,
  Currencies,
} from './requests/bidding-contracts-request.model';

export interface BiddingContractByProcess {
  visualCode: string;
  biddingContractId: string;
  parentId: string;
  code: string;
  version: number;
  biddingContractsAwarded: BiddingContractsAwarded[];
  contractType: number;
  contractStatus: BiddingContractStatusesEnum;
  nationality: string;
  idbAmount: number;
  localCounterpartAmount: number;
  cofinancedAmount: number;
  startDate: string;
  endDate: string;
  amendments: BiddingContractByProcess[];
  totalAccumulatedAmount?: number;
  totalAmountWithAmendments?: number;
  options?: ContractMenuOptionsEnum[];
  isCopy?: boolean;
}

export interface BiddingContractsAwarded {
  biddingProcessParticipantId: string;
  biddingProcessBidderId: string;
  name: string;
  nationality: string;
}

export interface BiddingContractDetail {
  awardees: BiddingContractsAwarded[];
  participants: BiddingContractsAwarded[];
  contract: BiddingContractResponse;
  currencies: Currencies[];
  documents: BiddingContractDocuments[];
  locations: BiddingContractLocations[];
  lots: BiddingContractLots[];
  securities: BiddingContractSecurities[];
  participantsAndWinners: ParticipantAwardedAndWinner[];
  visualCode: string;
  hasPendingSignatureAmendment?: boolean;
}
