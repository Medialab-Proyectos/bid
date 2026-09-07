export interface Operation {
  id?: number;
  isPmrRequired?: boolean;
  isReformulated?: boolean;
  reformulationDate?: Date;
  relationDate?: Date;
  hasRetroactiveExpenses?: boolean;
  retroactiveDate?: Date;
  retroactiveExpensesAmount?: number;
  plannedSupport?: number;
  actualSupport?: number;
  isInSeries?: boolean;
  isLastInSeries?: boolean;
  retroactiveEndDate?: Date;
  sapProjectNumber?: string;
  operationNumber?: string;
  createdBy?: string;
  created?: Date;
  modifiedBy?: Date;
  modified?: string;
  operationData: OperationData;
}

export interface OperationData {
  id?: number;
  operationNumberEn?: string;
  operationNumberEs?: string;
  operationNumberFr?: string;
  operationNumberPt?: string;
  objective?: string;
  relatedOperation?: string;
  totalCostOriginal?: number;
  totalCostCurrent?: number;
  localCounterpart?: number;
  cofinancing?: number;
  isRegional?: boolean;
  descriptionEn?: string;
  descriptionEs?: string;
  taxonomy?: string;
  executingAgency?: string;
  supportedOperation?: string;
  justification?: string;
  objectiveEn?: string;
  objectiveEs?: string;
  objectiveFR?: string;
  objectivePt?: string;
  country?: CountryMasterData;
}

export interface CountryMasterData {
  id?: number;
  code?: string;
  nameEn?: string;
  nameEs?: string;
  nameFr?: string;
  namePt?: string;
}
