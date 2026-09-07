import { AdditionalDocPackagesService } from '../../services/additional-doc-packages.service';
import { AdditionalPackage, BiddingProcessPlan } from '@core/models';

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, from, Observable, of, Subscription } from 'rxjs';
import { filter, map, mergeMap, tap } from 'rxjs/operators';
import {
  BiddingProcessDocumentPackagesStoreService,
  BiddingProcessPlanStoreService,
  EnumsStoreService,
  ProjectStoreService,
} from '@core/services/store-services';
import { VisibilityService } from '@core/services/view';
import {
  BiddingProcessDocumentGroup,
  BiddingProcessDocumentPackage,
  BiddingProcessProcurementProcess,
  DialogResponse,
  Enumerator,
  Enums,
  FiduciaryProcessDocument,
  FiduciaryProcessDocumentGroup,
  GetBiddingProcessDocumentGroupsByDocumentPackageIdResponse,
  GetFiduciaryProcessDocumentsIdResponse,
  GetSettingsResponse,
  KeyValueInput,
  PackagesAwardeds,
  ParticipantAwarded,
  ParticipantResult,
  ParticipantsAwardedResponse,
  UploadBiddingProcessPackageDocuments,
  UploadBiddingProcessPackageDocumentsWithResultAndAwarded,
  UploadFiduciaryProcessDocuments,
  WorkflowLastStepResponse,
  ModalOptions,
} from '@core/models';
import {
  DocumentDomain,
  BiddingProcurementProcessSupervisionMethods,
  DocumentPackagesStatus,
  PermissionEnum,
  SettingType,
  SettingActionType,
  BiddingProcessDocumentGroupsResults,
  WorkflowIdEntityType,
  DocEnum,
  BiddingProcessProcurementProcessStatuses,
  BiddingProcessPlanStatus,
} from '@core/enums';
import {
  EventDocument,
  NewDocuments,
} from '../../../process-doc-packages/models/event-document.model';
import { TranslateService } from '@ngx-translate/core';
import {
  BiddingProcessDocumentPackagesApiService,
  ParticipantsApiService,
} from '@core/services/apis';
import {
  DialogReturn,
  ModalService,
  NotificationGlobalService,
} from '@fiduciary-interface/app/shared';
import { AppUtilsService } from '@fiduciary-interface/app/app-utils.service';
import { ProcessConfiguration } from '@core/services/process-configuration.service';
import { Store } from '@ngrx/store';
import {
  AppStateWithBiddingProcessDocumentPackages,
  AppStateWithContact,
  AppStateWithUsrPreferences,
  ContactState,
  UsrPreferencesState,
} from '@core/store';
import * as actions from '@core/store/bidding-process-document-packages/actions/bidding-process-document-packages.actions';
import { WorkflowSharedService } from '@fiduciary-interface/app/shared/components/flows-sticky-footer/services';
import { TranslateEnumPipe } from '@fiduciary-interface/app/shared/pipes/translate-enum.pipe';

@Component({
  selector: 'fi-additional-document-tab',
  templateUrl: './additional-document-tab.component.html',
})
export class AdditionalDocumentTabComponent implements OnInit, OnDestroy {
  additionalPackage: AdditionalPackage;

  public subscriptions = new Subscription();
  public mobileView = false;
  selectedDocument = null;
  expandedRows = {};
  loading = false;
  procurementProcess: BiddingProcessProcurementProcess;
  procurementProcessSupervisionMethod: BiddingProcurementProcessSupervisionMethods;
  supervisionMethods = BiddingProcurementProcessSupervisionMethods;
  docPackagesStatus = DocumentPackagesStatus;
  projectBucketId: string;
  instAcronym: string;
  projectContractId: string;
  processProcurementProcessId: string;
  documentDomain = DocumentDomain;
  isUploading = false;
  completeView = true;
  itemBoolean = true;
  cleanSelection: FiduciaryProcessDocument = null;
  packagesGroups: FiduciaryProcessDocumentGroup[][] = [];
  packagesGroupsOptions: FiduciaryProcessDocumentGroup[][] = [];
  packagesVisbility: boolean[] = [];
  enumBiddingProcessDocumentGroupCodes: Enumerator[];
  documentPackages: BiddingProcessDocumentPackage[] = [];
  isEnumLoaded: boolean;
  resultOptionsEnum: Enumerator[];
  groupLoading: boolean[] = [];
  Enums = Enums;

