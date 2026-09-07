export interface ProjectTaskSchema {
  id: string;
  name: string;
  type: string;
  executionWbs: string;
  estimatedStartDate: Date;
  estimatedEndDate: Date;
  actualStartDate: Date;
  actualEndDate: Date;
  bidEstimatedAmount: number;
  localCounterpartAmount: number;
  coFinancingAmount: number;
  totalEstimatedAmount: number;
  percentage: number;
  bidActualCost: number;
  localCounterpartActualCost: number;
  coFinancingActualCost: number;
  totalActualAmount: number;
  currency: string;
  status: string;
  projectTasks: ProjectTaskSchema[]
}
