import { Injectable } from '@angular/core';
import { UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import {
  BiddingProcessPlanStatus,
  BiddingProcessProcurementProcessStatuses,
  DocumentPackagesStatus,
  SettingActionType,
  SettingType,
} from '@core/enums';
import {
  AddBiddingProcessMilestone,
  AddComment,
  BiddingProcessProcurementProcessDetail,
  CreateBiddingProcessRequest,
  Enumerator,
  GetBiddingProcurementProcessByIdResponse,
  GetBiddingProcurementProcessCommentResponse,
  GetBiddingProcurementProcessMilestonesResponse,
  GetSettingsResponse,
  KeyValue,
  KeyValueInput,
  Outputs,
  Process,
  ProjectTask,
  ProjectTaskResponse,
  GetBiddingProcessComponentResponse,
  BiddingProcurementProcessComment,
  BiddingProcessProcurementProcess,
} from '@core/models';
import { BiddingProcurementProcessMilestones } from '@core/models/bidding-milestones.model';
import {
  BiddingProcessPlanService,
  ProjectsApiService,
} from '@core/services/apis';
import { ProcessConfiguration } from '@core/services/process-configuration.service';
import { ProjectStoreService } from '@core/services/store-services';
import { AppStateWithContact } from '@core/store';
import { AppUtilsService } from '@fiduciary-interface/app/app-utils.service';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormConfig } from '../models/form-config.model';
import {
  Comments,
  createComments,
  createMilestones,
  createProcessOutputs,
} from '../procurement-process.form';
import { DocumentPackageProcessDetail } from '@core/models/responses/biddingProcess-document-package.model';

@Injectable({
  providedIn: 'root',
})
export class ProcurementProcessFormService {
  justificationVisibility: boolean;
  goodsReferenceVisibility: boolean;
  warningMessage: string;
  constructor(
    readonly biddingProcessSvc: BiddingProcessPlanService,
    private readonly configSvc: ProcessConfiguration,
    public projectStoreSvc: ProjectStoreService,
    private readonly projectsApi: ProjectsApiService,
    private readonly translate: TranslateService,
    private readonly notificationGlobalService: NotificationGlobalService,
    private readonly utilsSvc: AppUtilsService,
    readonly storeContact: Store<AppStateWithContact>
  ) {
    this.storeContact.select('contact').subscribe((data) => {
      if (data.contact) {
        this.IS_INTERNAL = data.contact.is_internal;
      }
    });
  }

  JUSTIFICATION_VALUE = 'Justification';
  GOODSREFERENCE_VALUE = 'GoodsReference';

  form: UntypedFormGroup;
  IS_INTERNAL: boolean;

  get comments() {
    return this.form
      .get('commentsProcess')
      .get('commentsList') as UntypedFormArray;
  }

  getIdByName(name: string, enumType: Enumerator[]): number {
    const enumValue = enumType.find((i) => i.name === name);
    return enumValue ? enumValue.id : null;
  }

  getNameById(id: number, enumType: Enumerator[]): string {
    const enumValue = enumType.find((i) => i.id === id);
    return enumValue ? enumValue.name : null;
  }

  getProcurementProcessDetail(
    processId: string
  ): Observable<BiddingProcessProcurementProcessDetail> {
    const process = this.biddingProcessSvc
      .getBiddingProcessProcurementProcessesById(processId)
      .pipe(
        map((response: GetBiddingProcurementProcessByIdResponse) => {
          return response.biddingProcessProcurementProcess;
        })
      );
    const comments = this.biddingProcessSvc.getBiddingComments(processId).pipe(
      map((response: GetBiddingProcurementProcessCommentResponse) => {
        return response.biddingProcurementProcessComments;
      })
    );
    const milestones = this.biddingProcessSvc
      .getProcessMilestones(processId)
      .pipe(
        map((response: GetBiddingProcurementProcessMilestonesResponse) => {
          return response.biddingProcessMilestones;
        })
      );
    const outputs = this.biddingProcessSvc
      .getBiddingProcessComponents(processId)
      .pipe(
        map((response: GetBiddingProcessComponentResponse) => {
          return response;
        })
      );

    const packages = this.biddingProcessSvc.getDocumentPackages(processId);
    return this.addPackageStatusOnMilestone(
      process,
      comments,
      milestones,
      outputs,
      packages
    );
  }

