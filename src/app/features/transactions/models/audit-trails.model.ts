import { TransactionsStatus } from '../enums';

export interface AuditTrailsHeader {
  contractStatus: string;
  transactionNumber: string[];
  transactionTypeCode: string[];
  transactionStatusId: TransactionsStatus;
  requestNumber: number[];
  partNumber: number[];
}

export interface AuditTrailsContent {
  comment: string;
  date: Date;
  time: string;
  action: string;
  user: string;
}
