import { TransactionAnjRequestAmount } from '../transaction-anj-request-amount.model';
import { TransactionComponent } from '../transaction-component.model';
import { TransactionRequestDetail } from '../transaction-request-detail.model';

export interface TransactionAnjGetResponse {
  transactionId: number;
  requestDetail: TransactionRequestDetail;
  requestAmount: TransactionAnjRequestAmount;
  components: TransactionComponent[];
  isEditMode?: boolean;
  canEdit: boolean;
}
