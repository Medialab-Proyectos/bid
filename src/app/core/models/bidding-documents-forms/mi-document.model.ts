import { BiddingDocumentIf } from './bidding-Document-If.mode';
import { Convergence } from './convergence.model';

export interface MiDocument {
  documentType: 'MI.json';
  executingAddress: string;
  executorComment?: string;
  responsable: string;
  email: string;
  website: string;
  phone: string;

  convergence: Convergence;

  biddingDocumentIf: BiddingDocumentIf;
}
