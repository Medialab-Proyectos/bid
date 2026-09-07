import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ModeEnum,
  BiddingContractStatusesEnum,
  DocumentDomain,
  PermissionEnum,
  CategoryProcurement,
  DocEnum,
  BiddingProcessPlanStatus,
  WorkflowIdEntityType,
} from '@core/enums';
import { ProcurementProcessCategoriesEnum } from '@core/enums/procurementProcessCategories.enum';
import {
  BiddingContractLocationsResponse,
  Currency,
  CurrencyChangeEvent,
  Enums,
  ExchangeRateResponse,
  FiduciaryProcessDocument,
  ParticipantsAwardedResponse,
  ProcessContractFormConfig,
  FiduciaryProcessDocumentGroup,
  ModalOptions,
  DialogResponse,
  Project,
} from '@core/models';
import {
  BiddingContractsRequest,
  BiddingContractsPutRequest,
} from '@core/models/requests/bidding-contracts-request.model';
import {
  ExchangeRateApiService,
  GeneralProcurementDocumentsApiService,
} from '@core/services/apis';
import { ContractFormCompleteService } from '@core/services/forms/contract-form-complete.service';
import {
  BiddingProcessPlanStoreService,
  EnumsStoreService,
  ProjectStoreService,
} from '@core/services/store-services';
import { FormErrorTranslateKey } from '@core/services/validation/form-validation/formErrorTranslateKey.model';
import { VisibilityService } from '@core/services/view';
import { AppStateWithUsrPreferences, EnumState } from '@core/store';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import { validateDocumentMandatory } from '@fiduciary-interface/app/shared/components/documents/components/document-group-section/document-group-section.form';
import { Store } from '@ngrx/store';

