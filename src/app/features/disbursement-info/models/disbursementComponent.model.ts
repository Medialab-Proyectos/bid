import { Amount, TransactionComponent } from '../../transactions/models';

export interface DisbursementComponent extends TransactionComponent {
  amountCurrent?: Amount;
  projectedAvailableBalance?: Amount;
}
export interface DisbursementBalances {
  amountAssignIdb: number;
  amountAssignLocalCounterpart: number;
  amountAssignCofinancing: number;
  components: DisbursementComponent[];
  componentsTotalAmountCurrentIdb: number;
  componentsTotalAmountCurrentLc: number;
  componentsTotalAmountCurrentCf: number;
  componentsTotalAmountDisbursedIdb: number;
  componentsTotalAmountDisbursedLc: number;
  componentsTotalAmountDisbursedCf: number;
  componentsTotalAmountAvailableIdb: number;
  componentsTotalAmountAvailableLc: number;
  componentsTotalAmountAvailableCf: number;
  componentsTotalAmountProjectedIdb: number;
  componentsTotalAmountProjectedLc: number;
  componentsTotalAmountProjectedCf: number;
}
