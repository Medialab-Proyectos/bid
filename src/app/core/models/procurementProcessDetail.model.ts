import { ProjectTaskSchema } from './projectTaskSchema.model';

export interface ProcurementProcessDetails {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  procurementMethod: string;
  supervisionMethod: string;
  justification: string;
  status: string;
  bafo: boolean;
  lots: string;
  manualId: string;
  sepaId: string;
  goodReference: string;
  processStartDate: Date;
  contractSignedDate: Date;
  destination: string;
  sustainabilityDescription: string;
  sustainability: string;
  components: ProjectTaskSchema[];
  outputs: ProjectTaskSchema[];
  deliverables: ProjectTaskSchema[];
  biddingMilestones: BiddingMilestonesSchema[];
  comments: CommentSchema[];
  componentHistories: ComponentHistory[];
  documentPackages: DocumentPackage[];
}

export interface DocumentPackage {
  id: string;
  procurementProcessId: string;
  biddingMilestoneId: string;
  status: string;
  username: string;
  documents: DocumentSchema[];
}

export interface DocumentSchema {
  id: string;
  bobId: string;
  ezshareId: string;
  name: string;
  language: string;
  extension: string;
  status: string;
  discloseDate: Date;
  documentType: string;
}

export interface ComponentHistory {
  id: string;
  entityKey: string;
  entityType: string;
  messagecode: string;
  username: string;
}

export interface BiddingMilestonesSchema {
  id: string;
  code: string;
  initialEstimationDate: Date;
  reEstimationDate: Date;
  actualDate: Date;
}

export class CommentSchema {
  id: string;
  text: string;
  visibility: string;
}
