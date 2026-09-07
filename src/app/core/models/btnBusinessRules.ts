export class BtnBusinessRule {
  id: string;
  literal: string;
  groupCode?: string;
  class: string;
  result: string;
}

export class BtnBusinessRuleGroup {
  id: string;
  groupCode: number;
  nameDocument: string;
  literalAction: string;
  literalPlataform: string;
  biddingDocumentId: string;
  idDocument: string;
  class: string;
}
