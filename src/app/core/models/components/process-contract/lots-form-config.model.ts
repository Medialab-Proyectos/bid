import { BiddingContractStatusesEnum } from '@core/enums';
import { BaseConfig } from '@core/models';

export class LotsFormConfig extends BaseConfig<LotsFormData, object> {
  data: LotsFormData;
  settings: LotsFormSettings;
}

interface LotsFormData {
  showUnits: boolean;
}

interface LotsFormSettings {
  disabled: boolean;
  status: BiddingContractStatusesEnum;
}
