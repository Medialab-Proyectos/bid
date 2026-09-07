import { TransactionDetail } from './transaction-detail.model';

export interface TransactionReqJustDetail {
  statusId: number;
  status: string;
  antDetail: TransactionDetail;
  justDetail: TransactionDetail;
  numberDaysFinancialPlanning: number;
}
