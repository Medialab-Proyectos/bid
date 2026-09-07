import { Transaction } from '../transaction.model';

export interface TransactionGetResponse {
  itemsCount: number;
  transactions: Transaction[];
}
