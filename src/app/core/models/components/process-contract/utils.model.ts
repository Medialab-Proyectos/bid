export interface IdNameEnum {
  id: number;
  name: string;
}

export interface IdNameString {
  id: string;
  name: string;
}

export interface CodeNameEnum {
  code: string;
  name: string;
}

export interface CurrencyEnum {
  id: string;
  currency: string;
  numberOfDecimals: number;
  exchangeRate?: number;
}
export interface Threshold {
  max: number;
  min: number;
}

export interface InputCurrencyData {
  amount: number;
  currency: CurrencyEnum;
}
