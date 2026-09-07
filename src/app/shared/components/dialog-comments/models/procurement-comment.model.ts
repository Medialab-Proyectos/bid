export interface ProcurementComment {
  id: string;
  text: string;
  visibility: number;
  source: number;
  status: number;
  created: Date;
  createdBy: string;
  actual?: boolean;
  modifiedBy?: string;
  edited?: string;
  editedBy?: string;
  userNameCreated?: string;
  userNameEdited?: string;
  marked?: boolean;
}

export interface ProcurementCommentRequest {
  text: string;
  visibility: number;
  id?: string;
}

export interface ProcurementCommentGetResponse {
  parentId: string;
  comments: ProcurementComment[];
}

export interface ProcuremenProcessCommentsByProcessesResponse {
  commentsByProcesses: ProcessCommentsByProcessesResponse[];
  paginate: Paginate;
  planStatus: number;
}

export interface ProcuremenProcessCommentsResponse {
  commentsByProcess: CommentsByProcessResponse[];
  paginate: Paginate;
  planStatus: number;
}

export interface CommentsByProcessResponse {
  processCode: string;
  processName: string;
  processId: string;
  processStatus: number;
  commentsByPlanVersion: CommentsByPlanVersionResponse[];
}

export interface CommentsByPlanVersionResponse {
  planVersion: string;
  commentsDraft: ProcurementCommentResponse[];
  commentsComplete: ProcurementCommentResponse[];
}

export interface ProcessCommentsByProcessesResponse {
  processName: string;
  processCode: string;
  commentsDraft: ProcurementCommentResponse[];
  commentsComplete: ProcurementCommentResponse[];
  parentId: string;
  processStatus: number;
}

export interface ProcurementCommentResponse {
  id: string;
  text: string;
  visibility: number;
  source: number;
  status: number;
  created: string;
  createdBy: string;
  actual?: boolean;
  modifiedBy?: string;
  modified?: string;
  planVersion?: string;
  edited?: string;
  editedBy?: string;
  marked?: boolean;
}

export interface Paginate {
  count: number;
  from: number;
  hasNext: boolean;
  hasPrevious: boolean;
  index: number;
  pages: number;
  size: number;
}
