export interface TransactionHeaderBalances {
  originalIdb: number;
  currentIdb: number;
  availableBalance: number;
  projectedAvailableBalance: number;
  disbursedAmount: number;
  disbursedPercent: number;
  lastDisbursementDate: Date;
  cofinanced: number;
  cancellations: number;
  budgetContributionProjectedAvailableBalance: number;
  budgetContributionAvailableBalance: number;
  localCounterpart: number;
  totalAmountPendingJustification: number;
  minimumAmountPendingJustification: number;
  toJustifyPercent: number;
  coFinancedDisbursed: number;
  localCounterpartDisbursed: number;
  cumulativeExtension: number;
  currentDisbExpiration: string;
  financialPeriodDeadline: string;
  lastAdvanceOfFoundsANTDate: string;
  lastAdvanceOfFoundsANTAmount: number;
  lastRequestNumber: number;
  retroactiveFinancingInformation: TransactionHeaderRetroactiveFinancing;
}

export interface TransactionHeaderRetroactiveFinancing {
  hasRetroactiveFinancing: boolean;
  rfCurrentAmount: number;
  rfOriginalAmount: number;
  disbRfAmount: number;
  availRfAmount: number;
  projAvailRfAmount: number;
  projDisbRfAmount: number;
}
