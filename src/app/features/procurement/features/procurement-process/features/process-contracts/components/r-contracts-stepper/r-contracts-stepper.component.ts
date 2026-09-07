import {
  Component,
  inject,
  OnInit,
  ViewChild,
  OnDestroy,
  DestroyRef,
  computed,
  Signal,
  signal,
} from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import {
  filter,
  forkJoin,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { BiddingContractTypesV2 } from '../../enums';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  BiddingProcessPlanStoreService,
  EnumsStoreService,
} from '@core/services/store-services';
import { ContractFormCompleteService } from '@core/services/forms/contract-form-complete.service';
import {
  BiddingProcessProcurementProcess,
  ContractsMasterData,
  Currency,
  CurrencyEnum,
  Enumerator,
  Enums,
  MasterDataCountryEnum,
  MasterDataType,
  ParticipantAwarded,
  ParticipantAwardedV2,
  ProjectTask,
  ProjectTaskResponse,
} from '@core/models';
import {
  AppState,
  AppStateWithSelectedProject,
  EnumsMasterDataState,
  EnumState,
  SelectedProjectState,
  UsrPreferencesState,
} from '@core/store';
import { FormType } from '@core/utils';
import {
  BiddingContractApiService,
  GeneralProcurementDocumentsApiService,
  ProjectsApiService,
} from '@core/services/apis';
import { ContractsService } from '../../services/contracts.service';
import {
  ComponentForm,
  ContractProductForm,
  createBonusForm,
  createCurrencyForm,
  createDamagesForm,
  createFeeForm,
  createGuaranteeForm,
  createLocationForm,
  createLotForm,
  defaultContractGeneralInfo,
  firstContractStep,
} from '../../rebrand-form/forms';
import {
  Contract,
  ContractAditionalInfoModel,
  ContractBonusResponse,
  ContractCostDitribution,
  ContractDamagesResponse,
  ContractDocumentState,
  ContractExecutionPlace,
  ContractGuaranteeResponse,
  ContractLocationResponse,
  ContractLotResponse,
  ContractLotsModel,
  ContractParticipants,
  ContractPaymentScheduleResponse,
  ContractPostModel,
  ContractResponse,
  ContractsFeesModel,
  ContractsGeneralInfoModel,
  Fee,
  NeededData,
  SourceItem,
} from '../../rebrand-form/models';
import { DocumentDomain, ProcurementProcessCategoriesEnum } from '@core/enums';
import { ContractRebrandService } from '../../services/contract-rebrand.service';
import { Store } from '@ngrx/store';
import { FormValidationService } from '@core/services/validation';
import { RContractsErrorDefinitions } from '../../rebrand-form/rebrand-form-validationKeys';
import { ErrorFocusDirective } from '../../directive/error-focus.directive';
import { NotificationGlobalService } from '../../../../../../../../shared';
import {
  ContractProgress,
  ContractProgressService,
} from '../../services/contract-progress.service';
import { ContractDialogComponent } from '../contract-dialog/contract-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { RContractsPaymentScheduleComponent } from '../r-contracts-payment-schedule/r-contracts-payment-schedule.component';
import { TranslateService } from '@ngx-translate/core';
import { CanComponentDeactivate } from '../../guard/unsaved-contract-changes.guard';
import { VisibilityService } from '@core/services/view';
import { RContractsDocumentsComponent } from '../r-contracts-documents/r-contracts-documents.component';

