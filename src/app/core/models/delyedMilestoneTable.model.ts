import { DelayedMilestoneTableTypeEnum } from '@core/enums';

export interface DelayedMilestoneTable {
  processByDelayedMilestones: string[][][];
  amedmentsByDelayedMilestones: string[][][];
  contractsByDelayedMilestones: string[][][];
}

export interface SelectedFilterForBiddingProcess {
  selectedRow: number;
  selectedCol: number;
  selectedTableType: DelayedMilestoneTableTypeEnum;
}
