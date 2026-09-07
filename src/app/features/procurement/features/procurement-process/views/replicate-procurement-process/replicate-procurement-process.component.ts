import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormArray,
  FormGroup,
  UntypedFormArray,
  UntypedFormGroup,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormValidationService } from '@core/services/validation';
import { VisibilityService } from '@core/services/view';
import { Observable, Subscription } from 'rxjs';
import { createProcurementForm } from '../../components/procurement-form/procurement.form';
import {
  BiddingProcessProcurementProcessDetail,
  CreateBiddingProcessRequest,
  Enumerator,
  Enums,
  GetSettingsResponse,
  KeyValue,
  KeyValueInput,
  ProcurementGroupMethod,
  Threshold,
} from '@core/models';
import { FormErrorTranslateKey } from '@core/services/validation/form-validation/formErrorTranslateKey.model';
import { GetBiddingProcessComponentResponse } from '@core/models/responses/bidding-process-component-response.model';
import { createProcessOutputs } from '../../procurement-process.form';
import {
  BiddingProcessPlanStoreService,
  EnumsStoreService,
} from '@core/services/store-services';
import { BiddingProcessPlanService } from '@core/services/apis';
import { ProcurementProcessFormService } from '../../services/procurement-process-form.service';
import { ProcessConfiguration } from '@core/services/process-configuration.service';
import {
  BiddingProcessProcurementProcessStatuses,
  PermissionEnum,
  GroupMethodEnum,
  SettingActionType,
  SettingType,
} from '@core/enums';
import { errorDefinitions } from '../process-form-validationsKeys';
import {
  FormConfig,
  ModeOfProcurementForm,
} from '../../models/form-config.model';
import { AppUtilsService } from '@fiduciary-interface/app/app-utils.service';
import { PermissionService } from '@core/services/app/permission/permission.service';
import { BiddingProcurementProcessMilestones } from '@core/models/bidding-milestones.model';
import { CanDeactivateFromGuard } from '@core/guards/canDeactivateForm.guard';
import { Store } from '@ngrx/store';
import { AppState } from '@core/store';
import { CommentsDomain } from '@fiduciary-interface/app/shared/components/dialog-comments/models';

@Component({
  selector: 'fi-replicate-procurement-process',
  templateUrl: './replicate-procurement-process.component.html',
})
export class ReplicateProcurementProcessComponent implements OnInit, OnDestroy {
  @ViewChild('divForm') divForm: ElementRef;
  hidden = false;
  form: UntypedFormGroup = createProcurementForm();
  allProcessData: BiddingProcessProcurementProcessDetail;
  component: GetBiddingProcessComponentResponse = null;
  private readonly subscription = new Subscription();
  public taskTypes: Enumerator[];
  public errorListTitle = 'COMMON.VALIDATION_ERRORS_TITLE';
  JUSTIFICATION_VALUE = 'Justification';
  GOODSREFERENCE_VALUE = 'GoodsReference';
  mobileView = false;
  public errorKeys: FormErrorTranslateKey[] = [];

  formErrorCollection: FormErrorTranslateKey[] = [];

  biddingProcessId = '';
  procurementProcess: CreateBiddingProcessRequest;

  procurementMethods$: Observable<Array<KeyValue>>;
  supervisionMethods$: Observable<Array<KeyValue>>;

  public attributeCountry: KeyValueInput;
  public attributeCategory: KeyValueInput;
  public attributeProcurementMethod: KeyValueInput;
  public attributeSupervisionMethod: KeyValueInput;
  public attributeGroupMethod: KeyValueInput;
  public thresholds: Threshold = { min: 0, max: 0 };
  public nationalBiddingThreshold: Threshold = { min: 0, max: 0 };

  justificationVisibility: boolean;
  goodsReferenceVisibility: boolean;

  public selectedOutputs$: Observable<any>;
  public milestone: BiddingProcurementProcessMilestones[];

  outputsAsigned: UntypedFormArray = new UntypedFormArray([]);
  isLoading = true;
  isButtonDisabled = false;
  milestonesCode: Enumerator[];
  justification: string;
  procurementProcessRequest: CreateBiddingProcessRequest;
  public procurementGroups: ProcurementGroupMethod[];
  biddingProcessStatus: BiddingProcessProcurementProcessStatuses;
  warningMessage: string;

  Enums = Enums;
  isEnumLoaded = false;
  isProjectLoading = true;