  addPackageStatusOnMilestone(
    process: Observable<BiddingProcessProcurementProcess>,
    comments: Observable<BiddingProcurementProcessComment[]>,
    milestones: Observable<BiddingProcurementProcessMilestones[]>,
    outputs: Observable<GetBiddingProcessComponentResponse>,
    packages: Observable<DocumentPackageProcessDetail>
  ): Observable<BiddingProcessProcurementProcessDetail> {
    return forkJoin({ process, comments, milestones, outputs, packages }).pipe(
      map(({ milestones, packages, ...otherData }) => {
        const { documentPackagesDetail } = packages;

        const updatedMilestones = milestones.map((milestone) => ({
          ...milestone,
          packageStatus:
            documentPackagesDetail.find(
              (pkg) => pkg.milestoneId === milestone.id
            )?.status.id ?? -1,
        }));

        return { ...otherData, milestones: updatedMilestones };
      })
    );
  }

  removeHours(fecha): Date {
    const fechaObjeto = new Date(fecha);
    fechaObjeto.setHours(0, 0, 0, 0);
    return fechaObjeto;
  }

  fillForm(
    form: UntypedFormGroup,
    data: BiddingProcessProcurementProcessDetail,
    milestones: Enumerator[]
  ) {
    this.form = form;
    const comments = this.buildCommentsArray(data).value;
    const arrayMilestones: UntypedFormArray = new UntypedFormArray([]);
    data.milestones.forEach((el) => {
      const milestonesFg = createMilestones();
      milestonesFg.setValue({
        initialEstimationDate: this.removeHours(el.estimatedDate),
        reEstimateDate: el.reEstimateDate
          ? this.removeHours(el.reEstimateDate)
          : null,
        actualDate: el.actualDate ? this.removeHours(el.actualDate) : null,
        order: el.order,
        code: this.getNameById(el.code, milestones),
        name: this.getNameById(el.code, milestones),
        tooltip: this.getNameById(el.code, milestones),
      });
      arrayMilestones.push(milestonesFg);
    });
    const formToFill = {
      adittionalInfo: {
        bafo: data.process.bafo,
        goodsReference: data.process.goodsReference,
        lots: data.process.lots,
        sepaPlecaId: data.process.sepaPeclaId,
      },
      commentsProcess: comments,
      componentsForm: {
        component: data.outputs.componentName,
        outputsAsigned: data.outputs.outputs,
      },
      costDistributionForm: {
        bidAmount: data.process.projectAmount.idbAmount,
        cofinancingAmount: data.process.projectAmount.cofinancedAmount,
        costJustificaction: data.process.projectAmount.costJustification,
        localCounterpartAmount:
          data.process.projectAmount.localCounterpartAmount,
      },
      milestonesForm: {
        milestoneCollection: arrayMilestones.value,
      },
      processForm: {
        category: data.process.category.name,
        description: data.process.description,
        justification: data.process.justification,
        manualId: data.process.manualId,
        name: data.process.name,
        procurementMethod: data.process.procurementMethod.name,
        subExecutor: data.process.subExecutor,
        supervisionType: data.process.supervisionMethod.name,
      },
      sustainabilityForm: {
        sustainability: data.process.sustainability,
        sustainabilityDescription: data.process.sustainabilityDescription,
      },
    };

    form.patchValue(formToFill);
    data.milestones.forEach(() => {
      (form.get('milestonesForm.milestoneCollection') as UntypedFormArray).push(
        createMilestones()
      );
    });
    form
      .get('milestonesForm.milestoneCollection')
      .setValue(arrayMilestones.value);
    form.get('componentsForm.component').setValue(data.outputs.componentId);
    const formOutputArray = form.get(
      'componentsForm.outputsAsigned'
    ) as UntypedFormArray;
    formOutputArray.clear();
    data.outputs.outputs.forEach((el, arrayOutputsIndex) => {
      formOutputArray.push(createProcessOutputs());
      formOutputArray.at(arrayOutputsIndex).setValue({
        id: el.ouputId,
        percentage: el.percentageAssigned,
      });
    });
  }

