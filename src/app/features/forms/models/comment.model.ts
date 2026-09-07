export interface Comments {
  numeral: number;
  userName: string;
  userRole: string;
  date: string;
  type: number;
  comment: string;
  class: string;
  reply: Reply;
}

export interface Reply {
  userName: string;
  date: string;
  comment: string;
}

export interface DeclineAnswer {
  index: number;
  item: Comments;
}
