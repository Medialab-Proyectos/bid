import { BiddingDocumentIf } from './bidding-Document-If.mode';
import { Convergence } from './convergence.model';

export interface AgaDocument {
  documentType: 'AGA.json';
  confinancingName?: string;
  cofinancingNameCheck: boolean;
  projectObjetives: string;
  procurementDescription: string;
  preferenceMargin: string;
  aditionalPublications?: string;
  precalificationContract?: string;
  precalificationContractCheck: boolean;
  aditionalPublicationsCheck: boolean;
  executingAddress: string;
  responsable: string;
  phone: string;
  email: string;
  website: string;

  convergence: Convergence;

  biddingDocumentIf: BiddingDocumentIf;
}
