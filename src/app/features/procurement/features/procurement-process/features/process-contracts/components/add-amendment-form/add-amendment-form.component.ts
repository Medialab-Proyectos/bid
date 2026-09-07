import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  BiddingContractApiService,
  GeneralProcurementDocumentsApiService,
  WorkflowApiService,
} from '@core/services/apis';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import {
  AmendmentRequest,
  BiddingContractByProcess,
  BiddingContractResponse,
  BiddingProcessPlan,
  BiddingProcessProcurementProcess,
  CostDistributionModel,
  DialogResponse,
  Enums,
  FiduciaryProcessDocument,
  FiduciaryProcessDocumentGroup,
  ModalOptions,
} from '@core/models';
import {
  PermissionEnum,
  BiddingContractStatusesEnum,
  BiddingProcurementProcessSupervisionMethods,
  DocumentDomain,
  ModeAmendmentEnum,
  ProcurementProcessCategoriesEnum,
  WorkflowIdEntityType,
  WorkflowEntityScreen,
  WorkflowModuleEnum,
  DocEnum,
  BiddingContractAmendmentDocumentGroupCode,
  BiddingProcessProcurementProcessStatuses,
  WorkflowCommentStatusEnum,
  BiddingProcessPlanStatus,
} from '@core/enums';
import { createAddAmendmentForm } from './add-amendment-form.form';
import {
  BiddingProcessPlanStoreService,
  ProjectStoreService,
} from '@core/services/store-services';
import { FormErrorTranslateKey } from '@core/services/validation/form-validation/formErrorTranslateKey.model';
import { DatePipe } from '@angular/common';
import { FormValidationService } from '@core/services/validation';
import {
  FormGroup,
  UntypedFormControl,
  UntypedFormGroup,
} from '@angular/forms';
import { validateDocumentMandatory } from '@fiduciary-interface/app/shared/components/documents/components/document-group-section/document-group-section.form';
import { merge, Observable, of, Subscription } from 'rxjs';
import { ContractSecurities } from '@core/models/components/process-contract/contract-securities.model';
import { ContractsLotsData } from '@core/models/components/process-contract/contract-lots.model';
import { ContractAmountData } from '@core/models/components/process-contract/contract-amount.model';
import { AmendmentLastResponse } from '@core/models/responses/amendments-response.model';
import { filter, map, mergeMap, switchMap, take } from 'rxjs/operators';
import { WorkflowSharedService } from '@fiduciary-interface/app/shared/components/flows-sticky-footer/services';
import { AppStateWithUsrPreferences } from '@core/store';
import { Store } from '@ngrx/store';
import { FillFormService } from '../../services/fill-form.service';
import { PermissionService } from '@core/services/app/permission/permission.service';
import { PopupNotificationService } from '@fiduciary-interface/app/shared/services/popup.service';
import { NotificationsService } from '@fiduciary-interface/app/shared/services/notifications.service';

@Component({
  selector: 'fi-add-amendment-form',
  templateUrl: './add-amendment-form.component.html',
})
export class AddAmendmentFormComponent implements OnInit, OnDestroy {
  private readonly suscription = new Subscription();
  private readonly ORIGINAL_CONTRACT_PERCENTAGE = 0.15;
  modeDocSection = DocEnum.AMENDMENTS;
  @Input() form = createAddAmendmentForm();
  @Input() amendment: AmendmentLastResponse;
  @Input() mode: string;
  @Input() projectBucketId: string;
  @Input() instAcronym: string;
  @Input() projectContractId: string;
  @Input() isAdd: boolean;
  @Input() procurementProcess: BiddingProcessProcurementProcess;
  @Input() originalContract: BiddingContractResponse;

  @Input() set selectedContract(_selectedContract: BiddingContractByProcess) {
    if (_selectedContract) {
      this._selectedContract = _selectedContract;
      this.canEdit = this.checkIsAbleToEdit();
      this.canConfirm = this.checkIsAbleToConfirm();
      this.selectedContractTotalAmount =
        _selectedContract?.idbAmount +
        _selectedContract?.cofinancedAmount +
        _selectedContract?.localCounterpartAmount;
    }
  }

  amendmentRequest: AmendmentRequest;
  amendmentCostDistribution = null;
  currencies: ContractAmountData[] = [];
  lots: ContractsLotsData[] = [];
  securities: ContractSecurities[] = [];
  _selectedContract: BiddingContractByProcess;
  costAmounts: CostDistributionModel;
  percentageContractAmendment: string;
  updatedDatesBoolean: boolean;
  differentEndDate: boolean;
  differentStartDate: boolean;
  fifteenPercent: boolean;

