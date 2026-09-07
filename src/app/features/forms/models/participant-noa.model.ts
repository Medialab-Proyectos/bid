export interface ParticipantNoa {
  id: string;
  name: string;
  result: number;
  nationality: number;
  totalScore: number;
  amount: number;
  signatureDate: Date;
  procurementName: string;

  openingPrice?: number;
  evaluatedPrice?: number;
  rejectReason?: string;
  contractScope?: string;
}
