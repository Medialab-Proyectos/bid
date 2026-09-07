import { BiddingContractStatusesEnum, GroupMethodEnum } from '@core/enums';
import { BaseConfig } from '../../base-config.model';
import { Threshold } from '.';

export class CostDistributionFormConfig extends BaseConfig<
  CostDistributionFormData,
  CostDistributionFormSettings
> {
  data: CostDistributionFormData;
  settings: CostDistributionFormSettings;
}

interface CostDistributionFormData {
  threshold?: Threshold;
  nationalBiddingThreshold?: Threshold;
  groupMethod?: GroupMethodEnum;
}

interface CostDistributionFormSettings {
  disabled?: boolean;
  status: BiddingContractStatusesEnum;
}
