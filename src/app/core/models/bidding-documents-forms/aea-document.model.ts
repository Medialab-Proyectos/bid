import { BiddingDocumentIf } from './bidding-Document-If.mode';
import { Convergence } from './convergence.model';

export interface AeaDocument {
  documentType: 'AEA.json';
  offerTerm: string;
  experience?: string;
  experienceCheck: string;
  informationWebsite: string;
  address?: string;
  executorComment?: string;
  responsable: string;
  executingAddress: string;
  phone: string;
  email: string;
  website: string;
  language: string;
  webFile?: string;

  convergence: Convergence;

  biddingDocumentIf: BiddingDocumentIf;
}