  filterCommentsOnInternalOrExternal(
    comments: BiddingProcessProcurementProcessDetail
  ): BiddingProcurementProcessComment[] {
    if (!this.IS_INTERNAL) {
      return comments.comments.filter((c) => {
        return !(c.comment.source === 1 && c.comment.visibility === 1);
      });
    } else {
      return comments.comments.filter((c) => {
        return !(c.comment.source === 0 && c.comment.visibility === 1);
      });
    }
  }

  buildCommentsArray(
    data: BiddingProcessProcurementProcessDetail
  ): UntypedFormGroup {
    const comments = Comments();
    this.comments.clear();
    const filteredComments = this.filterCommentsOnInternalOrExternal(data);
    filteredComments.forEach(() => {
      this.comments.push(createComments());
    });

    for (const comment of filteredComments) {
      const commentGroup = createComments();
      commentGroup.setValue({
        id: comment.comment.id,
        text: comment.comment.text,
        visibility: comment.comment.visibility.toString(),
        status: comment.comment.status,
        createdBy: comment.comment.createdBy,
      });
      (comments.get('commentsList') as UntypedFormArray).push(commentGroup);
    }
    return comments;
  }

  procurementRequest(
    form: UntypedFormGroup,
    countryCode: string,
    categories: Enumerator[],
    procurementMethods: Enumerator[],
    supervisionMethods: Enumerator[],
    milestones: Enumerator[],
    milestonesForUpdate?: BiddingProcurementProcessMilestones[]
  ): CreateBiddingProcessRequest {
    const processForm = form.get('processForm');
    const cosDistributionForm = form.get('costDistributionForm');
    const additionalInfo = form.get('adittionalInfo');
    const sustainability = form.get('sustainabilityForm');

    const categorieString = processForm.get('category').value;
    const newCategorie = this.getIdByName(
      `PROCUREMENT.CATEGORIES.${categorieString}`,
      categories
    );

    const procurementString = processForm.get('procurementMethod').value;
    const newprocurement = this.getIdByName(
      `PROCUREMENT.PROCUREMENT_METHOD.${procurementString}`,
      procurementMethods
    );

    const supervisionString = processForm.get('supervisionType').value;
    const newpSupervision = this.getIdByName(
      `PROCUREMENT.SUPERVISION_METHOD.${supervisionString}`,
      supervisionMethods
    );

    return {
      name: processForm.get('name').value,
      manualId: processForm.get('manualId').value,
      subExecutor: processForm.get('subExecutor').value,
      description: processForm.get('description').value,
      justification: processForm.get('justification').value,
      category: newCategorie,
      procurementMethod: newprocurement,
      supervisionType: newpSupervision,
      outputsTask: {
        componentId: form.get('componentsForm').get('component').value,
        outputs: this.mapPostOutputs(form),
      },
      costDistribution: {
        idbEstimatedAmount: this.mapNumberDecimals(
          cosDistributionForm.get('bidAmount').value
        ),
        localCounterpartAmount: this.mapNumberDecimals(
          cosDistributionForm.get('localCounterpartAmount').value
        ),
        cofinancedAmount: this.mapNumberDecimals(
          cosDistributionForm.get('cofinancingAmount').value
        ),
        totalEstimatedAmount: this.mapNumberDecimals(
          cosDistributionForm.get('contractTotalAmount').value
        ),
        costJustificaction: cosDistributionForm.get('justification').value,
      },
      biddingProcessMilestones: this.mapPostMilestones(
        form,
        milestones,
        milestonesForUpdate
      ),
      comments: this.mapPostComments(form),
      lots:
        additionalInfo.get('lots').value !== '' &&
        additionalInfo.get('lots').value !== null
          ? Number(additionalInfo.get('lots').value)
          : null,
      sepaPlecaId: additionalInfo.get('sepaPlecaId').value,
      bafo: additionalInfo.get('bafo').value,
      goodsReference:
        additionalInfo.get('goodsReference').value !== '' &&
        additionalInfo.get('goodsReference').value !== null
          ? Number(additionalInfo.get('goodsReference').value)
          : null,
      sustainability:
        sustainability.get('sustainability').value !== '' &&
        sustainability.get('sustainability').value !== null
          ? Number(sustainability.get('sustainability').value)
          : null,
      sustainabilityDescription: sustainability.get('sustainabilityDescription')
        .value,
      countryCode,
    };
  }

