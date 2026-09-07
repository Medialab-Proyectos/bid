import {
  BiddingProcessDocumentGroup,
  BiddingProcessDocumentPackage,
  FiduciaryProcessDocument,
} from '..';
import { ParticipantAwarded } from '../participant-awarded.model';

export interface GetProcessDocumentPackageByProcurementIdResponse {
  biddingProcessDocumentPackage: BiddingProcessDocumentPackage[];
  lastBidValidityExtensionDate: Date;
}

export interface GetBiddingProcessDocumentGroupsByDocumentPackageIdResponse {
  biddingProcessDocumentGroups: BiddingProcessDocumentGroup[];
}

/**
 * parentId:  Id of the entity biddingProcessDocumentGroupId,
 * projectBucketId, biddingProcessPlanId or biddingContractDocumentGroupId
 */
export interface GetFiduciaryProcessDocumentsIdResponse {
  parentId: string;
  fiduciaryProcessDocuments: FiduciaryProcessDocument[];
}

export interface UploadFiduciaryProcessDocuments {
  biddingProcessDocumentGroupId: string;
}

/**
 * relationalId: Id of their respective relational table.
 */
export interface UploadBiddingProcessPackageDocuments {
  relationalId: string;
  newFileName: string;
  fiduciaryProcessDocumentId: string;
}

export interface UploadBiddingProcessPackageDocumentsWithResultAndAwarded {
  relationalId: string;
  newFileName: string;
  fiduciaryProcessDocumentId: string;
  participantsOptions: ParticipantAwarded[];
  awardeds: string[];
}

export interface SubmitPackageStatusResponse {
  status: number;
}

export enum ActionType {
  CONFIRM = 0,
  CONFIRM_CLARIFICATION = 1,
  CONFIRM_AMENDMENT = 2,
  NON_OBJECTION = 3,
  NON_OBJECTION_AMENDMENT = 4,
}

export interface PackagesAwardeds {
  documentGroupAwardedIdList: ParticipantPackages[];
}

export interface ParticipantPackages {
  biddingProcessParticipantId: string;
}