  formConfig: FormConfig = {
    commentsSection: {
      isDisabled: false,
    },
    costDistributionSection: {
      isDisabled: false,
      justification: '',
    },
    outputsSection: {
      isDisabled: false,
    },
    milestoneSection: {
      isActualDateDisabled: false,
      isActualDateVisible: false,
      isEstimatedDateDisabled: false,
      isEstimatedDateVisible: false,
      isReEstimatedDateDisabled: false,
      isReEstimatedDateVisible: false,
      disabledRestimatedDates: [],
    },
    mode: ModeOfProcurementForm.CREATE,
  };

  updateProcessButtonPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
    PermissionEnum.ENTERPROCUREMENTCOMMENTS,
  ];
  cancelButtonPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
    PermissionEnum.ENTERPROCUREMENTCOMMENTS,
  ];
  saveCommentButtonPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
    PermissionEnum.ENTERPROCUREMENTCOMMENTS,
  ];

  hasEditProcurementProcessPermission: boolean;
  isDisabledCommentPermission: boolean;
  processStatus: number;
  isInternal: boolean;
  displayUpdteProcessAndCancelBtn: boolean;
  displaySaveCommentAndCancelBtn: boolean;
  focusComments = false;
  countryCode: string;
  projectBucketId: string;

  constructor(
    private readonly formSvc: FormValidationService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly visibilityService: VisibilityService,
    private readonly biddingProcessFormSvc: ProcurementProcessFormService,
    private readonly enumStoreSvc: EnumsStoreService,
    private readonly biddingProcessPlanSvc: BiddingProcessPlanService,
    private readonly configSvc: ProcessConfiguration,
    private readonly biddingProcessPlanStoreSvc: BiddingProcessPlanStoreService,
    private readonly permissionSvc: PermissionService,
    private readonly utilsSvc: AppUtilsService,
    private readonly canDeactivateFromGuard: CanDeactivateFromGuard,
    readonly store: Store<AppState>,
    private readonly biddingStoreSvc: BiddingProcessPlanStoreService
  ) {}

  get comments(): UntypedFormArray {
    return this.form.get('commentsProcess.commentsList') as UntypedFormArray;
  }

  ngOnInit(): void {
    this.loadProcurementProcessId(
      this.activatedRoute.snapshot.params.processId
    );

    this.visibilityServices();
    this.checkIsInternal();

    this.setAttributeCountry();
    this.procurementGroups = this.initGroupMethodArray();

    this.hasEditProcurementProcessPermission =
      this.checkEditProcurementProcessPermission();
    this.isDisabledCommentPermission = this.checkDisabledCommentPermission();
    this.getFocusComments();
  }

  loadProcurementProcessId(processProcurementProcessId: string): void {
    this.biddingStoreSvc.getBiddingProcessByIdAction(
      processProcurementProcessId
    );
  }

  getFocusComments(): void {
    const sub = this.store
      .select('procurementProcessHeader')
      .subscribe((FocusComments) => {
        this.focusComments = FocusComments.FocusComments;
      });
    sub.unsubscribe();
  }

  focusCommentsSection(): void {
    setTimeout(() => {
      document.getElementById('commentsSection').scrollIntoView();
    }, 1500);
  }

  checkIsInternal(): void {
    const sub = this.store.select('contact').subscribe((data) => {
      this.isInternal = data.contact.is_internal;
    });
    this.subscription.add(sub);
  }

  checkUpdateProcessAndCancelBtnVisibility(): void {
    if (this.isInternal) {
      this.displayUpdteProcessAndCancelBtn = false;
    } else {
      const statusesNotDisplayBtn = [
        BiddingProcessProcurementProcessStatuses.UNDER_REVIEW,
        BiddingProcessProcurementProcessStatuses.UNDER_REVIEW_MODIFIED,
      ];

      if (!statusesNotDisplayBtn.includes(this.processStatus)) {
        this.displayUpdteProcessAndCancelBtn = true;
      } else {
        this.displayUpdteProcessAndCancelBtn = false;
      }
    }
  }

  checkSaveCommentAndCancelBtnVisibility(): void {
    if (this.isInternal) {
      const statusesNotDisplayBtn = [
        BiddingProcessProcurementProcessStatuses.DELETED,
        BiddingProcessProcurementProcessStatuses.DRAFT,
        BiddingProcessProcurementProcessStatuses.CANCELLED,
        BiddingProcessProcurementProcessStatuses.UNSUCCESFUL_PROCESS,
        BiddingProcessProcurementProcessStatuses.PROCUREMENT_INELIGIBLE,
        BiddingProcessProcurementProcessStatuses.REJECTION_BIDS,
        BiddingProcessProcurementProcessStatuses.CONTRACT_TERMINATED,
      ];

      if (!statusesNotDisplayBtn.includes(this.processStatus)) {
        this.displaySaveCommentAndCancelBtn = true;
      } else {
        this.displaySaveCommentAndCancelBtn = false;
      }
    } else {
      const statusesDisplayBtn = [
        BiddingProcessProcurementProcessStatuses.UNDER_REVIEW,
        BiddingProcessProcurementProcessStatuses.UNDER_REVIEW_MODIFIED,
      ];
      if (statusesDisplayBtn.includes(this.processStatus)) {
        this.displaySaveCommentAndCancelBtn = true;
      } else {
        this.displaySaveCommentAndCancelBtn = false;
      }
    }
  }

  visibilityServices(): void {
    this.visibilityService.setVisiblityProjectHeader(false);
    this.visibilityService.setVisiblityProcessHeader(false);
    this.biddingProcessId = this.activatedRoute.snapshot.params.processId;
    this.visibilityService.breadcrumbService.set(
      '@replicateProcurement',
      'BREADCRUMB.NEW_ACQUISITION_PROCESS'
    );
    this.visibilityService.breadcrumbService.set('@adquisitionProcess', {
      skip: true,
    });
  }

  setAttributeCountry(): void {
    const sub = this.biddingProcessFormSvc.projectStoreSvc
      .selectedProject()
      .subscribe((data) => {
        if (data && data.selectedProject) {
          this.projectBucketId = data.selectedProject.projectBucketId;
          this.countryCode = data.selectedProject.countryCode;
          this.isProjectLoading = data.loading;
          this.attributeCountry = {
            key: 'countryCode',
            value: data.selectedProject.countryCode,
          };
        }
      });
    this.subscription.add(sub);
  }

  initGroupMethodArray(): ProcurementGroupMethod[] {
    const procurementGroups: ProcurementGroupMethod[] = [];
    const attributes: KeyValueInput[] = [];
    this.configSvc
      .settings(attributes, SettingActionType.Partial, SettingType.GroupMethod)
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
          this.procurementGroups = procurementGroups;
          this.populateForm();
        }
      });
    return procurementGroups;
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

  ngOnDestroy(): void {
    this.visibilityService.setVisiblityProjectHeader(true);
    this.visibilityService.setVisiblityProcessHeader(false);
    this.subscription.unsubscribe();
    this.visibilityService.breadcrumbService.set('@adquisitionProcess', {
      skip: false,
    });
  }

  populateForm(): void {
    this.subscription.add(
      this.enumStoreSvc.selectEnums().subscribe((data) => {
        const categoryEnum =
          data.enumsLoaded[Enums.biddingProcessProcurementProcessCategories];
        const supervisionMethodEnum =
          data.enumsLoaded[
            Enums.biddingProcessProcurementProcessSupervisionMethods
          ];
        const procurementEnum =
          data.enumsLoaded[
            Enums.biddingProcessProcurementProcessProcurementMethods
          ];
        const taskTypesEnum = data.enumsLoaded[Enums.projectTaskTypes];
        const commnetsVisibility = data.enumsLoaded[Enums.commentVisibilities];
        const milestonesCodeEnum =
          data.enumsLoaded[Enums.biddingProcessMilestoneCodes];
        const goodsRefecencesEnum =
          data.enumsLoaded[
            Enums.biddingProcessProcurementProcessGoodsReferences
          ];

        this.taskTypes = data.projectTaskTypes;
        this.milestonesCode = data.biddingProcessMilestoneCodes;

        this.isEnumLoaded =
          categoryEnum &&
          taskTypesEnum &&
          supervisionMethodEnum &&
          procurementEnum &&
          milestonesCodeEnum &&
          goodsRefecencesEnum &&
          commnetsVisibility;

        if (this.isEnumLoaded) {
          this.taskTypes = data.projectTaskTypes;
          this.milestonesCode = data.biddingProcessMilestoneCodes;
          this.biddingProcessFormSvc
            .getProcurementProcessDetail(this.biddingProcessId)
            .subscribe((data) => {
              if (data) {
                this.processStatus = data.process.status;
                this.allProcessData = data;
                this.initDropdowns(data);
                this.getProcurementMethods();
                this.biddingProcessFormSvc
                  .getFieldsVisibility(
                    this.attributeCountry,
                    this.attributeCategory,
                    this.attributeProcurementMethod,
                    this.attributeSupervisionMethod,
                    this.allProcessData,
                    this.form
                  )
                  .subscribe(
                    ({ justificationVisibility, goodsReferenceVisibility }) => {
                      this.justificationVisibility = justificationVisibility;
                      this.goodsReferenceVisibility = goodsReferenceVisibility;
                    }
                  );
                this.getSupervisionMethods();
                this.getThresholds();
                this.getOutputs(data, false);
                this.biddingProcessFormSvc.fillForm(
                  this.form,
                  data,
                  this.milestonesCode
                );
                this.milestone = data.milestones;
                this.formConfig.mode = ModeOfProcurementForm.CREATE;
                setTimeout(() => {
                  this.getOutputs(data, true);
                }, 500);
              }
            })
            .add(() => {
              this.isLoading = false;
              if (this.focusComments) {
                this.focusCommentsSection();
              }
              this.checkUpdateProcessAndCancelBtnVisibility();
              this.checkSaveCommentAndCancelBtnVisibility();

              const milestonesFormArray = this.form.get(
                'milestonesForm.milestoneCollection'
              ) as FormArray;

              milestonesFormArray.controls.forEach(
                (milestoneGroup: FormGroup) => {
                  milestoneGroup.patchValue({
                    reEstimateDate: null,
                    actualDate: null,
                  });
                }
              );
            });
        }
      })
    );
  }

  initDropdowns(data: BiddingProcessProcurementProcessDetail): void {
    this.attributeCategory = {
      key: 'category',
      value: data.process.category.name,
    };
    this.attributeProcurementMethod = {
      key: 'procurementMethod',
      value: data.process.procurementMethod.name,
    };
    this.attributeSupervisionMethod = {
      key: 'supervisionMethod',
      value: data.process.supervisionMethod.name,
    };
  }

  getThresholds(): void {
    const attributes = this.utilsSvc.buildAttributesArray(
      SettingType.Threshold,
      this.attributeCountry,
      this.attributeCategory,
      this.attributeProcurementMethod,
      this.attributeGroupMethod,
      this.attributeSupervisionMethod
    );
    this.configSvc
      .thresholdSettings(attributes)
      .subscribe((data: Threshold) => {
        if (data !== undefined) {
          this.thresholds = data;
          const isShoppingBidding =
            this.attributeGroupMethod.value === GroupMethodEnum.ShoppingBidding;

          if (isShoppingBidding) {
            const attributeC = JSON.parse(JSON.stringify(attributes));
            attributeC[1].value = GroupMethodEnum.NationalBidding;
            this.loadNationalBiddingThresholds(attributeC);
          }
        }
      });
  }

  loadNationalBiddingThresholds(attributes: KeyValueInput[]): void {
    let areNationalBiddingThresholdsSet = false;
    if (this.nationalBiddingThreshold) {
      areNationalBiddingThresholdsSet =
        Boolean(this.nationalBiddingThreshold.min) &&
        Boolean(this.nationalBiddingThreshold.max);
    }

    if (!areNationalBiddingThresholdsSet) {
      this.configSvc
        .thresholdSettings(attributes)
        .subscribe((nationalBiddingThreshold: Threshold) => {
          if (nationalBiddingThreshold) {
            this.nationalBiddingThreshold = nationalBiddingThreshold;
          }
        });
    }
  }

  getSupervisionMethods(): void {
    this.supervisionMethods$ =
      this.biddingProcessFormSvc.querySupervisionMethods(
        this.attributeCountry,
        this.attributeCategory,
        this.attributeProcurementMethod
      );
  }

  getProcurementMethods(): void {
    const differentiatorParameter: KeyValueInput = {
      key: 'onlyMethods',
      value: 1,
    };
    this.procurementMethods$ =
      this.biddingProcessFormSvc.queryProcurementMethods(
        this.attributeCountry,
        this.attributeCategory,
        differentiatorParameter
      );
    this.attributeGroupMethod = this.getGroupMethod(
      this.attributeProcurementMethod.value.toString()
    );
  }

  getOutputs(
    data: BiddingProcessProcurementProcessDetail,
    onInit: boolean
  ): void {
    if (onInit) {
      data.outputs.outputs.forEach((data) => {
        const Output = createProcessOutputs();
        Output.setValue({
          id: data.ouputId,
          percentage: data.percentageAssigned,
        });
        this.outputsAsigned.push(Output);
      });
      this.selectedOutputs$ = this.biddingProcessFormSvc.getAvailableOutputs(
        data.outputs.componentId,
        this.taskTypes
      );
    }
  }

  navigateToProcurement(): void {
    this.router.navigate(['.'], {
      relativeTo: this.activatedRoute.parent.parent.parent,
    });
  }

  submit(navigate: boolean): void {
    this.isButtonDisabled = true;
    this.formSvc.errorList = [];
    this.formErrorCollection = this.formSvc.validateForm(
      this.form,
      errorDefinitions
    );
    this.subscription.add(
      this.enumStoreSvc.selectEnums().subscribe((data) => {
        if (
          data.biddingProcessProcurementProcessCategories &&
          data.biddingProcessProcurementProcessProcurementMethods &&
          data.biddingProcessProcurementProcessSupervisionMethods &&
          data.biddingProcessMilestoneCodes
        ) {
          this.procurementProcess =
            this.biddingProcessFormSvc.procurementRequest(
              this.form,
              this.countryCode,
              data.biddingProcessProcurementProcessCategories,
              data.biddingProcessProcurementProcessProcurementMethods,
              data.biddingProcessProcurementProcessSupervisionMethods,
              data.biddingProcessMilestoneCodes
            );
          if (this.formErrorCollection.length === 0) {
            this.form.markAsPristine();
            if (navigate) {
              this.isLoading = true;
            } else {
              this.divForm.nativeElement.classList.add('hide');
              this.hidden = true;
            }
            this.biddingProcessPlanSvc
              .createBiddingProcessProcurementProcess(
                this.projectBucketId,
                this.procurementProcess
              )
              .subscribe(
                (response: string) => {
                  if (typeof response === 'string') {
                    this.isButtonDisabled = false;
                    this.biddingProcessPlanStoreSvc.reloadProcessesAction();
                    this.biddingProcessFormSvc.successMessage();
                    if (navigate) {
                      this.navigateToProcurement();
                    }
                  } else {
                    this.biddingProcessFormSvc.errorMessage();
                    this.isButtonDisabled = false;
                    throw new Error('Data is not an string');
                  }
                },
                () => {
                  this.biddingProcessFormSvc.errorMessage();
                  this.isButtonDisabled = false;
                }
              )
              .add(() => {
                this.isLoading = false;
                this.hidden = false;
                this.divForm.nativeElement.classList.remove('hide');
              });
          } else {
            this.isButtonDisabled = false;
            document.getElementById('top').scrollIntoView();
          }
        }
      })
    );
  }

  saveComments(): void {
    this.isButtonDisabled = true;
    this.formSvc.errorList = [];
    this.formErrorCollection = this.formSvc.validateForm(
      this.form,
      errorDefinitions
    );
    if (this.formErrorCollection.length === 0) {
      this.isLoading = true;
      const commentsRequest = this.biddingProcessFormSvc.mapPostComments(
        this.form
      );

      this.form.markAsPristine();

      this.subscription.add(
        this.biddingProcessPlanSvc
          .updateProcessProcurementProcessComments(
            CommentsDomain.BIDDINGPROCESSPROCUREMENTPROCESS,
            this.biddingProcessId,
            commentsRequest
          )
          .subscribe(
            () => {
              this.biddingProcessFormSvc.successSaveCommentMessage();
              this.navigateToProcurement();
              this.biddingProcessPlanStoreSvc.reloadProcessesAction();
              this.biddingProcessPlanStoreSvc.getBiddingProcessByIdAction(
                this.biddingProcessId
              );
            },
            () => {
              this.biddingProcessFormSvc.errorSaveCommentMessage();
            }
          )
          .add(() => {
            this.isLoading = false;
            this.isButtonDisabled = false;
          })
      );
    } else {
      this.isButtonDisabled = false;
      document.getElementById('top').scrollIntoView();
    }
  }

  checkEditProcurementProcessPermission(): boolean {
    return this.permissionSvc.hasPermission(
      PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION
    );
  }

  checkDisabledCommentPermission(): boolean {
    const enterCommentPermission = this.permissionSvc.hasPermission(
      PermissionEnum.ENTERPROCUREMENTCOMMENTS
    );
    const enterUpdateProcurementInformation = this.permissionSvc.hasPermission(
      PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION
    );
    return (
      !(enterCommentPermission || enterUpdateProcurementInformation) ||
      this.formConfig.commentsSection.isDisabled
    );
  }

  canDeactivate(): boolean | Observable<boolean | Observable<boolean>> {
    return this.canDeactivateFromGuard.openModalLogic(this.form);
  }
}
