import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription, combineLatest } from 'rxjs';
import {
  VisibilityService,
  WindowSize,
  WindowSizeService,
} from '@core/services/view';
import {
  BiddingContractByProcess,
  BiddingProcessPlan,
  BiddingProcessProcurementProcess,
  Contact,
  Contract,
  DialogResponse,
  Enums,
  LocationEnums,
  ModalOptions,
} from '@core/models';
import {
  BiddingContractStatusesEnum,
  BiddingProcessPlanStatus,
  BiddingProcessProcurementProcessStatuses,
  ContractMenuOptionsEnum,
  PermissionEnum,
} from '@core/enums';
import { ContractsService } from '../../services/contracts.service';
import {
  BiddingContractsStoreService,
  BiddingProcessPlanStoreService,
} from '@core/services/store-services';
import { PermissionService } from '@core/services/app/permission/permission.service';
import {
  AppStateWithContact,
  AppStateWithUsrPreferences,
  ContactState,
} from '@core/store';
import { Store } from '@ngrx/store';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import {
  ModalService,
  NotificationGlobalService,
} from '@fiduciary-interface/app/shared';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { BiddingProcessPlanService } from '@core/services/apis';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'fi-contracts',
  templateUrl: './contracts.component.html',
})
export class ContractsComponent implements OnInit, OnDestroy {
  @ViewChild(TooltipDirective) tooltipDir: TooltipDirective;

  readonly subscriptions = new Subscription();
  displayAddContractBtn: boolean;
  userInternal: boolean;
  selectedContract: Contract = null;
  enum = Enums;
  locationEnums = LocationEnums;
  informationalMessage: String;
  displayCompleteContracts = false;
  countryCode: string;
  procurementProcessStatus: BiddingProcessProcurementProcessStatuses;
  public statusEnum = BiddingContractStatusesEnum;

  accordionSettingsPendingSignature = [];
  accordionSettingsNotPendingSignature = [];

  contracts: BiddingContractByProcess[] = [];
  contractsPendingSignature: BiddingContractByProcess[] = [];
  contractsNotPendingSignature: BiddingContractByProcess[] = [];
  pendingSignatureOptions = [
    ContractMenuOptionsEnum.DELETE,
    ContractMenuOptionsEnum.EDIT,
  ];
  signedOptions = [
    ContractMenuOptionsEnum.AMENDMENT,
    ContractMenuOptionsEnum.TERMINATE,
  ];
  amendmentTerminateComplete = [
    ContractMenuOptionsEnum.AMENDMENT,
    ContractMenuOptionsEnum.COMPLETE,
    ContractMenuOptionsEnum.TERMINATE,
  ];
  finishOptions = [];
  terminateOptions = [];
  terminateReviewOptions = [];
  otherStatesOptions = [];

  isMobileView = false;
  public isLoading = true;
  showAddContract: boolean;

  public biddingContract: BiddingContractByProcess[];
  public procurementProcessId = '';
  public procurementProcessCode = '';
  public procurementProcess: BiddingProcessProcurementProcess;

  newContractButtonPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  completeContractsPermission: PermissionEnum[] = [
    PermissionEnum.SEND_OFFICIAL_PROCUREMENT_COMUNICATIONS,
  ];
  contractTablePermission: PermissionEnum[] = [
    PermissionEnum.VIEW_PROCUREMENT_INFORMATION,
  ];
  enterContractsTab: PermissionEnum[] = [
    PermissionEnum.DOWNLOAD_PACKAGE_DOCUMENTS,
  ];
  enterContractsTabGuest: PermissionEnum[] = [
    PermissionEnum.VIEW_PROCUREMENT_INFORMATION,
  ];
  hasPermissionSeeContract: boolean;
  selectedLanguage: string;
  inputContractTerminated: boolean;
  inputProcurementComplete: boolean;
  hideAddAmendmentOption = false;
  obsPreferences$: Observable<string>;
  obsContact$: Observable<Contact>;
  obsProcurementProcess$: Observable<BiddingProcessProcurementProcess>;
  obsProcessPlan$: Observable<BiddingProcessPlan>;
  isPlanNotInSync: boolean;

