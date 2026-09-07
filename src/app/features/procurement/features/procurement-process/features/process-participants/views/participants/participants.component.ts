import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared/services/notification-global.service';

import {
  BiddingProcessDocumentPackage,
  BiddingProcessPlan,
  BiddingProcessProcurementProcess,
  Contact,
  Currency,
  Enums,
  ErrorResponse,
  EvaluationParticipantsResponse,
  MasterDataCountry,
  MasterDataEnum,
  MasterDataType,
  Participant,
  ParticipantAddRequest,
  ParticipantResponse,
  Project,
} from '@core/models';
import {
  BiddingProcessPlanStoreService,
  ParticipantsStoreService,
} from '@core/services/store-services';
import {
  BiddingProcessPlanStatus,
  BiddingProcessProcurementProcessStatuses,
  EvaluationParticipantsConfig,
  ParticipantMenuOptionsEnum,
  PermissionEnum,
} from '@core/enums';

import { ProcessConfiguration } from '@core/services/process-configuration.service';
import { VisibilityService } from '@core/services/view';
import { ParticipantsService } from '../../services/participants.service';
import { PermissionService } from '@core/services/app/permission/permission.service';
import { ParticipantConfig } from '../../models/participant-config.model';
import { CanDeactivateFromGuard } from '@core/guards/canDeactivateForm.guard';
import { UntypedFormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  AppStateWithContact,
  AppStateWithParticipants,
  BiddingProcessPlanState,
  ContactState,
  SelectedProjectState,
} from '@core/store';
import { PackageAndParticipantsService } from '@core/services/app';
import * as participantsActions from '@core/store/participants/actions/participants.actions';
import { filter, map, take } from 'rxjs/operators';
import { ParticipantsApiService } from '@core/services/apis';
import { TranslateService } from '@ngx-translate/core';
import { CommonApiService } from '@core/services/apis';
import { EnumsmasterdataStoreService } from '@core/services/store-services/enumsMasterData/enumsmasterdata-store.service';

interface PackagesAndParticipantsConfig {
  participants: ParticipantResponse[];
  configValues: EvaluationParticipantsResponse;
  packages: BiddingProcessDocumentPackage[];
  code: number;
  selectedProject: SelectedProjectState;
  selectedPlan: BiddingProcessPlanState;
  disabledBtn: boolean;
  lastBidValidityExtensionDate: Date;
}
@Component({
  selector: 'fi-participants',
  templateUrl: './participants.component.html',
})
export class ParticipantsComponent implements OnInit, OnDestroy {
  readonly subscriptionsCollection: Subscription = new Subscription();

  public participants: Participant[] = [];
  public updatedParticipants: Participant[] = [];
  public savedParticipants: Participant[] = [];
  public newMobParticipant = new Participant();
  public currencyList: Currency[] = [];
  resultOptionsList: MasterDataEnum[];
  rejectedReasonsList: MasterDataEnum[];
  memberCountries: MasterDataCountry[];
  beneficiaryCountries: MasterDataCountry[];
  allCountries: MasterDataCountry[];
  loadedCountries = false;

  public procurementProcessId: string;
  procurementProcess: BiddingProcessProcurementProcess;
  procurementProcessStatus: BiddingProcessProcurementProcessStatuses;
  configValues: EvaluationParticipantsResponse;
  option = EvaluationParticipantsConfig;
  selectedProject: Project;
  enum = Enums;
  EvaluationParticipantsConfig = EvaluationParticipantsConfig;
  participantConfig: ParticipantConfig;

  loadingCheckData = true;
  public showInstruction = false;
  public enableSaveParticipant = false;
  public enableAddParticipant = false;
  participantsLoaded = false;
  public participantsLoading = true;
  public mobileView = false;
  public addingParticipantMobile = false;
  isConfigLoaded = false;
  userInternal: boolean;
  processPlan: BiddingProcessPlan;
  loadingPermission = true;

