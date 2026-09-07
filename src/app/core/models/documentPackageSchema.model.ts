import { GPNDoc } from './gpnDoc.model';

export interface DocumentPackageSchema {
  id: string;
  procurementProcessId: string;
  biddingMilestoneId: string;
  entityType: string;
  status: string;
  userName: string;
  documents: GPNDoc[];
  created: string;
  createdBy: string;
  modified: string;
  modifiedBy: string;
}
