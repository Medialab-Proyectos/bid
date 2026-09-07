export interface AppovedPlan {
  id: string;
  status: number;
  approvedDate: Date;
  submissionDate: Date;
  approvedBy: string;
  version: string;
  document: {
    fiduciaryProcessDocumentId: string;
    ezShareNumber: string;
    name: string;
    disclosureDate: Date;
    disclosureDateFormated?: string;
  };

  statusTranslation?: string;
  submissionDateFormated?: string;
  approvedDateFormated?: string;
}

export interface AppovedPlanResponse {
  biddingProcessPlansApproved: AppovedPlan[];
}