  constructor(
    private readonly windowSizeService: WindowSizeService,
    private readonly store: BiddingContractsStoreService,
    private readonly activatedRoute: ActivatedRoute,
    readonly router: Router,
    private readonly visibilitySvc: VisibilityService,
    readonly biddingStoreSvc: BiddingProcessPlanStoreService,
    readonly permissionSvc: PermissionService,
    readonly contractsSvc: ContractsService,
    readonly storePreferences: Store<AppStateWithUsrPreferences>,
    readonly fiModalSvc: ModalService,
    private readonly notificationGlobalService: NotificationGlobalService,
    private readonly translateService: TranslateService,
    readonly biddingProcessPlanSvc: BiddingProcessPlanService,
    readonly storeContact: Store<AppStateWithContact>
  ) {}

  ngOnInit(): void {
    this.obsPreferences$ = this.storePreferences.select('preferences').pipe(
      filter((data) => data.preferences.preferredLanguage !== null),
      map((data) => data.preferences.preferredLanguage),
      take(1)
    );
    this.obsContact$ = this.getContact().pipe(
      filter((data) => data.contact !== null),
      map((data) => data.contact),
      take(1)
    );
    this.obsProcurementProcess$ = this.biddingStoreSvc
      .biddingProcessPlan()
      .pipe(
        filter(
          (data) => data.selectedBiddingProcessProcurementProcess !== null
        ),
        map((data) => data.selectedBiddingProcessProcurementProcess)
      );
    this.obsProcessPlan$ = this.biddingStoreSvc
      .getOrLoadBiddingProcessPlan()
      .pipe(
        filter((data) => data.biddingPlanState.biddingProcessPlan !== null),
        map((data) => data.biddingPlanState.biddingProcessPlan),
        take(1)
      );
    combineLatest([
      this.obsPreferences$,
      this.obsContact$,
      this.obsProcurementProcess$,
      this.obsProcessPlan$,
    ]).subscribe(([preferences, contact, procurementProcess, processPlan]) => {
      this.isPlanNotInSync =
        processPlan.status !== BiddingProcessPlanStatus.IN_SYNC;
      this.userInternal = contact?.is_internal;
      this.getCurrentLang(preferences);
      this.loadBiddingProcessPlan(procurementProcess);
      this.checkPermissionForTabs(procurementProcess?.status);
    });
    this.visibilitySvc.setVisiblityProjectHeader(false);
    this.visibilitySvc.setVisiblityProcessHeader(true);
    this.setWindowSizeListener();
  }

  checkPermissionForTabs(
    selectedProcessStatus: BiddingProcessProcurementProcessStatuses
  ): void {
    let allowedStatus = [
      BiddingProcessProcurementProcessStatuses.EXPECTED,
      BiddingProcessProcurementProcessStatuses.MODIFIED,
      BiddingProcessProcurementProcessStatuses.PROCESS_ONGOING,
      BiddingProcessProcurementProcessStatuses.TECHNICAL_EVALUATION_OF_BIDS_PROPOSALS,
      BiddingProcessProcurementProcessStatuses.EVAL_BID_PROPOSAL,
    ];
    if (allowedStatus.includes(selectedProcessStatus)) {
      this.hasPermissionSeeContract = this.permissionSvc.haveSomePermissions(
        this.enterContractsTab
      );
    } else {
      this.hasPermissionSeeContract = this.permissionSvc.haveSomePermissions(
        this.enterContractsTabGuest
      );
    }
  }

