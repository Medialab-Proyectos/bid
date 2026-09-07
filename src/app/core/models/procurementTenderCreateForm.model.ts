import { ProjectTask } from ".";

export class ProcurementDataPreload {
  tenderMethod: TenderMethod[];
  category: Category[];
  supervisionMethod: SupervisionMethod[];
  component: ProjectTask[];
  proccessMilestone: Process[];
  output: ProjectTask[];
}
export interface TenderMethod {
  key: string;
  value: string;
}
export interface Category {
  key: string;
  value: string;
}

export interface SupervisionMethod {
  key: string;
  value: string;
}
export interface ProcurementComponent {
  id: string;
  name: string;
  type: string;
  executionWbs: string;
  estimatedStartDate: string;
  estimatedEndDate: string;
  actualStartDate: string;
  actualEndDate: string;
  bidEstimatedAmount: string;
  localCounterpartAmount: string;
  coFinancingAmount: string;
  totalEstimatedAmount: string;
  percentage: string;
  bidActualCost: string;
  localCounterpartActualCost: string;
  coFinancingActualCost: string;
  totalActualAmount: string;
  currency: string;
  status: string;
  projectTasks: ProcurementComponent[];
}
export interface Process {
  order: number;
  name: string;
  tooltip: string;
  estimatedDate?: Date;
  reEstimatedDate?: Date;
  actualDate?: Date;
}
