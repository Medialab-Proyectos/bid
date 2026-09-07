import { removeRequired } from '@core/utils';
import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import {
  UntypedFormArray,
  UntypedFormGroup,
  UntypedFormControl,
  Validators,
} from '@angular/forms';
import { from, Observable, of, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Enumerator,
  GetSettingsResponse,
  KeyValue,
  KeyValueInput,
  ProcurementGroupMethod,
  ProjectTaskResponse,
  Category,
  IdNameString,
  BiddingProcessProcurementProcessDetail,
  Enums,
} from '@core/models';
import { ProcessConfiguration } from '@core/services/process-configuration.service';
import { WindowSizeService } from '@core/services/view';
import {
  createMilestones,
  createProcessOutputs,
} from '../../procurement-process.form';
import {
  BiddingProcessPlanStoreService,
  EnumsStoreService,
  ProjectStoreService,
} from '@core/services/store-services';
import {
  GroupMethodEnum,
  SettingActionType,
  SettingType,
  CategoryProcurement,
  PermissionEnum,
  ProcurementProcessCategoriesEnum,
  BiddingProcurementProcessSupervisionMethods,
  ProcurementMethodCode,
  BiddingProcessPlanStatus,
} from '@core/enums';
import { ProjectsApiService } from '@core/services/apis';
import { createProcurementForm } from './procurement.form';
import { Threshold } from '@core/models/components/process-contract';
import { ProcurementProcessFormService } from '../../services/procurement-process-form.service';
import { FormConfig } from '../../models/form-config.model';
import { AppUtilsService } from '@fiduciary-interface/app/app-utils.service';
import { TranslateEnumPipe } from '@fiduciary-interface/app/shared/pipes/translate-enum.pipe';
import { SupervisionTypeCode } from '@core/enums/supervisionType.enum';

@Component({
  selector: 'fi-procurement-form',
  templateUrl: './procurement-form.component.html',
})
export class ProcurementFormComponent implements OnInit, OnDestroy, OnChanges {
  private readonly subscription = new Subscription();
  @Input() justificationVisibility: boolean;
  @Input() goodsReferenceVisibility: boolean;
  JUSTIFICATION_VALUE = 'Justification';
  GOODSREFERENCE_VALUE = 'GoodsReference';
  mobileView = false;
  enumMilestones: Enumerator[];

  CLASS = 'c-procurement-form';

  totalAssigned = 100;
  totalpercentage = 100;

  public attributeCountry: KeyValueInput;
  @Input() attributeCategory: KeyValueInput;
  @Input() attributeProcurementMethod: KeyValueInput;
  @Input() attributeGroupMethod: KeyValueInput;
  public attributeSupervisionMethod: KeyValueInput;

  public maxThresholdsRestriction: boolean;
  public minThresholdsRestriction: boolean;
  public minThresholdExceeded: boolean;
  public maxThresholdExceeded: boolean;

  supervisionMethod: BiddingProcurementProcessSupervisionMethods;

  countryCode = '';
  projectBucketId = '';
  @Input() warningMessage: string;

  public procurementGroups: ProcurementGroupMethod[];

  @Input() thresholds: Threshold = { min: 0, max: 0 };
  @Input() nationalBiddingThreshold: Threshold = { min: 0, max: 0 };

  public components$: Observable<{ name: string; id: string }[]>;

  public radioOptions: Enumerator[];
  public taskTypes: Enumerator[];
  public commentVisibilities: Enumerator[];
  public justificacion: string;
  public categories$: Observable<Array<KeyValue>> = this.getCategoriesList$();
  public applyMilestoneRules = false;

  isBiddingPlanInSync = false;