  mode = DocEnum.PACKAGES;
  documentSectionViewPermission: PermissionEnum[] = [
    PermissionEnum.VIEW_PROCUREMENT_INFORMATION,
  ];
  addAdditionalPackagePermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  documentEditPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
    PermissionEnum.ADD_DELETE_BANK_RESPONSE_DOCUMENT,
  ];
  viewDocumentPackagePermission: PermissionEnum[] = [
    PermissionEnum.VIEW_PROCUREMENT_INFORMATION,
  ];
  documentDeletePermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
    PermissionEnum.ADD_DELETE_BANK_RESPONSE_DOCUMENT,
  ];
  documentActualDateEditPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  documentDownloadDocumentGuestPermission: PermissionEnum[] = [
    PermissionEnum.DOWNLOAD_PACKAGE_DOCUMENTS,
  ];
  documentDownloadDocumentPermission: PermissionEnum[] = [
    PermissionEnum.VIEW_PROCUREMENT_INFORMATION,
  ];
  selectedLanguage: string;
  prodIsInternal: boolean;
  devIsInternal: boolean;
  isUserInternal: boolean;
  teamLeader: boolean;
  stepData: WorkflowLastStepResponse;
  noObjection: boolean;
  isBtnClicked: boolean[] = [];
  isGeneratedDocument: boolean;
  indexFileDeleted: number;
  groupEnum: string;
  displayAddPackageBtn: boolean;
  lastBidValidityExtensionDate: Date = null;
  originalBidValidityDate: Date = null;
  documentsPackages$: Observable<any>;
  selectedProcurementProcess$: Observable<any>;
  planState$: Observable<any>;
  loadingAddPackage: boolean;
  loadingPlan: boolean;
  processPlan: BiddingProcessPlan;
  planNotInSync: boolean;
  constructor(
    readonly additionalDocPackagesService: AdditionalDocPackagesService,
    readonly documentPackageStore: BiddingProcessDocumentPackagesStoreService,
    private readonly visibilitySvc: VisibilityService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly biddingStoreSvc: BiddingProcessPlanStoreService,
    private readonly biddingProcessPackageDocuments: BiddingProcessDocumentPackagesApiService,
    private readonly storeProject: ProjectStoreService,
    private readonly workflowSharedSvc: WorkflowSharedService,
    private readonly notificationGlobalService: NotificationGlobalService,
    private readonly translate: TranslateService,
    private readonly enumsSvc: EnumsStoreService,
    private readonly utilsSvc: AppUtilsService,
    readonly configSvc: ProcessConfiguration,
    private readonly store: Store<AppStateWithBiddingProcessDocumentPackages>,
    private readonly participantsService: ParticipantsApiService,
    readonly storePreferences: Store<AppStateWithUsrPreferences>,
    readonly storeContact: Store<AppStateWithContact>,
    readonly fiModalSvc: ModalService,
    private readonly translateEnum: TranslateEnumPipe
  ) {}

  ngOnInit(): void {
    this.planState$ = this.biddingStoreSvc
      .getOrLoadBiddingProcessPlan()
      .pipe(filter((data) => data.biddingPlanState.biddingProcessPlan !== null))
      .pipe(map((data) => data.biddingPlanState.biddingProcessPlan));

    this.getContactInformation();
    this.getCurrentLang();
    this.processProcurementProcessId =
      this.activatedRoute.snapshot.params.processId;
    this.visibilitySvc.setVisiblityProjectHeader(false);
    this.visibilitySvc.setVisiblityProcessHeader(true);
    this.loadDocumentsPackages();
    this.loadSelectedProcurementProcess();
    this.checkEnumsLoaded();
    this.groupEnum = Enums.biddingProcessDocumentGroupCodes;
    this.checkStatusForAddBtn();
  }

  addPackage(): void {
    this.loadingAddPackage = true;
    this.additionalDocPackagesService
      .addPackage(this.procurementProcess.id, this.additionalPackage)
      .subscribe(
        () => {
          this.notificationGlobalService.showSuccess(
            this.translate.instant(
              'PROCESS_DOC.ADDITONAL_DOCUMENT_TAB.ADD_ADDITIONAL_PACKAGE_SUCCESS'
            )
          );
          this.loadDocumentsPackages(true);
        },
        () => {
          this.errorMessage(
            'PROCESS_DOC.ADDITONAL_DOCUMENT_TAB.ADD_ADDITIONAL_PACKAGE_ERROR'
          );
        }
      );
  }

  getSettingsAdditionalPackage(): void {
    const attributes =
      this.additionalDocPackagesService.buildAttributesAdditionalPackage(
        this.procurementProcess.category.name,
        this.procurementProcess.procurementMethod.name,
        this.procurementProcess.supervisionMethod.name
      );
    this.configSvc
      .settings(
        attributes,
        SettingActionType.Extend,
        SettingType.AdditionalDocumentPackage
      )
      .subscribe((data: GetSettingsResponse) => {
        const formatedString = data.settings[0].values?.replace(/\\"/g, '"');
        if (formatedString !== '') {
          const newArray = JSON.parse(formatedString);
          const id = this.translateEnum.getIdByName(
            `ENUM.PROCESS.OPTIONAL.DOCUMENT.PACKAGE.${newArray?.packages[0]?.packageCode}`,
            Enums.biddingProcessDocumentPackageCodes
          );
          this.additionalPackage = {
            ...newArray?.packages[0],
            packageCode: id,
          };
        }
      });
  }

  getContactInformation(): void {
    this.subscriptions.add(
      this.getContact().subscribe((data) => {
        this.prodIsInternal = data?.contact?.is_internal;
        this.isUserInternal = this.getUserIsInternal();
      })
    );
  }

  getCurrentLang(): void {
    const sub = this.getPreferences().subscribe((data) => {
      if (data.preferences.preferredLanguage) {
        this.selectedLanguage = data.preferences.preferredLanguage;
      }
    });
    this.subscriptions.add(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getPackageDataAndResults(index: number): void {
    //TODO: REFACTOR
    this.groupLoading[index] = true;
    let packageLenght: number;
    const groupsDocs: BiddingProcessDocumentGroup[] = [];
    const docPackage = this.documentPackages[index];
    this.biddingProcessPackageDocuments
      .getBiddingProcessDocumentGroups(docPackage.id)
      .pipe(
        mergeMap(
          (res: GetBiddingProcessDocumentGroupsByDocumentPackageIdResponse) => {
            packageLenght = res.biddingProcessDocumentGroups.length;
            return from(res.biddingProcessDocumentGroups);
          }
        ),
        mergeMap((group: BiddingProcessDocumentGroup) => {
          group.fiduciaryProcessDocuments = [];
          return this.biddingProcessPackageDocuments
            .getFiduciaryProcessDocuments(
              group.id,
              this.documentDomain.BIDDINGPROCESSDOCUMENTGROUP
            )
            .pipe(
              map((hw: GetFiduciaryProcessDocumentsIdResponse) => {
                group.fiduciaryProcessDocuments.push(
                  ...hw.fiduciaryProcessDocuments.map((d) => {
                    return { ...d, newDescription: d.description };
                  })
                );

                group.documentsState = {
                  loading: false,
                };
                return group;
              })
            );
        }),
        mergeMap((group: BiddingProcessDocumentGroup) => {
          if (group.documentGroupConfiguration.isResult) {
            const attributes = this.buildResultQueryParams(
              docPackage.code,
              group.documentGroupCode
            );
            return this.querySettings(attributes).pipe(
              map((r: ParticipantResult) => {
                const newGroup = { ...group };
                newGroup.options = r.TypeResult;
                newGroup.TypeResultMandatory = r.TypeResultMandatory;
                return newGroup;
              })
            );
          } else {
            group.options = [];
            return of(group);
          }
        }),
        mergeMap((group: BiddingProcessDocumentGroup) => {
          if (
            group.documentGroupConfiguration.result ===
              BiddingProcessDocumentGroupsResults.AWARDED &&
            group.documentGroupConfiguration.isResult === true
          ) {
            return this.participantsService
              .getAwardedParticipants(this.processProcurementProcessId)
              .pipe(
                map((participants: ParticipantsAwardedResponse) => {
                  const newGroup = { ...group };
                  newGroup.participantsOptions =
                    participants.participantsAwarded;
                  return newGroup;
                })
              );
          } else {
            group.participantsOptions = [];
            return of(group);
          }
        }),
        mergeMap((group: BiddingProcessDocumentGroup) => {
          if (
            group.documentGroupConfiguration.result ===
              BiddingProcessDocumentGroupsResults.AWARDED &&
            group.documentGroupConfiguration.isResult === true
          ) {
            return this.biddingProcessPackageDocuments
              .getPackagesAwardeds(group.id)
              .pipe(
                map((participantsId: PackagesAwardeds) => {
                  const newGroup = { ...group };
                  newGroup.awardeds = participantsId.documentGroupAwardedIdList;
                  return newGroup;
                })
              );
          } else {
            group.participantsOptions = [];
            return of(group);
          }
        })
      )
      .subscribe((data) => {
        groupsDocs.push(data);
        if (groupsDocs.length === packageLenght) {
          const groups = this.addOptionsToDocs(groupsDocs);
          this.documentPackageStore.getDocumentGroupsAction(
            this.processProcurementProcessId,
            docPackage.id,
            groups
          );

          this.groupLoading[index] = false;
        }
        this.loadingAddPackage = false;
      });
  }

  addOptionsToDocs(
    groups: BiddingProcessDocumentGroup[]
  ): BiddingProcessDocumentGroup[] {
    groups.forEach((g) => {
      g.fiduciaryProcessDocuments.forEach((doc) => {
        doc.result =
          (g.documentGroupConfiguration.result ===
            BiddingProcessDocumentGroupsResults.AWARDED &&
            g.documentGroupConfiguration.isResult === true) ||
          g.documentGroupConfiguration.result !==
            BiddingProcessDocumentGroupsResults.NORESULT
            ? g.documentGroupConfiguration.result
            : -1;
        doc.options = [
          {
            groupCode: g.documentGroupCode,
            options: g.options,
          },
        ];
        doc.showHeaderResult = g.documentGroupConfiguration.isResult;
        doc.actualResults = g.options;
        doc.groupCode = g.documentGroupCode;
        doc.participantsOptions = g.participantsOptions;
        doc.awardeds = g.awardeds?.map((a) => a.biddingProcessParticipantId);
        doc.visibility = g.documentGroupConfiguration.visibility;
        doc.mandatory = g.documentGroupConfiguration.isMandatory;
      });
    });
    return groups;
  }

  checkEnumsLoaded(): void {
    this.subscriptions.add(
      this.enumsSvc.selectEnums().subscribe((data) => {
        const packageCodeEnum =
          data.enumsLoaded[Enums.biddingProcessDocumentPackageCodes];
        const packageStatusEnum =
          data.enumsLoaded[Enums.biddingProcessDocumentPackageStatuses];
        const resultPackageStatusEnum =
          data.enumsLoaded[Enums.biddingProcessDocumentgroupResults];

        this.isEnumLoaded =
          packageCodeEnum && packageStatusEnum && resultPackageStatusEnum;
        this.resultOptionsEnum = data.biddingProcessDocumentgroupResults;

        if (this.isEnumLoaded) {
          this.enumBiddingProcessDocumentGroupCodes =
            data['biddingProcessDocumentGroupCodes'];
        }
      })
    );
  }

  loadSelectedProcurementProcess(): void {
    this.selectedProcurementProcess$ =
      this.biddingStoreSvc.getOrLoadSelectedBiddingProcessById(
        this.processProcurementProcessId
      );

    const sub = this.selectedProcurementProcess$.subscribe((data) => {
      if (data.selectedBiddingProcessProcurementProcess) {
        this.procurementProcess = data.selectedBiddingProcessProcurementProcess;
        this.procurementProcessSupervisionMethod =
          this.procurementProcess.supervisionMethod.id;
        this.originalBidValidityDate = data
          .selectedBiddingProcessProcurementProcess.bidValidity
          ? new Date(data.selectedBiddingProcessProcurementProcess.bidValidity)
          : null;
        this.getSettingsAdditionalPackage();
      }
    });
    this.subscriptions.add(sub);
  }

  calculateLastBidValidityExtensionDate(
    biddingProcessDocumentPackage: BiddingProcessDocumentPackage[]
  ): Date {
    const lastPackageComplete = biddingProcessDocumentPackage
      .slice()
      .reverse()
      .find((p) => p.status === DocumentPackagesStatus.COMPLETE);
    return lastPackageComplete
      ? new Date(lastPackageComplete.bidValidityExtensionDate)
      : null;
  }

  loadDocumentsPackages(isAddPackage = false): void {
    this.documentPackageStore.getDocumentPackagesAction(
      this.processProcurementProcessId,
      true
    );
    this.documentsPackages$ =
      this.documentPackageStore.getDocumentPackagesByProcess(
        this.processProcurementProcessId
      );

    const subscription = this.documentsPackages$
      .pipe(
        tap((state) => {
          this.loading = state.loading;
        }),
        map((state) => {
          return {
            documentPackages: state.biddingProcessDocumentPackages,
          };
        })
      )
      .subscribe(({ documentPackages }) => {
        this.documentPackages = [...documentPackages].sort(
          (a, b) => a.order - b.order
        );
        this.lastBidValidityExtensionDate =
          this.calculateLastBidValidityExtensionDate(documentPackages);
        this.documentPackages = this.documentPackages.map((doc) => {
          const newDoc = { ...doc };
          newDoc.isReadOnly = this.shouldDisplayReadOnly(newDoc);
          return newDoc;
        });
        this.getGroups();
        this.getReadOnly();
        this.loadWorkflowActions();

        if (isAddPackage && this.documentPackages.length > 0) {
          this.documentPackages.forEach((_, index) => {
            if (this.expandedRows[index]) {
              this.expandedRows[index] = !this.expandedRows[index];
              this.expandRow(index);
            }
          });
          isAddPackage = false;
        } else {
          this.loadingAddPackage = false;
        }
      });
    this.subscriptions.add(subscription);
  }

  checkStatusForAddBtn(): void {
    this.loadingPlan = true;
    const sub = combineLatest([
      this.documentsPackages$,
      this.selectedProcurementProcess$,
      this.planState$,
    ])
      .pipe(
        filter(
          (data) =>
            !!data[1].selectedBiddingProcessProcurementProcess &&
            !data[0].loading &&
            data[2] !== null
        )
      )
      .subscribe((data) => {
        this.loadingPlan = false;
        this.processPlan = data[2];
        this.planNotInSync =
          this.processPlan?.status !== BiddingProcessPlanStatus.IN_SYNC;
        if (
          this.procurementProcess.supervisionMethod.id ===
            this.supervisionMethods.EX_ANTE &&
          (this.procurementProcess.status ===
            BiddingProcessProcurementProcessStatuses.TECHNICAL_EVALUATION_OF_BIDS_PROPOSALS ||
            this.procurementProcess.status ===
              BiddingProcessProcurementProcessStatuses.EVAL_BID_PROPOSAL)
        ) {
          if (this.documentPackages.length === 0) {
            this.displayAddPackageBtn = true;
          } else {
            const statusesNotDisplayBtn = [
              DocumentPackagesStatus.NOT_STARTED,
              DocumentPackagesStatus.RETURNED,
              DocumentPackagesStatus.UNDER_REVIEW,
            ];
            this.displayAddPackageBtn = !statusesNotDisplayBtn.includes(
              this.documentPackages[this.documentPackages.length - 1].status
            );
          }
        } else if (
          this.procurementProcess.supervisionMethod.id !==
          this.supervisionMethods.EX_ANTE
        ) {
          this.displayAddPackageBtn = true;
        } else {
          this.displayAddPackageBtn = false;
        }
        this.displayAddPackageBtn =
          this.displayAddPackageBtn &&
          this.processPlan?.status !== BiddingProcessPlanStatus.IN_SYNC;
      });
    this.subscriptions.add(sub);
  }

  getReadOnly(): void {
    this.documentPackages.forEach((p, index) => {
      this.packagesVisbility[index] = this.shouldDisplayReadOnly(p);
    });
  }

  getUserIsInternal(): boolean {
    let isInternal: boolean;
    isInternal = this.prodIsInternal;
    return isInternal;
  }

  getGroups(): void {
    this.documentPackages.forEach((p, index) => {
      this.groupLoading[index] = false;
      this.packagesGroups[index] = p.biddingProcessDocumentGroups.map((g) => {
        return {
          id: g.id,
          groupCode: g.documentGroupCode,
          fiduciaryProcessDocuments: g.fiduciaryProcessDocuments,
          isMandatory: g.documentGroupConfiguration.isMandatory,
          documentGroupConfiguration: g.documentGroupConfiguration,
        };
      });
    });
  }

  getFirstNotStartedOrReturnedPackages(): number {
    const filteredPackages = this.documentPackages.filter(
      (el) =>
        el.status === this.docPackagesStatus.NOT_STARTED ||
        el.status === this.docPackagesStatus.RETURNED
    );
    if (filteredPackages.length > 0) {
      return filteredPackages[0].order;
    } else {
      return -1;
    }
  }

  getBooleanStatusNotStartedOrReturned(
    item: BiddingProcessDocumentPackage
  ): boolean {
    return (
      item.status === this.docPackagesStatus.NOT_STARTED ||
      item.status === this.docPackagesStatus.RETURNED
    );
  }

  getBooleanStatusCompleteOrAmendmentReturned(
    item: BiddingProcessDocumentPackage
  ): boolean {
    return (
      item.status === this.docPackagesStatus.COMPLETE ||
      item.status === this.docPackagesStatus.AMENDMENT_RETURNED
    );
  }

  checkFirstPakage(item: BiddingProcessDocumentPackage): boolean {
    let firstPakage = null;
    for (const dPackage of this.documentPackages) {
      if (
        (this.getBooleanStatusNotStartedOrReturned(dPackage) ||
          this.getBooleanStatusCompleteOrAmendmentReturned(dPackage)) &&
        this.checkDocumentPakage(dPackage) &&
        this.checkIsAmendmentOrIsClarification(item)
      ) {
        firstPakage = dPackage;
        break;
      }
    }

    return firstPakage != null && firstPakage.id === item.id;
  }

  shouldDisplayReadOnly(item: BiddingProcessDocumentPackage): boolean {
    let result: boolean;
    if (!this.getUserIsInternal()) {
      if (
        this.procurementProcessSupervisionMethod ===
        this.supervisionMethods.EX_ANTE
      ) {
        result = !(
          (this.checkFirstNotStartedOrReturned(item) &&
            this.checkPreviousPackageStatus(item)) ||
          this.checkLastCompletedOrAmendmentReturnedOrCompleteWithAmendments(
            item
          )
        );
        //  TODO: In this case if the method checkFirstNotStartedOrReturned returns false we should display a message
        //  to indicate the user that the supervision method is Ex-ante
      } else {
        result = !(
          this.getBooleanStatusNotStartedOrReturned(item) ||
          this.getBooleanExPostRules(item)
        );
      }
    } else {
      if (
        item.status === DocumentPackagesStatus.UNDER_REVIEW ||
        item.status === DocumentPackagesStatus.AMENDMENT_UNDER_REV
      ) {
        result = false;
      } else {
        result = true;
      }
    }
    return result;
  }

  checkPreviousPackageStatus(item: BiddingProcessDocumentPackage): boolean {
    const orderPackage = item.order;
    if (orderPackage !== 1) {
      const prevPackage = this.documentPackages.find(
        (p) => p.order === orderPackage - 1
      );
      if (
        prevPackage?.status === DocumentPackagesStatus.COMPLETE ||
        prevPackage?.status === DocumentPackagesStatus.COMPLETE_AMENDMENT ||
        prevPackage?.status === DocumentPackagesStatus.AMENDMENT_UNDER_REV ||
        prevPackage?.status === DocumentPackagesStatus.AMENDMENT_RETURNED
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }

  checkFirstNotStartedOrReturned(item: BiddingProcessDocumentPackage): boolean {
    const firstNotStartedOrder = this.getFirstNotStartedOrReturnedPackages();
    if (firstNotStartedOrder !== -1) {
      if (item.order === firstNotStartedOrder) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  checkLastCompletedOrAmendmentReturnedOrCompleteWithAmendments(
    item: BiddingProcessDocumentPackage
  ): boolean {
    const filtered = this.documentPackages.filter(
      (el) =>
        el.status === DocumentPackagesStatus.COMPLETE ||
        el.status === DocumentPackagesStatus.AMENDMENT_RETURNED ||
        el.status === DocumentPackagesStatus.COMPLETE_AMENDMENT
    );
    if (filtered.length >= 1) {
      const amountPackagesCompletedOrAmendmentReturned = filtered.length;
      const index = amountPackagesCompletedOrAmendmentReturned - 1;
      if (this.checkIsAmendmentOrIsClarification(filtered[index])) {
        if (filtered[index].id === item.id) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  getBooleanExPostRules(item: BiddingProcessDocumentPackage): boolean {
    return (
      this.checkIsAmendmentOrIsClarification(item) &&
      (item.status === this.docPackagesStatus.COMPLETE ||
        item.status === this.docPackagesStatus.AMENDMENT_RETURNED ||
        item.status === this.docPackagesStatus.COMPLETE_AMENDMENT)
    );
  }

  checkDocumentPakage(item: BiddingProcessDocumentPackage): boolean {
    return item.biddingProcessDocumentGroups.length > 0;
  }

  checkIsAmendmentOrIsClarification(
    item: BiddingProcessDocumentPackage
  ): boolean {
    return item.biddingProcessDocumentGroups.some((group) => {
      return (
        !!group.documentGroupConfiguration &&
        (group.documentGroupConfiguration.isAmendment ||
          group.documentGroupConfiguration.isClarification)
      );
    });
  }

  initMobileConditionals(): void {
    this.subscriptions.add(
      this.visibilitySvc.sizeWindow().subscribe((data) => {
        this.mobileView = data.mobileView;
      })
    );
  }

  expandRow(index: number): void {
    //TODO: CHECK BUSSINESS LOGIC WITH JOAO
    if (this.expandedRows[index] !== true) {
      this.indexFileDeleted = index;
      this.getPackageDataAndResults(index);
    }

    this.expandedRows[index] = !this.expandedRows[index];
  }

  searchDocumentGenerated(
    groupsDocs: BiddingProcessDocumentGroup[]
  ): FiduciaryProcessDocument {
    if (groupsDocs.length === 0) {
      return null;
    }
    const groupCode = this.getGroupCode(groupsDocs);
    return this.getDocument(groupCode, groupsDocs);
  }

  getDocument(
    groupCode: number,
    groups: BiddingProcessDocumentGroup[]
  ): FiduciaryProcessDocument {
    let document: FiduciaryProcessDocument;
    groups.forEach((group) => {
      if (group.fiduciaryProcessDocuments) {
        group.fiduciaryProcessDocuments.forEach((doc) => {
          if (doc.groupCode === groupCode) {
            document = doc;
          }
        });
      }
    });
    return document;
  }

  getGroupCode(groupsDocs: BiddingProcessDocumentGroup[]): number {
    let groupCode = 0;
    const groupFiltered = groupsDocs?.filter(
      (docs) => docs.documentGroupConfiguration.isAutogenerated
    );

    if (groupFiltered.length > 1) {
      groupCode = groupFiltered.find(
        (doc) => doc.documentGroupConfiguration.isMandatory
      )?.documentGroupCode;
    } else {
      groupCode = groupFiltered[0]?.documentGroupCode;
    }

    return groupCode;
  }

  collapseDetail(index: number): void {
    this.expandRow(index);
  }

  editFileAction(data, index: number): void {
    const event: EventDocument = data.event;
    const documentPackageId = data.parentId;
    const documentPackage = this.documentPackages.find(
      (dp) => dp.id === documentPackageId
    );

    let biddingProcessDocumentGroupId: UploadFiduciaryProcessDocuments;
    let g = null;
    for (const group of documentPackage.biddingProcessDocumentGroups) {
      if (group.documentGroupCode === event.groupCode) {
        g = group;
        biddingProcessDocumentGroupId = {
          biddingProcessDocumentGroupId: group.id,
        };
      }
    }

    const filteredGroup: BiddingProcessDocumentGroup =
      documentPackage.biddingProcessDocumentGroups.find(
        (g) => g.documentGroupCode === event.groupCode
      );

    if (
      this.checkIsUniqueDocumentCorrect(g, event) &&
      event.groupCode !== null
    ) {
      if (event.item.id === '' || event.item.id === null) {
        this.isUploading = true;
        if (event.groupCode === undefined) {
          this.isUploading = false;
          this.documentPackageStore.addedDescriptionNotUploadedDoc(
            this.processProcurementProcessId,
            documentPackageId,
            event.item
          );
        } else {
          this.checkPackagesAndResultInfo(
            biddingProcessDocumentGroupId,
            event,
            filteredGroup,
            documentPackageId,
            index
          );
        }
      } else {
        this.editTypeDocument(
          event,
          documentPackageId,
          biddingProcessDocumentGroupId,
          filteredGroup,
          index
        );
      }
    } else {
      const aux = { ...event.item };
      aux.groupCode = event.groupCode;
      this.groupLoading[index] = true;
      this.cleanSelection = aux;
      if (event.groupCode !== null) {
        this.errorMessage(
          'PROCESS_DOC.DOCUMENT_TAB.DOCUMENT_MESSAGES.UNIQUENESS_ERROR'
        );
      }
      setTimeout(() => {
        this.groupLoading[index] = false;
      }, 300);
    }
  }

  checkPackagesAndResultInfo(
    biddingProcessDocumentGroupId: UploadFiduciaryProcessDocuments,
    event: EventDocument,
    filteredGroup: BiddingProcessDocumentGroup,
    documentPackageId: any,
    index: number
  ): void {
    this.biddingProcessPackageDocuments
      .uploadDocumentsPackages(
        this.procurementProcess.id,
        biddingProcessDocumentGroupId.biddingProcessDocumentGroupId,
        event.item.file,
        event.item.description
      )
      .pipe(
        mergeMap((response: UploadBiddingProcessPackageDocuments) => {
          const packageResponseWithAwardeds: UploadBiddingProcessPackageDocumentsWithResultAndAwarded =
            {
              relationalId: response.relationalId,
              newFileName: response.newFileName,
              fiduciaryProcessDocumentId: response.fiduciaryProcessDocumentId,
              awardeds: [],
              participantsOptions: [],
            };
          return of(packageResponseWithAwardeds);
        }),
        mergeMap(
          (
            response: UploadBiddingProcessPackageDocumentsWithResultAndAwarded
          ) => {
            if (
              filteredGroup.documentGroupConfiguration.result ===
                BiddingProcessDocumentGroupsResults.AWARDED &&
              filteredGroup.documentGroupConfiguration.isResult === true
            ) {
              return this.participantsService
                .getAwardedParticipants(this.processProcurementProcessId)
                .pipe(
                  map((participants: ParticipantsAwardedResponse) => {
                    const newResponse = { ...response };
                    newResponse.participantsOptions =
                      participants.participantsAwarded;
                    return newResponse;
                  })
                );
            } else {
              return of(response);
            }
          }
        ),
        mergeMap(
          (
            response: UploadBiddingProcessPackageDocumentsWithResultAndAwarded
          ) => {
            if (
              event.isResult === true &&
              filteredGroup.documentGroupConfiguration.result ===
                BiddingProcessDocumentGroupsResults.AWARDED
            ) {
              return this.biddingProcessPackageDocuments
                .getPackagesAwardeds(
                  biddingProcessDocumentGroupId.biddingProcessDocumentGroupId
                )
                .pipe(
                  map((res) => {
                    const newResponse = { ...response };
                    newResponse.awardeds = res.documentGroupAwardedIdList.map(
                      (a) => a.biddingProcessParticipantId
                    );
                    return newResponse;
                  })
                );
            } else {
              return of(response);
            }
          }
        )
      )
      .subscribe(
        (
          response: UploadBiddingProcessPackageDocumentsWithResultAndAwarded
        ) => {
          const newEvent = {
            ...event,
          };
          const document = {
            ...newEvent.item,
          };

          document.relationalId = response.relationalId;
          document.name = response.newFileName;
          newEvent.item = document;
          document.id = response.fiduciaryProcessDocumentId;

          this.actionsOnEditDocument(
            event,
            documentPackageId,
            true,
            newEvent,
            response.participantsOptions,
            response.awardeds,
            index
          );
        },
        () => {
          this.errorMessage(
            'PROCESS_DOC.DOCUMENT_TAB.DOCUMENT_MESSAGES.UPLOADED_BLOB_STORAGE_ERROR'
          );
        }
      )
      .add(() => (this.isUploading = false));
  }

  checkIsUniqueDocumentCorrect(
    group: BiddingProcessDocumentGroup,
    doc: EventDocument
  ): boolean {
    if (
      !!group &&
      !!group.documentGroupConfiguration &&
      !!group.documentGroupConfiguration.isUniqueDocument
    ) {
      if (group.fiduciaryProcessDocuments.length === 0) {
        return true;
      } else {
        return (
          group.fiduciaryProcessDocuments.find((d) => d.id === doc.item.id) !==
          undefined
        );
      }
    }
    return true;
  }

  editTypeDocument(
    event: EventDocument,
    documentPackageId: string,
    biddingProcessDocumentGroupId: UploadFiduciaryProcessDocuments,
    group: BiddingProcessDocumentGroup,
    index?: number
  ): void {
    if (event.updatingDescription !== true) {
      this.isUploading = true;
      this.biddingProcessPackageDocuments
        .editBiddingProcessPackageDocument(
          event.item.relationalId,
          this.processProcurementProcessId,
          biddingProcessDocumentGroupId,
          event.item.description
        )
        //TODO: REFACTOR
        .pipe(
          mergeMap((res: string) => {
            const obj = {
              filename: res,
            } as any;
            return of(obj);
          }),
          mergeMap((r) => {
            if (event.isResult === true) {
              return this.queryResult(
                this.buildResultQueryParams(event.packageCode, event.groupCode)
              ).pipe(
                map((res) => {
                  const newObject = { ...r };
                  newObject.results = res;
                  return newObject;
                })
              );
            } else {
              const newObject = { ...r };
              newObject.results = null;
              return of(newObject);
            }
          }),
          mergeMap((r) => {
            if (
              event.isResult === true &&
              group.documentGroupConfiguration.result ===
                BiddingProcessDocumentGroupsResults.AWARDED
            ) {
              return this.biddingProcessPackageDocuments
                .getPackagesAwardeds(
                  biddingProcessDocumentGroupId.biddingProcessDocumentGroupId
                )
                .pipe(
                  map((res) => {
                    const newObject = { ...r };
                    newObject.awardeds = res.documentGroupAwardedIdList.map(
                      (a) => a.biddingProcessParticipantId
                    );
                    return newObject;
                  })
                );
            } else {
              const newObject = { ...r };
              newObject.awardeds = null;
              return of(newObject);
            }
          }),
          mergeMap((r) => {
            if (
              event.isResult === true &&
              group.documentGroupConfiguration.result ===
                BiddingProcessDocumentGroupsResults.AWARDED
            ) {
              return this.participantsService
                .getAwardedParticipants(this.processProcurementProcessId)
                .pipe(
                  map((res: ParticipantsAwardedResponse) => {
                    const newObject = { ...r };
                    newObject.options = res.participantsAwarded;
                    return newObject;
                  })
                );
            } else {
              const newObject = { ...r };
              newObject.options = null;
              return of(newObject);
            }
          })
        )
        .subscribe((data) => {
          this.actionsOnEditDocument(
            event,
            documentPackageId,
            false,
            null,
            data.options,
            data.awardeds,
            index
          );
        })
        .add(() => (this.isUploading = false));
    } else {
      this.documentPackageStore.addDescriptionToExistingDoc(
        this.processProcurementProcessId,
        documentPackageId,
        event.groupCode,
        event.item.id,
        event.item.description
      );
    }
  }

  actionsOnEditDocument(
    event: EventDocument,
    documentPackageId: string,
    isNewDocument = false,
    getNewDocument = null,
    awardedOptions?: ParticipantAwarded[],
    selectedAwardeds?: string[],
    index?: number
  ): void {
    const newDocuments: FiduciaryProcessDocument[] = [];
    this.deleteDocumentFromStorage(
      event.item,
      documentPackageId,
      isNewDocument
    );

    if (getNewDocument !== null) {
      event = getNewDocument;
    }

    const newDocument: FiduciaryProcessDocument = {
      id: event.item?.id,
      relationalId: event.item?.relationalId,
      status: event.item?.status,
      type: event.item?.type,
      operationsDocumentId: event.item?.operationsDocumentId,
      ezshareNumber: event.item?.ezshareNumber,
      name: event.item?.name,
      created: event.item?.created,
      createdBy: event.item?.createdBy,
      modified: event.item?.modified,
      groupCode: event.groupCode,
      description: event.item.description,
    };

    newDocuments.push(newDocument);

    this.documentPackageStore.addDocumentPackagesAction(
      this.processProcurementProcessId,
      documentPackageId,
      newDocuments,
      event.groupCode
    );
    if (event.isResult === true) {
      this.setPackageResultAndAwardeeds(
        this.queryResult(
          this.buildResultQueryParams(event.packageCode, event.groupCode)
        ),
        event,
        newDocument,
        awardedOptions,
        selectedAwardeds
      );
    }
    this.getPackageDataAndResults(index);
  }

  buildResultQueryParams(
    packageCode: number,
    groupCode: number
  ): KeyValueInput[] {
    const attributeDocPackageCode: KeyValueInput = {
      key: 'PackageCode',
      value: packageCode,
    };
    const attributeDocumentCode: KeyValueInput = {
      key: 'DocumentCode',
      value: groupCode,
    };
    const attributeCategory: KeyValueInput = {
      key: 'category',
      value: this.procurementProcess.category.id,
    };
    const attributeProcurementMethod: KeyValueInput = {
      key: 'procurementMethod',
      value: this.procurementProcess.procurementMethod.id,
    };
    const attributeSupervisionMethod: KeyValueInput = {
      key: 'supervisionMethod',
      value: this.procurementProcess.supervisionMethod.name,
    };
    return this.utilsSvc.buildAttributesArray(
      SettingType.ResultOptions,
      null,
      attributeCategory,
      attributeProcurementMethod,
      null,
      attributeSupervisionMethod,
      null,
      attributeDocPackageCode,
      attributeDocumentCode
    );
  }

  querySettings(attributes: KeyValueInput[]): Observable<ParticipantResult> {
    return this.configSvc
      .settings(
        attributes,
        SettingActionType.Extend,
        SettingType.ResultOptions,
        true
      )
      .pipe(
        mergeMap((el: GetSettingsResponse) =>
          this.enumsSvc.selectEnums().pipe(
            map((data) => {
              const settings = el?.settings?.[0].values?.replace(/\\"/g, '"');
              if (settings !== '') {
                const results: string[] = JSON.parse(settings)?.TypeResult;
                const TypeResultMandatory: boolean = JSON.parse(
                  JSON.parse(settings)?.TypeResultMandatory
                );
                const enums = data.biddingProcessDocumentgroupResults;
                const participantResult: ParticipantResult = {
                  TypeResult: enums.filter((enumItem) =>
                    results.some(
                      (result) => enumItem.name.split('.').pop() === result
                    )
                  ),
                  TypeResultMandatory,
                };
                return participantResult;
              } else {
                const participantResult: ParticipantResult = {
                  TypeResult: [],
                  TypeResultMandatory: false,
                };
                return participantResult;
              }
            })
          )
        )
      );
  }

  queryResult(attributes: KeyValueInput[]): Observable<Enumerator[]> {
    return this.querySettings(attributes).pipe(map((r) => r.TypeResult));
  }

  setPackageResultAndAwardeeds(
    obs: Observable<Enumerator[]>,
    event: EventDocument,
    document: FiduciaryProcessDocument,
    awardedOptions: ParticipantAwarded[],
    selectedAwardeds: string[]
  ): void {
    obs
      .subscribe((results) => {
        if (results && results.length >= 1) {
          const processId = this.procurementProcess.id;
          const documentId = document.id;
          const groupCode = event.groupCode;
          const packageCode = event.packageCode;
          this.store.dispatch(
            actions.updateDocOptionsResult({
              processId,
              packageCode,
              groupCode,
              documentId,
              results,
              awardedOptions,
              selectedAwardeds,
            })
          );
          this.isUploading = false;
        }
      })
      .add(() => (this.isUploading = false));
  }

  deleteDocumentFromStorage(
    document: FiduciaryProcessDocument,
    biddingProcessDocumentPackagesId: string,
    uploadFile = false
  ): void {
    this.documentPackageStore.deleteDocument(
      this.processProcurementProcessId,
      biddingProcessDocumentPackagesId,
      document,
      uploadFile
    );
  }

  public deleteAction(event: string): void {
    const sub = this.handleWarningModal().subscribe((data: DialogResponse) => {
      if (data.result === ModalOptions.ACCEPT) {
        this.deleteFileAction(event);
      }
    });
    this.subscriptions.add(sub);
  }

  handleWarningModal(): Observable<DialogReturn> {
    return this.fiModalSvc.open(
      'GPN.MODAL.TITLE',
      [
        { text: 'GPN.MODAL.OPTION.NO' },
        {
          text: 'GPN.MODAL.OPTION.YES',
          cssClass: 'k-primary',
        },
      ],
      [
        {
          key: 'BIDDINDG.MODAL.OPTION.CONTENT',
          bold: false,
        },
      ]
    );
  }

  deleteFileAction(data): void {
    const document = data.document;
    const documentPackageId = data.parentId;
    if (document.id === '' && document.relationalId === '') {
      this.deleteDocumentFromStorage(document, documentPackageId, true);
    } else {
      this.isUploading = true;
      this.biddingProcessPackageDocuments
        .deleteBiddingProcessPackageDocument(
          document.relationalId,
          documentPackageId
        )
        /* .deletePackageDocuments(this.processProcurementProcessId, document.id) */
        .subscribe(
          () => {
            this.deleteDocumentFromStorage(document, documentPackageId);
            this.getPackageDataAndResults(this.indexFileDeleted);
          },
          () => this.errorMessage()
        )
        .add(() => (this.isUploading = false));
    }
  }

  getAllDocuments(
    documentPackage: BiddingProcessDocumentPackage
  ): FiduciaryProcessDocument[] {
    const docs: FiduciaryProcessDocument[] = [];
    if (documentPackage.biddingProcessDocumentGroups) {
      documentPackage.biddingProcessDocumentGroups.forEach((group) => {
        if (group.fiduciaryProcessDocuments) {
          group.fiduciaryProcessDocuments.forEach((doc) => {
            docs.push(doc);
          });
        }
      });
    }

    if (documentPackage.documentsToUpload !== undefined) {
      documentPackage.documentsToUpload.forEach((doc) => {
        docs.push(doc);
      });
    }

    return docs;
  }

  handlerFilesChanged(data): void {
    const files = data.files;
    const parentId = data.parentId;
    const documents: FiduciaryProcessDocument[] = [];
    let fileList: FiduciaryProcessDocument[] = [];
    let documentsToUpload: any = [];

    if (files.length > 0) {
      for (const documentPackage of this.documentPackages) {
        if (documentPackage.id === parentId) {
          fileList = this.getAllDocuments(documentPackage);
          documentsToUpload = documentPackage.documentsToUpload;
        }
      }

      const addDocument = this.checkIsDocumentRepeat(
        files,
        fileList,
        documentsToUpload
      );

      if (addDocument) {
        files.forEach((file) => {
          documents.push({
            id: '',
            relationalId: '',
            status: 0,
            type: 0,
            operationsDocumentId: 0,
            ezshareNumber: '',
            name: file.name,
            created: file.lastModifiedDate,
            createdBy: '',
            modified: new Date(),
            file,
            description: '',
          });
        });

        this.documentPackageStore.addDocumentPackagesAction(
          this.processProcurementProcessId,
          parentId,
          documents
        );
      } else {
        this.errorMessage(
          'SHARED.DOCUMENT.PROCESS_DOC.DOCUMENT_MESSAGES.DUPLICATE_ERROR'
        );
      }
    } else {
      this.errorMessage(
        'SHARED.DOCUMENT.PROCESS_DOC.DOCUMENT_MESSAGES.FORMAT_ERROR'
      );
    }
  }

  btnClicked($event: number): void {
    this.isBtnClicked[$event] = true;
  }

  errorMessage(
    message = 'PROCESS_DOC.DOCUMENT_TAB.DOCUMENT_MESSAGES.DOWNLOAD_ERROR'
  ): void {
    this.notificationGlobalService.showError(
      this.translate.instant(message),
      'right',
      'top',
      7000
    );
  }

  checkIsDocumentRepeat(
    newDocuments: NewDocuments[],
    documentsList: FiduciaryProcessDocument[],
    documentsToUploadList
  ): boolean {
    let newFile = true;
    if (documentsList.length > 0) {
      documentsList.forEach((file) => {
        newDocuments.forEach((document) => {
          if (document.name === file.name) {
            newFile = false;
          }
        });
      });
    }

    if (documentsToUploadList !== undefined) {
      documentsToUploadList.forEach((UploadFile) => {
        newDocuments.forEach((document) => {
          if (document.name === UploadFile.name) {
            newFile = false;
          }
        });
      });
    }

    return newFile;
  }

  hideDetails(): void {
    this.visibilitySvc.setVisiblityProcessHeader(true);
    this.selectedDocument = null;
  }

  loadWorkflowActions(): void {
    this.subscriptions.add(
      this.storeProject
        .selectedProject()
        .pipe(
          filter((data) => !!data.selectedProject),
          tap((data) => {
            this.projectBucketId = data.selectedProject.projectBucketId;
            this.instAcronym = data.selectedProject.executorAcronym;
            this.projectContractId = data.selectedProject.contract;
          })
        )
        .subscribe((_) => {
          const documentPackage = this.documentPackages?.find(
            (dp) =>
              dp.status === DocumentPackagesStatus.UNDER_REVIEW ||
              dp.status === DocumentPackagesStatus.AMENDMENT_UNDER_REV
          );

          if (!!documentPackage) {
            this.workflowSharedSvc.loadActions(
              {
                body: {
                  entityTypeId: documentPackage.id,
                  projectBucketId: this.projectBucketId,
                  idEntityType: WorkflowIdEntityType.DOCUMENT_PACKAGE,
                },
                projectContractId: this.projectContractId,
                instAcronym: this.instAcronym,
              },
              {
                docPackageStatus: documentPackage.status,
                processId: this.processProcurementProcessId,
              }
            );
          }
        })
    );
  }

  completeDocs(packageIndex: number): void {
    this.groupLoading[packageIndex] = true;
    this.subscriptions.add(
      this.biddingProcessPackageDocuments
        .uploadAfterCompletionDocumentPackage(
          this.documentPackages[packageIndex].id
        )
        .subscribe(
          () => {
            this.expandRow(packageIndex);
            setTimeout(() => {
              this.expandRow(packageIndex);
            }, 200);
          },
          () => {
            this.notificationGlobalService.showError(
              this.translate.instant('PROCESS_DOC.CONFIRM_DOCUMENT_BTN.ERROR')
            );
          }
        )
        .add(() => {
          this.groupLoading[packageIndex] = false;
        })
    );
  }

  public getContact(): Observable<ContactState> {
    return this.storeContact.select('contact');
  }

  public getPreferences(): Observable<UsrPreferencesState> {
    return this.storePreferences.select('preferences');
  }
}
