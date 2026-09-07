export interface ParagraphData {
  key: string | number;
  type?: ParagraphType;
  url?: string;
  tooltip?: string;
}

export type ParagraphType = `${ParagraphTypeEnum}`;

export enum ParagraphTypeEnum {
  BOLD = 'bold',
  ITALIC = 'italic',
  LINK = 'link',
  DATE = 'date',
  DATE_END = 'date_end',
  TOOLTIP = 'tooltip',
}
