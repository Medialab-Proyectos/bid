export interface ContractSecurities {
  amount: number;
  currency: string;
  expirationDate: Date;
  securityType: number;
  usdEquivalentAmount: number;
  id?: string;
}
