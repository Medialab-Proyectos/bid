import { BiddingDocumentIf } from './bidding-Document-If.mode';
import { Convergence } from './convergence.model';
import { Participant } from './participant.model';

export interface NoaDocument {
  documentType: 'NOA.json';
  contractSigningDate: string;
  experienceCheck: string;
  experience: string;
  participantName: string;
  participantNationality: string;
  participantScore: string;
  initialPrice: string;
  finalPrice: string;
  responsable: string;
  executingAddress: string;
  phone: string;
  email: string;
  website: string;

  convergence: Convergence;

  biddingDocumentIf: BiddingDocumentIf;

  biddingProccessIf: {
    procurementType?: string;
    procurementId?: string;
    procurementName?: string;
    procurementMethod?: string;
    participantList?: [Participant];
    participantAmount?: string;
  };
}
