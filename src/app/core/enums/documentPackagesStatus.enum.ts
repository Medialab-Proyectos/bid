export enum DocumentPackagesStatus {
  DRAFT = 0,
  NOT_STARTED = 1,
  COMPLETE = 2,
  UNDER_REVIEW = 3,
  RETURNED = 4,
  AMENDMENT_UNDER_REV = 5,
  AMENDMENT_RETURNED = 6,
  COMPLETE_AMENDMENT = 7,
  DELETED = 8,
}

export enum DocumentPackagesStatusText {
  DRAFT = 'Draf',
  NOT_STARTED = 'NotStarted',
  COMPLETE = 'Complete',
  UNDER_REVIEW = 'UnderReview',
  RETURNED = 'Returned',
  AMENDMENT_UNDER_REV = 'AmendmentUnderReview',
  AMENDMENT_RETURNED = 'AmendementReturned',
  COMPLETE_AMENDMENT = 'CompleteWithAmendment',
}