  viewInstructionMessagePermission: PermissionEnum[] = [
    PermissionEnum.VIEW_PROCUREMENT_INFORMATION,
  ];
  viewParticipantPermission: PermissionEnum[] = [
    PermissionEnum.VIEW_PROCUREMENT_INFORMATION,
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  addAnotherLinePermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  enterParticipantTab: PermissionEnum[] = [
    PermissionEnum.DOWNLOAD_PACKAGE_DOCUMENTS,
  ];
  enterParticipantTabGuest: PermissionEnum[] = [
    PermissionEnum.VIEW_PROCUREMENT_INFORMATION,
  ];
  hasPermissionSeeParticipant: boolean;
  form: UntypedFormGroup;

  obsDataProcessPlan$: Observable<BiddingProcessPlan>;
  obsCurrency$: Observable<Currency[] | ErrorResponse>;
  obsPackagesAndParticipants$: Observable<PackagesAndParticipantsConfig>;
  obsContacts$: Observable<Contact>;
  obsProcurementProcess$: Observable<BiddingProcessProcurementProcess>;

  constructor(
    private readonly router: Router,
    private readonly activeRoute: ActivatedRoute,
    private readonly participantStore: ParticipantsStoreService,
    private readonly participantService: ParticipantsService,
    private readonly participantsApi: ParticipantsApiService,
    readonly configSvc: ProcessConfiguration,
    readonly biddingStoreSvc: BiddingProcessPlanStoreService,
    private readonly visibilitySvc: VisibilityService,
    readonly permissionSvc: PermissionService,
    readonly notification: NotificationGlobalService,
    private readonly canDeactivateFromGuard: CanDeactivateFromGuard,
    readonly storeContact: Store<AppStateWithContact>,
    private readonly packageAndParticipantsSvc: PackageAndParticipantsService,
    private readonly store: Store<AppStateWithParticipants>,
    private readonly translateSvc: TranslateService,
    readonly commonCurrenciesApiSvc: CommonApiService,
    private readonly enumMasterDataStoreSvc: EnumsmasterdataStoreService
  ) {}

  ngOnInit(): void {
    this.getParticipantResultEnumOptions();
    this.getParticipantRejectedReasons();
    this.populateCountriesMasterData();
    this.obsDataProcessPlan$ = this.biddingStoreSvc
      .getOrLoadBiddingProcessPlan()
      .pipe(filter((data) => data.biddingPlanState.biddingProcessPlan !== null))
      .pipe(map((data) => data.biddingPlanState.biddingProcessPlan))
      .pipe(take(1));
    this.obsCurrency$ = this.commonCurrenciesApiSvc.getCurrencies();
    this.obsPackagesAndParticipants$ = this.packageAndParticipantsSvc
      .checkData()
      .pipe(take(1));
    this.obsContacts$ = this.getContact()
      .pipe(filter((data) => !!data && !!data.contact))
      .pipe(map((data) => data.contact))
      .pipe(take(1));

    this.visibilitySvc.setVisiblityProjectHeader(false);
    this.visibilitySvc.setVisiblityProcessHeader(true);
    this.loadingCheckData = true;
    this.participantsLoading = true;
    this.loadingPermission = true;
    this.subscriptionsCollection.add(
      combineLatest([
        this.obsDataProcessPlan$,
        this.obsCurrency$,
        this.obsPackagesAndParticipants$,
        this.obsContacts$,
      ]).subscribe(
        ([processPlan, currencies, packagesAndParticipants, contact]) => {
          this.loadingCheckData = false;
          this.participantsLoading = false;
          this.fillCurrencies(currencies as Currency[]);
          this.loadBiddingProcessPlan(packagesAndParticipants);
          this.userInternal = contact.is_internal;
          this.processPlan = processPlan;
        }
      )
    );

    this.subscriptionsCollection.add(
      this.biddingStoreSvc
        .biddingProcessPlan()
        .pipe(
          filter(
            (data) => data.selectedBiddingProcessProcurementProcess !== null
          )
        )
        .pipe(map((data) => data.selectedBiddingProcessProcurementProcess))
        .subscribe((data) => {
          this.checkPermissionForTabs(data.status);
          this.loadingPermission = false;
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptionsCollection.unsubscribe();
  }

  populateCountriesMasterData(): void {
    this.subscriptionsCollection.add(
      this.enumMasterDataStoreSvc
        .getStoreMasterDataByEnum(MasterDataType.Countries)
        .subscribe((data) => {
          this.mapCountries(data);
        })
    );
  }

  mapCountries(countries: MasterDataCountry[]): void {
    const seenIds = new Set<number>();

    this.memberCountries = [];
    this.beneficiaryCountries = [];
    this.allCountries = [];

    countries.forEach((c) => {
      if (c.isMember) {
        this.memberCountries.push(c);
      }
      if (c.isBeneficiary) {
        this.beneficiaryCountries.push(c);
      }
      if (!seenIds.has(c.id)) {
        this.allCountries.push(c);
        seenIds.add(c.id);
      }
    });
    this.loadedCountries = true;
  }

  getParticipantResultEnumOptions() {
    this.subscriptionsCollection.add(
      this.enumMasterDataStoreSvc
        .getStoreMasterData(MasterDataType.ParticipantResult)
        .subscribe((data) => {
          this.resultOptionsList = data;
        })
    );
  }

  getParticipantRejectedReasons() {
    this.subscriptionsCollection.add(
      this.enumMasterDataStoreSvc
        .getStoreMasterData(MasterDataType.ParticipantRejectedReason)
        .subscribe((data) => {
          this.rejectedReasonsList = data;
        })
    );
  }

  checkPermissionForTabs(
    processStatus: BiddingProcessProcurementProcessStatuses
  ): void {
    const allowedStatuses = [
      BiddingProcessProcurementProcessStatuses.EXPECTED,
      BiddingProcessProcurementProcessStatuses.MODIFIED,
      BiddingProcessProcurementProcessStatuses.PROCESS_ONGOING,
      BiddingProcessProcurementProcessStatuses.TECHNICAL_EVALUATION_OF_BIDS_PROPOSALS,
      BiddingProcessProcurementProcessStatuses.EVAL_BID_PROPOSAL,
    ];
    if (allowedStatuses.includes(processStatus)) {
      this.hasPermissionSeeParticipant = this.permissionSvc.haveSomePermissions(
        this.enterParticipantTab
      );
    } else {
      this.hasPermissionSeeParticipant = this.permissionSvc.haveSomePermissions(
        this.enterParticipantTabGuest
      );
    }
  }

  fillCurrencies(currencies: Currency[]): void {
    this.currencyList = currencies.map((item) => {
      return {
        id: item.currency,
        currency: item.currency,
        numberOfDecimals: item.numberOfDecimals,
        exchangeRate: null,
        isHard: item.isHard,
        isBorrowing: item.isBorrowing,
      };
    });
  }

  loadBiddingProcessPlan(data: PackagesAndParticipantsConfig): void {
    this.loadingCheckData = true;
    this.participantsLoading = true;

    this.procurementProcessId =
      data.selectedPlan.selectedBiddingProcessProcurementProcess.id;
    this.procurementProcess =
      data.selectedPlan.selectedBiddingProcessProcurementProcess;
    this.procurementProcessStatus = this.procurementProcess.status;
    this.configValues = data.configValues;
    this.isConfigLoaded = true;
    this.loadingCheckData = false;
    this.store.dispatch(
      participantsActions.getParticipantsSuccess({
        participants: data.participants,
        processId: this.procurementProcessId,
      })
    );
    setTimeout(() => {
      this.participantsLoading = false;
      this.participantsLoaded = true;
      this.initializeParticipants();
    });
  }

  validateStatus(): boolean {
    return (
      this.processPlan.status !== BiddingProcessPlanStatus.IN_SYNC &&
      [
        BiddingProcessProcurementProcessStatuses.EXPECTED,
        BiddingProcessProcurementProcessStatuses.MODIFIED,
        BiddingProcessProcurementProcessStatuses.PROCESS_ONGOING,
        BiddingProcessProcurementProcessStatuses.TECHNICAL_EVALUATION_OF_BIDS_PROPOSALS,
        BiddingProcessProcurementProcessStatuses.EVAL_BID_PROPOSAL,
        BiddingProcessProcurementProcessStatuses.CONTRACT_UNDER_EXECUTION,
      ].includes(this.procurementProcessStatus)
    );
  }

  initializeParticipants(): void {
    const subscription = this.participantStore
      .getStateByProcess$(this.procurementProcessId)
      .subscribe((data) => {
        this.participants = [...data.participants];

        this.participants = [...data.participants].map((participant) => {
          const newParticipant = { ...participant };
          if (this.validateStatus()) {
            newParticipant.options = ['PARTICIPANT.SEE', 'PARTICIPANT.REMOVE'];
          } else {
            newParticipant.options = ['PARTICIPANT.SEE'];
          }
          return newParticipant;
        });
        this.savedParticipants = [...this.participants];
        this.updatedParticipants = [...this.participants];
        if (this.participants.length <= 0) {
          this.showInstruction = true;
          if (this.validateStatus()) {
            this.addRow();
            this.showInstruction = false;
          } else {
            this.showInstruction = true;
          }
        } else {
          this.showInstruction = false;

          if (data.error !== null) {
            this.addRow();
          }
        }
        this.participantsLoaded = data.loaded;
        this.participantsLoading = data.loading;
      });
    this.subscriptionsCollection.add(subscription);
  }

  addRow(): void {
    this.participants.push(new Participant());
  }

  removeEmptyRow(): void {
    this.participants.pop();
  }

  addMobileParticipant(): void {
    this.visibilitySvc.setVisiblityProcessHeader(false);
    this.addingParticipantMobile = true;
  }

  handleParticipantOption(event): void {
    if (
      event.action === ParticipantMenuOptionsEnum.REMOVE &&
      this.validateStatus()
    ) {
      this.removeParticipant(event.participant);
    }
    if (event.action === ParticipantMenuOptionsEnum.SEE) {
      this.participantService.setBidderForm(null);
      this.router.navigate(
        [
          event.participant.biddingProcessParticipantId,
          'bidder',
          event.participant.biddingProcessBidderId,
        ],
        { relativeTo: this.activeRoute }
      );
    }
  }

  public getContact(): Observable<ContactState> {
    return this.storeContact.select('contact');
  }

  removeParticipant(participant: Participant): void {
    if (
      participant.biddingProcessParticipantId !== null &&
      participant.biddingProcessParticipantId !== undefined
    ) {
      this.loadingCheckData = true;
      this.participantsLoading = true;
      this.participantsApi
        .deleteParticipant(
          participant.biddingProcessParticipantId,
          this.procurementProcessId
        )
        .subscribe({
          next: () => {
            this.sucessMsg('PARTICIPANT.SUBMIT_MSG.SUCCESS.REMOVE');
          },
          complete: () => {
            this.loadBiddingProcessPlan2();
          },
        });
    }
  }

  loadBiddingProcessPlan2() {
    this.packageAndParticipantsSvc
      .checkData()
      .pipe(take(1))
      .subscribe((data) => this.loadBiddingProcessPlan(data));
  }

  onCurrencyChange({
    newValue,
    newCurrency,
    index,
  }: {
    newValue: ParticipantResponse;
    newCurrency: string;
    index: number;
  }) {
    const currentParticipants =
      this.updatedParticipants.length === 0
        ? this.participants
        : this.updatedParticipants;

    this.participants = currentParticipants.map((participant, idx) => {
      if (idx === index) {
        return newValue;
      }

      return {
        ...participant,
        currency: newCurrency,
      };
    });
  }

  setNumber(value): number {
    const number = Number(value);
    if (isNaN(number)) {
      return null;
    }
    return number;
  }

  addedParticipant({ participant, form }) {
    if (
      this.form.get('result').value === 2 &&
      (this.form.get('rejectedReasons').value === undefined ||
        this.form.get('rejectedReasons').value?.length === 0 ||
        this.form.get('rejectedReasons').value === null)
    ) {
      const msg = this.translateSvc.instant('BIDDER.SAVE_ERROR');
      this.notification.showError(msg, 'right', 'top', 7000);
      return;
    }
    const weighedTechScore = this.setNumber(form.weighedTechScore);
    const weighedFinancialScore = this.setNumber(form.weighedFinancialScore);
    const totalScore = this.setNumber(form.totalScore);
    const result = this.setNumber(form.result);
    const amountUsd = this.setNumber(form.amountUsd);
    const currencyData = form.participantAmount?.currency;
    let amount,
      currency = null;
    if (form.participantAmount?.amount !== null) {
      amount = this.setNumber(form.participantAmount?.amount);
      currency =
        typeof currencyData === 'object'
          ? currencyData?.currency
          : currencyData;
    }
    const rejectedReason = form.rejectedReasons ? form.rejectedReasons : [];
    const justificationEligibility = form.justificationEligibility;
    const newParticipantRequest: ParticipantAddRequest = {
      amountUsd,
      biddingProcessBidderId: form.bidder.id,
      weighedTechScore,
      weighedFinancialScore,
      totalScore,
      amount,
      result,
      currency,
      rejectedReason,
      justificationEligibility,
    };

    const isParticipant = this.savedParticipants.find(
      (p) =>
        p.biddingProcessParticipantId ===
        participant.biddingProcessParticipantId
    );

    if (isParticipant !== undefined) {
      const index = this.participants.findIndex(
        (p) =>
          p.biddingProcessBidderId ===
          newParticipantRequest.biddingProcessBidderId
      );
      this.participants[index].allowToEdit = false;
      this.participantsLoading = true;
      this.participantsApi
        .updateParticipant(
          newParticipantRequest,
          participant.biddingProcessParticipantId,
          this.procurementProcessId
        )
        .subscribe({
          next: () => {
            const aux = this.rejectedReasonsList.filter((rr) =>
              newParticipantRequest.rejectedReason.includes(rr.id)
            );
            const participantUpdate = this.participants[index];
            this.participants[index] = {
              ...participantUpdate,
              totalScore: newParticipantRequest.totalScore,
              weighedFinancialScore:
                newParticipantRequest.weighedFinancialScore,
              weighedTechScore: newParticipantRequest.weighedTechScore,
              result: this.resultOptionsList.find(
                (r) => r.id === newParticipantRequest.result
              ),
              amount: newParticipantRequest.amount,
              amountUsd: newParticipantRequest.amountUsd,
              currency: newParticipantRequest.currency,
              rejectedReasons: aux,
              justificationEligibility:
                newParticipantRequest.justificationEligibility,
            };
            this.participants[index].allowToEdit = true;
            this.sucessMsg('PARTICIPANT.SUBMIT_MSG.SUCCESS.UPDATE');
          },
          error: () => {},
          complete: () => {
            this.participantsLoading = false;
          },
        });
    } else {
      this.participantsLoading = true;
      this.participantsApi
        .createParticipant(newParticipantRequest, this.procurementProcessId)
        .subscribe(
          () => {
            this.sucessMsg('PARTICIPANT.SUBMIT_MSG.SUCCESS.SAVE');
          },
          () => {},
          () => {
            this.loadBiddingProcessPlan2();
          }
        );
    }
  }

  stopAdding(event): void {
    this.visibilitySvc.setVisiblityProcessHeader(true);
    this.addingParticipantMobile = event;
  }

  checkPermission(): boolean {
    return this.permissionSvc.hasPermission(
      PermissionEnum.VIEW_PROCUREMENT_INFORMATION
    );
  }

  handleParticipantConfig(event: ParticipantConfig): void {
    this.participantConfig = event;
  }

  participantValueChanges({
    form,
    newParticipant,
    index,
  }: {
    form: UntypedFormGroup;
    newParticipant: ParticipantResponse;
    index: number;
  }): void {
    this.form = form;

    this.updatedParticipants = this.updatedParticipants.map(
      (participant, idx) => {
        if (idx === index) {
          return newParticipant;
        }
        return participant;
      }
    );
  }

  canDeactivate(): boolean | Observable<boolean | Observable<boolean>> {
    return this.canDeactivateFromGuard.openModalLogic(this.form);
  }

  sucessMsg(message: string): void {
    const msg = this.translateSvc.instant(message);
    this.notification.showSuccess(msg, 'right', 'top', 7000);
  }
}
