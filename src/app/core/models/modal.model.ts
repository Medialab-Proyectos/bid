import { DialogAction } from '@progress/kendo-angular-dialog';

export interface ModalContent {
  key: string;
  bold: boolean;
  text?: string;
}

export interface DialogResponse extends DialogAction {
  result: ModalOptions;
  comment?: string;
  content: any;
}

export enum ModalOptions {
  ACCEPT = 0,
  CANCEL,
}
