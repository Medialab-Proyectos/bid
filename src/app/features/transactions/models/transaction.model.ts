import { Enumerator } from '@core/models';
import { PermissionActions } from '@core/enums';
import {
  TransactionAction,
  TransactionsStatus,
  TransactionsTypes,
} from '../enums';

export interface Transaction {
  id: number;
  transactionNumber: string;
  transactionType: string;
  requestNumber: number;
  partNumber: number;
  currency: string;
  amount: number;
  status: string;
  approvalDate: Date;
  lastUpdatedBy: string;
  lastUpdate: Date;
  valueDate: Date;
  transactionActions: TransactionActions[];
  transactionTypeCode: TransactionsTypes;
  transactionStatusCode: string;
  transactionStatusId: TransactionsStatus;
  /**
   * @description Id of the parent transaction ATJ
   */
  parentId: number;

  lastUpdateFormatted?: string;
  approvalDateFormatted?: string;
  valueDateFormatted?: string;
  transactionTypeFormatted?: string;
  statusEnum?: Enumerator;
  transactionStatusTranslated?: string;
}

export interface TransactionActions {
  text: string;
  value: TransactionAction;
  permissions?: PermissionActions[];
}

export interface TransactionEventEmitter {
  action: TransactionActions;
  transaction: Transaction;
}

export interface TransactionData {
  id: number;
  type: TransactionsTypes;
  status: number;
  pendingGroupsGet?: boolean;
}
