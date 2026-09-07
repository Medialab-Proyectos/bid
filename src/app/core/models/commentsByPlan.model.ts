export interface CommentsByPlan {
  biddingProcurementProcessComments: CommentByPlan[];
}

export interface CommentByPlan {
  biddingProcessProcurementProcessId: string;
  code: string;
  id: string;
  comment: Comment;
}

export interface Comment {
  actual: boolean;
  created: string;
  createdBy: string;
  id: string;
  modified: string;
  modifiedBy: string;
  source: number;
  status: number;
  text: string;
  visibility: string;
}
