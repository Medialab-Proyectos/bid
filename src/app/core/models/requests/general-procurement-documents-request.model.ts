import { FiduciaryProcessDocument } from '..';

export interface GeneralProcurementDocumentResponse {
  parentId: string;
  fiduciaryProcessDocuments: FiduciaryProcessDocument[];
}
