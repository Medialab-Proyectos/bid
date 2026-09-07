import { RequestAntAmount, ResponseAntAmount } from '../amount.model';
import { TransactionRequestDetail } from '../transaction-request-detail.model';

export interface AntTransactionRequest {
  requestDetails?: TransactionRequestDetail;
  requestAmounts?: RequestAntAmount;
  beneficiary?: BeneficiaryAntRequest;
}

export interface TransactionAnt {
  transactionId: number;
  requestDetail: TransactionRequestDetail;
  requestAmount: ResponseAntAmount;
  beneficiary: {
    bankFlowId: string;
  };
}

export interface BeneficiaryAntRequest {
  bankFlowId: string;
  country: string;
  numberId: string;
  acronym?: string;
  institutionName?: string;
}
