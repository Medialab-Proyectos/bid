import { FiduciaryProcessDocumentGroup } from '@core/models';
import { GroupType } from '../enums';
import { NoticeTypeEnum } from '@core/enums/documentPackageCode.enum';

export interface GroupsTabs {
  type: GroupType;
  groups: FiduciaryProcessDocumentGroup[];
}

export interface ConfirmNoticeEvent {
  noticeId: string;
  noticeType: NoticeTypeEnum;
}
