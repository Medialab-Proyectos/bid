import { ResponseAntAmount } from '../amount.model';
import { TransactionRequestDetail } from '../transaction-request-detail.model';

export interface TransactionAntResponse {
  transactionId: number;
  requestDetail: TransactionRequestDetail;
  requestAmount: ResponseAntAmount;
  beneficiary: {
    bankFlowId: string;
    institutionName: string;
    acronym: string;
    beneficiaryName: string;
    beneficiaryId: string;
    accountNumber: string;
  };
  isEditMode?: boolean;
  canEdit: boolean;
}
