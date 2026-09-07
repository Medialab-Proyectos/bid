import {
  DocumentPackagesStatus,
  FiduciaryProcessDocumentsStatuses,
  RolEnum,
  StepTaskEnum,
} from '@core/enums';
import { FormNameEnum } from '../../enums/form-name';

export interface BussinessRulesFormRequest {
  groupDocument: FormNameEnum; // only left part before dash '-'
  rol?: RolEnum;
  documentStatus?: FiduciaryProcessDocumentsStatuses;
  packageStatus?: DocumentPackagesStatus;
  workflowStep?: StepTaskEnum;
}

export interface BussinessRulesRequest {
  categoryCode?: string;
  procurementCode?: string;
  supervisionMethod?: string;
  totalAmountProcurementProcess?: string;
  document?: string;
  userRole?: string;
  documentStatus?: string;
  packageStatus?: string;
  workflowStep?: string;
}
