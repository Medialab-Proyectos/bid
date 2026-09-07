import { BiddingProcurementProcessComment, ProjectAmount } from '.';
import { Advance } from '@core/models';
import { BiddingProcessProcurementProcessStatuses } from '@core/enums';

export interface BiddingProcessPlan {
  id: string;
  projectBucketId: string;
  version: number;
  status: number;
  approvedDate: string;
  approvedBy: string;
}

export interface BiddingProcessProcurementProcess {
  id: string;
  biddingProcessPlanId: string;
  category: CategoryObject;
  procurementMethod: ProcurementMethodObject;
  supervisionMethod: SupervisionMethodObject;
  status: BiddingProcessProcurementProcessStatuses;
  goodsReference: number;
  sustainability: number;
  code: string;
  name: string;
  description: string;
  justification: string;
  bafo: boolean;
  sepaPeclaId: string;
  lots: number;
  manualId: string;
  sustainabilityDescription: string;
  subExecutor: string;
  advanceMilestone: Advance;
  projectAmount: ProjectAmount;
  totalAcumulatedAmount: number;
  componentName: string;
  totalComments: number;
  comments?: BiddingProcurementProcessComment[];
  isCommentsLoaded?: boolean;
  bidValidity?: string;
  /**
   * used to show the procurement process cancel loading spinner
   */
  isCancelling?: boolean;
  isMigrated: boolean;
  packagesUnderReview: boolean;
  isUpdated: boolean;
  marked?: boolean;
  procurementProcessComments: ProcurementProcessComments[];
  order: number;
}

export interface ProcurementProcessComments {
  id: string;
  visibility: number;
  source: number;
  status: number;
  text: string;
  created: string;
  createdBy: string;
  actual: boolean;
  editedBy: string;
  edited: string;
  marked: boolean;
  userNameCreated: string;
  userNameEdited: string;
  dateOfOrder: string;
}

export interface CategoryObject {
  id: number;
  name: string;
}

export interface ProcurementMethodObject {
  id: number;
  name: string;
}

export interface SupervisionMethodObject {
  id: number;
  name: string;
}
