import {
  TransactionComponent,
  Beneficiary,
  TransactionReqJustDetail,
  TransactionRequestDetail,
  TransactionRequestTotalsAmount,
  ResponseAntAmount,
  ResponseJustAmount,
} from '..';

export interface TransactionByIdGetResponse {
  transactionId: number;
  transactionNumber: string;
  requestDetail: TransactionRequestDetail;
  requestAntAndJustDetail: TransactionReqJustDetail;
  requestJustAmount: ResponseJustAmount;
  requestAntAmount: ResponseAntAmount;
  requestTotalsAmount: TransactionRequestTotalsAmount;
  beneficiary: Beneficiary;
  components: TransactionComponent[];
  isEditMode: boolean;
  canEdit: boolean;
}
