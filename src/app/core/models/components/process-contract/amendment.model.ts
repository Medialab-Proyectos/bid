export interface Amendment {
  biddingProcurementProcessId: string;
  contractType: number;
  contractStatus: number;
  conflictResolutionMethod: number;
  liquidatedDamageType: number;
  bonusType: number;
  liquidatedDamagePaymentFrecuency: number;
  bonusPaymentFrecuency: number;
  name: string;
  object: string;
  signatureDate: string;
  startDate: string;
  endDate: string;
  idbAmount: number;
  localCounterpartAmount: number;
  cofinancedamount: number;
  controlNumber: string;
  hasAdvancedPayment: true;
  applicableLaw: string;
  liquidatedDamagePercentage: number;
  liquidatedDamageMaximumPercentage: number;
  bonusPercentage: number;
  bonusMaximumPercentage: number;
  costJustification: string;
}