  mapNumberDecimals(number: number): number {
    return Number(number?.toFixed(2));
  }

  mapPostMilestones(
    form: UntypedFormGroup,
    milestones: Enumerator[],
    milestonesForUpdate?: BiddingProcurementProcessMilestones[]
  ): AddBiddingProcessMilestone[] {
    const formatedMilestones: AddBiddingProcessMilestone[] = [];
    const milestone = (
      form.get('milestonesForm').get('milestoneCollection') as UntypedFormArray
    ).getRawValue();
    milestone.forEach((el) => {
      const code =
        this.getIdByName(el.code, milestones) !== null
          ? this.getIdByName(el.code, milestones)
          : el.code;
      const milestoneForUpdate = milestonesForUpdate?.find(
        (x) => x.code === code
      );

      formatedMilestones.push({
        id: milestoneForUpdate?.id,
        estimatedDate: el.initialEstimationDate,
        code,
        actualDate: el.actualDate,
        reEstimatedDate: el.reEstimateDate,
      });
    });
    return formatedMilestones;
  }

  mapPostOutputs(form: UntypedFormGroup): Outputs[] {
    const outputForm = form.get('componentsForm').get('outputsAsigned').value;
    const newOutputs: Outputs[] = [];
    for (const output of outputForm) {
      newOutputs.push({
        percentageAssigned: output.percentage,
        ouputId: output.id,
      });
    }
    return newOutputs;
  }

  mapPostComments(form: UntypedFormGroup): AddComment[] {
    const commentForm = (
      form.get('commentsProcess').get('commentsList') as UntypedFormGroup
    ).getRawValue();
    const newComments: AddComment[] = [];
    for (const form of commentForm) {
      newComments.push({
        id: form.id !== '' ? form.id : null,
        visibility: Number(form.visibility),
        status: form.status,
        text: form.text,
      });
    }
    return newComments;
  }

  queryProcurementMethods(
    attributeCountry: KeyValueInput,
    attributeCategory: KeyValueInput,
    attributeDifferentiator: KeyValueInput
  ): Observable<KeyValue[]> {
    const attributes = this.utilsSvc.buildAttributesArray(
      SettingType.procurementMethod,
      attributeCountry,
      attributeCategory,
      null,
      null,
      null,
      null,
      null,
      null,
      attributeDifferentiator
    );

    return this.configSvc
      .settings(attributes, SettingActionType.Extend, SettingType.Method)
      .pipe(
        map((data: GetSettingsResponse) => {
          const settings = data.settings;
          if (settings.length > 0 && settings[0].values) {
            const values = JSON.parse(settings[0].values);
            return (values.listMethods as any[]).map((value, index) => ({
              key: index.toString(),
              value: value.code,
            })) as KeyValue[];
          } else {
            return null;
          }
        })
      );
  }

