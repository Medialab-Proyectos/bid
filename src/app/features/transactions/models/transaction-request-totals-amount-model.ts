import { Currency } from '@core/models';

export interface TransactionRequestTotalsAmount {
  selectedRequestedCurrency: Currency;
  totalsItems: TotalsItems[];
}

export interface TotalsItems {
  source: string;
  sourceType: number;
  requestedAmount: number;
  equivalentCurrency: number;
  expectedBalances: number;
}
