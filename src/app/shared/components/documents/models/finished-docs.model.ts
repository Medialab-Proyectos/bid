import { PermissionEnum } from '@core/enums';
import { FiduciaryProcessDocument } from '@core/models';

export interface FinishedDocsUndbActions {
  text: string;
  action: (item: FiduciaryProcessDocument) => void;
  iconClass: string;
  permissions?: PermissionEnum[];
  type: FinishedDocsUndbActionType;
}

export enum FinishedDocsUndbActionType {
  EDIT_AMENDMENT = 0,
  PREVIEW_AMENDMENT,
  DELETE_AMENDMENT,
  CONFIRM_AMENDMENT,
}
