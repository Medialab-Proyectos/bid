import { FiduciaryProcessDocument } from '@core/models';

export interface EventDocument {
  groupCode?: number;
  item: FiduciaryProcessDocument;
  isResult?: boolean;
  packageCode?: number;
  updatingDescription?: boolean;
}

export interface NewDocuments {
  extension: string;
  name: string;
  rawFile: File;
  size: number;
  state: number;
  uid: string;
}

interface File {
  lastModified: number;
  lastModifiedDate: Date;
  name: string;
  size: number;
  type: string;
  webkitRelativePath: string;
}

export interface EventFileEdit {
  groupId: string;
  event: EventDocument;
}

export interface EventFileDelete {
  parentId: string;
  document: {
    created: Date;
    createBy: string;
    ezshareNumber: string;
    groupCode: number;
    id: string;
    modified: Date;
    name: string;
    operationsDocumentId: number;
    relationalId: string;
    status: number;
    type: number;
  };
}
