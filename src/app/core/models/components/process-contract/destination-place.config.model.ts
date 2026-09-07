import { BaseConfig } from '../../base-config.model';
import { BiddingContractStatusesEnum } from '@core/enums';
import { CodeNameEnum } from '.';

export class DestinationPlaceFormConfig extends BaseConfig<
  DestinationPlaceFormData,
  object
> {
  data: DestinationPlaceFormData;
  settings: ProcessContractFormSettings;
}

export interface DestinationPlaceFormData {
  beneficiaryCountries: CodeNameEnum[];
}
export interface ProcessContractFormSettings {
  disabled: boolean;
  status: BiddingContractStatusesEnum;
}
