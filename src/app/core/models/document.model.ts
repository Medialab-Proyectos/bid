import { FiduciaryProcessDocumentsStatuses } from '@core/enums';

export class Document {
  documentStatus?: FiduciaryProcessDocumentsStatuses;
  ezshareId?: string;
  name: string;
  publishDate?: Date;
  createdBy?: string;
  updatedDate?: Date;
  id?: string;
  type?: string;
  created?: Date;
  version?: string;
  language?: string;
  extension?: string;
  blobId?: string;
  modified?: Date;
  status?: FiduciaryProcessDocumentsStatuses;
}
export interface DocumentsPermissions {
  replace?: boolean;
  delete: boolean;
  download: boolean;
}

export interface DocumentCreateInput {
  name: string;
  ezshareId: string;
  type: string;
  createdBy: string;
  created: string;
  version: string;
}