  public getContact(): Observable<ContactState> {
    return this.storeContact.select('contact');
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getCurrentLang(data: string): void {
    this.selectedLanguage = data;
  }

  loadBiddingProcessPlan(process: BiddingProcessProcurementProcess): void {
    this.procurementProcessId = this.activatedRoute.snapshot.params.processId;
    this.procurementProcess = process;
    this.countryCode = this.procurementProcess.code.split('-')[0];
    this.procurementProcessStatus = this.procurementProcess.status;
    this.showAddContract = this.showAddContractButton();
    this.procurementProcessCode = this.procurementProcess.code;
    this.setContractsState();

    const procurementStatuses = [
      BiddingProcessProcurementProcessStatuses.TECHNICAL_EVALUATION_OF_BIDS_PROPOSALS,
      BiddingProcessProcurementProcessStatuses.EVAL_BID_PROPOSAL,
      BiddingProcessProcurementProcessStatuses.PROCESS_ONGOING,
      BiddingProcessProcurementProcessStatuses.CONTRACT_UNDER_EXECUTION,
    ];

    this.hideAddAmendmentOption = !procurementStatuses.includes(
      this.procurementProcessStatus
    );
  }

  showAddContractButton(): boolean {
    return (
      this.isPlanNotInSync &&
      [
        BiddingProcessProcurementProcessStatuses.EVAL_BID_PROPOSAL,
        BiddingProcessProcurementProcessStatuses.PROCESS_ONGOING,
        BiddingProcessProcurementProcessStatuses.CONTRACT_UNDER_EXECUTION,
        BiddingProcessProcurementProcessStatuses.TECHNICAL_EVALUATION_OF_BIDS_PROPOSALS,
      ].includes(this.procurementProcess.status)
    );
  }

  showDetails(contract: Contract): void {
    this.selectedContract = contract;
  }

  hideDetails(): void {
    this.selectedContract = null;
  }

  removeAddAmendmentOption(options: string[]): string[] {
    return options.filter((el) => {
      return el !== ContractMenuOptionsEnum.AMENDMENT;
    });
  }

  removeTerminateContractOption(options: string[]): string[] {
    return options.filter((el) => {
      return el !== ContractMenuOptionsEnum.TERMINATE;
    });
  }

  checkHasPendingAmendment(amendments: BiddingContractByProcess[]): boolean {
    const index = amendments.findIndex(
      (el) =>
        el.contractStatus === BiddingContractStatusesEnum.PENDING_SIGNATURE ||
        el.contractStatus ===
          BiddingContractStatusesEnum.RETURNED_WITH_COMMENTS ||
        el.contractStatus === BiddingContractStatusesEnum.AMENDMENT_UNDER_REV ||
        el.contractStatus === BiddingContractStatusesEnum.AMENDMENT_REVIEWED
    );
    if (index !== -1) {
      return true;
    } else {
      return false;
    }
  }

  checkHasAmendmentUnderReview(
    amendments: BiddingContractByProcess[]
  ): boolean {
    const index = amendments.findIndex(
      (el) =>
        el.contractStatus === BiddingContractStatusesEnum.AMENDMENT_UNDER_REV
    );
    if (index !== -1) {
      return true;
    } else {
      return false;
    }
  }

  setContractsOptions(state: any): void {
    this.isLoading = state.loading;
    this.contractsPendingSignature = [];
    this.contractsNotPendingSignature = [];
    const pendingSignatureContracts = state.procurementContracts.filter(
      (c) => c.contractStatus === BiddingContractStatusesEnum.PENDING_SIGNATURE
    );
    const otherContracts = state.procurementContracts.filter(
      (c) => c.contractStatus !== BiddingContractStatusesEnum.PENDING_SIGNATURE
    );

    this.groupByStatus(pendingSignatureContracts, true);
    this.groupByStatus(otherContracts, false);
    this.contracts = [
      ...this.contractsPendingSignature,
      ...this.contractsNotPendingSignature,
    ];
    this.getContractsScreenMessage();
  }

  groupByStatus(contracts, isPendingSignature) {
    contracts.forEach((contract, index) => {
      let options = this.getOptionsByStatus(contract);

      if (this.hideAddAmendmentOption) {
        options = this.removeAddAmendmentOption(options);
      }

      options = this.checkPermissions(options);
      this.processContract(contract, options, isPendingSignature, index);
    });
  }

  getOptionsByStatus(contract) {
    let options = [];
    const status = contract.contractStatus;

    if (this.isPlanNotInSync) {
      switch (status) {
        case this.statusEnum.SIGNED:
          options = this.signedOptions;
          options = this.processSignedOptions(contract, options);
          break;
        case this.statusEnum.FINISHED:
          options = this.finishOptions;
          break;
        case this.statusEnum.PENDING_SIGNATURE:
          options = this.pendingSignatureOptions;
          break;
        case this.statusEnum.TERMINATED:
          options = this.terminateOptions;
          break;
        case this.statusEnum.TERMINATION_UNDER_REV:
          options = this.terminateReviewOptions;
          break;
        case this.statusEnum.EXECUTION:
        case this.statusEnum.EXECUTION_AMENDMENTS:
        case this.statusEnum.EXPIRED:
          options = this.amendmentTerminateComplete;
          options = this.processExecutionOptions(contract, options);
          break;
        default:
          options = this.otherStatesOptions;
          break;
      }
    }
    if (contract.isCopy) {
      options = options.filter((o) => o !== ContractMenuOptionsEnum.AMENDMENT);
    }
    return options;
  }

  processSignedOptions(contract, options) {
    if (this.checkHasPendingAmendment(contract.amendments)) {
      options = this.removeAddAmendmentOption(options);
    }
    if (this.checkHasAmendmentUnderReview(contract.amendments)) {
      options = this.removeTerminateContractOption(options);
    }
    return options;
  }

  processExecutionOptions(contract, options) {
    if (this.checkHasPendingAmendment(contract.amendments)) {
      options = this.removeAddAmendmentOption(options);
    }
    if (this.checkHasAmendmentUnderReview(contract.amendments)) {
      options = this.removeTerminateContractOption(options);
    }
    return options;
  }

  processContract(contract, options, isPendingSignature, index) {
    let targetArray = isPendingSignature
      ? this.contractsPendingSignature
      : this.contractsNotPendingSignature;
    const targetAccordion = isPendingSignature
      ? this.accordionSettingsPendingSignature
      : this.accordionSettingsNotPendingSignature;

    targetArray.push({ ...contract, options });
    targetArray[index].totalAmountWithAmendments =
      targetArray[index].amendments[
        targetArray[index].amendments.length - 1
      ]?.totalAccumulatedAmount;

    targetArray = this.sortContractsByCode(targetArray);
    this.setAccordionSettings(targetAccordion, contract.biddingContractId);
  }

  setAccordionSettings(accordionSettings, id) {
    const found = accordionSettings.find((element) => element.id === id);
    if (!found) {
      accordionSettings.push({ id, collapse: true });
    }
  }

  getContractsScreenMessage(): void {
    if (
      this.isPlanNotInSync &&
      this.procurementProcess.status ===
        BiddingProcessProcurementProcessStatuses.CONTRACT_UNDER_EXECUTION &&
      this.checkContractsAviablityToComplete()
    ) {
      this.displayCompleteContracts = true;
      this.informationalMessage = 'CONTRACT.COMPLETE_CONTRACT_INFO';
    } else {
      if (
        this.procurementProcess.status !==
        BiddingProcessProcurementProcessStatuses.PROCUREMENT_COMPLETE
      ) {
        this.displayAddContractBtn = true;
        this.displayCompleteContracts = false;
        this.informationalMessage = 'CONTRACT.ALERT_INFO';
      } else {
        this.displayCompleteContracts = false;
        this.informationalMessage = '';
      }
    }
    if (
      this.isPlanNotInSync &&
      this.procurementProcess.isMigrated &&
      this.contracts.length === 0 &&
      this.permissionSvc.haveSomePermissions(
        this.completeContractsPermission
      ) &&
      (this.procurementProcess.status ===
        BiddingProcessProcurementProcessStatuses.CONTRACT_UNDER_EXECUTION ||
        this.procurementProcess.status ===
          BiddingProcessProcurementProcessStatuses.CONTRACT_SIGNED)
    ) {
      this.displayCompleteContracts = true;
    }
  }

  //TODO: Candidato a revisar dado que se llama varias veces para decidir si pintar el boton o no, esa decision podria moverse al Backend | Refactoring
  checkContractsAviablityToComplete(): boolean {
    let isAvaibleToCompleteContract: boolean;
    this.inputContractTerminated = false;
    this.inputProcurementComplete = false;
    if (this.contracts.length !== 0) {
      isAvaibleToCompleteContract = true;
    } else {
      isAvaibleToCompleteContract = false;
    }
    this.contracts.forEach((c) => {
      if (
        c.contractStatus !== BiddingContractStatusesEnum.FINISHED &&
        c.contractStatus !== BiddingContractStatusesEnum.TERMINATED &&
        c.contractStatus !== BiddingContractStatusesEnum.DELETED
      ) {
        isAvaibleToCompleteContract = false;
        return isAvaibleToCompleteContract;
      }
    });
    const ContractsDeleted = this.contracts.filter((c) => {
      return c.contractStatus === BiddingContractStatusesEnum.DELETED;
    });
    const ContractsFinished = this.contracts.filter((c) => {
      return c.contractStatus === BiddingContractStatusesEnum.FINISHED;
    });
    const ContractsTerminated = this.contracts.filter((c) => {
      return c.contractStatus === BiddingContractStatusesEnum.TERMINATED;
    });
    this.inputContractTerminated =
      ContractsTerminated.length + ContractsDeleted.length ===
      this.contracts.length;
    this.inputProcurementComplete =
      ContractsFinished.length + ContractsDeleted.length ===
      this.contracts.length;

    return isAvaibleToCompleteContract;
  }

  openModalCompleteContracts(): void {
    let updateStatus: number;
    const sub = this.fiModalSvc
      .open(
        'CONTRACTS.COMPLETED.DIALOG.TITLE',
        [
          { text: 'CONTRACTS.COMPLETED.DIALOG.CANCEL' },
          {
            text: 'CONTRACTS.COMPLETED.DIALOG.COMPLETE',
            cssClass: 'k-primary',
          },
        ],
        [{ key: 'CONTRACTS.COMPLETED.DIALOG.CONTENT_1', bold: false }]
      )
      .pipe(
        filter((data: DialogResponse) => data.result === ModalOptions.ACCEPT),
        switchMap(() => {
          this.isLoading = true;
          if (this.inputProcurementComplete) {
            updateStatus =
              BiddingProcessProcurementProcessStatuses.PROCUREMENT_COMPLETE;

            return this.biddingProcessPlanSvc.updateStatus(
              this.procurementProcessId,
              BiddingProcessProcurementProcessStatuses.PROCUREMENT_COMPLETE,
              this.countryCode
            );
          }
          if (this.inputContractTerminated) {
            updateStatus =
              BiddingProcessProcurementProcessStatuses.CONTRACT_TERMINATED;
            return this.biddingProcessPlanSvc.updateStatus(
              this.procurementProcessId,
              BiddingProcessProcurementProcessStatuses.CONTRACT_TERMINATED,
              this.countryCode
            );
          }
          updateStatus =
            BiddingProcessProcurementProcessStatuses.PROCUREMENT_COMPLETE;
          return this.biddingProcessPlanSvc.updateStatus(
            this.procurementProcessId,
            BiddingProcessProcurementProcessStatuses.PROCUREMENT_COMPLETE,
            this.countryCode
          );
        })
      )
      .subscribe(
        () => {
          this.biddingStoreSvc.completeProcurementProcessAction(
            this.procurementProcessId,
            updateStatus
          );
          this.notificationGlobalService.showSuccess(
            this.translateService.instant(
              'CONTRACTS.COMPLETED.CONFIRMATION.SUCCESS'
            ),
            'right',
            'top',
            7000
          );
          this.isLoading = false;
        },
        (err) => this.checkErr(err)
      );

    this.subscriptions.add(sub);
  }

  public checkErr(err): void {
    let msg = err?.message;
    if (err instanceof HttpErrorResponse) {
      msg = err.error.detail;
    }
    if (msg === 'HasUnfinishedContracts') {
      this.notificationGlobalService.showInfo(
        this.translateService.instant(
          'CONTRACTS.COMPLETED.CONFIRMATION.UNFINISHED_CONTRACTS'
        ),
        'right',
        'top',
        10000
      );
    } else {
      this.notificationGlobalService.showError(
        this.translateService.instant('CONTRACTS.COMPLETED.CONFIRMATION.ERROR'),
        'right',
        'top',
        7000
      );
    }
    this.isLoading = false;
  }

  setContractsState(): void {
    this.loadContracts();
    const subscription = this.store
      .getContractsByProcess(this.procurementProcessId)
      .subscribe((state) => {
        this.setContractsOptions(state);
      });
    this.subscriptions.add(subscription);
  }

  loadContracts(): void {
    this.store.getContractsByProcessAction(
      this.procurementProcessId,
      this.procurementProcessCode
    );
  }

  createContract(): void {
    if (this.hasLegacyContracts()) {
      this.router.navigate(['./create'], { relativeTo: this.activatedRoute });
    } else {
      this.router.navigate(['./new-create'], {
        relativeTo: this.activatedRoute,
      });
    }
  }

  hasLegacyContracts(): boolean {
    return this.contracts?.some((c) => !c.isCopy) ?? false;
  }

  setWindowSizeListener(): void {
    const subscription = this.windowSizeService.windowSizeChanged.subscribe(
      (windowSize: WindowSize) => {
        this.isMobileView = windowSize.mobileView;
      }
    );

    this.subscriptions.add(subscription);
  }

  sortAmendments(
    amendments: BiddingContractByProcess[]
  ): BiddingContractByProcess[] {
    const aux = [...amendments];
    return aux.sort((a, b) => {
      return a.version < b.version ? -1 : 1;
    });
  }

  sortContractsByCode(
    contract: BiddingContractByProcess[]
  ): BiddingContractByProcess[] {
    const aux = [...contract];
    return aux.sort((a, b) => {
      return Number(a.code) < Number(b.code) ? -1 : 1;
    });
  }

  checkPermissions(
    options: ContractMenuOptionsEnum[]
  ): ContractMenuOptionsEnum[] {
    let opts = [...options];

    if (
      !this.permissionSvc.hasPermission(
        PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION
      )
    ) {
      opts = opts.filter(
        (opt) =>
          opt !== ContractMenuOptionsEnum.AMENDMENT &&
          opt !== ContractMenuOptionsEnum.DELETE &&
          opt !== ContractMenuOptionsEnum.EDIT &&
          opt !== ContractMenuOptionsEnum.COMPLETE &&
          opt !== ContractMenuOptionsEnum.TERMINATE
      );
    }

    return opts;
  }

  showTooltip(e: MouseEvent): void {
    const element = e.target as HTMLElement;

    if (
      element.classList.contains('has-ellipsis') &&
      element.offsetWidth < element.scrollWidth
    ) {
      this.tooltipDir.toggle(element);
    } else {
      this.tooltipDir.hide();
    }
  }

  addContractV2() {
    this.router.navigate(['new-create'], { relativeTo: this.activatedRoute });
  }
}
