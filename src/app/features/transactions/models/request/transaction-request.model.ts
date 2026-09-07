import {
  TransactionComponent,
  TransactionDetail,
  RequestAntAmount,
  ResponseJustAmount,
  TransactionRequestDetail,
  TransactionRequestTotalsAmount,
  BeneficiaryAntRequest,
} from '../';
import { DocumentsANI } from '..';

export interface TransactionRequest {
  requestDetails: TransactionRequestDetail;
  requestJustAmounts: ResponseJustAmount;
  requestAntAmounts: RequestAntAmount;
  requestTotalsAmount: TransactionRequestTotalsAmount;
  components: TransactionComponent[];
  requestAntAndJustDetail: {
    numberDaysFinancialPlanning: number;
    antDetail: TransactionDetail;
    justDetail: TransactionDetail;
  };
  beneficiary: BeneficiaryAntRequest;
  documents: DocumentsANI[];
}