  querySupervisionMethods(
    attributeCountry: KeyValueInput,
    attributeCategory: KeyValueInput,
    attributeProcurementMethod: KeyValueInput
  ): Observable<KeyValue[]> {
    const attributes = this.utilsSvc.buildAttributesArray(
      SettingType.supervisionMethod,
      attributeCountry,
      attributeCategory,
      attributeProcurementMethod
    );
    return this.configSvc
      .settings(attributes, SettingActionType.Extend, SettingType.Method)
      .pipe(
        map((data: GetSettingsResponse) => {
          const settings = data.settings;
          if (settings.length > 0 && settings[0].values) {
            const values = JSON.parse(settings[0].values);
            return (values.supervisionMethods as any[]).map((value, index) => ({
              key: index.toString(),
              value: value.code,
            })) as KeyValue[];
          } else {
            return null;
          }
        })
      );
  }

  queryMilestones(
    attributeCategory: KeyValueInput,
    attributeProcurementMethod: KeyValueInput,
    attributeSupervisionMethod: KeyValueInput
  ): Observable<GetSettingsResponse> {
    const attributes = this.utilsSvc.buildAttributesArray(
      SettingType.Milestone,
      null,
      attributeCategory,
      attributeProcurementMethod,
      null,
      attributeSupervisionMethod
    );
    return this.configSvc
      .settings(attributes, SettingActionType.Extend, SettingType.Milestone)
      .pipe(
        map((r: GetSettingsResponse) => {
          return r;
        })
      );
  }

  getAvailableOutputs(componentId: string, taskTypes: Enumerator[]) {
    const outputType = taskTypes.findIndex((type) =>
      type.name.endsWith('OUTPUT')
    );
    return this.projectsApi.getProjectTasksChilds(componentId).pipe(
      map((response: ProjectTaskResponse) => {
        const outputs = response.projectTasks.filter((output: ProjectTask) => {
          if (output.type === outputType) {
            return output;
          } else {
            return null;
          }
        });
        return { projectTasks: outputs };
      }),
      this.mapProjectTask()
    );
  }

  mapProjectTask() {
    return map((projectTasksResponse: ProjectTaskResponse) => {
      return projectTasksResponse.projectTasks.map((projectTask) => {
        return {
          name: projectTask.name,
          id: projectTask.id,
        };
      });
    });
  }

