import { Comments } from '../comment.model';

export interface PreviewBiddingDocumentRequest {
  documentType: string;
  documentInfo: string;
  biddingDocumentId: string;
}
export interface StoreBiddingDocumentRequest
  extends PreviewBiddingDocumentRequest {
  documentFormatType: string;
}

export interface UpdateBiddingDocumentRequest {
  jsonFormModel: string;
  comments: Comments[];
}
