import { Currency } from '@core/models';

export interface Amount {
  distributeIbd: number;
  distributeLocalCounterpart: number;
  distributeCofinancing: number;
}

export interface RequestAntAmount {
  requestedCurrency: string;
  requiredAmount: number;
  equivalentApprovedCurrency: number;
}

export interface ResponseAntAmount {
  requestedCurrency: Currency;
  requiredAmount: number;
  equivalentApprovedCurrency: number;
  availableBalance: number;
}

export interface ResponseJustAmount {
  bid: number;
  localCounterpart: number;
  cofinancing: number;
}
