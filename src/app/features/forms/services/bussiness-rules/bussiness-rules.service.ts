import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  DocumentPackagesStatus,
  DocumentPackagesStatusText,
  FiduciaryProcessDocumentsStatuses,
  FiduciaryProcessDocumentsTextStatuses,
  RolEnum,
} from '@core/enums';
import { GroupNameEnum, GroupNameTextEnum } from '@core/enums/groupCode.enum';
import { Project } from '@core/models';
import {
  BtnBusinessRule,
  BtnBusinessRuleGroup,
} from '@core/models/btnBusinessRules';
import { PermissionService } from '@core/services/app/permission/permission.service';
import { environment } from '@fiduciary-interface/environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '@progress/kendo-angular-dialog';
import { from, Observable, Subject } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
import { DynamicPreviewDialogComponent } from '../../components/dynamic-preview-dialog/dynamic-preview-dialog.component';
import { BussinessRulesFunctionEnum } from '../../enums/bussiness-rules-form.enum';
import { FormNameEnum } from '../../enums/form-name';
import { FormStatusEnum } from '../../enums/form-status.enum';
import { JsonFormModel } from '../../models/dynamic-form.model';
import { BussinessRulesRequest } from '../../models/request/bussiness-rules-form-request.model';
import { BussinessRulesFormResponse } from '../../models/response/bussiness-rules-form-response.model';
import { DynamicFormsSharedService } from '../dynamic-form-shared/dynamic-form-shared.service';
import { DynamicFormBuildService } from '../dynamic-form/dynamic-form-build.service';

@Injectable({
  providedIn: 'root',
})
export class BussinessRulesFormService {
  private readonly basePath = `${environment.hostApi.fiduciaryProcessApi.endpoint}/api/`;

  constructor(
    private readonly httpClient: HttpClient,
    private permissionService: PermissionService,
    private readonly dynamicFormBuildService: DynamicFormBuildService,
    private readonly fb: UntypedFormBuilder,
    readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly dynamicFormsSharedService: DynamicFormsSharedService,
    private readonly dialogService: DialogService,
    private readonly translate: TranslateService
  ) {}

  public bussinessRulesFunctionEnum: BussinessRulesFunctionEnum;
  public jsonFormData: JsonFormModel = null;
  public dynamicForm: UntypedFormGroup = this.fb.group({});
  public getFunction(
    projectContractId: string,
    bussinessRulesRequest: BussinessRulesRequest
  ): Observable<BussinessRulesFormResponse> {
    return this.permissionService
      .getRolesStore()
      .pipe(filter((data) => data.loaded))
      .pipe(
        switchMap(() => {
          const url = `${this.basePath}biddingDocuments/getFunctionToDoOnDocument`;
          return this.httpClient.post<BussinessRulesFormResponse>(
            url,
            this.createObjectRequestBussinessRules(
              projectContractId,
              bussinessRulesRequest
            )
          );
        })
      );
  }

  filterRole(projectContractId: string): RolEnum {
    const rolesPermitios: RolEnum[] = [
      RolEnum.Team_Leader,
      RolEnum.Alternate_TeamLeader,
      RolEnum.Procurement_Fiduciary_Specialist,
      RolEnum.External_Coordinator,
      RolEnum.External_Procurement_Specialist,
    ];
    const roles =
      this.permissionService.getRolesByContractNumber(projectContractId);

    let rolBussines: RolEnum;
    roles.forEach((element) => {
      const rol = rolesPermitios.find((x) => x === element.roleIdCode);
      if (rol !== undefined) {
        rolBussines = rol;
      }
    });
    return rolBussines;
  }

  public filterBussinessRules(
    resultBr: BussinessRulesFunctionEnum
  ): FormStatusEnum {
    let formStatus: FormStatusEnum;
    switch (resultBr.toUpperCase()) {
      case BussinessRulesFunctionEnum.GENERATE:
        formStatus = FormStatusEnum.CREATE;
        break;
      case BussinessRulesFunctionEnum.ADJUST:
        formStatus = FormStatusEnum.ADJUST;
        break;
      case BussinessRulesFunctionEnum.ADJUST_RETURNED:
        formStatus = FormStatusEnum.ADJUST_RETURNED;
        break;
      case BussinessRulesFunctionEnum.REVIEW:
        formStatus = FormStatusEnum.REVIEW;
        break;
      case BussinessRulesFunctionEnum.REVIEW_TEAM_LEADER:
        formStatus = FormStatusEnum.REVIEW_TEAM_LEADER;
        break;
      case BussinessRulesFunctionEnum.EDIT_OPENING_DATE:
        formStatus = FormStatusEnum.EDIT_OPENING_DATE;
        break;
      case BussinessRulesFunctionEnum.VIEW:
        formStatus = FormStatusEnum.VIEW;
        break;
      default:
        formStatus = undefined;
        break;
    }
    return formStatus;
  }

  createButton(
    resultBr: BussinessRulesFunctionEnum,
    form: FormNameEnum
  ): BtnBusinessRule {
    let btnO: BtnBusinessRule;
    if (resultBr && form) {
      const result = resultBr.toUpperCase();
      const classes = this.addClassButton(result);

      btnO = {
        id: `BTN_${result}_${form}`,
        class: classes,
        literal: `FORMS.FORMS_TABS.${result}_${form}`,
        result: result,
      };
    }
    return btnO;
  }

