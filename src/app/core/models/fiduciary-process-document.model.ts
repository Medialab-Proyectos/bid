import { DocumentPackageStatusEnum } from '@core/enums/packageDocumentStatus.enum';
import { BiddingProcessDocumentGroupConfiguration } from './bidding-process-document-packages.model';
import { ParticipantAwarded } from './participant-awarded.model';
import { Enumerator } from './responses';
import { FiduciaryProcessDocumentsStatusIdEnum } from '@core/enums';

export interface FiduciaryProcessDocument
  extends FiduciaryProcessDocumentObj, ProcurementNoticeDocument {
  options?: ResultDocuments[];
  actualResults?: Enumerator[];
  result?: number;
  showHeaderResult?: boolean;
  participantsOptions?: ParticipantAwarded[];
  awardeds?: string[];
  visibility?: number;
  mandatory?: boolean;
}

export interface NoticeStatus {
  id: FiduciaryProcessDocumentsStatusIdEnum;
  code: string;
  name: Name;
}

export interface Name {
  en: string;
  es: string;
  fr: string;
  pt: string;
}

export interface ProcurementNoticeDocument {
  noticeId?: string;
  noticeCode?: string;
  noticeVersion?: number;
  noticeStatus?: NoticeStatus;
}

export interface FiduciaryProcessDocumentObj {
  id: string;
  name: string;
  /**
   * @fromEnum DocumentStatus
   */
  status: number;

  /**
   * @fromEnum DocumentType
   */
  type: number;
  operationsDocumentId: number;
  ezshareNumber: string;
  createdBy: string;
  description: string;
  newDescription?: string;
  previousGroupCode?: number;
  created: Date;
  modified: Date;
  biddingDocumentId?: string;
  relationalId: string;
  /**
   * @fromEnum GroupCode
   */
  groupCode?: number;
  file?: File;
  needBeUploaded?: boolean;
  systemGenerated?: boolean;
  packageDocumentStatus?: DocumentPackageStatusEnum;
  publicationDate?: string;
}

export interface ResultDocuments {
  groupCode: number;
  options: Enumerator[];
}

export interface FiduciaryProcessDocumentGroup {
  id: string;
  groupCode: number;
  isMandatory: boolean;
  fiduciaryProcessDocuments?: FiduciaryProcessDocument[];
  documentGroupConfiguration?: BiddingProcessDocumentGroupConfiguration;
}
