import { Injectable } from '@angular/core';
import { GroupNameTextEnum } from '@core/enums/groupCode.enum';
import {
  BiddingIdDocuments,
  FiduciaryProcessDocumentGroup,
} from '@core/models';
import { FormStatusEnum } from '@fiduciary-interface/app/features/forms/enums/form-status.enum';
import { FormRequestDataGeneric } from '@fiduciary-interface/app/features/forms/models/form-request-data';
import { BussinessRulesFormService } from '@fiduciary-interface/app/features/forms/services/bussiness-rules/bussiness-rules.service';
import { BussinessRulesFunctionEnum } from '@fiduciary-interface/app/features/forms/enums/bussiness-rules-form.enum';

@Injectable({
  providedIn: 'root',
})
export class DocumentsGenerateService {
  statusForm: FormStatusEnum;
  groups: FiduciaryProcessDocumentGroup[] = [];
  operationNumber: string;
  biddingProcessPlanId: string;
  biddingProcessProcurementProcessId: string;
  procurementProcessName: string;

  constructor(private readonly brFormService: BussinessRulesFormService) {}

  createRequestData(
    form: GroupNameTextEnum,
    groupCode: number,
    resultBr?: BussinessRulesFunctionEnum
  ): FormRequestDataGeneric {
    const biddingIdDocuments: BiddingIdDocuments =
      this.getGroupByFormName(groupCode);

    const formRequestData: FormRequestDataGeneric = {
      formName: form,
      formStatus: this.checkCreateStatusForm(resultBr),
      operationNumber: this.operationNumber,
      biddingProcessPlanId: this.biddingProcessPlanId,
      biddingProcessProcurementProcessId:
        this.biddingProcessProcurementProcessId,
      documentPackageId: biddingIdDocuments.idGroup,
      biddingDocumentId: biddingIdDocuments.biddingDocumentId,
      fiduciaryProcessDocumentId: biddingIdDocuments.fiduciaryProcessDocumentId,
      nameFile: biddingIdDocuments.nameFile,
      categoryName: this.procurementProcessName,
    };
    return formRequestData;
  }

  private getGroupByFormName(groupCode: number): BiddingIdDocuments {
    let newFormData: BiddingIdDocuments;
    const group = this.groups?.find((g) => g.groupCode === groupCode);

    if (!!group) {
      newFormData = { idGroup: group.id };
      const fiduciaryDoc = group.fiduciaryProcessDocuments?.find(
        (fiduciaryDoc) => !!fiduciaryDoc.biddingDocumentId
      );

      if (!!fiduciaryDoc) {
        newFormData = {
          ...newFormData,
          biddingDocumentId: fiduciaryDoc.biddingDocumentId,
          fiduciaryProcessDocumentId: fiduciaryDoc.id,
          nameFile: fiduciaryDoc.name,
        };
      }
    }

    return newFormData;
  }

  checkCreateStatusForm(resultBr: BussinessRulesFunctionEnum): FormStatusEnum {
    return this.brFormService.filterBussinessRules(resultBr);
  }
}