import { TranslateService } from '@ngx-translate/core';
import { EMPTY, Observable, Subscription } from 'rxjs';
import {
  catchError,
  filter,
  map,
  mergeMap,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import { createWinnerInformationGroup } from '../winner-information/winner-information-form.form';
import { errorDefinitions } from './contracts-form.errors';
import { createContractsForm } from './contracts-form.form';
import {
  DialogReturn,
  ModalService,
} from '../../../../../../../../shared/services/modal.service';
import { PopupNotificationService } from '@fiduciary-interface/app/shared/services/popup.service';
import { NotificationsService } from '@fiduciary-interface/app/shared/services/notifications.service';
import { PermissionService } from '@core/services/app/permission/permission.service';
import { BiddingContractTypes } from '../../enums';
import { UboService } from '../../../process-doc-packages/services/ubo.service';
@Component({
  selector: 'fi-contracts-form',
  templateUrl: './contracts-form.component.html',
})
export class ContractsForm implements OnInit {
  private readonly subscription = new Subscription();

  groupEnum = Enums.biddingContractDocumentGroupCodes;
  documentDomain = DocumentDomain.BIDDINGCONTRACTDOCUMENTGROUP;
  public status = BiddingContractStatusesEnum;

  public successToast = 'CONTRACT.CONFIRM_SUCCESS_TOAST';
  public biddingContractId: string;
  processProcurementProcessId: string;
  processCategory: string;
  goodsVisibility: boolean;
  showLotsSection = true;
  documentsGroup: FiduciaryProcessDocumentGroup[] = [];
  documentsToUpload: FiduciaryProcessDocument[] = [];

  modeDocSection = DocEnum.CONTRACTS;

  readonly = false;
  isUploading = false;
  secondStep = false;
  public isSubmitting = false;
  isEnumLoaded = false;
  projectSelected: Project;
  public procurementId: string;
  isLoadingInternalReview = false;
  contractTypeDesignation: boolean;

  @Input() form = createContractsForm();
  @Input() modeEnum: ModeEnum;
  @Input() statusEnum: BiddingContractStatusesEnum;
  @Input() stateSubmit: string;
  @Output() errorList: EventEmitter<FormErrorTranslateKey[]> = new EventEmitter<
    FormErrorTranslateKey[]
  >();
  public formErrorCollection: FormErrorTranslateKey[] = [];

  public mode: boolean;
  formConfig: ProcessContractFormConfig = {
    data: {
      procurementProcessDescription: '',
      beneficiaryCountries: [],
      memberCountries: [],
      currencies: [],
      conflictsResolutionsList: [],
      goodsSourceList: [],
      contractTypesList: [],
      bonusTypes: [],
      damagesTypes: [],
      frequencies: [],
      securityTypes: [],
      showUnits: true,
      threshold: {
        min: 0,
        max: 0,
      },
      nationalBiddingThreshold: {
        min: 0,
        max: 0,
      },
      groupMethod: null,
    },
    settings: {
      disabled: true,
      status: null,
    },
  };

  selectedLanguage: string;

  addCurrencyPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  removeCurrencyPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  addLotPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  removeLotPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  addSecurityPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  removeSecurityPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  addLiqDamagesPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  removeLiqDamagesPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  addBonusPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  removeBonusPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  viewDocumentGroupsPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  deleteDocumentPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  editDocumentPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  nextButtonPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  saveContractButtonPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  sendNotificationButtonPermission: PermissionEnum[] = [
    PermissionEnum.SEND_INTERNAL_NOTIFICATIONS,
  ];
  confirmContractButtonPermission: PermissionEnum[] = [
    PermissionEnum.SEND_OFFICIAL_PROCUREMENT_COMUNICATIONS,
  ];
  cancelContractButtonPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  totalLotsAmount = 0;
  totalAmountGeneralInformation: number = 0;
  isPlanInSync: boolean;
  loadingPlan: boolean;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly biddingProcessStore: BiddingProcessPlanStoreService,
    readonly exchangeRateApi: ExchangeRateApiService,
    private readonly notificationGlobalService: NotificationGlobalService,
    private readonly translate: TranslateService,
    readonly contractsFormSvc: ContractFormCompleteService,
    readonly visibilitySvc: VisibilityService,
    private readonly documentsApi: GeneralProcurementDocumentsApiService,
    private readonly enumStoreSvc: EnumsStoreService,
    readonly storePreferences: Store<AppStateWithUsrPreferences>,
    private readonly biddingProcessPlanStoreSvc: BiddingProcessPlanStoreService,
    readonly fiModalSvc: ModalService,
    readonly permissionSvc: PermissionService,
    readonly popupService: PopupNotificationService,
    readonly notificationService: NotificationsService,
    readonly storeProject: ProjectStoreService,
    private readonly uboSvc: UboService
  ) {}

  get winnerInformationForm(): UntypedFormGroup {
    return this.form.get('winnerInformation') as UntypedFormGroup;
  }

  get generalInformationForm(): UntypedFormGroup {
    return this.form.get('generalInformation') as UntypedFormGroup;
  }

  get generalInformationCurrencyList(): UntypedFormArray {
    return this.generalInformationForm.get('currencyList') as UntypedFormArray;
  }

  get costDistributionForm(): UntypedFormGroup {
    return this.form.get('costDistribution') as UntypedFormGroup;
  }

  get lotsForm(): UntypedFormArray {
    return this.form.get('lots') as UntypedFormArray;
  }

  get destinationPlaceForm(): UntypedFormGroup {
    return this.form.get('destinationPlace') as UntypedFormGroup;
  }

  get aditionalInformationForm(): UntypedFormGroup {
    return this.form.get('aditionalInformation') as UntypedFormGroup;
  }

  get securityList(): UntypedFormArray {
    return this.aditionalInformationForm.get(
      'securityList'
    ) as UntypedFormArray;
  }

  get attachmentForm(): UntypedFormControl {
    return this.form.get('attachments') as UntypedFormControl;
  }

  get groups(): FiduciaryProcessDocumentGroup[] {
    return this.attachmentForm.value as FiduciaryProcessDocumentGroup[];
  }

  minLengthArray(min: number): ValidatorFn {
    return (c: AbstractControl): ValidationErrors | null => {
      if (c.value.length >= min) {
        return null;
      }
      return { MinLengthArray: true };
    };
  }

  listenHasAdvancedPaymentsChanges() {
    const sub = this.form
      .get('generalInformation.hasAdvancedPayment')
      .valueChanges.subscribe((data) => {
        if (data) {
          this.securityList.setValidators(this.minLengthArray(1));
        } else {
          this.securityList.setValidators(null);
        }
        this.securityList.updateValueAndValidity();
      });
    this.subscription.add(sub);
  }

  showSpinnerLogic() {
    this.isSubmitting = true;
    this.subscription.add(
      this.enumStoreSvc.selectEnums().subscribe((data) => {
        const groupCodesEnum =
          data.enumsLoaded[Enums.biddingProcessDocumentGroupCodes];

        this.isEnumLoaded = groupCodesEnum;
        if (this.isEnumLoaded) {
          this.isSubmitting = false;
        }
      })
    );
  }

  ngOnInit(): void {
    this.loadSelectedProject();
    this.loadingPlan = true;
    let processId = this.activatedRoute.snapshot.params.processId;
    this.subscription.add(
    this.biddingProcessPlanStoreSvc
      .getOrLoadSelectedBiddingProcessById(processId)
      .pipe(
        switchMap(() => {
          return this.biddingProcessPlanStoreSvc
            .getOrLoadBiddingProcessPlan()
            .pipe(
              filter(
                (data) => data.biddingPlanState.biddingProcessPlan !== null
              ),
              map((data) => data.biddingPlanState.biddingProcessPlan),
              take(1)
            );
        })
      )
      .subscribe((data) => {
        this.isPlanInSync = data.status === BiddingProcessPlanStatus.IN_SYNC;
        this.mode = this.isPlanInSync || this.getMode(this.modeEnum);
        this.loadingPlan = false;
      })
    );
    this.listenHasAdvancedPaymentsChanges();
    this.getCurrentLang();
    this.showSpinnerLogic();
    this.visibilitySvc.setVisiblityProjectHeader(false);
    this.visibilitySvc.setVisiblityProcessHeader(false);

    this.biddingContractId = this.activatedRoute.snapshot.params.contractId;
    this.procurementId = this.activatedRoute.snapshot.params.procurementId;

    this.mode =
      this.getMode(this.modeEnum) ||
      !this.checkEditProcurementProcessPermission();
    this.getDescriptionProcurementProcess();
    this.setUnitFieldVisibilityAndGetCategory();
    this.selectEnumsStore();
    this.fillCurrencies();
    this.fillParticipantsOptionsOnCreateContract();

    if (this.biddingContractId) {
      this.chargeGroups();
    }

    const sub = this.form.valueChanges.subscribe(() => {
      this.totalLotsAmount = 0;
      this.totalAmountGeneralInformation = 0;
      this.checkLotsTotalAmount();
      this.checkCostDistrubitionTotalAmount();
    });

    this.subscription.add(sub);
    this.isContractTypeOther();
  }

  isContractTypeOther(): void {
    this.contractTypeDesignation =
      this.form.get('generalInformation.contractType').value ===
      BiddingContractTypes.OTHER;
  }

  public loadSelectedProject(): void {
    const sub = this.storeProject
      .selectedProject()
      .pipe(
        filter((state) => !!state.selectedProject),
        tap((state) => {
          this.projectSelected = state.selectedProject;
        })
      )
      .subscribe((_) => {});

    this.subscription.add(sub);
  }
  checkEditProcurementProcessPermission(): boolean {
    return this.permissionSvc.hasPermission(
      PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION
    );
  }

  isNotEqualAmount(amount1: number, amount2: number): boolean {
    if (Number(amount1) !== Number(Number(amount2).toFixed(2))) {
      return true;
    }
    return false;
  }

  checkCostDistrubitionTotalAmount(): void {
    this.generalInformationCurrencyList.controls.forEach((control) => {
      let generalInformationUsdValue = control.get('usdEquivalentAmount').value;
      this.totalAmountGeneralInformation += Number(
        Number(generalInformationUsdValue).toFixed(2)
      );
    });

    if (
      this.isNotEqualAmount(
        this.totalAmountGeneralInformation,
        this.costDistributionForm.get('contractTotalAmount').value
      )
    ) {
      this.costDistributionForm.setErrors({
        maxExceededCostDistributionAmount: true,
      });
    } else {
      this.costDistributionForm.setErrors(null);
    }
  }
  checkLotsTotalAmount(): void {
    if (this.lotsForm.controls.length >= 1) {
      this.lotsForm.controls.forEach((control) => {
        this.totalLotsAmount += control.get('amount').value;
      });
      this.totalLotsAmount = Number(Number(this.totalLotsAmount).toFixed(2));
      if (
        this.isNotEqualAmount(
          this.totalLotsAmount,
          this.costDistributionForm.get('contractTotalAmount').value
        )
      ) {
        this.lotsForm.setErrors({ maxExceededLotsAmount: true });
      } else {
        this.lotsForm.setErrors(null);
      }
    }
  }

  ngOnDestroy(): void {
    this.visibilitySvc.setVisiblityProcessHeader(true);
    this.subscription.unsubscribe();
  }

  selectEnumsStore(): void {
    const subscription = this.contractsFormSvc.enumStore
      .selectEnums()
      .subscribe((state) => {
        this.fillDropdownsData(state);
      });
    this.subscription.add(subscription);
  }

  fillDropdownsData(state: EnumState): void {
    this.formConfig.data.memberCountries = state.memberCountries;
    this.formConfig.data.beneficiaryCountries = state.beneficiaryCountries;
    this.formConfig.data.conflictsResolutionsList =
      state.biddingContractConflictResolutionMethods;
    this.formConfig.data.contractTypesList = state.biddingContractTypes;
    this.formConfig.data.securityTypes = state.biddingContractSecurityTypes;
    this.formConfig.data.damagesTypes =
      state.biddingContractLiquidatedDamageTypes;
    this.formConfig.data.frequencies =
      state.biddingContractBonusPaymentFrequency;
    this.formConfig.data.bonusTypes = state.biddingContractBonusTypes;
    this.formConfig.data.goodsSourceList = state.memberCountries;
  }

  fillCurrencies(): void {
    const subscription = this.contractsFormSvc.commonApi
      .getCurrencies()
      .subscribe((currencies: Currency[]) => {
        this.formConfig.data.currencies = currencies.map((item) => {
          return {
            id: item.currency,
            currency: item.currency,
            numberOfDecimals: item.numberOfDecimals,
            exchangeRate: null,
          };
        });
      });
    this.subscription.add(subscription);
  }

  fillParticipantsOptionsOnCreateContract(): void {
    if (this.activatedRoute.snapshot.url[0].path === 'create') {
      const procurementProcessId =
        this.activatedRoute.snapshot.params.processId;
      const subscription = this.contractsFormSvc.participantApi
        .getAwardedParticipants(procurementProcessId)
        .subscribe((participants: ParticipantsAwardedResponse) => {
          const winnerList = this.winnerInformationForm.get(
            'winnerList'
          ) as UntypedFormArray;

          participants.participantsAwarded.forEach((winner) => {
            const winnerGroup = createWinnerInformationGroup();
            winnerGroup.setValue({
              checked: false,
              name: winner.name,
              nationality: winner.nationality,
              biddingProcessParticipantId: winner.biddingProcessParticipantId,
            });
            winnerList.push(winnerGroup);
          });
        });
      this.subscription.add(subscription);
    }
  }

  getMode(status: ModeEnum): boolean {
    switch (status) {
      case ModeEnum.CREATE:
        return false;
      case ModeEnum.READ:
        this.secondStep = true;

        this.readonly = true;

        return true;
      case ModeEnum.UPDATE:
        this.secondStep = true;

        return false;
      case ModeEnum.AMENDMENTS:
        return false;

      default:
        return true;
    }
  }

  /**
   * Load and save the currency exchange rate if it is not loaded
   * @param event
   * @returns
   */
  onCurrencyChange(
    event: CurrencyChangeEvent,
    section: 'securities' | 'generalInformation'
  ): void {
    const currencyId = event.currency;
    if (currencyId === null) {
      return;
    }

    const currency = this.formConfig.data.currencies.find(
      (i) => i.id === currencyId
    );

    if (currency.exchangeRate === null) {
      const currencyRowIndex = event.index;
      let row = null;
      if (section === 'generalInformation') {
        row = this.generalInformationCurrencyList.at(currencyRowIndex);
      } else {
        row = this.securityList.at(currencyRowIndex);
      }

      this.exchangeRateApi.convert(currency.id).subscribe(
        (response: ExchangeRateResponse) => {
          currency.exchangeRate = response.exchangeRate;
          let totalAmount;
          if (section === 'generalInformation') {
            totalAmount = row.get('totalAmount').value;
          } else {
            totalAmount = row.get('amount').value;
          }

          const usdEquivalentAmount = totalAmount / currency.exchangeRate;
          row.get('usdEquivalentAmount').setValue(usdEquivalentAmount);
        },
        () => {
          row.get('usdEquivalentAmount').setValue(0);
        }
      );
    }
  }

  showErrorToast(msg: string): void {
    let errorMsg = msg;
    errorMsg = this.translate.instant(errorMsg);
    this.notificationGlobalService.showError(errorMsg);
  }

  submit(event: boolean, isSentInternalReview: boolean = false): void {
    let processId: string;
    if (this.modeEnum !== ModeEnum.CREATE) {
      this.chargeGroups();
    }
    if (this.biddingContractId && !event) {
      validateDocumentMandatory(this.groups, this.attachmentForm);
    }

    this.contractTypeValidation();
    this.validate();
    if (this.formErrorCollection.length <= 0) {
      this.form.markAsPristine();
      let biddingProccesPutRequest: BiddingContractsPutRequest = null;
      let biddingProcessRequest: BiddingContractsRequest = null;

      processId = this.activatedRoute.snapshot.params.processId;
      if (this.modeEnum === ModeEnum.UPDATE) {
        biddingProccesPutRequest = this.contractsFormSvc.setPutModelInformation(
          this.form,
          processId,
          this.contractTypeDesignation
        );
      } else {
        biddingProcessRequest = this.contractsFormSvc.setPostModelInformation(
          this.form,
          processId,
          this.contractTypeDesignation
        );
      }

      if (event) {
        this.isSubmitting = true;
        if (!this.biddingContractId) {
          this.saveContract(biddingProcessRequest);
        } else {
          this.updateContract(
            biddingProccesPutRequest,
            this.biddingContractId,
            isSentInternalReview
          );
        }
      } else {
        const sub = this.uboSvc
          .checkBiddersSignaturesContract(
            processId,
            this.getWinnersParticipantsId()
          )
          .subscribe((missingSignatures) => {
            if (missingSignatures.length > 0) {
              const names = missingSignatures.join(', ');
              const errorMsg = `${this.translate.instant(
                'PROCESS_DOC.UBO.MISSING_SIGNATURES.PART_1'
              )}${names} ${this.translate.instant(
                'PROCESS_DOC.UBO.MISSING_SIGNATURES.PART_2'
              )}`;
              this.showErrorToast(errorMsg);
            } else {
              this.confirmationModal().subscribe((data: DialogResponse) => {
                if (data.result === ModalOptions.ACCEPT) {
                  this.isSubmitting = true;
                  biddingProccesPutRequest =
                    this.contractsFormSvc.setPutModelInformation(
                      this.form,
                      processId,
                      this.contractTypeDesignation
                    );
                  this.updateConfirm(
                    this.biddingContractId,
                    biddingProccesPutRequest
                  );
                }
              });
            }
          });

        this.subscription.add(sub);
      }
    }
  }

  getWinnersParticipantsId(): string[] {
    return (
      this.form?.value?.winnerInformation?.winnerList
        ?.filter((w) => w.checked)
        ?.map((w) => w.biddingProcessParticipantId) || []
    );
  }

  confirmationModal(): Observable<DialogReturn> {
    return this.fiModalSvc.open(
      'CONTRACT.MODAL.TITLE',
      [
        { text: 'CONTRACT.MODAL.OPTION.CANCEL' },
        {
          text: 'CONTRACT.MODAL.OPTION.CONFIRM_CONTRACT',
          cssClass: 'k-primary',
        },
      ],
      [
        {
          key: 'CONTRACT.MODAL.CONTENT',
          bold: false,
        },
      ]
    );
  }

  saveContract(biddingProcessRequest: BiddingContractsRequest): void {
    this.contractsFormSvc
      .saveContract(biddingProcessRequest)
      .pipe(
        mergeMap((contractId) => {
          if (typeof contractId === 'string') {
            return this.contractsFormSvc.biddingContractApiService
              .getBiddingContractLocations(contractId)
              .pipe(
                map((response: BiddingContractLocationsResponse) => {
                  if (response.locations.length > 0) {
                    const locationId = response.locations[0].id;
                    this.destinationPlaceForm.get('id').setValue(locationId);
                  }
                  return contractId;
                }),
                catchError(() => {
                  return EMPTY;
                })
              );
          }
          return null;
        })
      )
      .subscribe(
        (responseContractId) => {
          if (this.secondStep === false) {
            if (typeof responseContractId === 'string') {
              this.biddingContractId = responseContractId;
              this.modeEnum = ModeEnum.UPDATE;
              this.chargeGroups();
            }
            this.isContractTypeOther();
            this.toastMessageAndGoNextStep(this.successToast);
          } else {
            this.toastMessageAndNavigation(this.successToast);
          }
        },
        () => {
          this.errorMessage('CONTRACT.SAVE_ERROR_TOAST');
        }
      )
      .add(() => (this.isSubmitting = false));
  }

  toastMessageAndGoNextStep(toast: string): void {
    this.secondStep = true;
    const message = this.translate.instant(toast);
    this.successMessage(message);
  }

  toastMessageAndNavigation(
    toast: string,
    isSentInterReview: boolean = false
  ): void {
    const message = this.translate.instant(toast);
    this.successMessage(message);
    if (isSentInterReview) {
      this.isLoadingInternalReview = true;
      this.sentInternalReviewLogic();
    } else {
      this.router.navigate(['.'], {
        relativeTo: this.activatedRoute.parent,
      });
    }
  }

  updateContract(
    biddingProcessRequest: BiddingContractsPutRequest,
    biddingContractId: string,
    isSentInternalReview: boolean = false
  ): void {
    this.contractsFormSvc
      .updateContract(biddingProcessRequest, biddingContractId)
      .subscribe(
        () => {
          this.toastMessageAndNavigation(
            'CONTRACT.UPDATE_SUCCESS_TOAST',
            isSentInternalReview
          );
        },
        () => {
          this.errorMessage('CONTRACT.UPDATE_ERROR');
        }
      )
      .add(() => {
        this.isSubmitting = false;
      });
  }

  getCurrentLang(): void {
    const sub = this.storePreferences
      .select('preferences')
      .subscribe((data) => {
        if (data.preferences.preferredLanguage) {
          this.selectedLanguage = data.preferences.preferredLanguage;
        }
      });
    this.subscription.add(sub);
  }

  updateConfirm(
    biddingContractId: string,
    biddingProcessRequest: BiddingContractsPutRequest
  ): void {
    this.contractsFormSvc
      .updateContract(biddingProcessRequest, biddingContractId)
      .pipe(
        mergeMap((_) =>
          this.contractsFormSvc.updateConfirm(
            biddingContractId,
            this.selectedLanguage
          )
        )
      )
      .subscribe(
        (_) => {
          this.toastMessageAndNavigation(this.successToast);
          this.biddingProcessPlanStoreSvc.getBiddingProcessByIdAction(
            biddingProcessRequest.biddingProcurementProcessId
          );
          this.biddingProcessStore.reloadProcessesAction();
        },
        (_) => this.errorMessage('CONTRACT.CONFIRM_ERROR_TOAST')
      )
      .add(() => (this.isSubmitting = false));
  }

  successMessage(message: string): void {
    this.notificationGlobalService.showSuccess(message, 'right', 'top', 7000);
  }

  errorMessage(typeError: string): void {
    const message = this.translate.instant(typeError);
    this.notificationGlobalService.showError(message, 'right', 'top', 7000);
  }

  navigateToContracts() {
    this.router.navigate(['.'], { relativeTo: this.activatedRoute.parent });
  }

  /**
  @description This method fill the general information objective field with the description of the procurementProcess
  */
  getDescriptionProcurementProcess(): void {
    const subscription = this.biddingProcessStore
      .biddingProcessPlan()
      .subscribe((data) => {
        if (data.selectedBiddingProcessProcurementProcess) {
          this.formConfig.data.procurementProcessDescription =
            data.selectedBiddingProcessProcurementProcess.description;

          if (
            this.modeEnum !== ModeEnum.READ &&
            this.modeEnum !== ModeEnum.UPDATE
          ) {
            this.generalInformationForm
              .get('objective')
              .setValue(
                data.selectedBiddingProcessProcurementProcess.description
              );
          }
        }
      });
    this.subscription.add(subscription);
  }

  /**
   * @description this method compare the process category to show or hide the unit fields inside general information section
   */
  setUnitFieldVisibilityAndGetCategory(): void {
    const subscription = this.biddingProcessStore
      .biddingProcessPlan()
      .subscribe((data) => {
        if (data.selectedBiddingProcessProcurementProcess) {
          this.formConfig.data.showUnits =
            data.selectedBiddingProcessProcurementProcess.category.id ===
            ProcurementProcessCategoriesEnum.GOODS
              ? true
              : false;
          if (this.formConfig.data.showUnits) {
            for (let i = 0; i < this.lotsForm.value.length; i++) {
              this.lotsForm
                .at(i)
                .get('units')
                .setValidators([Validators.required]);
            }
          }
          this.processCategory =
            data.selectedBiddingProcessProcurementProcess.category.name;
          this.goodsVisibility =
            this.processCategory === CategoryProcurement.PROCT_GOODS;
          this.showLotsSection =
            this.processCategory !== CategoryProcurement.PROCT_INDCST;
          this.contractTypeValidation();

          if (!this.showLotsSection) {
            for (let i = 0; i < this.lotsForm.length; i++) {
              this.lotsForm.removeAt(i);
            }
          }

          if (this.goodsVisibility) {
            this.form
              .get('generalInformation.goodsSource')
              .setValidators([Validators.required]);
          }
        }
      });
    this.subscription.add(subscription);
  }

  contractTypeValidation(): void {
    const typeDesignationControl = this.form.get(
      'generalInformation.typeDesignation'
    );
    this.isContractTypeOther();
    if (this.contractTypeDesignation) {
      typeDesignationControl.setValidators([Validators.required]);
    } else {
      typeDesignationControl.setValidators(null);
    }
    typeDesignationControl.updateValueAndValidity();
  }

  validate(): void {
    this.form.markAllAsTouched();
    this.formErrorCollection = this.contractsFormSvc.validationSvc.validateForm(
      this.form,
      errorDefinitions
    );
    this.errorList.emit(this.formErrorCollection);
  }

  chargeGroups(): void {
    this.documentsApi
      .getGroups(this.documentDomain, this.biddingContractId)
      .subscribe((response) => {
        this.attachmentForm.setValue(response);
      });
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
        EntityType: WorkflowIdEntityType.BIDDING_CONTRACT,
        Id: this.biddingContractId,
        ProjectBucketId: this.projectSelected.projectBucketId,
      })
      .subscribe(
        () => {
          this.notificationService.successMsg();
          this.router.navigate(['.'], {
            relativeTo: this.activatedRoute.parent,
          });
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
