export interface ProjectTask {
  id: string;
  name: string;
  type: number;
  executionWbs: string;
  estimatedStartDate: string;
  estimatedEndDate: string;
  actualStartDate: string;
  actualEndDate: string;
  bidEstimatedAmount: number;
  localCounterpartAmount: number;
  coFinancingAmount: number;
  totalEstimatedAmount: number;
  bidActualCost: number;
  localCounterpartActualCost: number;
  coFinancingActualCost: number;
  totalActualAmount: number;
  currency: string;
  status: number;
}
