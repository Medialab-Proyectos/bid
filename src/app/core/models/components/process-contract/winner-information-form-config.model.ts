import { ModeEnum } from '@core/enums';
import { IdNameEnum } from '..';
import { BaseConfig } from '../../base-config.model';

export class WinnerInformationFormConfig extends BaseConfig<
  WinnerInformationFormData,
  WinnerInformationFormSettings
> {
  data: WinnerInformationFormData;
  settings: WinnerInformationFormSettings;
}

interface WinnerInformationFormData {
  memberCountries: IdNameEnum[];
}

interface WinnerInformationFormSettings {
  mode: ModeEnum;
}
