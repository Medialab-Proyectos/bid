import { MasterDataEnum, ParticipantAwarded, ParticipantAwardedV2 } from '..';
import { Participant } from '../participant.model';

export interface ParticipantResponse extends Participant {
  biddingProcessBidderId: string;
  biddingProcessParticipantId: string;
  weighedTechScore: number;
  weighedFinancialScore: number;
  totalScore: number;
  amount: number;
  currency: string;
  result: MasterDataEnum;
  biddingContractAwarded: boolean;
  biddingProcessDocumentAwarded: boolean;
  amountUsd: number;
  justificationEligibility: string;
}
export interface GetParticipantsResponse {
  procurementProcessId: string;
  participantsDetail: ParticipantResponse[] | Participant[];
}

export interface ParticipantsAwardedResponse {
  procurementProcessId: string;
  participantsAwarded: ParticipantAwarded[];
}

export interface ParticipantsAwardedResponseV2 {
  procurementProcessId: string;
  participantsAwarded: ParticipantAwardedV2[];
}
