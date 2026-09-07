import { PermissionEnum } from '@core/enums';
import { BPbtns } from '../enums';

export interface BPBtnDocumentsUploaded {
  showDocumentUploaded: boolean;
  disabledDocumentUploadedBtn: boolean;
}
export interface BPBtnDictionaryFlags {
  showBtn: boolean;
  disableBtn: boolean;
}

export interface BPBtnDictionaryItem
  extends BPBtnDictionaryFlags,
    BPBtnDocumentsUploaded {
  permission: PermissionEnum[];
  key: string;
  tooltip: string;
  btnActionFunction: () => void;
}

export interface BPBtnDictionary {
  [BPbtns.Confirm]: BPBtnDictionaryItem;
  [BPbtns.ConfirmAmendment]: BPBtnDictionaryItem;
  [BPbtns.ConfirmClarificationUpload]: BPBtnDictionaryItem;
  [BPbtns.Disclosure]: BPBtnDictionaryItem;
  [BPbtns.NonObjection]: BPBtnDictionaryItem;
  [BPbtns.RequestAmendment]: BPBtnDictionaryItem;
}

export interface BPBtnDictionaryAdditionalDodcs {
  [BPbtns.Confirm]: BPBtnDictionaryItem;
  [BPbtns.NonObjection]: BPBtnDictionaryItem;
}