@Component({
  selector: 'fi-r-contracts-stepper',
  templateUrl: './r-contracts-stepper.component.html',
  styleUrls: ['./r-contracts-stepper.component.scss'],
})
export class RContractsStepperComponent
  implements OnInit, OnDestroy, CanComponentDeactivate
{
  private readonly destroy$ = new Subject<void>();
  private readonly storeSelectedProject = inject(
    Store<AppStateWithSelectedProject>
  );
  private readonly procurementStoreSvc = inject(BiddingProcessPlanStoreService);
  private readonly documentsApi = inject(GeneralProcurementDocumentsApiService);
  private readonly contractsFormSvc = inject(ContractFormCompleteService);
  readonly notificationGlobalService = inject(NotificationGlobalService);
  private readonly contractApiSvc = inject(BiddingContractApiService);
  private readonly validationService = inject(FormValidationService);
  private readonly progressService = inject(ContractProgressService);
  private readonly contractsSvc = inject(ContractRebrandService);
  private readonly enumStoreSvc = inject(EnumsStoreService);
  private readonly projectSvc = inject(ProjectsApiService);
  private readonly activateRoute = inject(ActivatedRoute);
  private readonly contractSvc = inject(ContractsService);
  private visibilityService = inject(VisibilityService);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly store = inject(Store<AppState>);
  private readonly dialog = inject(MatDialog);
  readonly _formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly loadDetailScreen = signal<boolean>(
    /\/contracts\/v2\/[0-9a-fA-F-]{36}\/detail$/.test(this.router.url)
  );

  constructor() {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        this.loadDetailScreen.set(
          /\/contracts\/v2\/[0-9a-fA-F-]{36}\/detail$/.test(this.router.url)
        );
      });
    this.paymentSchedule = computed(
      () => this.contractsSvc.contractPreloadedDataSignal()?.paymentSchedule
    );
  }

  // ============ SIMPLIFICADO ============
  currentStepIndex = 0;
  contractProgress: ContractProgress | null = null;

  @ViewChild(RContractsPaymentScheduleComponent)
  paymentScheduleComponent: RContractsPaymentScheduleComponent;
  @ViewChild(RContractsDocumentsComponent)
  contractDocumentsComponent: RContractsDocumentsComponent;
  @ViewChild('stepper') stepper: MatStepper;
  initialFormValue: any = null;
  documentDomain = DocumentDomain.BIDDINGCONTRACTDOCUMENTGROUP;
  biddingContractConflictResolutionMethods: Enumerator[] = [];
  biddingContractBonusPaymentFrequency: Enumerator[];
  biddingContractLiquidatedDamageTypes: Enumerator[];
  biddingContractSecurityTypes: Enumerator[];
  biddingContractTypes: Enumerator[] = [];
  biddingContractBonusTypes: Enumerator[];
  contractsPaymentRequests: Enumerator[];
  biddingContractDocumentGroupCodes: Enumerator[];
  filteredBiddingContractDocumentGroupCodes: Enumerator[];
  procurementProcess: BiddingProcessProcurementProcess;
  currencies: CurrencyEnum[] = [];
  memberCountries: Enumerator[];
  countries: MasterDataCountryEnum[];
  isGoods: boolean;
  isExternalAudit: boolean;
  isLoading$: Observable<boolean>;
  contractId: string;
  allCurrenciesRegistered: string[];
  contractStartDate: string;
  countryCode: string;
  contractEndDate: string;
  componentProducts: Map<string, ProjectTask[]>;
  contractData: ContractResponse;
  paymentSchedule: Signal<ContractPaymentScheduleResponse[]>;
  showLots = true;
  showDamages = true;
  showBonus = true;
  showGuarantees = true;
  showFees = true;
  allCurrencies$: Observable<Currency[]>;
  allProjectTasks$: Observable<ProjectTask[]>;
  selectedProjectTasks$: Observable<ProjectTask[]>;
  currenciesMap = [];
  formErrorCollection = [];
  dataLoaded = false;
  documentState = signal<ContractDocumentState>(null);
  forceLeaving = false;
  isReverting = false;
  allowStepChange = false;
  currencyApprovalCode: string;

  costDistributionComponentData: {
    structure: SourceItem[];
    products: Map<string, ProjectTask[]>;
  } | null = null;

  contract: FormType<Contract> = firstContractStep(false, false);
  processId: string;
  participants: ParticipantAwarded[];

  canDeactivate(): Observable<boolean> | boolean {
    if (this.contractsSvc.contractJustUpdated()) {
      return true;
    }
    if (this.currentStepIndex === 0) {
      if (!this.contractId) {
        if (this.contract.dirty) {
          return this.showLeaveDialog();
        }
        return true;
      }

      if (this.hasFormChanges()) {
        return this.showLeaveDialog();
      }
    }
    if (this.currentStepIndex === 1) {
      if (this.paymentScheduleComponent.hasModifications()) {
        return this.showLeaveDialog();
      }
      return true;
    }

    return true;
  }

  private showLeaveDialog(): Observable<boolean> {
    const dialogRef = this.dialog.open(ContractDialogComponent, {
      data: {
        title: this.translate.instant(
          'R.CONTRACT.DIALOG.CONFIRM_LEAVE_WITHOUT_SAVE.TITLE'
        ),
        message: this.translate.instant(
          'R.CONTRACT.DIALOG.CONFIRM_LEAVE_WITHOUT_SAVE.MESSAGE'
        ),
        confirmText: this.translate.instant(
          'R.CONTRACT.DIALOG.CONFIRM_LEAVE_WITHOUT_SAVE.CONFIRM'
        ),
        cancelText: this.translate.instant(
          'R.CONTRACT.DIALOG.CONFIRM_LEAVE_WITHOUT_SAVE.CANCEL'
        ),
      },
    });

    return dialogRef.afterClosed().pipe(map((result) => result === true));
  }

  ngOnInit(): void {
    this.initializeAll();
  }

  reset() {
    this.destroy$.next();
    this.contract.reset();
    this.dataLoaded = false;
    this.contractData = null;
    this.costDistributionComponentData = null;
    this.componentProducts = null;
    this.initializeAll();
  }

  initializeAll() {
    this.visibilityService.setVisiblityProcessHeader(true);
    this.processId = this.activateRoute.snapshot.params['processId'];
    this.contractId = this.activateRoute.snapshot.params['contractId'];

    if (this.contractId) {
      this.currentStepIndex = 0;
    }

    this.loadAllDataRequired();
    this.isLoading$ = this.contractsSvc.loading$;

    if (this.contractId) {
      this.loadContractProgress();
    }
    this.contractsSvc.isSubmitted(false);
  }

  hasFormChanges(): boolean {
    if (!this.contractId) {
      return false;
    }
    return this.hasChanges();
  }

  private normalizeFormValue(obj: any): any {
    if (obj === null || obj === undefined) {
      return null;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.normalizeFormValue(item));
    }

    if (typeof obj === 'object' && obj.constructor === Object) {
      const sortedObj: any = {};
      Object.keys(obj)
        .sort()
        .forEach((key) => {
          sortedObj[key] = this.normalizeFormValue(obj[key]);
        });
      return sortedObj;
    }

    return obj;
  }

  performLeave() {
    this.router.navigate(['../'], {
      relativeTo: this.activateRoute,
      queryParamsHandling: 'preserve',
    });
  }

  leaveSchedule() {
    const payments = this.paymentScheduleComponent.payments;
    if (payments.dirty && payments.touched) {
      const dialogRef = this.dialog.open(ContractDialogComponent, {
        data: {
          title: this.translate.instant(
            'R.CONTRACT.DIALOG.CONFIRM_LEAVE_WITHOUT_SAVE.TITLE'
          ),
          message: this.translate.instant(
            'R.CONTRACT.DIALOG.CONFIRM_LEAVE_WITHOUT_SAVE.MESSAGE'
          ),
          confirmText: this.translate.instant(
            'R.CONTRACT.DIALOG.CONFIRM_LEAVE_WITHOUT_SAVE.CONFIRM'
          ),
          cancelText: this.translate.instant(
            'R.CONTRACT.DIALOG.CONFIRM_LEAVE_WITHOUT_SAVE.CANCEL'
          ),
        },
      });

      dialogRef
        .afterClosed()
        .pipe(
          filter((result) => result === true),
          takeUntil(this.destroy$)
        )
        .subscribe(() => {
          this.gotoStep(0);
        });
    }
  }

  onLeave(): void {
    this.performLeave();
  }

  updateContract(): void {
    this.formErrorCollection = this.validationService.validateForm(
      this.contract,
      RContractsErrorDefinitions
    );
    this.contractsSvc.isSubmitted(true);

    if (!this.contract.valid) {
      this.contract.markAllAsTouched();
      this.focusFirstError();
      return;
    }

    this.performUpdateContract();
  }

  private performUpdateContract(): void {
    this.formErrorCollection = this.validationService.validateForm(
      this.contract,
      RContractsErrorDefinitions
    );
    this.contractsSvc.isSubmitted(true);

    if (!this.contract.valid) {
      this.contract.markAllAsTouched();
      this.focusFirstError();
      return;
    }

    this.contractsSvc.setLoading(true);

    this.contractApiSvc
      .putContractV2(
        this.contractId,
        this.contractsSvc.mapFormToMakeRequest(
          this.procurementProcess,
          this.contract
        )
      )
      .pipe(
        switchMap(() => this.contractApiSvc.getContractByIdV2(this.contractId)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (updatedContractData: ContractResponse) => {
          this.notificationGlobalService.showSuccess(
            this.translate.instant('R.CONTRACT.NOTIFICATIONS.UPDATE_SUCCESS')
          );
          this.contractData = updatedContractData;

          this.contractsSvc.updateContractData(updatedContractData);

          this.initialFormValue = JSON.parse(
            JSON.stringify(this.contract.getRawValue())
          );
          this.contractsSvc.setContractJustUpdated(true);

          this.progressService.invalidateCache(this.contractId);
          this.loadContractProgress();

          this.currentStepIndex = 1;
          if (this.stepper) {
            this.stepper.selectedIndex = 1;
          }

          this.reset();
        },
        error: (error) => {
          this.notificationGlobalService.showError(error);
          this.contractsSvc.setLoading(false);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.contractsSvc.setLoading(true);
    this.contractsSvc.setPaymentScheduleMode(null);
    this.progressService.invalidateCache(this.contractId);
  }

  private loadContractProgress(): void {
    if (!this.contractId) {
      return;
    }
  }

  omitStep() {
    this.gotoStep(2);
  }

  gotoStep(stepIndex: number): void {
    // El step 2 es opcional
    if (stepIndex === 2 || stepIndex === 0) {
      if (
        this.paymentScheduleComponent.isModifiedSignal() &&
        this.paymentScheduleComponent.selectedMode !== null
      ) {
        this.showLeaveDialog().subscribe((confirmed) => {
          if (confirmed) {
            this.forceLeaving = true;
            this.paymentScheduleComponent.resetToOriginalSchedule();
            this.proceedToStep(stepIndex);
          } else {
            this.forceLeaving = false;
          }
        });
        return;
      }
    }
    if (stepIndex === 0) {
      this.goBackToFirstStep();
    }
    this.proceedToStep(stepIndex);
  }

  goBackToFirstStep() {
    if (this.paymentScheduleComponent._paymentSchedule.length <= 0) {
      this.paymentScheduleComponent.backToModeSelector();
    }
    this.paymentScheduleComponent.resetToOriginalSchedule();
  }

  private proceedToStep(stepIndex: number): void {
    // Validar paso actual antes de avanzar
    if (stepIndex > this.currentStepIndex) {
      if (!this.validateCurrentStep(this.currentStepIndex)) {
        this.markCurrentStepAsTouched(this.currentStepIndex);
        return;
      }
    }

    // Si es paso 1 (o superior) y no hay contractId, crear primero
    if (stepIndex >= 1 && !this.contractId) {
      this.createContractAndProceed(stepIndex);
      return;
    }

    // Simplemente cambiar el paso
    this.allowStepChange = true;
    this.currentStepIndex = stepIndex;
    if (this.stepper) {
      this.allowStepChange = true;
      this.stepper.selectedIndex = stepIndex;
    }
  }

  onStepChange(event: StepperSelectionEvent): void {
    if (this.isReverting) {
      this.isReverting = false;
      return;
    }
    if (this.allowStepChange) {
      this.allowStepChange = false;
      return;
    }
    this.isReverting = true;
    setTimeout(() => {
      this.stepper.selectedIndex = event.previouslySelectedIndex;
    });
  }

  getContractActualValue(): ContractPostModel {
    return this.contractsSvc.mapFormToMakeRequest(
      this.procurementProcess,
      this.contract
    );
  }

  mapPostModelToContractResponse(
    postModel: ContractPostModel
  ): ContractResponse {
    const { goodsOrigins, ...restGeneralInfo } = postModel.generalInformation;

    const costDistribution = postModel.costDistributions.map((c, index) => {
      return {
        id: '',
        componentId: c.componentId,
        currency: c.currency,
        order: index + 1,
        detail: c.costDistributionDetails.map((cd) => {
          return {
            cfTotal: cd.cfTotal,
            id: '',
            idbTotal: cd.idbTotal,
            lcTotal: cd.lcTotal,
            productId: cd.productId,
          };
        }),
      };
    });
    return {
      id: '',
      additionalInformation: postModel.additionalInformation,
      costDistribution,
      executionsOfWork: postModel.executionOfWorks,
      fees: postModel.fees,
      generalInformation: {
        ...restGeneralInfo,
        goodsOrigin: goodsOrigins,
      },
      lots: postModel.lots.map((m, index) => {
        return { ...m, order: index + 1 };
      }),
      participantAwardedId: postModel.processParticipant,
      processId: postModel.procurementProcess,
    };
  }

  hasChanges(): boolean {
    const savedData = this.normalizeFormValue(
      this.removeIds(this.contractData)
    );
    const currentData = this.normalizeFormValue(
      this.removeIds(
        this.mapPostModelToContractResponse(this.getContractActualValue())
      )
    );
    return JSON.stringify(savedData) !== JSON.stringify(currentData);
  }

  removeIds<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.removeIds(item)) as T;
    }

    const result: any = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key) && key !== 'id') {
        result[key] = this.removeIds(obj[key]);
      }
    }

    return result as T;
  }

  private createContractAndProceed(targetStep: number): void {
    this.formErrorCollection = this.validationService.validateForm(
      this.contract,
      RContractsErrorDefinitions
    );
    this.contractsSvc.isSubmitted(true);

    if (!this.contract.valid) {
      this.contract.markAllAsTouched();
      this.focusFirstError();
      return;
    }

    this.contractsSvc.setLoading(true);
    this.contractApiSvc
      .postContractV2(
        this.contractsSvc.mapFormToMakeRequest(
          this.procurementProcess,
          this.contract
        )
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (contractId) => {
          this.contractId = contractId;
          this.contractsSvc.setContractJustUpdated(true);
          this.progressService.invalidateCache(contractId);
          this.router
            .navigate(['../v2', contractId], {
              relativeTo: this.activateRoute,
              queryParamsHandling: 'preserve',
            })
            .then(() => {
              this.contractsSvc.setLoading(true);
              setTimeout(() => {
                this.contract.markAsPristine();
                this.contract.markAsUntouched();
                this.currentStepIndex = targetStep;
                if (this.stepper) {
                  this.allowStepChange = true;
                  this.stepper.selectedIndex = targetStep;
                }
              }, 0);
            });
        },
        error: (error) => {
          console.error('Error creating contract:', error);
          this.notificationGlobalService.showError(error);
          this.contractsSvc.setLoading(false);
        },
      });
  }

  private validateCurrentStep(stepIndex: number): boolean {
    switch (stepIndex) {
      case 0:
        return this.contract.valid;
      case 1:
        if (!this.paymentScheduleComponent) {
          return true;
        }
        return this.paymentScheduleComponent.shouldShowModeSelector()
          ? true
          : this.forceLeaving ||
              this.paymentScheduleComponent.paymentValidationSignal().isValid;

      case 2:
        this.contractDocumentsComponent.validate();
        this.getDocsState();
        return this.contractDocumentsComponent.canProceed();
      case 3:
        return true;
      default:
        return true;
    }
  }

  private markCurrentStepAsTouched(stepIndex: number): void {
    switch (stepIndex) {
      case 0:
        this.contract.markAllAsTouched();
        this.focusFirstError();
        break;
      case 1:
        this.paymentScheduleComponent.payments.markAllAsTouched();
        break;
      case 2:
        break;
      case 3:
        break;
    }
  }

  isStepDisabled(stepIndex: number): boolean {
    if (!this.contractProgress) {
      return stepIndex > 0;
    }

    return !this.progressService.canAccessStep(
      stepIndex,
      this.contractProgress
    );
  }

  isStepOptional(stepIndex: number): boolean {
    return stepIndex === 1;
  }

  getDocsState() {
    const newState = this.contractDocumentsComponent._documentState();
    this.documentState.set(newState);
  }

  canProceedFromPaymentSchedule(): boolean {
    if (!this.paymentScheduleComponent) {
      return true;
    }

    const validation = this.paymentScheduleComponent.paymentValidationSignal();
    const hasSchedule = this.paymentScheduleComponent.payments.length > 0;

    return !hasSchedule || validation.isValid;
  }

  private focusFirstError() {
    setTimeout(() => {
      ErrorFocusDirective.focusFirstErrorInDocument();
    });
  }

  // ============================================
  // TODO EL RESTO DEL CÓDIGO SIN CAMBIOS
  // ============================================

  private areRequiredEnumsLoaded(enums: EnumState): boolean {
    return (
      enums.enumsLoaded[Enums.contractsTypes] &&
      enums.enumsLoaded[Enums.contractsConflictResolutionMethods] &&
      enums.enumsLoaded[Enums.contractsGuaranteeTypes] &&
      enums.enumsLoaded[Enums.contractsLiquidationDamageTypes] &&
      enums.enumsLoaded[Enums.contractsBonusTypes] &&
      enums.enumsLoaded[Enums.contractsPaymentFrequencies] &&
      enums.enumsLoaded[Enums.contractsPaymentRequests] &&
      enums.enumsLoaded[Enums.biddingContractDocumentGroupCodes]
    );
  }

  private areRequiredEnumsLoadedMasterData(
    enums: EnumsMasterDataState
  ): boolean {
    return enums.masterDataLoaded[MasterDataType.Countries];
  }

  private extractRequiredEnumsMasterData(
    enums: EnumsMasterDataState,
    lang: string
  ) {
    const countries: MasterDataCountryEnum[] = enums[
      MasterDataType.Countries
    ].map((item) => {
      return {
        ...item,
        translatedName: item.name[lang],
        isBeneficiary: item.isBeneficiary,
        isMember: item.isMember,
      };
    });
    return {
      countries,
    };
  }

  private extractRequiredEnums(enums: EnumState, lang: string) {
    return {
      biddingContractTypes: this.transformContractsMasterDataToEnumerator(
        enums.contractsTypes,
        lang
      ),
      biddingContractConflictResolutionMethods:
        this.transformContractsMasterDataToEnumerator(
          enums.contractsConflictResolutionMethods,
          lang
        ),
      memberCountries: enums.memberCountries,
      biddingContractSecurityTypes:
        this.transformContractsMasterDataToEnumerator(
          enums.contractsGuaranteeTypes,
          lang
        ),
      biddingContractBonusPaymentFrequency:
        this.transformContractsMasterDataToEnumerator(
          enums.contractsPaymentFrequencies,
          lang
        ),
      biddingContractLiquidatedDamageTypes:
        this.transformContractsMasterDataToEnumerator(
          enums.contractsLiquidationDamageTypes,
          lang
        ),
      biddingContractBonusTypes: this.transformContractsMasterDataToEnumerator(
        enums.contractsBonusTypes,
        lang
      ),
      contractsPaymentRequests: this.transformContractsMasterDataToEnumerator(
        enums.contractsPaymentRequests,
        lang
      ),
      biddingContractDocumentGroupCodes:
        enums.biddingContractDocumentGroupCodes,
    };
  }

  private transformContractsMasterDataToEnumerator(
    data: ContractsMasterData[],
    lang: string
  ): Enumerator[] {
    return data.map((item) => ({
      id: item.id,
      name: this.getNameByLang(item, lang),
    }));
  }

  private getNameByLang(item: ContractsMasterData, lang: string): string {
    const langMap = {
      en: item.nameEn,
      es: item.nameEs,
      fr: item.nameFr,
      pt: item.namePt,
    };
    return langMap[lang] || item.nameEn || '';
  }

  enumsObs(lang: string) {
    return this.enumStoreSvc.selectEnums().pipe(
      filter(this.areRequiredEnumsLoaded),
      take(1),
      map((enums) => this.extractRequiredEnums(enums, lang))
    );
  }

  enumsObsMasterData(lang: string) {
    return this.enumStoreSvc.selectEnumsMasterData().pipe(
      filter(this.areRequiredEnumsLoadedMasterData),
      take(1),
      map((enums) => this.extractRequiredEnumsMasterData(enums, lang))
    );
  }

  currencyObs(): Observable<
    {
      id: string;
      currency: string;
      numberOfDecimals: number;
      exchangeRate: any;
    }[]
  > {
    return this.contractsFormSvc.commonApi.getCurrencies().pipe(
      map((currencies: Currency[]) =>
        currencies.map((item) => ({
          id: item.currency,
          currency: item.currency,
          numberOfDecimals: item.numberOfDecimals,
          exchangeRate: null,
        }))
      )
    );
  }

  participantsAwardeedObs(lang: string): Observable<ParticipantAwardedV2[]> {
    return this.contractApiSvc.getAwardeedsV2(this.processId).pipe(
      map((data) => {
        return data.participantsAwarded.map((p) => {
          return {
            biddingProcessBidderId: p.biddingProcessBidderId,
            biddingProcessParticipantId: p.biddingProcessParticipantId,
            name: p.name,
            nationality: p.nationality[lang],
            checked: '',
            type: p.type[lang],
          };
        });
      })
    );
  }

  getPreferences(): Observable<string> {
    return this.store.select('preferences').pipe(
      filter(
        (data: UsrPreferencesState) =>
          data.preferences !== null && data.preferences !== undefined
      ),
      map((data: UsrPreferencesState) => {
        return data.preferences.preferredLanguage;
      }),
      take(1)
    );
  }

  private loadAllDataRequired(): void {
    this.getPreferences()
      .pipe(
        switchMap((lang) => this.loadInitialData(lang)),
        switchMap((initialData) => this.loadContractData(initialData)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ({ contractData, componentProducts }) => {
          this.componentProducts = componentProducts;
          this.handleLoadedData(contractData, componentProducts);
        },
      });
  }

  private loadInitialData(lang: string): Observable<NeededData> {
    return forkJoin({
      enums: this.enumsObs(lang),
      enumsMasterData: this.enumsObsMasterData(lang),
      currencies: this.currencyObs(),
      participantsAwardeed: this.participantsAwardeedObs(lang),
      costDistributionData: this.contractSvc
        .preloadAllDataContracts()
        .pipe(take(1)),
      procurementProcess: this.loadProcurementProcess(),
      contractId: of(this.contractId),
      operationCurrencyCode: this.getOperationDataCurrency(),
    }).pipe(tap((data) => this.assignData(data)));
  }

  private getOperationDataCurrency(): Observable<string> {
    return this.storeSelectedProject.select('selectedProject').pipe(
      filter(
        (project: SelectedProjectState) => project.selectedProject !== null
      ),
      take(1),
      map((data) => data.selectedProject.contract),
      switchMap((data) => {
        return this.contractApiSvc
          .getOperationConversion(data)
          .pipe(map((data) => data.shortCode));
      })
    );
  }

  private loadProcurementProcess(): Observable<BiddingProcessProcurementProcess> {
    return this.procurementStoreSvc.biddingProcessPlan().pipe(
      filter((data) => data?.selectedBiddingProcessProcurementProcess !== null),
      map((data) => data.selectedBiddingProcessProcurementProcess),
      take(1)
    );
  }

  private loadContractData(initialData: NeededData): Observable<{
    contractData: ContractResponse;
    componentProducts: Map<string, ProjectTask[]>;
  }> {
    if (!initialData.contractId) {
      return of({ contractData: null, componentProducts: new Map() });
    }
    return forkJoin({
      paymentSchedule: this.contractApiSvc.getPaymentSchedule(
        initialData.contractId
      ),
      contractData: this.contractApiSvc.getContractByIdV2(
        initialData.contractId
      ),
      documents: this.documentsApi
        .getGroups(this.documentDomain, initialData.contractId)
        .pipe(
          map((groups) =>
            groups.map((group) => ({
              ...group,
              fiduciaryProcessDocuments: group.fiduciaryProcessDocuments.map(
                (doc) => ({
                  ...doc,
                  newDescription: doc.description,
                })
              ),
            }))
          )
        ),
    }).pipe(
      tap(({ paymentSchedule, contractData, documents }) => {
        this.contractsSvc.setPreloadedData({
          contractData,
          documents,
          paymentSchedule,
        });
        this.contractsSvc.setContractGroups(documents);

        this.filteredBiddingContractDocumentGroupCodes =
          this.biddingContractDocumentGroupCodes.filter((group) => {
            return documents.some((doc) => doc.groupCode === group.id);
          });
      }),
      switchMap(({ contractData }) => this.loadComponentProducts(contractData))
    );
  }

  private loadComponentProducts(contractData: ContractResponse): Observable<{
    contractData: ContractResponse;
    componentProducts: Map<string, ProjectTask[]>;
  }> {
    const componentIds = this.extractComponentIds(
      contractData.costDistribution
    );

    if (componentIds.length === 0) {
      return of({
        contractData,
        componentProducts: new Map<string, ProjectTask[]>(),
      });
    }

    const productRequests = componentIds.map((componentId) =>
      this.projectSvc.getProjectTasksChilds(componentId).pipe(
        map((res: ProjectTaskResponse) => ({
          componentId,
          products: res.projectTasks,
        }))
      )
    );

    return forkJoin(productRequests).pipe(
      map((results) => ({
        contractData,
        componentProducts: this.createProductsMap(results),
      }))
    );
  }

  private createProductsMap(
    results: { componentId: string; products: ProjectTask[] }[]
  ): Map<string, ProjectTask[]> {
    const productsMap = new Map<string, ProjectTask[]>();
    results.forEach(({ componentId, products }) => {
      productsMap.set(componentId, products);
    });
    return productsMap;
  }

  private handleLoadedData(
    contractData: ContractResponse,
    componentProducts: Map<string, ProjectTask[]>
  ): void {
    if (contractData) {
      this.contractData = contractData;
      this.contractsSvc.setSignDate(
        contractData.generalInformation.signatureDate
      );
      this.contractStartDate = contractData.generalInformation.startDate;
      this.contractEndDate = contractData.generalInformation.endDate;
      this.allCurrenciesRegistered = [
        ...new Set<string>(
          contractData.costDistribution.map((cd) => cd.currency)
        ),
      ];
      const costDistributionIds = this.contractData.costDistribution.map(
        (cd) => cd.componentId
      );
      this.selectedProjectTasks$ = this.allProjectTasks$.pipe(
        map((pt) => pt.filter((p) => costDistributionIds.includes(p.id)))
      );
      this.fillFormOnDetailContract(contractData, componentProducts);
      this.dataLoaded = true;
    } else {
      this.setMinimumData(this.procurementProcess, this.contract);
      this.dataLoaded = true;
    }
    this.contractsSvc.setLoading(false);
    if (this.contractsSvc.contractJustUpdated()) {
      this.currentStepIndex = 1;
    }
    if (this.loadDetailScreen()) {
      this.currentStepIndex = 3;
    }
    this.contractsSvc.setContractJustUpdated(false);
  }

  private extractComponentIds(costDistribution: SourceItem[]): string[] {
    const componentIds = new Set<string>();
    costDistribution.forEach((item) => {
      if (item.componentId) {
        componentIds.add(item.componentId);
      }
    });
    return Array.from(componentIds);
  }

  private assignData(data: NeededData) {
    this.biddingContractTypes = data.enums.biddingContractTypes;
    this.biddingContractConflictResolutionMethods =
      data.enums.biddingContractConflictResolutionMethods;
    this.memberCountries = data.enums.memberCountries;
    this.countries = data.enumsMasterData.countries;
    this.biddingContractSecurityTypes = data.enums.biddingContractSecurityTypes;
    this.biddingContractBonusPaymentFrequency =
      data.enums.biddingContractBonusPaymentFrequency;
    this.biddingContractLiquidatedDamageTypes =
      data.enums.biddingContractLiquidatedDamageTypes;
    this.biddingContractBonusTypes = data.enums.biddingContractBonusTypes;
    this.currencies = data.currencies;
    this.participants = data.participantsAwardeed;
    this.countryCode = data.costDistributionData.project.countryCode;
    this.allCurrencies$ = of(data.costDistributionData.currencies);
    this.allProjectTasks$ = of(data.costDistributionData.components);
    this.currenciesMap = data.costDistributionData.currencies;
    this.procurementProcess = data.procurementProcess;
    this.contractsPaymentRequests = data.enums.contractsPaymentRequests;
    this.biddingContractDocumentGroupCodes =
      data.enums.biddingContractDocumentGroupCodes;
    this.currencyApprovalCode = data.operationCurrencyCode;

    this.isGoods =
      this.procurementProcess.category.id ===
      ProcurementProcessCategoriesEnum.GOODS;
    this.isExternalAudit =
      this.procurementProcess.category.id ===
      ProcurementProcessCategoriesEnum.EXTERNAL_AUDIT;
    this.showLots = [
      ProcurementProcessCategoriesEnum.NON_CONSULTING_SERVICES,
      ProcurementProcessCategoriesEnum.WORKS,
      ProcurementProcessCategoriesEnum.GOODS,
      ProcurementProcessCategoriesEnum.CONSULTING_FIRMS,
    ].includes(this.procurementProcess.category.id);
    this.showDamages = [
      ProcurementProcessCategoriesEnum.NON_CONSULTING_SERVICES,
      ProcurementProcessCategoriesEnum.WORKS,
      ProcurementProcessCategoriesEnum.GOODS,
    ].includes(this.procurementProcess.category.id);
    this.showBonus = [
      ProcurementProcessCategoriesEnum.WORKS,
      ProcurementProcessCategoriesEnum.GOODS,
    ].includes(this.procurementProcess.category.id);
    this.showGuarantees = ![
      ProcurementProcessCategoriesEnum.INDIVIDUAL_CONSULTANTS,
      ProcurementProcessCategoriesEnum.EXTERNAL_AUDIT,
    ].includes(this.procurementProcess.category.id);
    this.showFees = [ProcurementProcessCategoriesEnum.EXTERNAL_AUDIT].includes(
      this.procurementProcess.category.id
    );
    this.contract = firstContractStep(this.isGoods, false);
  }

  setGeneralInformationSection(
    form: FormType<Contract>,
    data: ContractResponse
  ) {
    form.controls.participants.controls.selectedParticipantId.setValue(
      data.participantAwardedId
    );
    form.controls.generalInfo.setValue(
      defaultContractGeneralInfo(
        this.isGoods,
        data.generalInformation.contractType === BiddingContractTypesV2.OTHER,
        data.generalInformation
      ).getRawValue()
    );
  }

  setGuaranteesSection(form: FormType<Contract>, data: ContractResponse) {
    form.controls.additionalInformation.controls.guarantees.clear();
    data.additionalInformation.guarantees.forEach(
      (g: ContractGuaranteeResponse) => {
        form.controls.additionalInformation.controls.guarantees.push(
          createGuaranteeForm(g)
        );
      }
    );
  }

  setDamagesSection(form: FormType<Contract>, data: ContractResponse) {
    form.controls.additionalInformation.controls.damages.clear();
    const damage: ContractDamagesResponse =
      data.additionalInformation.liquidationOfDamage;
    if (damage !== null && damage.liquidationOfDamageTypeId !== null) {
      form.controls.additionalInformation.controls.damages.push(
        createDamagesForm(damage)
      );
    }
  }

  setBonusSection(form: FormType<Contract>, data: ContractResponse) {
    form.controls.additionalInformation.controls.bonus.clear();
    const bonus: ContractBonusResponse = data.additionalInformation.bonus;
    if (bonus !== null && bonus.bonusTypeId !== null) {
      form.controls.additionalInformation.controls.bonus.push(
        createBonusForm(bonus)
      );
    }
  }

  setFeesSection(form: FormType<Contract>, data: ContractResponse) {
    form.controls.fees.controls.fees.clear();
    const fees = data.fees;
    if (fees && fees.length > 0) {
      fees
        .sort((a, b) => a.order - b.order)
        .forEach((fee) => {
          const newFee: Fee = {
            concept: fee.concept,
            currency: fee.currency,
            hours: fee.hours,
            subtotal: fee.usdEquivalent,
            usdEquivalent: fee.usdEquivalent,
          };
          form.controls.fees.controls.fees.push(createFeeForm(newFee));
        });
    }
  }

  setLocationSection(form: FormType<Contract>, data: ContractResponse) {
    form.controls.executionPlace.controls.locations.clear();
    data.executionsOfWork.forEach((l: ContractLocationResponse) => {
      form.controls.executionPlace.controls.locations.push(
        createLocationForm(l)
      );
    });
  }

  setLotsSection(form: FormType<Contract>, data: ContractResponse) {
    form.controls.lots.controls.lots.clear();
    const currencyList: string[] = [
      ...new Set<string>(data.lots.map((l: ContractLotResponse) => l.currency)),
    ];
    data.lots.forEach((lot: ContractLotResponse) => {
      form.controls.lots.controls.lots.push(createLotForm(currencyList, lot));
    });
  }

  setCostDistributionSection(
    form: FormType<Contract>,
    data: ContractResponse,
    componentProducts: Map<string, ProjectTask[]>
  ) {
    const currenciesArray = form.controls.costDistribution.controls.currencies;
    this.populateCurrenciesFormArray(
      currenciesArray,
      data.costDistribution,
      componentProducts
    );
  }

  fillFormOnDetailContract(
    data: ContractResponse,
    componentProducts: Map<string, ProjectTask[]>
  ): void {
    this.setGeneralInformationSection(this.contract, data);
    this.setGuaranteesSection(this.contract, data);
    this.setDamagesSection(this.contract, data);
    this.setBonusSection(this.contract, data);
    this.setFeesSection(this.contract, data);
    this.setLocationSection(this.contract, data);
    this.setLotsSection(this.contract, data);
    this.setCostDistributionSection(this.contract, data, componentProducts);
  }

  populateCurrenciesFormArray(
    currenciesFormArray: FormArray,
    source: SourceItem[],
    componentProducts: Map<string, ProjectTask[]>
  ): void {
    currenciesFormArray.clear();
    const currencyMap = new Map<string, SourceItem[]>();
    source
      .sort((a, b) => a.order - b.order)
      .forEach((item) => {
        if (!currencyMap.has(item.currency)) {
          currencyMap.set(item.currency, []);
        }
        currencyMap.get(item.currency)!.push(item);
      });
    currencyMap.forEach((items, currency) => {
      const currencyFormGroup = createCurrencyForm({ currency });
      const componentsArray = currencyFormGroup.get(
        'componentsArray'
      ) as FormArray;
      items.forEach((item) => {
        const componentFormGroup = ComponentForm({
          component: item.componentId,
        });
        const productsArray = componentFormGroup.controls.products;
        item.detail.forEach((detail) => {
          const productFormGroup = ContractProductForm({
            output: detail.productId,
            bidAmount: detail.idbTotal,
            localCounterPartAmount: detail.lcTotal,
            cofinancingAmount: detail.cfTotal,
          });
          productsArray.push(productFormGroup);
        });
        componentsArray.push(componentFormGroup);
      });
      currenciesFormArray.push(currencyFormGroup);
    });
    setTimeout(() => {
      this.costDistributionComponentData = {
        structure: source,
        products: componentProducts,
      };
    });
  }

  setMinimumData(
    procurementProcess: BiddingProcessProcurementProcess,
    form: FormType<Contract>
  ) {
    form.controls.generalInfo.controls.contractObjective.setValue(
      procurementProcess.description
    );
    form.controls.executionPlace.controls.locations.controls[0].controls.country.setValue(
      this.countryCode === 'RG' ? '' : this.countryCode
    );
  }

  get currenciesList() {
    const currencyTotals =
      this.contract.controls.costDistribution.controls.currencies.controls.map(
        (currencyControl) => {
          const currency = currencyControl.controls.currency.value;
          const total =
            currencyControl.controls.componentsArray.controls.reduce(
              (sumComponents, componentControl) => {
                const productsTotal =
                  componentControl.controls.products.controls.reduce(
                    (sumProducts, productControl) => {
                      return (
                        sumProducts +
                        (productControl.controls.bidAmount.value +
                          productControl.controls.localCounterPartAmount.value +
                          productControl.controls.cofinancingAmount.value || 0)
                      );
                    },
                    0
                  );
                return sumComponents + productsTotal;
              },
              0
            );

          return {
            currency,
            total,
          };
        }
      );
    return currencyTotals;
  }

  get generalInfoContract(): FormType<ContractsGeneralInfoModel> {
    return this.contract?.controls.generalInfo;
  }

  get participantsForm(): FormType<ContractParticipants> {
    return this.contract?.controls.participants;
  }

  get generalInfoForm(): FormType<ContractsGeneralInfoModel> {
    return this.contract?.controls.generalInfo;
  }

  get costDistributionForm(): FormType<ContractCostDitribution> {
    return this.contract?.controls.costDistribution;
  }

  get executionPlaceForm(): FormType<ContractExecutionPlace> {
    return this.contract?.controls.executionPlace;
  }

  get additionalInfoForm(): FormType<ContractAditionalInfoModel> {
    return this.contract?.controls.additionalInformation;
  }

  get lotsForm(): FormType<ContractLotsModel> {
    return this.contract?.controls.lots;
  }

  get feesForm(): FormType<ContractsFeesModel> {
    return this.contract?.controls.fees;
  }
}
