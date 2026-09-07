import { MasterDataEnum } from '../masterDataEnum.model';

export interface DocumentPackageProcessDetail {
  procurementProcessId: string;
  documentPackagesDetail: DocumentPackageDetail[];
}

export interface DocumentPackageDetail {
  documentPackageId: string;
  milestoneId: string;
  status: MasterDataEnum;
  code: MasterDataEnum;
  order: number;
  requireNonObjection: boolean;
  actualDate: string;
  isOptional: boolean;
  bidValidityExtensionDate: string;
}
