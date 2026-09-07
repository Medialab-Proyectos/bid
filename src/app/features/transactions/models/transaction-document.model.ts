import { FiduciaryProcessDocumentObj } from '@core/models';

export interface TransactionDocumentGroup {
  id: string;
  documentGroupCode: number;
  isMandatory: boolean;
  isCanDuplicated: boolean;
  systemGenerated: boolean;
  order: number;
  documents?: FiduciaryProcessDocumentObj[];
}

export interface TransactionEventDocument {
  document: FiduciaryProcessDocumentObj;
  documentGroupCode: number;
}
