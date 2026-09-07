import { PermissionEnum } from '@core/enums';
import { Enumerator, FiduciaryProcessDocument } from '@core/models';

export interface FileListPackage {
  docs: FiduciaryProcessDocument[];
  codes: Enumerator[];
}
export interface PackagesFilesListConfiguration {
  showHeaderResult: boolean;
  aviableDocs: FileListPackage;
  readonlyDocs: FileListPackage;
}

export interface FileListUndbActions {
  text: string;
  action: (item: FiduciaryProcessDocument) => void;
  iconClass: string;
  permissions?: PermissionEnum[];
  type: FileListUndbActionType;
}

export enum FileListUndbActionType {
  EDIT_NOTICE = 0,
  PREVIEW_NOTICE,
  DELETE_NOTICE,
}
