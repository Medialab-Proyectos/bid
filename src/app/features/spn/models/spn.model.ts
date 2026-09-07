export type UnitOfTime = {
  id: string;
  name: string;
};

export interface GetSpnResponse {
  id: string;
  version: number;
  code: string;
  spnType: string;
  agaCode: string;
  agaPublicationDate: string;
  publicationDate: string;
  sentDate: string;
  language: string;
  status: string;
  documentPackageId: string;
  documentId: string;
  worksToBeAcquired: string;
  agenciesWillBeCofinanced: string;
  withLots: boolean;
  lots: Lot[];
  timeQuantity: number;
  unitOfTime: string;
  exceptionalEligibilityRules: string;
  qualificationRequirements: string;
  languageOfBiddingDocuments: string;
  nonRefundableAmount: number;
  nonRefundableCurrency: string;
  nonRefundablePaymentMethod: string;
  howToSendBiddingDocument: string;
  linksRelatedWithTheDocument: string[];
  dateOfSubmissionOfBids: string;
  electronicOffers: boolean;
  bidOpeningDate: string;
  typeOfAccompaniment: number;
  isAmount: boolean;
  bidMaintenanceGuaranteeCurrency: string;
  bidMaintenanceAmountInCurrency: number;
  bidMaintenancePercentageOfBidPrice: number;
  isSameOpeningAddress: boolean;
  bidOpeningAddress: string;
  bidOpeningSubmission: string;
  marginOfPreferenceWillBeGranted: boolean;
  mofMethod: boolean;
  negotiationMethod: boolean;
  responsibleAddress: string;
  responsibleName: string;
  responsibleEmail: string;
  responsiblePhone: string;
  address: string;
  executingAgency: string;
  attention: string;
  phone: string;
  email: string;
  website: string;
}

export interface Lot {
  id: string;
  number: number;
  name: string;
  expectedTime: number;
  unitOfTime: string;
  technicalSpecifications: string;
}
