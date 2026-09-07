import { Paginate } from '../activities/activitiesPaginate.model';

export interface ProcessCommentsResponse {
  processName: string;
  comments: ProcurementCommentResponse[];
  parentId: string;
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
  userNameCreated?: string;
  userNameEdited?: string;
  marked?: boolean;
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
  marked?: boolean;
}

export interface CommentsByPlanVersionResponse {
  planVersion: string;
  commentsDraft: ProcurementCommentResponse[];
  commentsComplete: ProcurementCommentResponse[];
}

export interface UpdateCommentsResponse {
  commentsParent: CommentsResponse[];
}

export interface PostCommentResponse {
  comment: CommentResponse;
  newIds: string;
  parentId: string;
}

export interface CommentResponse {
  actual: boolean;
  created: string;
  createdBy: string;
  edited: string;
  editedBy: string;
  id: string;
  modified: string;
  modifiedBy: string;
  source: number;
  status: number;
  text: string;
  visibility: number;
  userNameCreated?: string;
  userNameEdited?: string;
}

export interface CommentsResponse {
  id: string;
  comment: CommentResponse;
}
