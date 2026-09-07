import { DisbursementBalances } from './disbursementComponent.model';
import { DisbursementHeader } from './disbursementHeader.model';

export interface DisbursementDetail {
  balances: DisbursementBalances;
  header: DisbursementHeader;
}