  @Input() form: UntypedFormGroup = createProcurementForm();
  @Input() readOnly = false;
  @Input() procurementMethods$: Observable<Array<KeyValue>> =
    this.getTenderMethodList$();
  @Input() supervisionMethods$: Observable<Array<KeyValue>> =
    this.getTenderMethodList$();
  @Input() selectedOutputs$: Observable<any>;
  @Input() formConfig: FormConfig;
  @Input() disabledComments: boolean;
  @Input() set allProcessData(value: BiddingProcessProcurementProcessDetail) {
    this._allProcessData = value;
    this.fillUnfilledData();
  }
  _allProcessData: BiddingProcessProcurementProcessDetail;

  viewProcurementFormPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
    PermissionEnum.VIEW_PROCUREMENT_INFORMATION,
  ];
  showBAFO: boolean;
  isPROCT_PFA: boolean;
  showLots: boolean;
  @Input() processStatus: number;

  constructor(
    readonly configSvc: ProcessConfiguration,
    private readonly projectStoreSvc: ProjectStoreService,
    private readonly windowService: WindowSizeService,
    private readonly projectsApi: ProjectsApiService,
    private readonly enumStoreSvc: EnumsStoreService,
    private readonly procurementFormSvc: ProcurementProcessFormService,
    private readonly utilsSvc: AppUtilsService,
    private readonly translateEnum: TranslateEnumPipe,
    readonly biddingProcessPlanStore: BiddingProcessPlanStoreService
  ) {}

  ngOnChanges(): void {
    if (this.justificationVisibility) {
      this.processForm.get('justification').setValidators(Validators.required);
    } else {
      this.processForm.get('justification').setValidators(null);
      this.processForm.get('justification').setErrors(null);
      this.processForm.get('justification').setValue('');
    }

    this.processForm.updateValueAndValidity();
  }

  listenSupervisionTypeChanges(): void {
    const sub = this.form
      .get('processForm.supervisionType')
      .valueChanges.subscribe((data) => {
        this.updateSupervisionMethod(data);
      });
    this.subscription.add(sub);
  }

  updateSupervisionMethod(data: string): void {
    this.supervisionMethod = this.translateEnum.getIdByName(
      `PROCUREMENT.SUPERVISION_METHOD.${data}`,
      Enums.biddingProcessProcurementProcessSupervisionMethods
    );
  }

  ngOnInit(): void {
    this.getIsPROCT_PFA();
    this.listenSupervisionTypeChanges();
    this.getEnums();
    this.procurementGroups = this.initGroupMethodArray();
    this.initProjectParams();
    this.populateEnums();
    this.resetCategoryForm();
    this.resetAcquisitionForm();
    this.resetMonitoringForm();
    this.resetOutputs();
    this.listenCategoryChanges();
    if (this.outputsAsigned.length < 1) {
      this.addOutputFormGroup();
    }
    this.checkShowLots();
    this.setReadOnlyMode();
    this.listenSupervisionMethodChanges();
    this.listenProcessFormChanges();
    this.justificacion = this.formConfig.costDistributionSection.justification;
  }

  listenProcessFormChanges(): void {
    const sub = this.form
      .get('processForm')
      .valueChanges.subscribe((processForm) => {
        this.applyMilestoneRules =
          this.handleRulesToValidateMilestones(processForm);
      });
    this.subscription.add(sub);
  }

  handleRulesToValidateMilestones(processForm): boolean {
    if (processForm.category === CategoryProcurement.PROCT_INDCST) {
      return true;
    }
    if (
      processForm.procurementMethod === ProcurementMethodCode.PROCT_SRQOI ||
      processForm.procurementMethod === ProcurementMethodCode.PROCT_SRMQ
    ) {
      return true;
    }
    if (
      processForm.supervisionType === SupervisionTypeCode.Local ||
      processForm.supervisionType === SupervisionTypeCode.ExPost ||
      processForm.supervisionType === SupervisionTypeCode.NationalSystem
    ) {
      return true;
    }
    return false;
  }

  listenSupervisionMethodChanges(): void {
    const sub = this.form
      .get('processForm.supervisionType')
      .valueChanges.subscribe((data) => {
        this.supervisionMethod = this.translateEnum.getIdByName(
          `PROCUREMENT.SUPERVISION_METHOD.${data}`,
          Enums.biddingProcessProcurementProcessSupervisionMethods
        );
      });
    this.subscription.add(sub);
  }

  getEnums(): void {
    const sub = this.biddingProcessPlanStore
      .getOrLoadBiddingProcessPlan()
      .subscribe((state) => {
        this.isBiddingPlanInSync =
          state.biddingPlanState?.biddingProcessPlan?.status ===
          BiddingProcessPlanStatus.IN_SYNC;
        const enumState = state.enumState;
        this.enumMilestones = enumState.biddingProcessMilestoneCodes;
      });
    this.subscription.add(sub);
  }

  setReadOnlyMode(): void {
    if (this.readOnly) {
      this.disabledForms();
      setTimeout(() => {
        removeRequired(`.${this.CLASS} .fi-kendo-label--required`);
      }, 1000);
    }
  }

  disabledForms(): void {
    Object.keys(this.form.controls).forEach((controlName) => {
      setTimeout(() => {
        this.form
          .get(controlName)
          .disable({ onlySelf: true, emitEvent: false });
      }, 0);
    });
  }

  fillUnfilledData(): void {
    this.initProcessDataSection();
    this.initOutputsSection();
    this.fillMilestones();
  }

  listenCategoryChanges(): void {
    const getter = 'processForm.category';
    if (this.form.get(getter).value) {
      this.checkCategory(this.form.get(getter).value);
    }
    const sub = this.form.get(getter).valueChanges.subscribe((data) => {
      this.checkCategory(data);
    });
    this.subscription.add(sub);
  }

  checkCategory(data: any): void {
    const category = this.translateEnum.getIdByName(
      `PROCUREMENT.CATEGORIES.${data}`,
      Enums.biddingProcessProcurementProcessCategories
    );
    if (
      category === ProcurementProcessCategoriesEnum.CONSULTING_FIRMS ||
      category === ProcurementProcessCategoriesEnum.EXTERNAL_AUDIT ||
      category === ProcurementProcessCategoriesEnum.INDIVIDUAL_CONSULTANTS
    ) {
      this.showBAFO = false;
      this.form.get('adittionalInfo').get('bafo').setValue(null);
    } else {
      this.showBAFO = true;
    }
  }

  initProcessDataSection(): void {
    this.form
      .get('processForm.procurementMethod')
      .setValue(this._allProcessData?.process?.procurementMethod?.name);
    this.form
      .get('processForm.supervisionType')
      .setValue(this._allProcessData?.process?.supervisionMethod?.name);
    this.updateSupervisionMethod(
      this._allProcessData?.process?.supervisionMethod?.name
    );
    this.form
      .get('componentsForm.component')
      .setValue(this._allProcessData?.outputs?.componentId);

    if (
      this.adittionalInfo.get('goodsReference').value !== null &&
      this.adittionalInfo.get('goodsReference').value !== ''
    ) {
      this.goodsReferenceVisibility = true;
      this.adittionalInfo
        .get('goodsReference')
        .setValidators(Validators.required);
    }
  }

  initOutputsSection(): void {
    const val = this.fillComponents();
    if (!!val && val.length > 0) {
      this.form.get('componentsForm.outputsAsigned').setValue(val);
    }
  }

  fillComponents(): any[] {
    const aux = [];
    this._allProcessData?.outputs?.outputs.forEach((el) => {
      aux.push({ id: el.ouputId, percentage: el.percentageAssigned });
    });
    return aux;
  }

  fillMilestones(): void {
    const milestoneCollection = this.form.get(
      'milestonesForm.milestoneCollection'
    ) as UntypedFormArray;
    if (milestoneCollection.length <= 0) {
      this._allProcessData?.milestones?.forEach((el) => {
        const name = this.translateEnum.translateEnum(
          el.code,
          this.enumMilestones
        );
        const actualDate =
          el.actualDate !== null ? new Date(el.actualDate) : null;
        const estimatedDate =
          el.estimatedDate !== null ? new Date(el.estimatedDate) : null;
        const reEstimateDate =
          el.reEstimateDate !== null ? new Date(el.reEstimateDate) : null;
        const newMilestone = createMilestones();
        newMilestone.get('actualDate').setValue(actualDate);
        newMilestone.get('code').setValue(el.code);
        newMilestone.get('initialEstimationDate').setValue(estimatedDate);
        newMilestone.get('name').setValue(name);
        newMilestone.get('order').setValue(el.order);
        newMilestone.get('reEstimateDate').setValue(reEstimateDate);
        newMilestone.get('tooltip').setValue(el.id);
        milestoneCollection.push(newMilestone);
      });
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  get outputsAsigned() {
    return this.componentsForm.get('outputsAsigned') as UntypedFormArray;
  }

  get processForm() {
    return this.form.get('processForm') as UntypedFormGroup;
  }

  get componentsForm() {
    return this.form.get('componentsForm') as UntypedFormGroup;
  }

  get adittionalInfo() {
    return this.form.get('adittionalInfo') as UntypedFormGroup;
  }

  get commentsProcess() {
    return this.form.get('commentsProcess') as UntypedFormGroup;
  }

  get costDistributionForm() {
    return this.form.get('costDistributionForm') as UntypedFormGroup;
  }

  get milestonesForm() {
    return this.form.get('milestonesForm') as UntypedFormGroup;
  }

  get milestonesArray() {
    return this.milestonesForm.get('milestoneCollection') as UntypedFormArray;
  }

  get processFormCategory() {
    return this.processForm.get('category') as UntypedFormControl;
  }

  get processFormAcquisition() {
    return this.processForm.get('procurementMethod') as UntypedFormControl;
  }

  get processFormMonitoring() {
    return this.processForm.get('supervisionType') as UntypedFormControl;
  }

  get sustainabilityForm() {
    return this.form.get('sustainabilityForm') as UntypedFormGroup;
  }

  resetCostComponentMilestones(bool: boolean = false): void {
    this.thresholds = null;
    this.nationalBiddingThreshold = null;
    if (bool) {
      this.componentsForm.reset();
    }
    this.milestonesForm.reset();
  }

  resetCategoryForm(): void {
    this.subscription.add(
      this.processFormCategory.valueChanges.subscribe(() => {
        this.processFormAcquisition.reset();
        this.processFormMonitoring.reset();
        this.resetCostComponentMilestones();
        while (this.milestonesArray.length > 0) {
          this.milestonesArray.removeAt(this.milestonesArray.length - 1);
        }
        this.checkShowLots();
      })
    );
  }

  checkShowLots(): void {
    if (
      CategoryProcurement.PROCT_INDCST ===
      this.processFormCategory.getRawValue()
    ) {
      this.adittionalInfo.get('lots').setValue(null);
      this.showLots = false;
    } else {
      this.showLots = true;
    }
  }

  resetAcquisitionForm(): void {
    this.subscription.add(
      this.processFormAcquisition.valueChanges.subscribe(() => {
        this.processFormMonitoring.reset();
        this.resetCostComponentMilestones();
      })
    );
  }

  resetMonitoringForm(): void {
    this.subscription.add(
      this.processFormMonitoring.valueChanges.subscribe(() => {
        this.resetCostComponentMilestones();
      })
    );
  }

  resetOutputs(): void {
    this.subscription.add(
      this.componentsForm.get('component').valueChanges.subscribe(() => {
        while (this.outputsAsigned.controls.length > 1) {
          this.outputsAsigned.removeAt(this.outputsAsigned.controls.length - 1);
        }
        this.outputsAsigned.reset();
        this.totalAssigned = 100;
      })
    );
  }

  initProjectParams(): void {
    const sub = this.projectStoreSvc.selectedProject().subscribe((data) => {
      if (data.selectedProject) {
        this.countryCode = data.selectedProject.countryCode;
        this.projectBucketId = data.selectedProject.projectBucketId;
        this.attributeCountry = {
          key: 'countryCode',
          value: this.countryCode,
        };
      }
    });
    this.subscription.add(sub);
  }

  getCategoriesList$(): Observable<KeyValue[]> {
    const data: Category[] = [];
    for (const value in CategoryProcurement) {
      data.push({
        key: 'category',
        value,
      });
    }
    return from([data]);
  }

  populateEnums(): void {
    this.subscription.add(
      this.enumStoreSvc.selectEnums().subscribe((data) => {
        if (data.biddingProcessProcurementProcessGoodsReferences) {
          this.radioOptions =
            data.biddingProcessProcurementProcessGoodsReferences;
        }
        if (data.projectTaskTypes && data.projectTaskTypes.length >= 1) {
          this.taskTypes = data.projectTaskTypes;
          this.components$ = this.getComponents();
        }
        if (data.commentVisibilities) {
          this.commentVisibilities = data.commentVisibilities;
        }
      })
    );
  }

  getTenderMethodList$(): Observable<KeyValue[]> {
    return from([[]]);
  }

  getGroupMethod(methodName: string): KeyValueInput {
    let groupGeneral: ProcurementGroupMethod = null;
    groupGeneral = this.procurementGroups.find((group) => {
      return group.methods.find((method) => {
        return method === methodName;
      });
    });
    if (groupGeneral) {
      return {
        key: 'groupMethod',
        value: groupGeneral.name,
      };
    } else {
      return {
        key: '',
        value: '',
      };
    }
  }

  initGroupMethodArray(): ProcurementGroupMethod[] {
    const procurementGroups: ProcurementGroupMethod[] = [];
    const attributes: KeyValueInput[] = [];
    this.subscription.add(
      this.configSvc
        .settings(
          attributes,
          SettingActionType.Partial,
          SettingType.GroupMethod
        )
        .subscribe((data: GetSettingsResponse) => {
          const settings = data.settings;
          if (settings) {
            settings.forEach((element) => {
              const inputstring = element.values;
              const formatedString = inputstring.replace(/\\"/g, '"');
              const objectValues = JSON.parse(formatedString);
              procurementGroups.push({
                name: element.attributes[0].value,
                methods: Object.values(objectValues)[0] as Array<string>,
              });
            });
          }
        })
    );
    return procurementGroups;
  }

  valueChange(event): void {
    const eventName = event.event;
    const dropdownValue = event.dropdownValue;
    const attribute: KeyValueInput = { key: '', value: '' };
    this.milestonesArray.clear();
    this.resetCostComponentMilestones();
    this.warningMessage = '';
    if (dropdownValue === 'category') {
      this.resetCostComponentMilestones(true);
      this.supervisionMethods$ = of([]);
      this.setFieldsVisibility([]);
      attribute.key = 'category';
      attribute.value = eventName;
      const differentiatorParameter: KeyValueInput = {
        key: 'onlyMethods',
        value: 1,
      };
      this.attributeCategory = attribute;
      this.procurementMethods$ =
        this.procurementFormSvc.queryProcurementMethods(
          this.attributeCountry,
          this.attributeCategory,
          differentiatorParameter
        );
    } else {
      if (dropdownValue === 'procurementMethod') {
        this.setFieldsVisibility([]);
        this.attributeGroupMethod = this.getGroupMethod(eventName);
        attribute.key = 'procurementMethod';
        attribute.value = eventName;

        this.attributeProcurementMethod = attribute;
        this.supervisionMethods$ =
          this.procurementFormSvc.querySupervisionMethods(
            this.attributeCountry,
            this.attributeCategory,
            this.attributeProcurementMethod
          );
      } else {
        if (dropdownValue === 'threshold') {
          attribute.key = 'supervisionMethod';
          attribute.value = eventName;
          this.attributeSupervisionMethod = attribute;
          this.queryThresholds(
            this.attributeCountry,
            this.attributeCategory,
            this.attributeProcurementMethod,
            this.attributeGroupMethod,
            this.attributeSupervisionMethod
          );
          this.queryMilestones(
            this.attributeCategory,
            this.attributeProcurementMethod,
            this.attributeSupervisionMethod
          );
          this.queryFieldsVisibility(
            this.attributeCountry,
            this.attributeCategory,
            this.attributeProcurementMethod,
            this.attributeSupervisionMethod
          );
        }
      }
    }
  }

  getIsPROCT_PFA(): void {
    this.subscription.add(
      this.form.get('processForm').valueChanges.subscribe((data) => {
        if (data.procurementMethod === ProcurementMethodCode.PROCT_PFA) {
          this.isPROCT_PFA = true;
        } else {
          this.isPROCT_PFA = false;
        }
      })
    );
  }

  queryMilestones(
    attributeCategory: KeyValueInput,
    attributeProcurementMethod: KeyValueInput,
    attributeSupervisionMethod: KeyValueInput
  ): void {
    while (this.milestonesArray.length > 0) {
      this.milestonesArray.removeAt(this.milestonesArray.length - 1);
    }
    this.subscription.add(
      this.procurementFormSvc
        .queryMilestones(
          attributeCategory,
          attributeProcurementMethod,
          attributeSupervisionMethod
        )
        .subscribe((data: GetSettingsResponse) => {
          const settings = data.settings;
          if (settings && settings[0].values !== '') {
            const milestones = this.procurementFormSvc.milestonesFormatting(
              settings[0].values
            );
            this.procurementFormSvc.addMilestoneProcess(
              this.milestonesArray,
              milestones
            );
          }
        })
    );
  }

  queryThresholds(
    attributeCountry: KeyValueInput,
    attributeCategory: KeyValueInput,
    attributeProcurementMethod: KeyValueInput,
    attributeGroupMethod: KeyValueInput,
    attributeSupervisionMethod: KeyValueInput
  ): void {
    const attributes = this.utilsSvc.buildAttributesArray(
      SettingType.Threshold,
      attributeCountry,
      attributeCategory,
      attributeProcurementMethod,
      attributeGroupMethod,
      attributeSupervisionMethod
    );
    this.subscription.add(
      this.configSvc
        .thresholdSettings(attributes)
        .subscribe((data: Threshold) => {
          if (data) {
            this.thresholdsFormatting(data);
            this.thresholds = data;
            const isShoppingBidding =
              attributeGroupMethod.value === GroupMethodEnum.ShoppingBidding;

            if (isShoppingBidding) {
              const attributeC = JSON.parse(JSON.stringify(attributes));
              attributeC[1].value = GroupMethodEnum.NationalBidding;
              this.loadNationalBiddingThresholds(attributeC);
            }
          }
        })
    );
  }

  queryFieldsVisibility(
    attributeCountry: KeyValueInput,
    attributeCategory: KeyValueInput,
    attributeProcurementMethod: KeyValueInput,
    attributeSupervisionMethod: KeyValueInput
  ): void {
    const attributes = this.utilsSvc.buildAttributesArray(
      SettingType.MandatoryField,
      attributeCountry,
      attributeCategory,
      attributeProcurementMethod,
      null,
      attributeSupervisionMethod
    );
    this.subscription.add(
      this.configSvc
        .settings(
          attributes,
          SettingActionType.Extend,
          SettingType.MandatoryField
        )
        .subscribe((data: GetSettingsResponse) => {
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
                this.setFieldsVisibility(objectValues.fields);
              } else {
                this.setFieldsVisibility([]);
              }
            });
          }
        })
    );
  }

  setFieldsVisibility(fields: string[]): void {
    if (fields.includes(this.JUSTIFICATION_VALUE)) {
      this.justificationVisibility = true;
      this.processForm.get('justification').setValidators(Validators.required);
    } else {
      this.justificationVisibility = false;
      this.processForm.get('justification').setValidators(null);
      this.processForm.get('justification').setErrors(null);
      this.processForm.get('justification').setValue('');
    }
    if (fields.includes(this.GOODSREFERENCE_VALUE)) {
      this.goodsReferenceVisibility = true;
      this.adittionalInfo
        .get('goodsReference')
        .setValidators(Validators.required);
    } else {
      this.goodsReferenceVisibility = false;
      this.adittionalInfo.get('goodsReference').setValidators(null);
      this.adittionalInfo.get('goodsReference').setErrors(null);
      this.adittionalInfo.get('goodsReference').setValue('');
    }

    this.adittionalInfo.get('goodsReference').updateValueAndValidity();
    this.processForm.get('justification').updateValueAndValidity();
  }

  loadNationalBiddingThresholds(attributes: KeyValueInput[]): void {
    let areNationalBiddingThresholdsSet = false;
    if (this.nationalBiddingThreshold) {
      areNationalBiddingThresholdsSet =
        Boolean(this.nationalBiddingThreshold.min) &&
        Boolean(this.nationalBiddingThreshold.max);
    }

    if (!areNationalBiddingThresholdsSet) {
      const sub = this.configSvc
        .thresholdSettings(attributes)
        .subscribe((nationalBiddingThreshold: Threshold) => {
          if (nationalBiddingThreshold) {
            this.nationalBiddingThreshold = nationalBiddingThreshold;
          }
        });
      this.subscription.add(sub);
    }
  }

  thresholdsFormatting(thresholds: Threshold): void {
    if (thresholds.min !== undefined) {
      this.maxThresholdsRestriction = false;
      this.minThresholdsRestriction = true;
    } else {
      this.maxThresholdsRestriction = true;
      this.minThresholdsRestriction = false;
    }
  }

  getComponents(): Observable<IdNameString[]> {
    const componentType = this.taskTypes.findIndex((type) =>
      type.name.endsWith('COMPONENT')
    );

    return this.projectsApi
      .getProjectTasks(this.projectBucketId, componentType)
      .pipe(this.mapProjectTask());
  }

  selectComponent(event: string): void {
    this.selectedOutputs$ = this.procurementFormSvc.getAvailableOutputs(
      event,
      this.taskTypes
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

  addOutputFormGroup(): void {
    this.outputsAsigned.push(createProcessOutputs());
  }

  calcTotal(index?: number): void {
    let sum = 0;
    this.outputsAsigned.controls.forEach((form) => {
      sum += form.get('percentage').value;
    });
    this.totalAssigned = this.totalpercentage - sum;
    if (sum > this.totalpercentage && index) {
      this.autocorrectPercentage(sum, index);
      sum = 0;
      this.outputsAsigned.controls.forEach((form) => {
        sum += form.get('percentage').value;
      });
      this.totalAssigned = this.totalpercentage - sum;
    }
    if (this.totalAssigned > 0) {
      this.componentsForm.controls.outputsAsigned.setErrors({
        unassignedAmount: true,
      });
    }
  }

  autocorrectPercentage(sum: number, index: number): void {
    let i = 0;
    const exced = sum - this.totalpercentage;
    const replaceAmount = this.outputsAsigned.value[index].percentage - exced;
    this.outputsAsigned.controls.forEach((el) => {
      if (i === index) {
        el.get('percentage').setValue(replaceAmount);
      }
      i++;
    });
  }

  initMobileConditionals(): void {
    this.subscription.add(
      this.windowService.windowSizeChanged.subscribe((data) => {
        this.mobileView = data.mobileView;
      })
    );
  }
}
