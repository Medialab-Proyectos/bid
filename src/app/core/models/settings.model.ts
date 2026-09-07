import { KeyValue } from '.';

export class SettingsModel {
  code: string;
  value: string;
}

export class GetSetting {
  id: string;
  type: string;
  attributes: KeyValue[];
  values: string;
  modified: string;
}

export class PreferencesModel {
  defaultLanguage: string;
  preferredLanguage: string;
  projects: OperationPreference[];
  procurementPreferences: ProcurementPreferences[];
}

export class ProcurementPreferences {
  projectBucketId: string;
  process: boolean;
  contracts: boolean;
  amendments: boolean;
}
export class OperationPreference {
  projectBucket?: string;
  contractNumber: string;
  projectName?: {
    en: string;
    es: string;
    pt: string;
    fr: string;
  };
  operationNumber: string;
  institutionName?: string;
  totalApprovedAmount?: number;
  projectBucketId?: string;
  countryCode?: string;
}

export class OperationDataPreference {
  operationNumber: string;
  contract: string;
}
