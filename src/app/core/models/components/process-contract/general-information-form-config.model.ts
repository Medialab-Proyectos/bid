import { BiddingContractStatusesEnum } from '@core/enums';
import { IdNameEnum, CurrencyEnum, CodeNameEnum } from '.';
import { BaseConfig } from '../../base-config.model';

export class GeneralInformationFormConfig extends BaseConfig<
  GeneralInformationFormData,
  object
> {
  data: GeneralInformationFormData;
  settings: GeneralInformationForSettings;
}

interface GeneralInformationFormData {
  procurementProcessDescription: string;
  conflictsResolutionsList: IdNameEnum[];
  contractTypesList: IdNameEnum[];
  currencies: CurrencyEnum[];
  goodsSourceList: CodeNameEnum[];
}

interface GeneralInformationForSettings {
  disabled: boolean;
  status: BiddingContractStatusesEnum;
}
