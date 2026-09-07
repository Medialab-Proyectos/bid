export class CardSystem {
  title: string;
  message: string;
  status: CardSystemStatus;
  text: string;
  textSecondary: string;
}

export enum CardSystemStatus {
  available = 'available',
  unavailable = 'unavailable',
  partialOutage = 'partial outage',
}
