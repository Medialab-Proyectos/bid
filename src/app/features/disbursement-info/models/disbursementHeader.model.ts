export interface DisbursementHeader {
  currentDisbInformation: string;
  cumulativeExtension: number;
  totalAmountPendingJustification: number;
  minimumAmountPendingJustification: number;
  advanceJustificationPercentage: number;
  financialPeriodDeadline: string;
  lastRequestNumber: number;
  lastAdvanceFoundsAmount: number;
  lastAdvanceFoundDate: string;
}
