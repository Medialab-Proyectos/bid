export enum CommentStatusEnum {
  DRAFT = 0,
  COMPLETED,
}

export enum ProcurementCommentTypeEnum {
  PLAN = 'PLAN',
  PROCESS = 'PROCESS',
  PROCESS_DETAIL = 'PROCESS_DETAIL',
}
export enum ProcurementCommentViewType {
  DRAFT = 0,
  COMPLETE = 1,
  DRAFT_COMPLETE = 2,
}

export const processCommentsTabEnum = {
  PROCESS_ACTIVE: 'processActive',
  PROCESS_HISTORIC: 'processHistoric',
};

export enum CommentsSelectionAction {
  ADD = 'ADD',
  REMOVE = 'REMOVE',
}