  milestonesFormatting(milestoneString: string): Process[] {
    const formatedString = milestoneString.replace(/\\"/g, '"');
    const milestoneValues = JSON.parse(formatedString);
    const milestonesArray = Object.values(milestoneValues)[0] as Array<any>;
    const tempArray: Process[] = [];
    milestonesArray.forEach((el) => {
      tempArray.push({
        name: el.milestoneCode,
        order: el.milestoneOrder,
        tooltip: `${el.milestoneCode}`,
      });
    });
    return tempArray;
  }

  addMilestoneProcess(formArray: UntypedFormArray, data: Process[]): void {
    data.forEach((el) => {
      const group = createMilestones();
      group.setValue({
        initialEstimationDate: null,
        reEstimateDate: null,
        actualDate: null,
        order: el.order,
        code: el.name,
        name: el.name,
        tooltip: el.tooltip,
      });
      formArray.push(group);
    });
  }

  successMessage(): void {
    const msg = this.translate.instant('PROCUREMENT.CREATE_SUCCESS');
    this.notificationGlobalService.showSuccess(msg);
  }

  successEditMessage(): void {
    const msg = this.translate.instant('PROCUREMENT.EDIT_SUCCESS');
    this.notificationGlobalService.showSuccess(msg);
  }

  successSaveCommentMessage(): void {
    const msg = this.translate.instant('PROCUREMENT.SAVE_COMMENT_SUCCESS');
    this.notificationGlobalService.showSuccess(msg);
  }

  errorSaveCommentMessage(): void {
    const message = this.translate.instant('PROCUREMENT.SAVE_COMMENT_ERROR');
    this.notificationGlobalService.showError(message);
  }

  errorMessage(): void {
    const message = this.translate.instant('PROCUREMENT.EDIT_ERROR');
    this.notificationGlobalService.showError(message);
  }

  configForm(data: BiddingProcessProcurementProcessDetail): FormConfig {
    const allowedPackageStataus = [
      DocumentPackagesStatus.COMPLETE,
      DocumentPackagesStatus.UNDER_REVIEW,
      DocumentPackagesStatus.AMENDMENT_UNDER_REV,
      DocumentPackagesStatus.AMENDMENT_RETURNED,
      DocumentPackagesStatus.COMPLETE_AMENDMENT,
    ];
    const disabledRestimatedDates = data.milestones.map((m) =>
      allowedPackageStataus.includes(m.packageStatus)
    );
    const isComentsDisabled = this.isNotEditable(data.process.status);
    const isCostDistributioDisabled = this.isDraftExpectedOrModified(
      data.process.status
    );
    const isOutputsDisabled = this.isDraftExpectedOrModified(
      data.process.status
    );
    const isMilestonesDraftExpectedOrModified = this.isDraftExpectedOrModified(
      data.process.status
    );

    const isUnderReviewUnderReviewModified =
      this.isUnderReviewOrUnderReviewModified(data.process.status);

    return {
      commentsSection: {
        isDisabled: isComentsDisabled,
      },
      costDistributionSection: {
        isDisabled: !isCostDistributioDisabled,
        justification: data.process.projectAmount.costJustification,
      },
      outputsSection: {
        isDisabled: !isOutputsDisabled,
      },
      milestoneSection: {
        isEstimatedDateDisabled: !isMilestonesDraftExpectedOrModified,
        isEstimatedDateVisible: true,
        isReEstimatedDateDisabled:
          !isMilestonesDraftExpectedOrModified &&
          !isUnderReviewUnderReviewModified,
        isReEstimatedDateVisible: !isMilestonesDraftExpectedOrModified,
        isActualDateDisabled: true,
        isActualDateVisible: false,
        disabledRestimatedDates,
      },
      mode: null,
    };
  }

  isUnderReviewOrUnderReviewModified(status: number) {
    if (
      status === BiddingProcessProcurementProcessStatuses.UNDER_REVIEW ||
      status === BiddingProcessProcurementProcessStatuses.UNDER_REVIEW_MODIFIED
    ) {
      return true;
    } else {
      return false;
    }
  }

  isNotEditable(status: number): boolean {
    if (
      status === BiddingProcessProcurementProcessStatuses.CANCELLED ||
      status ===
        BiddingProcessProcurementProcessStatuses.PROCUREMENT_COMPLETE ||
      status === BiddingProcessProcurementProcessStatuses.UNSUCCESFUL_PROCESS ||
      status === BiddingProcessProcurementProcessStatuses.REJECTION_BIDS ||
      status === BiddingProcessProcurementProcessStatuses.CONTRACT_TERMINATED ||
      status === BiddingProcessProcurementProcessStatuses.PROCUREMENT_INELIGIBLE
    ) {
      return true;
    } else {
      return false;
    }
  }

  isDraftExpectedOrModified(status: number): boolean {
    if (
      status === BiddingProcessProcurementProcessStatuses.DRAFT ||
      status === BiddingProcessProcurementProcessStatuses.EXPECTED ||
      status === BiddingProcessProcurementProcessStatuses.MODIFIED
    ) {
      return true;
    } else {
      return false;
    }
  }

  disableAditionalInfo(
    form: UntypedFormGroup,
    data: BiddingProcessProcurementProcessDetail
  ): void {
    if (!this.isDraftExpectedOrModified(data.process.status)) {
      form.get('adittionalInfo').disable();
    }
  }

  disableProcurementeProcess(
    form: UntypedFormGroup,
    data: BiddingProcessProcurementProcessDetail
  ): void {
    if (!this.isDraftExpectedOrModified(data.process.status)) {
      form.get('processForm').disable();
    }
    if (!this.isNotEditable(data.process.status)) {
      form?.get('processForm')?.get('manualId')?.enable();
    }
  }

  disableComponents(
    form: UntypedFormGroup,
    data: BiddingProcessProcurementProcessDetail
  ): void {
    if (!this.isDraftExpectedOrModified(data.process.status)) {
      form.get('componentsForm.component').disable();
    }
  }

  disableSustainabilies(
    form: UntypedFormGroup,
    data: BiddingProcessProcurementProcessDetail
  ): void {
    if (this.isNotEditable(data.process.status)) {
      form.get('sustainabilityForm').disable();
    }
  }

  disableFormField(
    form: UntypedFormGroup,
    data: BiddingProcessProcurementProcessDetail
  ): void {
    this.disableAditionalInfo(form, data);
    this.disableProcurementeProcess(form, data);
    this.disableComponents(form, data);
    this.disableSustainabilies(form, data);
  }

  getFieldsVisibility(
    attributeCountry: KeyValueInput,
    attributeCategory: KeyValueInput,
    attributeProcurementMethod: KeyValueInput,
    attributeSupervisionMethod: KeyValueInput,
    allProcessData: BiddingProcessProcurementProcessDetail,
    form: UntypedFormGroup
  ): Observable<{
    justificationVisibility: boolean;
    goodsReferenceVisibility: boolean;
  }> {
    const attributes = this.utilsSvc.buildAttributesArray(
      SettingType.MandatoryField,
      attributeCountry,
      attributeCategory,
      attributeProcurementMethod,
      null,
      attributeSupervisionMethod
    );
    return this.configSvc
      .settings(
        attributes,
        SettingActionType.Extend,
        SettingType.MandatoryField
      )
      .pipe(
        map((data: GetSettingsResponse) => {
          const settings = data.settings;

          if (settings) {
            settings.forEach((element) => {
              const inputstring = element.values;
              const formatedString = inputstring.replace(/\\"/g, '"');
              if (formatedString !== '') {
                const objectValues = JSON.parse(formatedString);
                const keyWarning =
                  objectValues.warningMessage.split('FI.CNVG.FP.')[1];
                this.warningMessage =
                  keyWarning === undefined ? '' : keyWarning;
                return this.setFieldsVisibility(
                  objectValues.fields,
                  allProcessData,
                  form
                );
              } else {
                return this.setFieldsVisibility([], allProcessData, form);
              }
            });
          }
          return {
            justificationVisibility: this.justificationVisibility,
            goodsReferenceVisibility: this.goodsReferenceVisibility,
          };
        })
      );
  }

  setFieldsVisibility(
    fields: string[],
    allProcessData: BiddingProcessProcurementProcessDetail,
    form: UntypedFormGroup
  ): void {
    if (fields.includes(this.JUSTIFICATION_VALUE)) {
      this.justificationVisibility = true;
      form
        .get('processForm.justification')
        .setValue(allProcessData?.process?.justification);
    } else {
      this.justificationVisibility = false;
    }
    if (fields.includes(this.GOODSREFERENCE_VALUE)) {
      this.goodsReferenceVisibility = true;
    } else {
      this.goodsReferenceVisibility = false;
    }
  }

  isUnableToEditProcess(
    processStatus: BiddingProcessProcurementProcessStatuses,
    planStatus: BiddingProcessPlanStatus
  ): boolean {
    const restrictedPlanStatuses = [
      BiddingProcessPlanStatus.UNDER_REVIEW,
      BiddingProcessPlanStatus.IN_SYNC,
    ];

    const restrictedProcessStatuses = [
      BiddingProcessProcurementProcessStatuses.EXPECTED,
      BiddingProcessProcurementProcessStatuses.MODIFIED,
      BiddingProcessProcurementProcessStatuses.UNDER_REVIEW_MODIFIED,
    ];

    return (
      restrictedPlanStatuses.includes(planStatus) &&
      restrictedProcessStatuses.includes(processStatus)
    );
  }
}