  createBiddingButton(
    resultBr: BussinessRulesFunctionEnum,
    codeGroup: number,
    biddingDocumentId: string,
    idDocument: string
  ): BtnBusinessRuleGroup {
    let btnO: BtnBusinessRuleGroup;
    if (resultBr) {
      const nameDocument = this.mapNameDocument(codeGroup);
      let result = resultBr.toUpperCase();
      if (result === BussinessRulesFunctionEnum.REVIEW_TEAM_LEADER) {
        result = BussinessRulesFunctionEnum.REVIEW;
      }
      const classes = this.addClassButton(result);

      btnO = {
        id: `BTN_${result}_${codeGroup}`,
        groupCode: codeGroup,
        literalAction: `BIDDINDG.BUTTON.${result}`,
        nameDocument,
        literalPlataform: 'BIDDINDG.BUTTON.TEXT_PLATAFORM',
        biddingDocumentId,
        idDocument,
        class: classes,
      };
    }
    return btnO;
  }

  createObjectRequestBussinessRules(
    projectContractId: string,
    bussinessRulesRequest: BussinessRulesRequest
  ): BussinessRulesRequest {
    const bussinessRules: BussinessRulesRequest = {
      categoryCode: this.validateValue(bussinessRulesRequest.categoryCode),
      procurementCode: this.validateValue(
        bussinessRulesRequest.procurementCode
      ),
      supervisionMethod: this.validateValue(
        bussinessRulesRequest.supervisionMethod
      ),
      totalAmountProcurementProcess: this.validateValue(
        bussinessRulesRequest.totalAmountProcurementProcess
      ),
      document: this.validateValue(bussinessRulesRequest.document),
      userRole: this.validateValue(this.filterRole(projectContractId)),
      documentStatus: this.validateValue(bussinessRulesRequest.documentStatus),
      packageStatus: this.validateValue(bussinessRulesRequest.packageStatus),
      workflowStep: this.validateValue(bussinessRulesRequest.workflowStep),
    };
    return bussinessRules;
  }

  private validateValue(value: string): string {
    return String(value && value !== 'null' ? value : undefined);
  }

  mapStatusDocument(
    statusDocument: number
  ): FiduciaryProcessDocumentsTextStatuses {
    let textStatus: FiduciaryProcessDocumentsTextStatuses = undefined;
    if (statusDocument !== undefined) {
      for (const key in FiduciaryProcessDocumentsStatuses) {
        if (key === String(statusDocument)) {
          textStatus =
            FiduciaryProcessDocumentsTextStatuses[
              FiduciaryProcessDocumentsStatuses[key]
            ];
        }
      }
    }

    return textStatus;
  }

  mapStatusDocumentPackage(statusDocument: number): DocumentPackagesStatusText {
    let textStatus: DocumentPackagesStatusText = undefined;
    if (statusDocument !== undefined) {
      for (const key in DocumentPackagesStatus) {
        if (key === String(statusDocument)) {
          textStatus = DocumentPackagesStatusText[DocumentPackagesStatus[key]];
        }
      }
    }

    return textStatus;
  }

  mapNameDocument(codeGroup: number): GroupNameTextEnum {
    let textStatus: GroupNameTextEnum = undefined;
    if (codeGroup !== undefined) {
      for (const key in GroupNameEnum) {
        if (key === String(codeGroup)) {
          textStatus = GroupNameTextEnum[GroupNameEnum[key]];
        }
      }
    }

    return textStatus;
  }

  getPreview(
    data: any,
    formStatus: FormStatusEnum,
    formName: string,
    operationNumber: string,
    language: string,
    selectedProject: Project,
    processProcurementProcessId: string
  ): Observable<boolean> {
    return this.getDynamicForm(
      data,
      formStatus,
      formName,
      operationNumber,
      language
    ).pipe(
      switchMap(() => {
        let openDialog = new Subject<boolean>();
        const getPhone = this.dynamicForm.get('phone');
        getPhone.setValue(
          this.dynamicFormsSharedService.processPhoneNumber(getPhone.value)
        );
        this.dynamicFormsSharedService
          .openDocumentPreviewDialog(
            this.jsonFormData,
            this.dynamicForm,
            selectedProject,
            processProcurementProcessId,
            language
          )
          .subscribe((response) => {
            const dialogRef = this.dialogService.open({
              title: this.translate.instant('FORMS.DYNAMIC_FORM.PREVIEW'),
              content: DynamicPreviewDialogComponent,
              maxHeight: '90%',
              maxWidth: '70%',
              actions: [
                {
                  text: this.translate.instant('FORMS.DYNAMIC_FORM.CLOSE'),
                  primary: true,
                },
              ],
            });
            dialogRef.content.instance.previewHTML = response;
          })
          .add(() => {
            openDialog.next(false);
          });
        return openDialog.asObservable();
      })
    );
  }

  getDynamicForm(
    data: any,
    formStatus: FormStatusEnum,
    formName: string,
    operationNumber: string,
    language: string
  ): Observable<any> {
    if (data.biddingDocumentId !== '') {
      return this.dynamicFormBuildService
        .getDynamicFormById(data.biddingDocumentId)
        .pipe(
          tap((response) => {
            if (response !== null) {
              this.dynamicForm = this.fb.group({});
              this.jsonFormData = response;
              this.dynamicFormBuildService.generateForm(
                this.jsonFormData,
                this.dynamicForm,
                formStatus
              );
            } else {
              this.router.navigate(['../../'], {
                relativeTo: this.activatedRoute,
              });
            }
          })
        );
    } else {
      return from(
        this.dynamicFormBuildService.getDynamicForm(
          formName,
          operationNumber,
          language,
          null
        )
      ).pipe(
        tap((response) => {
          if (response !== null) {
            this.dynamicForm = this.fb.group({});
            this.jsonFormData = response;
            this.dynamicFormBuildService.generateForm(
              this.jsonFormData,
              this.dynamicForm,
              formStatus
            );
          }
        })
      );
    }
  }

  public addClassButton(result: any): string {
    return result !== BussinessRulesFunctionEnum.PENDINGPUBLICATION
      ? 'btn-online-brand'
      : '';
  }
}
