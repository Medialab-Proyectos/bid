export interface TransactionAudiTrailCreateRequest {
  createAuditTrailListRequests: TransactionAudiTrailRequest[];
}

export interface TransactionAudiTrailRequest {
  transactionId: number;
  comment: string;
  action: string;
  user: string;
}
