import { gpnDpcStatus } from '../enums/gpnDocStatus.enum';

export interface GPNDoc {
  id: string;
  blobId: string;
  ezshareId: string;
  name: string;
  language: string;
  extension: string;
  discloseDate: string;
  status: gpnDpcStatus;
  createdBy: string;
  created: string;
  modifiedBy: string;
  modified: string;
}
