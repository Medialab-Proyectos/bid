import { FormStatusEnum } from '../enums/form-status.enum';

export interface FormRequestData {
  formName: string; //GroupNameTextEnum
  formStatus: FormStatusEnum;
  operationNumber: string;
  biddingDocumentId?: string;
  fiduciaryProcessDocumentId?: string;
  nameFile?: string;
}

export interface FormRequestDataGPN extends FormRequestData {
  projectBucketId: string;
}

export interface FormRequestDataGeneric extends FormRequestData {
  documentPackageId: string;
  biddingProcessPlanId: string;
  biddingProcessProcurementProcessId: string;
  categoryName?: string;
}
