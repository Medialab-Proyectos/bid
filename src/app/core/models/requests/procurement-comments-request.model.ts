export interface UpdateCommentsRquest {
  commentsParent: CommentRquest[];
}
export interface AddProcurementComment {
  id: string;
  visibility?: number;
  status?: number;
  text: string;
}
export interface CommentRquest {
  id: string;
  comment: AddProcurementComment;
}

export interface SaveComment {
  id: string;
  visibility?: number;
  text: string;
}
