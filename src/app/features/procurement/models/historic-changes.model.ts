export interface HistoricChanges {
  processChanges: ProcessChanges[];
  milestonesChanges: MilestonesChanges;
  componentsChanges: ComponentsChanges;
}
export interface ProcessChanges {
  modifiedBy: string;
  updatedValue: string;
  previousValue: string;
  newValue: string;
  modified: string;
}
export interface MilestonesChanges {
  modifiedMilestone: boolean;
  newMilestones: MilestoneChange[];
  previousMilestones: MilestoneChange[];
  updatedBy: string;
  updatedDate: string;
}
export interface MilestoneChange {
  nameMilestone: string;
  codeMilestone: number;
  modificationDate: string;
  modifiedBy: string;
  actualDate: string;
  estimatedDate: string;
  reestimatedDate: string;
  order: number;
}

export interface OutputsChanges {
  outputId: string;
  outputName: string;
  modificationDate: string;
  modifiedBy: string;
  percentageAssigned: number;
}

export interface TaskChanges {
  componentId: string;
  componentName: string;
  outputs: OutputsChanges[];
}

export interface ComponentsChanges {
  previousValues: TaskChanges;
  newValues: TaskChanges;
}
