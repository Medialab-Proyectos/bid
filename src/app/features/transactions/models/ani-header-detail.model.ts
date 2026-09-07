import { TransactionsStatus } from '../enums';
import { DocumentsANI } from './responses';

export interface AniHeaderDetail {
  requestAntDetails: {
    requestNumber: number;
    partNumber: number;
    numberDaysFinancialPlanning: number;
    transactionNumber: string;
    statusId: TransactionsStatus;
    status: string;
    receivedDate: Date;
    financialPlanningPeriodDeadLine: Date;
    authorizeDate: Date;
  };
  requestAntAmounts: {
    approvedCurrency: string;
    requestedCurrency: string;
    requiredAmount: number;
    equivalentApprovedCurrency: number;
    projectedAvailableBalance: number;
    realValueDate: Date;
  };
  documents: DocumentsANI[];
}
