import { Amount } from './amount.model';

export interface TransactionComponent {
  id: number;
  code: number;
  name: string;
  amountsDistribute: Amount;
  amountsProjectedAvailable: Amount;
  readOnly?: boolean;
  componentTableInformation?: Amount[];
  type?: number;
}
