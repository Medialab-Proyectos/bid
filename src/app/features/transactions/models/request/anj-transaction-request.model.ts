import { TransactionAnjRequestAmount } from '../transaction-anj-request-amount.model';
import { TransactionComponent } from '../transaction-component.model';
import { TransactionRequestDetail } from '../transaction-request-detail.model';

export interface AnjTransactionRequest {
  requestDetails?: TransactionRequestDetail;
  requestAmounts?: TransactionAnjRequestAmount;
  components?: TransactionComponent[];
}
