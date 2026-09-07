import { BaseConfig } from '../../base-config.model';
import { CodeNameEnum, CurrencyEnum, IdNameEnum } from '.';
import { BiddingContractStatusesEnum, GroupMethodEnum } from '@core/enums';
import { Threshold } from '@core/models';
import { Enumerator } from '@core/models/responses';

export class ProcessContractFormConfig extends BaseConfig<
  ProcessContractFormData,
  object
> {
  data: ProcessContractFormData;
  settings: ProcessContractFormSettings;
}

export interface ProcessContractFormData {
  procurementProcessDescription: string;
  beneficiaryCountries: CodeNameEnum[];
  memberCountries: IdNameEnum[];
  currencies: CurrencyEnum[];
  conflictsResolutionsList: IdNameEnum[];
  goodsSourceList: Enumerator[];
  contractTypesList: IdNameEnum[];
  bonusTypes: IdNameEnum[];
  damagesTypes: IdNameEnum[];
  frequencies: IdNameEnum[];
  securityTypes: IdNameEnum[];
  showUnits: boolean;
  threshold: Threshold;
  nationalBiddingThreshold: Threshold;
  groupMethod: GroupMethodEnum;
}
export interface ProcessContractFormSettings {
  disabled: boolean;
  status: BiddingContractStatusesEnum;
}
