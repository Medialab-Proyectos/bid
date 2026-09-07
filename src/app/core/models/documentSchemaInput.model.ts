import { DocumentStatusEnum } from "@core/enums";
export interface DocumentSchemInput {
  id?: string;
  blobId: string;
  ezshareId?: string;
  name: string;
  language: string;
  extension: string;
  documentStatus?: DocumentStatusEnum;
  disclosedDate?: Date;
  createdBy?: string;
  created?: Date;
  modifiedBy?: string;
  modified?: Date;
}