  contractId: string = this.activatedRoute.snapshot.params.contractId;
  amendmentRouteId: string = this.activatedRoute.snapshot.params.amendmentId;
  amendmentId: string;
  canConfirm: boolean;
  canEdit: boolean;
  readOnly: boolean;
  isUploading: boolean;
  isSubmitting: boolean;
  isButtonDisabled: boolean;
  showLotsUnits: boolean;
  documentDomain = DocumentDomain.AMENDMENTDOCUMENTGROUP;
  groupEnum = Enums.biddingContractDocumentGroupCodes;
  permissions: PermissionEnum[] = [PermissionEnum.SPECIAL];
  documentsToUpload: FiduciaryProcessDocument[] = [];
  actualGroups: FiduciaryProcessDocumentGroup[];
  selectedLanguage: string;
  isLoadingInternalReview = false;
  processPlan: BiddingProcessPlan;
  planNotInSync: boolean;
  planLoading: boolean;

  public secondStep = false;

  isAmountHigher: boolean;
  isExAnte: boolean;
  selectedContractTotalAmount: number;
  totalAmount: number;
  updateContractDates: string;

  formErrorCollection: FormErrorTranslateKey[] = [];
  errorDefinitions = {
    'undefined-startDateGreaterThanEndDate': this.translate.instant(
      'CONTRACT.VALIDATION_ERRORS.END_DATE_LOWER_START_DATE'
    ),
    'attachments-requiredDocumentError': this.translate.instant(
      'CONTRACT.VALIDATION_ERRORS.REQUIRED_DOCUMENTS'
    ),
  };
  errorListTitle = 'COMMON.VALIDATION_ERRORS_TITLE';
  savedAmendmendId: string;

  nextButtonPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  saveButtonPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  cancelButtonPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  confirmButtonPermission: PermissionEnum[] = [
    PermissionEnum.SEND_OFFICIAL_PROCUREMENT_COMUNICATIONS,
  ];
  amendmentSendNotificationButtonPermission: PermissionEnum[] = [
    PermissionEnum.SEND_INTERNAL_NOTIFICATIONS,
  ];
  viewDocumentPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  editDocumentPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  deleteDocumentPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];

  constructor(
    readonly biddingContractApiSvc: BiddingContractApiService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly translate: TranslateService,
    readonly notificationGlobalSvc: NotificationGlobalService,
    readonly router: Router,
    private readonly datePipe: DatePipe,
    private readonly validationSvc: FormValidationService,
    private readonly biddingProcessStore: BiddingProcessPlanStoreService,
    private readonly documentsApi: GeneralProcurementDocumentsApiService,
    private readonly workflowSharedSvc: WorkflowSharedService,
    private readonly workflowApi: WorkflowApiService,
    readonly route: ActivatedRoute,
    readonly storePreferences: Store<AppStateWithUsrPreferences>,
    readonly fillAmenmendtForm: FillFormService,
    readonly projectStore: ProjectStoreService,
    private readonly permissionSvc: PermissionService,
    readonly popupService: PopupNotificationService,
    readonly notificationService: NotificationsService
  ) {}

  ngOnInit(): void {
    this.planLoading = true;
    this.biddingProcessStore
      .getOrLoadBiddingProcessPlan()
      .pipe(filter((data) => data.biddingPlanState.biddingProcessPlan !== null))
      .pipe(map((data) => data.biddingPlanState.biddingProcessPlan))
      .pipe(take(1))
      .subscribe((data) => {
        this.planLoading = false;
        this.processPlan = data;
        this.planNotInSync =
          this.processPlan.status !== BiddingProcessPlanStatus.IN_SYNC;
        this.checkMode();
      });
    setTimeout(() => {
      this.initializeDifferentsBooleans();
    }, 1000);
    this.getCurrentLang();
    this.setUnitFieldVisibility();
    this.calculateCostDistributions();
    this.checkIfFillForm();
    setTimeout(() => {
      this.listenCostChanges();
    }, 2000);
    if (this.amendment.id) {
      this.chargeGroups();
      this.loadWorkflowActions();
    }

    this.listenDatesChanges();
    this.listenChangesNonObjection();

    setTimeout(() => {
      this.modifyGroups();
    }, 1000);
  }

  modifyGroups(): void {
    this.fifteenPercent =
      this.isAmountHigher ||
      ((this.differentStartDate || this.differentEndDate) &&
        this.checkSUpervisionMethodAndAmendmentStatus());
    this.updatedDatesBoolean = this.differentStartDate || this.differentEndDate;
    this.attachmentForm.setValue(
      this.removeUnnecesaryGroups(this.fifteenPercent, this.actualGroups)
    );
  }

  initializeDifferentsBooleans(): void {
    const datesForms = this.form.get('dateUpdateForm') as FormGroup;
    this.differentEndDate = this.formatDatesToString(datesForms, 'endDate');
    this.differentStartDate = this.formatDatesToString(datesForms, 'startDate');
  }

  formatDatesToString(formGroup: FormGroup, param: string): boolean {
    const date = formGroup.get(param).value;
    const amendmentDate = this.shortDate(date);
    const contractDate = this.shortDate(this.originalContract[param]);
    return amendmentDate !== contractDate;
  }

  shortDate(date: string | Date): string {
    return this.removeHours(new Date(date));
  }

  padTo2Digits(num: number): string {
    return num.toString().padStart(2, '0');
  }

  removeHours(date: Date): string {
    return [
      date.getFullYear(),
      this.padTo2Digits(date.getMonth() + 1),
      this.padTo2Digits(date.getDate()),
    ].join('-');
  }

  checkSUpervisionMethodAndAmendmentStatus(): boolean {
    return (
      this.isExAnte &&
      (this.amendment.status ===
        BiddingContractStatusesEnum.PENDING_SIGNATURE ||
        this.amendment.status ===
          BiddingContractStatusesEnum.RETURNED_WITH_COMMENTS ||
        this.amendment.status ===
          BiddingContractStatusesEnum.AMENDMENT_UNDER_REV)
    );
  }

  listenDatesChanges(): void {
    const aux = this.form.get('dateUpdateForm') as FormGroup;
    const subEndDate = aux.get('endDate').valueChanges.subscribe((data) => {
      const amendmentEndDate = this.shortDate(data);
      const contractEndDate = this.shortDate(this.originalContract?.endDate);
      this.differentEndDate = contractEndDate !== amendmentEndDate;
    });
    this.suscription.add(subEndDate);

    const subStartDate = aux.get('startDate').valueChanges.subscribe((data) => {
      const amendmentStartDate = this.shortDate(data);
      const contractStartDate = this.shortDate(
        this.originalContract?.startDate
      );
      this.differentStartDate = amendmentStartDate !== contractStartDate;
    });
    this.suscription.add(subStartDate);
  }

  listenChangesNonObjection(): void {
    const aux = this.form.get('dateUpdateForm') as FormGroup;
    const obs1 = aux.get('endDate').valueChanges;
    const obs2 = aux.get('startDate').valueChanges;
    const obs3 = this.form.get('costDistributionForm').valueChanges;
    const sub = merge(obs1, obs2, obs3).subscribe(() => {
      this.modifyGroups();
    });
    this.suscription.add(sub);
  }

  checkIfFillForm(): void {
    if (this.secondStep) {
      this.fillAmenmendtForm.fillFormValues(this.form, this.amendment);
    }
  }

  getCurrentLang(): void {
    const sub = this.storePreferences
      .select('preferences')
      .subscribe((data) => {
        if (data.preferences.preferredLanguage) {
          this.selectedLanguage = data.preferences.preferredLanguage;
        }
      });
    this.suscription.add(sub);
  }

  listenCostChanges(): void {
    if (
      this.mode !== ModeAmendmentEnum.READ &&
      this.amendmentRouteId !== null
    ) {
      const sub = this.form
        .get('costDistributionForm')
        .valueChanges.subscribe(() => {
          this.isAmountHigher = this.calculateCurrentTotalAmount();
          this.modifyGroups();
        });
      this.suscription.add(sub);
    }
  }

  calculateCurrentTotalAmount(): boolean {
    let distributionTotalAmount = 0;
    const costDistributionForm = this.form.get('costDistributionForm');

    if (costDistributionForm.value.bidAmount === null) {
      distributionTotalAmount += this.amendment.idbAmount;
    } else {
      distributionTotalAmount += costDistributionForm.value.bidAmount;
    }

    if (costDistributionForm.value.localCounterpartAmount === null) {
      distributionTotalAmount += this.amendment.localCounterpartAmount;
    } else {
      distributionTotalAmount +=
        costDistributionForm.value.localCounterpartAmount;
    }

    if (costDistributionForm.value.cofinancingAmount === null) {
      distributionTotalAmount += this.amendment.cofinancedAmount;
    } else {
      distributionTotalAmount += costDistributionForm.value.cofinancingAmount;
    }
    return this.setIsAmountHigher(distributionTotalAmount);
  }

  removeUnnecesaryGroups(
    isAmountHigher: boolean,
    actualGroups: FiduciaryProcessDocumentGroup[]
  ): FiduciaryProcessDocumentGroup[] {
    if (this.amendment.status !== BiddingContractStatusesEnum.SIGNED) {
      if (isAmountHigher) {
        const filteredGroups = actualGroups?.filter(
          (g) =>
            g.groupCode !==
            BiddingContractAmendmentDocumentGroupCode.SIGNED_CONTRACT_AMENDMENT
        );
        if (filteredGroups) {
          return filteredGroups;
        } else {
          return [];
        }
      } else {
        const filteredGroups = actualGroups?.filter(
          (g) =>
            g.groupCode !==
            BiddingContractAmendmentDocumentGroupCode.DRAFT_CONTRACT_AMENDMENT
        );
        if (filteredGroups) {
          return filteredGroups;
        } else {
          return [];
        }
      }
    } else {
      return actualGroups;
    }
  }

  ngOnDestroy(): void {
    this.suscription.unsubscribe();
  }

  checkMode(): void {
    if (this.mode !== ModeAmendmentEnum.CREATE) {
      if (
        this.amendment.status ===
          BiddingContractStatusesEnum.PENDING_SIGNATURE ||
        this.amendment.status ===
          BiddingContractStatusesEnum.RETURNED_WITH_COMMENTS
      ) {
        this.secondStep = true;
        if (
          this.permissionSvc.hasPermission(
            PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION
          )
        ) {
          this.readOnly = false;
        } else {
          this.readOnly = true;
          this.form.disable();
        }
      } else if (
        this.amendment.status === BiddingContractStatusesEnum.AMENDMENT_REVIEWED
      ) {
        setTimeout(() => {
          this.form.disable();
        }, 500);
        this.readOnly = false;
        this.secondStep = true;
      } else {
        this.readOnly = true;
        this.secondStep = true;
        this.form.disable();
      }
      this.handleFormStatusByRules();
    } else {
      return;
    }
  }

  private handleFormStatusByRules(): void {
    const procurementStatus = this.procurementProcess?.status;

    const negativeProcurementStatuses = [
      BiddingProcessProcurementProcessStatuses.CANCELLED,
      BiddingProcessProcurementProcessStatuses.UNSUCCESFUL_PROCESS,
      BiddingProcessProcurementProcessStatuses.PROCUREMENT_INELIGIBLE,
      BiddingProcessProcurementProcessStatuses.REJECTION_BIDS,
      BiddingProcessProcurementProcessStatuses.CONTRACT_TERMINATED,
      BiddingProcessProcurementProcessStatuses.MODIFIED,
      BiddingProcessProcurementProcessStatuses.UNDER_REVIEW_MODIFIED,
    ];

    const procurementCondition =
      !negativeProcurementStatuses.includes(procurementStatus);

    if (!this.planNotInSync || !procurementCondition) {
      this.isButtonDisabled = true;
      this.readOnly = true;
      this.form.disable();
    }
  }

  validate(): void {
    this.formErrorCollection = this.validationSvc.validateForm(
      this.form,
      this.errorDefinitions
    );
    if (this.formErrorCollection.length > 0) {
      document.getElementById('top').scrollIntoView();
    }
  }

  checkIsAbleToEdit(): boolean {
    if (
      this._selectedContract.contractStatus ===
        BiddingContractStatusesEnum.SIGNED ||
      this._selectedContract.contractStatus ===
        BiddingContractStatusesEnum.EXECUTION ||
      this._selectedContract.contractStatus ===
        BiddingContractStatusesEnum.EXECUTION_AMENDMENTS ||
      this._selectedContract.contractStatus ===
        BiddingContractStatusesEnum.EXPIRED
    ) {
      this._selectedContract.amendments.forEach((amendment) => {
        if (
          this.amendment.version !== amendment.version &&
          (amendment.contractStatus ===
            BiddingContractStatusesEnum.PENDING_SIGNATURE ||
            amendment.contractStatus ===
              BiddingContractStatusesEnum.AMENDMENT_UNDER_REV ||
            amendment.contractStatus ===
              BiddingContractStatusesEnum.AMENDMENT_REVIEWED)
        ) {
          return false;
        } else {
          if (
            this.amendment.status !==
            BiddingContractStatusesEnum.PENDING_SIGNATURE
          ) {
            return false;
          } else {
            return true;
          }
        }
      });
      return true;
    } else {
      return false;
    }
  }

  checkIsAbleToConfirm(): boolean {
    if (
      this._selectedContract.contractStatus ===
        BiddingContractStatusesEnum.SIGNED ||
      this._selectedContract.contractStatus ===
        BiddingContractStatusesEnum.EXECUTION ||
      this._selectedContract.contractStatus ===
        BiddingContractStatusesEnum.EXECUTION_AMENDMENTS ||
      this._selectedContract.contractStatus ===
        BiddingContractStatusesEnum.EXPIRED
    ) {
      if (
        this.amendment?.status === BiddingContractStatusesEnum.SIGNED &&
        this.mode !== ModeAmendmentEnum.READ
      ) {
        return true;
      } else {
        for (const amendment of this._selectedContract.amendments) {
          if (
            this.amendment.version !== amendment.version &&
            (amendment.contractStatus ===
              BiddingContractStatusesEnum.PENDING_SIGNATURE ||
              amendment.contractStatus ===
                BiddingContractStatusesEnum.AMENDMENT_UNDER_REV ||
              amendment.contractStatus ===
                BiddingContractStatusesEnum.AMENDMENT_REVIEWED)
          ) {
            return false;
          } else {
            if (
              this.amendment.status ===
                BiddingContractStatusesEnum.PENDING_SIGNATURE ||
              this.amendment.status ===
                BiddingContractStatusesEnum.AMENDMENT_REVIEWED ||
              this.amendment.status ===
                BiddingContractStatusesEnum.RETURNED_WITH_COMMENTS
            ) {
              return true;
            } else {
              return false;
            }
          }
        }
        return true;
      }
    } else {
      return false;
    }
  }

  calculateCostDistributions(): void {
    this.amendmentCostDistribution = {
      bidAmount: this.amendment.idbAmount,
      localCounterpartAmount: this.amendment.localCounterpartAmount,
      cofinancingAmount: this.amendment.cofinancedAmount,
      contractTotalAmount:
        this.amendment.idbAmount +
        this.amendment.localCounterpartAmount +
        this.amendment.cofinancedAmount,
    };
  }

  setAmendmentRequestValues(): void {
    this.setCurrenciesFormValues();
    this.setLotsFormValues();
    this.setSecuritiesFormValues();
    this.amendmentRequest = {
      object: this.form.controls.contractObjetiveForm.value
        ? this.form.controls.contractObjetiveForm.value
        : this.amendment.object,

      startDate: this.form.controls.dateUpdateForm.get('startDate').value
        ? new Date(
            this.shortDate(
              this.form.controls.dateUpdateForm.get('startDate').value
            )
          )
        : this.amendment?.startDate,

      endDate: this.form.controls.dateUpdateForm.get('endDate').value
        ? new Date(
            this.shortDate(
              this.form.controls.dateUpdateForm.get('endDate').value
            )
          )
        : this.amendment.endDate,

      signatureDate: this.form.controls.dateUpdateForm.get('signatureDate')
        .value
        ? new Date(
            this.shortDate(
              this.form.controls.dateUpdateForm.get('signatureDate').value
            )
          )
        : this.amendment.signatureDate,
      idbAmount: this.getAmountProperty('bidAmount'),
      localCounterpartAmount: this.getAmountProperty('localCounterpartAmount'),
      cofinancedAmount: this.getAmountProperty('cofinancingAmount'),
      currencies: this.currencies,
      biddingContractLots: this.lots,
      securities: this.securities,
    };
  }

  getAmendmentAmount(key: string): number {
    switch (key) {
      case 'bidAmount':
        return this.amendment.idbAmount;
      case 'localCounterpartAmount':
        return this.amendment.localCounterpartAmount;
      case 'cofinancingAmount':
        return this.amendment.cofinancedAmount;
      default:
        return 0;
    }
  }

  getAmountProperty(key: string) {
    let value = null;
    const aux = this.form.controls.costDistributionForm as UntypedFormGroup;
    const formControlValue = aux.controls[key].value;
    const valueAmendment = this.getAmendmentAmount(key);
    if (this.mode === ModeAmendmentEnum.CREATE && !this.secondStep) {
      value = formControlValue ? formControlValue : 0;
    } else {
      value =
        formControlValue !== undefined ? formControlValue : valueAmendment;
    }
    return value;
  }

  setCurrenciesFormValues(): void {
    this.currencies = [];
    const formControlValue = (
      this.form.get('contractAmountForm') as UntypedFormGroup
    ).getRawValue();
    formControlValue.forEach((item, i) => {
      const currency = this.amendment.currencies[i].currency;
      let totalAmount = 0;
      let usdEquivalentAmount = 0;
      if (this.mode === ModeAmendmentEnum.CREATE && !this.secondStep) {
        totalAmount = item.totalAmount ? item.totalAmount : 0;
        usdEquivalentAmount = item.usdEquivalentAmount
          ? item.usdEquivalentAmount
          : 0;
      } else {
        totalAmount =
          item.totalAmount !== undefined
            ? item.totalAmount
            : this.amendment.currencies[i].totalAmount;
        usdEquivalentAmount =
          item.usdEquivalentAmount !== undefined
            ? item.usdEquivalentAmount
            : this.amendment.currencies[i].usdEquivalentAmount;
      }
      const obj = {
        currency,
        totalAmount,
        usdEquivalentAmount,
      };
      if (this.mode === ModeAmendmentEnum.UPDATE || this.secondStep) {
        obj['id'] = this.amendment.currencies[i].id;
      }
      this.currencies.push(obj);
    });
  }

  setLotsFormValues(): void {
    this.form.controls.lotsForm.value.forEach((item, i) => {
      const lots = this.amendment.biddingContractLots;
      if (this.amendment.biddingContractLots.length !== 0) {
        const name = this.getLotData(item, lots, i, 'name');
        const units = this.getLotData(item, lots, i, 'units');
        const amount = this.getLotData(item, lots, i, 'amount');
        const obj = {
          name,
          units,
          amount,
        };
        if (this.mode === ModeAmendmentEnum.UPDATE || this.secondStep) {
          obj['id'] = this.amendment.biddingContractLots[i].id;
        }

        this.lots.push(obj);
      }
    });
  }

  getLotData(
    item: any,
    lots: ContractsLotsData[],
    index: number,
    property: string
  ) {
    let attribute;
    if (item[property] === '') {
      attribute = lots[index][property];
    } else {
      if (item[property] !== null || item[property]) {
        attribute = item[property];
      } else {
        attribute = lots[index][property];
      }
    }
    return attribute;
  }

  setSecuritiesFormValues(): void {
    this.form.controls.warrantyExtensionForm.value.forEach((item, i) => {
      const obj = {
        securityType: this.amendment.securities[i].securityType,
        currency: this.amendment.securities[i].currency,
        amount: item.amount ? item.amount : this.amendment.securities[i].amount,
        usdEquivalentAmount: item.usdEquivalentAmount
          ? item.usdEquivalentAmount
          : this.amendment.securities[i].usdEquivalentAmount,
        expirationDate: item.expirationDate
          ? item.expirationDate
          : this.amendment.securities[i].expirationDate,
      };

      if (this.mode === ModeAmendmentEnum.UPDATE || this.secondStep) {
        obj['id'] = this.amendment.securities[i].id;
      }

      this.securities.push(obj);
    });
  }

  getCosts(event: CostDistributionModel) {
    this.costAmounts = event;
  }

  submit(event: boolean, isSentInternalReview: boolean = false): void {
    this.checkDateStartGreaterEndDate();
    this.chargeGroups();
    if (this.amendment.id && !event) {
      validateDocumentMandatory(this.groups, this.attachmentForm);
    }
    this.validate();

    if (this.formErrorCollection.length <= 0) {
      this.form.markAsPristine();
      this.isSubmitting = true;
      this.isButtonDisabled = true;
      this.setAmendmentRequestValues();
      if (event) {
        if (this.secondStep) {
          this.editOrConfirmAmendment(false, isSentInternalReview);
        } else {
          this.saveAmendment();
        }
      } else {
        this.editOrConfirmAmendment(true);
      }
    }
  }

  saveAmendment(): void {
    const sub = this.biddingContractApiSvc
      .postAmendment(this.contractId, this.amendmentRequest)
      .subscribe(
        (response: string) => {
          this.showSuccessMsg('CONTRACT.AMENDMENT_SAVE_SUCCESS');
          this.secondStep = true;
          this.checkIfFillForm();
          this.savedAmendmendId = response;
          this.chargeGroups();
        },
        () => this.showErrorMsg()
      )
      .add(() => {
        this.isSubmitting = false;
        this.isButtonDisabled = false;
        this.getLastAmendment();
      });
    this.suscription.add(sub);
  }

  getLastAmendment() {
    const sub = this.biddingContractApiSvc
      .getAmendmentsLast(this.contractId)
      .subscribe((data: AmendmentLastResponse) => {
        this.setAmendmentData(data);
      });
    this.suscription.add(sub);
  }

  setAmendmentData(data: AmendmentLastResponse): void {
    if (data) {
      this.amendment = data;
      this.checkIfFillForm();
    }
  }

  processAmendmentRequest(): void {
    if (this.savedAmendmendId) {
      this.amendment.id = this.savedAmendmendId;
      this.amendmentRequest.biddingContractLots =
        this.amendmentRequest.biddingContractLots.filter(
          (data) => data.id !== undefined
        );
      this.amendmentRequest.securities =
        this.amendmentRequest.securities.filter(
          (data) => data.id !== undefined
        );
      this.amendmentRequest.currencies =
        this.amendmentRequest.currencies.filter(
          (data) => data.id !== undefined
        );
    }
  }

  editOrConfirmAmendment(
    confirmOrSubmit: boolean,
    isSentInternalReview: boolean = false
  ): void {
    if (
      this.amendment.status === BiddingContractStatusesEnum.AMENDMENT_REVIEWED
    ) {
      this.amendmentRequest.idbAmount = this.amendment.idbAmount;
      this.amendmentRequest.cofinancedAmount = this.amendment.cofinancedAmount;
      this.amendmentRequest.localCounterpartAmount =
        this.amendment.localCounterpartAmount;
    }

    this.processAmendmentRequest();
    const sub = this.biddingContractApiSvc
      .putAmendment(this.amendment.id, this.amendmentRequest)
      .pipe(
        mergeMap((_) => {
          if (confirmOrSubmit) {
            if (this.fifteenPercent) {
              return this.submitLogic();
            } else {
              return this.biddingContractApiSvc.putConfirmAmendment(
                this.amendment.id,
                this.selectedLanguage,
                this.fifteenPercent
              );
            }
          }
          return of(true);
        })
      )
      .subscribe(
        (onlySave) => {
          if (!onlySave) {
            this.showSuccessMsg('CONTRACT.AMENDMENT_CONFIRM_SUCCESS');
          } else {
            this.showSuccessMsg('CONTRACT.AMENDMENT_UPDATE_SUCCESS');
          }
          if (!isSentInternalReview) {
            this.biddingProcessStore.getBiddingProcessByIdAction(
              this.procurementProcess.id
            );
          }
          this.navigateToContractTable(isSentInternalReview);
        },
        () => this.showErrorMsg()
      )
      .add(() => {
        this.isSubmitting = false;
        this.isButtonDisabled = false;
      });
    this.suscription.add(sub);
  }

  submitLogic(): Observable<any> {
    return this.workflowSharedSvc.getFirstRoleName().pipe(
      switchMap((firstRoleName) =>
        this.workflowApi.lauchWorkflow(
          {
            entityTypeId: this.amendment.id,
            isInternalVisibility: true,
            instAcronym: this.instAcronym,
            biddingContract: this.amendment.id,
            projectBucketId: this.projectBucketId,
            businessRulesRequest: {
              factors: {
                workflowSection: WorkflowEntityScreen.CONTRACT_AMENDMENT,
                categoryCode: this.procurementProcess.category?.name,
                procurementCode:
                  this.procurementProcess.procurementMethod?.name,
                totalAmountContractAmendments: String(this.totalAmount),
                percentAmountContractAmendments:
                  this.percentageContractAmendment,
                updateContractDates: this.updatedDatesBoolean ? 'Y' : 'N',
              },
            },
            workflowComment: {
              text: '',
              visibility: true,
              status: WorkflowCommentStatusEnum.COMPLETED,
            },
            role: firstRoleName,
          },
          this.selectedLanguage,
          WorkflowModuleEnum.BIDDING_PROCESS
        )
      ),
      mergeMap((_) =>
        this.biddingContractApiSvc.putConfirmAmendment(
          this.amendment.id,
          this.selectedLanguage,
          this.fifteenPercent
        )
      ),
      map((_) => false)
    );
  }

  showSuccessMsg(msg: string): void {
    const message = this.translate.instant(msg);
    this.notificationGlobalSvc.showSuccess(message);
  }

  showErrorMsg(): void {
    const msg = this.translate.instant('CONTRACT.AMENDMENT_SAVE_ERROR');
    this.notificationGlobalSvc.showError(msg);
  }

  showCancelMsg(): void {
    if (this.mode === ModeAmendmentEnum.CREATE) {
      const msg = this.translate.instant('CONTRACT.AMENDMENT_CANCEL');
      this.notificationGlobalSvc.showInfo(msg);
    }
    this.navigateToContractTable();
  }

  navigateToContractTable(isSentInternalReview: boolean = false): void {
    if (isSentInternalReview) {
      this.isLoadingInternalReview = true;
      this.sentInternalReviewLogic();
    } else {
      if (this.mode !== ModeAmendmentEnum.CREATE) {
        this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
      } else {
        this.router.navigate(['..'], { relativeTo: this.activatedRoute });
      }
    }
  }

  setUnitFieldVisibility(): void {
    this.suscription.add(
      this.biddingProcessStore.biddingProcessPlan().subscribe((data) => {
        if (data.selectedBiddingProcessProcurementProcess) {
          this.showLotsUnits =
            data.selectedBiddingProcessProcurementProcess.category.id ===
            ProcurementProcessCategoriesEnum.GOODS;

          this.isExAnte =
            data.selectedBiddingProcessProcurementProcess.supervisionMethod
              .id === BiddingProcurementProcessSupervisionMethods.EX_ANTE;
        }
      })
    );
  }

  checkDateStartGreaterEndDate(): void {
    let formStartDate: string;
    let formEndDate: string;

    const startDateValue =
      this.form.controls.dateUpdateForm.get('startDate').value;
    const endDateValue = this.form.controls.dateUpdateForm.get('endDate').value;

    if (startDateValue) {
      formStartDate = this.transformDate(
        new Date(startDateValue).toISOString()
      );
    }

    if (endDateValue) {
      formEndDate = this.transformDate(new Date(endDateValue).toISOString());
    }

    const startDate = startDateValue
      ? formStartDate
      : this.transformDate(this.amendment?.startDate);

    const endDate = endDateValue
      ? formEndDate
      : this.transformDate(this.amendment?.endDate);

    if (endDate < startDate) {
      this.form.controls.dateUpdateForm.setErrors({
        startDateGreaterThanEndDate: true,
      });
    } else {
      this.form.controls.dateUpdateForm.setErrors(null);
    }
  }

  startDateLowerThanSignatureDate(): boolean {
    let formStartDate: string;
    let formSignatureDate: string;

    const startDateValue =
      this.form.controls.dateUpdateForm.get('startDate').value;
    const signatureDateValue =
      this.form.controls.dateUpdateForm.get('signatureDate').value;

    if (startDateValue) {
      formStartDate = this.transformDate(
        new Date(startDateValue).toISOString()
      );
    }

    if (signatureDateValue) {
      formSignatureDate = this.transformDate(
        new Date(signatureDateValue).toISOString()
      );
    }

    const startDate = startDateValue
      ? formStartDate
      : this.transformDate(this.amendment?.startDate);

    const signatureDate = signatureDateValue
      ? formSignatureDate
      : this.transformDate(this.amendment.signatureDate);

    return startDate < signatureDate;
  }

  transformDate(date): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }

  chargeGroups(): void {
    const id = this.route.snapshot.paramMap.get('amendmentId');
    if (id !== undefined || id !== null) {
      this.amendmentId = id;
    }
    const resquestId =
      this.amendmentId !== undefined ? this.amendmentId : this.contractId;
    const newResquestId = this.savedAmendmendId
      ? this.savedAmendmendId
      : resquestId;
    if (newResquestId) {
      const sub = this.documentsApi
        .getGroups(this.documentDomain, newResquestId)
        .subscribe((response) => {
          this.actualGroups = response;
          if (this.isAmountHigher === undefined) {
            this.isAmountHigher = this.calculateCurrentTotalAmount();
            this.fifteenPercent =
              this.isAmountHigher ||
              ((this.differentStartDate || this.differentEndDate) &&
                this.checkSUpervisionMethodAndAmendmentStatus());
            this.updatedDatesBoolean =
              this.differentStartDate || this.differentEndDate;
          }
          this.attachmentForm.setValue(
            this.removeUnnecesaryGroups(this.fifteenPercent, this.actualGroups)
          );
        });
      this.suscription.add(sub);
    }
  }

  get attachmentForm(): UntypedFormControl {
    return this.form.get('attachments') as UntypedFormControl;
  }

  get groups(): FiduciaryProcessDocumentGroup[] {
    return this.attachmentForm.value as FiduciaryProcessDocumentGroup[];
  }

  checkIsAmountHigher(
    totalAmount: number,
    amenmentTotalAmount: number
  ): boolean {
    const originalContractAmount =
      (this.originalContract?.idbAmount) +
      (this.originalContract?.cofinancedamount) +
      (this.originalContract?.localCounterpartAmount);
    const calculatedPercentage = (totalAmount / originalContractAmount) * 100;
    this.percentageContractAmendment = calculatedPercentage.toFixed(2);
    const accumulatedTotal = totalAmount + amenmentTotalAmount;
    return (
      accumulatedTotal >
      originalContractAmount * this.ORIGINAL_CONTRACT_PERCENTAGE
    );
  }

  setIsAmountHigher(totalAmount: number): boolean {
    this.totalAmount = totalAmount;
    return (
      this.isExAnte &&
      (this.amendment.status ===
        BiddingContractStatusesEnum.PENDING_SIGNATURE ||
        this.amendment.status ===
          BiddingContractStatusesEnum.RETURNED_WITH_COMMENTS ||
        this.amendment.status ===
          BiddingContractStatusesEnum.AMENDMENT_UNDER_REV) &&
      this.checkIsAmountHigher(
        totalAmount,
        this.originalContract.amendmentsTotalAmount
      )
    );
  }

  loadWorkflowActions(): void {
    if (!this.isAdd) {
      this.workflowSharedSvc.loadActions({
        body: {
          entityTypeId: this.amendment.id,
          projectBucketId: this.projectBucketId,
          idEntityType: WorkflowIdEntityType.BIDDING_CONTRACT_AMENDMENT,
        },
        projectContractId: this.projectContractId,
        instAcronym: this.instAcronym,
      });
    }
  }

  get getLotsTotal(): number {
    let total = 0;
    this.form.controls.lotsForm.getRawValue().forEach((l) => {
      total = total + l.amount;
    });
    return total;
  }

  sendNotification(): void {
    this.popupService
      .handleNotificationModal()
      .pipe(
        filter((data: DialogResponse) => data.result === ModalOptions.ACCEPT)
      )
      .subscribe(() => {
        this.submit(true, true);
      });
  }

  sentInternalReviewLogic(): void {
    this.notificationService
      .sendNotification({
        EntityType: WorkflowIdEntityType.BIDDING_CONTRACT_AMENDMENT,
        Id: this.amendment.id,
        ProjectBucketId: this.projectBucketId,
      })
      .subscribe(
        () => {
          this.notificationService.successMsg();
          this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
        },
        () => {
          this.notificationService.errorMsg();
        }
      )
      .add(() => {
        this.isLoadingInternalReview = false;
      });
  }
}
