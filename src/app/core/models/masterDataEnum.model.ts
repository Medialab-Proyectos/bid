export interface MasterDataEnum {
  id: number;
  code: string;
  name: nameMasterData;
}

export interface nameMasterData {
  en: string;
  es: string;
  fr: string;
  pt: string;
}

export interface MasterData {
  id: number;
  code: string;
  name: string;
}

export interface MasterDataCountry extends MasterData {
  isMember: boolean;
  isBeneficiary: boolean;
}

export interface MasterDataCountryEnum extends MasterDataEnum {
  isMember: boolean;
  isBeneficiary: boolean;
  isActive: boolean;
  isBorrower: boolean;
  translatedName?: string;
}
