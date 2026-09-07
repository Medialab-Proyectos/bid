import { FiduciaryProcessDocumentGroup } from './fiduciary-process-document.model';
import { documentPackageGroupType } from '@core/enums';
export interface DocumentPackageGroupsTabs {
  type: documentPackageGroupType;
  groups: FiduciaryProcessDocumentGroup[];
}
