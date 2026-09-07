export interface FilterComment {
  user: string;
  visibility: string;
  dateRange: FilterCommentDateRange;
  processId: string;
  processName: string;
  marked: boolean;
}

export interface FilterCommentDateRange {
  initialDate: Date;
  endDate: Date;
}

export interface CommentsRequest {
  filters: FilterComment;
  page: number;
  size: number;
}
