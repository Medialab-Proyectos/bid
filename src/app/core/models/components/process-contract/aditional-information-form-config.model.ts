import { IdNameEnum, CurrencyEnum } from './';
import { BaseConfig } from '../../base-config.model';
import { ModeEnum, BiddingContractStatusesEnum } from '@core/enums';

/**
 * Aditional information form
 */
export class AditionalInformationFormConfig extends BaseConfig<
  AditionalInformationFormData,
  AditionalInformationFormSettings
> {
  data: AditionalInformationFormData;
  settings: AditionalInformationFormSettings;
}

interface AditionalInformationFormData {
  securityTypes: IdNameEnum[];
  currencies: CurrencyEnum[];
  frequencies: IdNameEnum[];
  damagesTypes: IdNameEnum[];
  bonusTypes: IdNameEnum[];
}

interface AditionalInformationFormSettings {
  mode: ModeEnum;
  status: BiddingContractStatusesEnum;
}

export interface CurrencyChangeEvent {
  currency: string;
  index: number;
}

/**
 * Security form
 */
export class SecurityFormConfig extends BaseConfig<
  SecurityFormData,
  SecurityFormSettings
> {
  data: SecurityFormData;
  settings: SecurityFormSettings;
}

interface SecurityFormData {
  securityTypes: IdNameEnum[];
  currencies: CurrencyEnum[];
}

interface SecurityFormSettings {
  mode: ModeEnum;
}

/**
 * Damages form
 */
export class DamagesFormConfig extends BaseConfig<
  DamagesFormData,
  DamagesFormSettings
> {
  data: DamagesFormData;
  settings: DamagesFormSettings;
}

interface DamagesFormData {
  frequencies: IdNameEnum[];
  damagesTypes: IdNameEnum[];
}

interface DamagesFormSettings {
  mode: ModeEnum;
}

/**
 * Bonus form
 */
export class BonusFormConfig extends BaseConfig<
  BonusFormData,
  BonusFormSettings
> {
  data: BonusFormData;
  settings: BonusFormSettings;
}

interface BonusFormData {
  bonusTypes: IdNameEnum[];
  frequencies: IdNameEnum[];
}

interface BonusFormSettings {
  mode: ModeEnum;
}
