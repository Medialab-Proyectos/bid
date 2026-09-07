import { TransactionComponent } from '../transaction-component.model';

export interface GetTransactionComponentsResponse {
  amountAssignIdb: number;
  amountAssignLocalCounterpart: number;
  amountAssignCofinancing: number;
  components: TransactionComponent[];
  componentsTotalAmountAvailableCf: number;
  componentsTotalAmountAvailableIdb: number;
  componentsTotalAmountAvailableLc: number;
  componentsTotalAmountCurrentCf: number;
  componentsTotalAmountCurrentIdb: number;
  componentsTotalAmountCurrentLc: number;
  componentsTotalAmountDisbursedCf: number;
  componentsTotalAmountDisbursedIdb: number;
  componentsTotalAmountDisbursedLc: number;
  componentsTotalAmountProjectedCf: number;
  componentsTotalAmountProjectedIdb: number;
  componentsTotalAmountProjectedLc: number;
}
