export enum FiduciaryProcessDocumentsStatuses {
  draftUploadedBlobStorage = 0,
  draftPendingUploadEazyshare = 1,
  errorEzshareUpload = 2,
  uploaded = 3,
  underReview = 4,
  disclosed = 5,
  rejected = 6,
  undisclosed = 7,
  pendingDisclose = 8,
  errorDisclose = 9,
  deleted = 10,
  ReturnWithComment = 11,
  ReadyToPublication = 12,
  Publicated = 13,
}

export enum FiduciaryProcessDocumentsTextStatuses {
  draftUploadedBlobStorage = 'draftUploadedBlobStorage',
  draftPendingUploadEazyshare = 'draftPendingUploadEazyshare',
  errorEzshareUpload = 'errorEzshareUpload',
  uploaded = 'uploaded',
  underReview = 'underReview',
  disclosed = 'disclosed',
  rejected = 'rejected',
  undisclosed = 'undisclosed',
  pendingDisclose = 'pendingDisclose',
  errorDisclose = 'errorDisclose',
  deleted = 'deleted',
  ReturnWithComment = 'returnWithComment',
  ReadyToPublication = 'readyToPublication',
  Publicated = 'publicated',
}

export enum FiduciaryProcessDocumentsStatusIdEnum {
  REGISTERED = 1,
  UNDER_REVIEW,
  CONFIRMED,
  SENT_TO_PUBLICATION,
  PUBLISHED,
}
