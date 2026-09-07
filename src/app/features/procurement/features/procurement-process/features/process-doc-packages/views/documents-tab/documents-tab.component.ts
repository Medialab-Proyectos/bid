import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { from, Observable, of, Subscription, throwError } from 'rxjs';
import {
  catchError,
  filter,
  finalize,
  map,
  mergeMap,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
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
  WorkflowLastStepRequestBody,
  WorkflowLastStepResponse,
  ModalOptions,
  Project,
  BiddingProcessPlan,
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
  FiduciaryProcessDocumentsStatuses,
  BiddingProcessPlanStatus,
} from '@core/enums';
import { EventDocument, NewDocuments } from '../../models/event-document.model';
import { TranslateService } from '@ngx-translate/core';
import {
  BiddingProcessDocumentPackagesApiService,
  ParticipantsApiService,
  WorkflowApiService,
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
import { FormStatusEnum } from '@fiduciary-interface/app/features/forms/enums/form-status.enum';
import { BussinessRulesFormService } from '@fiduciary-interface/app/features/forms/services/bussiness-rules/bussiness-rules.service';
import { BussinessRulesFunctionEnum } from '@fiduciary-interface/app/features/forms/enums/bussiness-rules-form.enum';
import { BtnBusinessRuleGroup } from '@core/models/btnBusinessRules';
import {
  ProcurementMethod,
  BiddingProcessProcurementProcessStatuses,
} from '@core/enums';
import { PackageAndParticipantsService } from '@core/services/app';
import {
  DocumentPackageCode,
  DocumentPackageName,
} from '@core/enums/documentPackageCode.enum';
import { GroupNameEnum } from '@core/enums/groupCode.enum';
import { PermissionService } from '@core/services/app/permission/permission.service';
import { UboApiService } from '@core/services/apis/fiduciary-process-api/ubo-api/ubo-api.service';
import { UBOData } from '@core/models/ubo.model';
import { UboService } from '../../services/ubo.service';
import { DocumentGroupCode } from '@fiduciary-interface/app/shared/components/documents/enums';
import { AppStateWithPackageVisibility } from '@core/store/visibility-package-screen/reducer/visibility-package-screen.reducer';
@Component({
  selector: 'fi-documents-tab',
  templateUrl: './documents-tab.component.html',
})
export class DocumentsTabComponent implements OnInit, OnDestroy {
  public subscriptions = new Subscription();
  public mobileView = false;
  selectedDocument = null;
  expandedRows = {};
  loading = false;
  loadingPackagesAndParticipants = true;
  procurementProcess: BiddingProcessProcurementProcess;
  procurementProcessSupervisionMethod: BiddingProcurementProcessSupervisionMethods;
  supervisionMethods = BiddingProcurementProcessSupervisionMethods;
  docPackagesStatus = DocumentPackagesStatus;
  projectBucketId: string;
  instAcronym: string;
  projectContractId: string;
  operationNumber: string;
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
  groupLoadingBusiness: boolean[] = [];
  groupBtnBidding: BtnBusinessRuleGroup[] = [];
  groupResultBr: BussinessRulesFunctionEnum[] = [];
  Enums = Enums;
  displayBtnOpenDate = false;
  disabledValidityDate: boolean;
  loadingPlan: boolean;
  processPlan: BiddingProcessPlan;
  planNotInSync: boolean;

  availableAlertUNDB = [
    DocumentPackageCode.EOI,
    DocumentPackageCode.SPN,
    DocumentPackageCode.NOA_FIRMS,
    DocumentPackageCode.NOA_GOODS,
  ];

  btnBidding: BtnBusinessRuleGroup = null;

  mode = DocEnum.PACKAGES;
  documentSectionViewPermission: PermissionEnum[] = [
    PermissionEnum.VIEW_PROCUREMENT_INFORMATION,
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
  bidValidityDatePermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  UBOPermision: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
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
  resultBr: BussinessRulesFunctionEnum;
  groupEnum: string;
  showMessageShoppingOrRequest: boolean;
  readonly BID_VALIDITY_EXTENSION = 'BIDDING_PACKAGES_BID_VALIDITY_EXTENSION';
  showBidValidityExtension = false;
  originalDateRules = true;
  showReturnPackageBtn: boolean[] = [];
  dropdownCodes: BiddingProcessDocumentPackage[][] = [];
  loadingSetting = false;
  countryCode: string = null;
  duplicatePackageNumber: number[] = [];
  participantsDisabled = false;
  showBtnPublication = false;
  showBtnDeleteByBussnes = true;
  EXTENDED_BID_VALIDITY_DATE_DISABLED = true;
  selectedDate: Date | null = null;
  notificationText = {
    successMessage: 'PROCESS_DOC.DOCUMENT_TAB.BID_VALIDITY_DATE_UPDATE.SUCCESS',
    errorMessage: 'PROCESS_DOC.DOCUMENT_TAB.BID_VALIDITY_DATE_UPDATE.ERROR',
  };
  lastBidValidityExtensionDate: Date = null;
  hasPermissionToEditbidValidityDate = false;
  public formStatus = FormStatusEnum.CREATE;
  public selectedProject: Project;
  showUBOBtn: boolean[] = [];
  disableUBOBtn: boolean[] = [];
  UBORules: UBOData;
  applyUBORules: boolean[] = [];
  hasUboDocumentGroup: boolean[] = [];
  visibilityPackage: boolean;

  constructor(
    readonly documentPackageStore: BiddingProcessDocumentPackagesStoreService,
    private readonly visibilitySvc: VisibilityService,
    private readonly biddingStoreSvc: BiddingProcessPlanStoreService,
    private readonly biddingProcessPackageDocuments: BiddingProcessDocumentPackagesApiService,
    private readonly storeProject: ProjectStoreService,
    private readonly workflowSharedSvc: WorkflowSharedService,
    private readonly workflowApi: WorkflowApiService,
    private readonly notificationGlobalService: NotificationGlobalService,
    private readonly translate: TranslateService,
    private readonly enumsSvc: EnumsStoreService,
    private readonly utilsSvc: AppUtilsService,
    readonly configSvc: ProcessConfiguration,
    private readonly store: Store<AppStateWithBiddingProcessDocumentPackages>,
    private readonly participantsService: ParticipantsApiService,
    readonly storePreferences: Store<AppStateWithUsrPreferences>,
    readonly storeContact: Store<AppStateWithContact>,
    readonly storePackage: Store<AppStateWithPackageVisibility>,
    private readonly brFormService: BussinessRulesFormService,
    readonly fiModalSvc: ModalService,
    readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly packageAndParticipantsSvs: PackageAndParticipantsService,
    private readonly permissionSvc: PermissionService,
    readonly uboApiService: UboApiService,
    readonly uboService: UboService
  ) {}

  private redirectIfNeeded(url: string): void {
    if (url.endsWith('doc-packages')) {
      this.visibilitySvc.setVisibilityPackagesScreen(true);
      this.visibilitySvc.setVisiblityProcessHeader(true);
    } else {
      this.visibilitySvc.setVisibilityPackagesScreen(false);
      this.visibilitySvc.setVisiblityProcessHeader(false);
    }
    if (url.endsWith('/spn')) {
      this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
    }
  }

  ngOnInit(): void {
    this.redirectIfNeeded(this.router.url);
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        )
      )
      .subscribe((event) => this.redirectIfNeeded(event.urlAfterRedirects));
    this.visibilitySvc.setVisibilityPackagesScreen(true);
    this.subscriptions.add(
      this.uboApiService.getUBO().subscribe((data) => {
        this.UBORules = data;
      })
    );
    this.subscriptions.add(
      this.storePackage.select('packageScreen').subscribe((data) => {
        this.visibilityPackage = data.packageScreen;
      })
    );
    this.loadingPlan = true;
    this.subscriptions.add(
      this.biddingStoreSvc
        .getOrLoadBiddingProcessPlan()
        .pipe(
          filter((data) => data.biddingPlanState.biddingProcessPlan !== null)
        )
        .subscribe((data) => {
          this.loadingPlan = false;
          this.processPlan = data.biddingPlanState.biddingProcessPlan;
          this.planNotInSync =
            this.processPlan?.status !== BiddingProcessPlanStatus.IN_SYNC;
        })
    );
    this.loadingPackagesAndParticipants = true;
    this.subscriptions.add(
      this.packageAndParticipantsSvs
        .checkData()
        .pipe(
          take(1),
          finalize(() => {
            this.loadingPackagesAndParticipants = false;
          })
        )
        .subscribe({
          next: (data) => {
            this.participantsDisabled = data.disabledBtn;
            this.store.dispatch(
              actions.getDocumentPackagesSuccess({
                processId:
                  data.selectedPlan.selectedBiddingProcessProcurementProcess.id,
                biddingProcessDocumentPackages: data.packages,
                lastBidValidityExtensionDate: data.lastBidValidityExtensionDate
                  ? new Date(data.lastBidValidityExtensionDate)
                  : null,
              })
            );
          },
          error: () => {},
        })
    );
    this.getContactInformation();
    this.getCurrentLang();
    this.processProcurementProcessId =
      this.activatedRoute.snapshot.params.processId;
    this.visibilitySvc.setVisiblityProjectHeader(false);
    this.visibilitySvc.setVisiblityProcessHeader(true);
    this.loadDocumentsPackages();
    this.loadSelectedProcurementProcess();
    this.checkEnumsLoaded();

    this.subscriptions.add(
      this.storeProject.selectedProject().subscribe((data) => {
        if (!!data && !!data.selectedProject) {
          this.countryCode = data.selectedProject.countryCode;
        }
      })
    );
    this.groupEnum = Enums.biddingProcessDocumentGroupCodes;
    this.getSettingsOptionalPackage();
    this.hasPermissionToEditbidValidityDate = this.checkPermission();
  }

  checkPermission(): boolean {
    return this.permissionSvc.haveSomePermissions(
      this.bidValidityDatePermission
    );
  }

  getSettingsOptionalPackage(): void {
    const sub = this.biddingStoreSvc
      .getOrLoadSelectedBiddingProcessById(this.processProcurementProcessId)
      .pipe(
        filter(
          (response) => !!response.selectedBiddingProcessProcurementProcess
        ),
        switchMap((data) =>
          this.configSvc.settings(
            this.buildAttributesOptionalPackage(
              data.selectedBiddingProcessProcurementProcess
            ),
            SettingActionType.Extend,
            SettingType.AdditionalDocumentPackage
          )
        )
      )
      .subscribe((data: GetSettingsResponse) => {
        if (data.settings.length > 0) {
          const formatedString = data.settings[0].values?.replace(/\\"/g, '"');
          if (formatedString !== '') {
            const newArray = JSON.parse(formatedString);
            const x = newArray.packages.find((p) => {
              return p.packageCode === this.BID_VALIDITY_EXTENSION;
            });
            if (x !== undefined) {
              this.showBidValidityExtension = true;
            }
          }
        }
      });

    this.subscriptions.add(sub);
  }

  buildAttributesOptionalPackage(
    process: BiddingProcessProcurementProcess
  ): KeyValueInput[] {
    const attributeCategory: KeyValueInput = {
      key: 'category',
      value: process.category.name,
    };
    const attributeProcurementMethod: KeyValueInput = {
      key: 'procurementMethod',
      value: process.procurementMethod.name,
    };
    const attributeSupervisionMethod: KeyValueInput = {
      key: 'supervisionMethod',
      value: process.supervisionMethod.name,
    };
    return this.utilsSvc.buildAttributesArray(
      SettingType.AdditionalDocumentPackage,
      null,
      attributeCategory,
      attributeProcurementMethod,
      null,
      attributeSupervisionMethod,
      null
    );
  }

  getContactInformation() {
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
    const sub = this.biddingProcessPackageDocuments
      .getBiddingProcessDocumentGroups(docPackage.id)
      .pipe(
        mergeMap(
          (res: GetBiddingProcessDocumentGroupsByDocumentPackageIdResponse) => {
            packageLenght = res.biddingProcessDocumentGroups.length;
            this.hasUboDocumentGroup[index] =
              !!res.biddingProcessDocumentGroups.find((p) => {
                return p.documentGroupCode === DocumentGroupCode.UBO_DOCUMENT;
              });
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
        this.checkUBOBtnConditions(index);
        if (groupsDocs.length === packageLenght) {
          const groups = this.addOptionsToDocs(groupsDocs);
          this.documentPackageStore.getDocumentGroupsAction(
            this.processProcurementProcessId,
            docPackage.id,
            groups
          );

          if (
            this.procurementProcess.supervisionMethod.id !==
              BiddingProcurementProcessSupervisionMethods.EX_POST &&
            data.documentGroupConfiguration.isAutogenerated &&
            !data.documentGroupConfiguration.systemUpload
          ) {
            this.groupLoadingBusiness[index] = true;
            this.groupBtnBidding[index] = null;
            this.groupResultBr[index] = null;
            this.subscriptions.add(
              this.checkFormBtnVisibility(
                docPackage,
                groupsDocs,
                index
              )?.subscribe()
            );
          }
          this.groupLoading[index] = false;
        }
      });
    this.subscriptions.add(sub);
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
        if (
          GroupNameEnum.BIDDINDG_DOC_TECHNICAL_NOTIFICATION_EX ===
          g.documentGroupCode
        ) {
          doc.actualResults = [
            { id: -1, name: 'RESULT.OPTION.PARTICIPANT' },
            ...g.options,
          ];
        } else {
          doc.actualResults = g.options;
        }
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
    this.subscriptions.add(
      this.biddingStoreSvc
        .getOrLoadSelectedBiddingProcessById(this.processProcurementProcessId)
        .subscribe((data) => {
          if (data.selectedBiddingProcessProcurementProcess) {
            this.procurementProcess =
              data.selectedBiddingProcessProcurementProcess;
            this.disabledValidityDate = !this.editableValidityDate(
              this.procurementProcess
            );
            this.checkProcurementMethod();
            this.procurementProcessSupervisionMethod =
              this.procurementProcess.supervisionMethod.id;
          }
        })
    );
  }

  editableValidityDate(
    procurementProcess: BiddingProcessProcurementProcess
  ): boolean {
    return (
      (procurementProcess.status ===
        BiddingProcessProcurementProcessStatuses.EXPECTED ||
        procurementProcess.status ===
          BiddingProcessProcurementProcessStatuses.PROCESS_ONGOING ||
        procurementProcess.status ===
          BiddingProcessProcurementProcessStatuses.TECHNICAL_EVALUATION_OF_BIDS_PROPOSALS ||
        procurementProcess.status ===
          BiddingProcessProcurementProcessStatuses.EVAL_BID_PROPOSAL) &&
      !this.isUserInternal
    );
  }

  checkProcurementMethod(): void {
    if (
      this.procurementProcess.procurementMethod.id ===
        ProcurementMethod.PROCT_SRQOI ||
      this.procurementProcess.procurementMethod.id ===
        ProcurementMethod.PROCT_SRMQ
    ) {
      this.showMessageShoppingOrRequest = true;
    }
  }

  loadDocumentsPackages(): void {
    const subscription = this.documentPackageStore
      .getDocumentPackagesByProcess(this.processProcurementProcessId)
      .pipe(
        tap((state) => {
          this.loading = state.loading;
        }),
        map((state) => {
          return {
            documentPackages: state.biddingProcessDocumentPackages,
            lastBidValidityExtensionDate: state.lastBidValidityExtensionDate,
          };
        })
      )
      .subscribe(({ documentPackages, lastBidValidityExtensionDate }) => {
        this.lastBidValidityExtensionDate = lastBidValidityExtensionDate;
        this.documentPackages = [...documentPackages].sort(
          (a, b) => a.order - b.order
        );
        this.documentPackages = this.documentPackages.map((doc) => {
          const newDoc = { ...doc };
          newDoc.isReadOnly = this.shouldDisplayReadOnly(newDoc);
          return newDoc;
        });

        this.getGroups();
        this.getReadOnly();
        this.loadWorkflowActions();
        this.originalDateRules = this.handleBidOriginalDateRules(
          this.documentPackages
        );
      });
    this.subscriptions.add(subscription);
  }

  checkUBOBtnConditions(index: number): void {
    const procurementProcessFinalStatues = [
      BiddingProcessProcurementProcessStatuses.CANCELLED,
      BiddingProcessProcurementProcessStatuses.UNSUCCESFUL_PROCESS,
      BiddingProcessProcurementProcessStatuses.REJECTION_BIDS,
      BiddingProcessProcurementProcessStatuses.PROCUREMENT_INELIGIBLE,
      BiddingProcessProcurementProcessStatuses.PROCUREMENT_COMPLETE,
      BiddingProcessProcurementProcessStatuses.CONTRACT_TERMINATED,
      BiddingProcessProcurementProcessStatuses.MODIFIED,
      BiddingProcessProcurementProcessStatuses.UNDER_REVIEW_MODIFIED,
    ];
    const firstPackageIndex = 0;

    this.disableUBOBtn[index] =
      (index === firstPackageIndex
        ? false
        : this.documentPackages[index - 1].status !==
          DocumentPackagesStatus.COMPLETE) &&
      this.documentPackages[index].status ===
        DocumentPackagesStatus.NOT_STARTED;
    this.applyUBORules[index] =
      this.uboService.checkUboRules(
        this.UBORules,
        this.countryCode,
        this.procurementProcess.category.name,
        this.procurementProcess.procurementMethod.name,
        this.procurementProcess.supervisionMethod.name,
        'value'
      ) && this.hasUboDocumentGroup[index];

    this.showUBOBtn[index] =
      this.applyUBORules[index] &&
      !procurementProcessFinalStatues.includes(
        this.procurementProcess.status
      ) &&
      this.permissionSvc.haveSomePermissions(this.UBOPermision);
  }

  handleBidOriginalDateRules(
    documentPackages: BiddingProcessDocumentPackage[]
  ) {
    const codeOneIndex = documentPackages.findIndex(
      (bp) =>
        bp.code === DocumentPackageName.BIDDING_PACKAGES_BID_OPEN_RECORD ||
        bp.code ===
          DocumentPackageName.BIDDING_PACKAGES_BID_OPEN_RECORD_TECHNICAL
    );
    if (codeOneIndex === -1) {
      return true;
    }

    const previousElementsValid = documentPackages
      .slice(0, codeOneIndex)
      .every(
        (bp) =>
          bp.status === this.docPackagesStatus.COMPLETE ||
          bp.status === this.docPackagesStatus.COMPLETE_AMENDMENT
      );

    const codeOneElementValid =
      documentPackages[codeOneIndex].status ===
      this.docPackagesStatus.NOT_STARTED;

    return !(previousElementsValid && codeOneElementValid);
  }

  onDateReceived(date: Date): void {
    this.selectedDate = date;
  }

  get onDateSelected(): boolean {
    return this.selectedDate !== null;
  }

  getReadOnly() {
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

  get isExAnte() {
    return (
      this.procurementProcessSupervisionMethod ===
      this.supervisionMethods.EX_ANTE
    );
  }

  checkPreviousPackageStatus(item: BiddingProcessDocumentPackage): boolean {
    const orderPackage = item.order;
    if (orderPackage !== 1) {
      const prevPackage = this.documentPackages.find(
        (p) => p.order === orderPackage - 1
      );
      if (
        prevPackage.status === DocumentPackagesStatus.COMPLETE ||
        prevPackage.status === DocumentPackagesStatus.COMPLETE_AMENDMENT ||
        prevPackage.status === DocumentPackagesStatus.AMENDMENT_UNDER_REV ||
        prevPackage.status === DocumentPackagesStatus.AMENDMENT_RETURNED
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

  closePackage(index: number): void {
    this.expandedRows[index] = false;
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
      const groupFilteredByDocs = groupsDocs?.filter(
        (docs) => docs.fiduciaryProcessDocuments?.length > 0
      );

      groupCode =
        groupFiltered[0]?.documentGroupCode ??
        groupFilteredByDocs[0]?.documentGroupCode;
    }

    return groupCode;
  }

  collapseDetail(index: number): void {
    this.expandRow(index);
  }

  completeDocs(packageIndex: number): void {
    this.groupLoadingBusiness[packageIndex] = true;
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
          this.groupLoadingBusiness[packageIndex] = false;
        })
    );
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
  ) {
    const sub = this.biddingProcessPackageDocuments
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
          this.errorMessage();
        }
      )
      .add(() => (this.isUploading = false));
    this.subscriptions.add(sub);
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
          this.procurementProcess.id,
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
              if (el.settings.length > 0) {
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
                }
              }
              const participantResult: ParticipantResult = {
                TypeResult: [],
                TypeResultMandatory: false,
              };
              return participantResult;
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
            description: '',
            createdBy: '',
            modified: new Date(),
            file,
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
            this.selectedProject = data.selectedProject;
            this.projectBucketId = data.selectedProject.projectBucketId;
            this.instAcronym = data.selectedProject.executorAcronym;
            this.projectContractId = data.selectedProject.contract;
            this.operationNumber = data.selectedProject.operationNumber;
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

  private checkFormBtnVisibility(
    docPackage: BiddingProcessDocumentPackage,
    groupsDocs: BiddingProcessDocumentGroup[],
    index: number
  ): Observable<any> {
    const document = this.searchDocumentGenerated(groupsDocs);
    const group = this.getGroupCode(groupsDocs);
    this.btnBidding = null;

    if (
      document?.biddingDocumentId === '' ||
      this.findProcurementStatus(this.procurementProcess.status)
    ) {
      this.groupLoadingBusiness[index] = false;
      return;
    }

    this.checkVisibilityBtnPublication(docPackage, document);

    return this.getWorkflowNextStep(docPackage).pipe(
      mergeMap((actionSelected: string) =>
        this.brFormService.getFunction(this.projectContractId, {
          categoryCode: this.procurementProcess.category.name,
          procurementCode: this.procurementProcess.procurementMethod.name,
          supervisionMethod: this.procurementProcess.supervisionMethod.name,
          totalAmountProcurementProcess: String(
            this.procurementProcess.projectAmount.estimatedAmount
          ),
          document: this.brFormService.mapNameDocument(group),
          documentStatus: this.brFormService.mapStatusDocument(
            document?.status
          ),
          packageStatus: this.brFormService.mapStatusDocumentPackage(
            docPackage.status
          ),
          workflowStep: actionSelected,
        })
      ),
      mergeMap((data) => {
        if (!!data) {
          return of(data.result);
        }
        return throwError(String());
      }),
      catchError((error) => {
        this.notificationGlobalService.showError(
          this.translate.instant('FI.CNVG.FP.FORMS.GET_FUNCTION_BR.ERROR')
        );
        return throwError(error);
      }),
      tap((result: BussinessRulesFunctionEnum) => {
        if (result.toString() !== '') {
          this.displayButtons(result);
          this.btnBidding = this.brFormService.createBiddingButton(
            result,
            group,
            document?.biddingDocumentId,
            document?.id
          );
          this.showBtnDeleteByBussnes =
            result.toUpperCase() !== BussinessRulesFunctionEnum.ADJUST_RETURNED;
        }
        this.resultBr = result;

        this.groupLoadingBusiness[index] = false;
        this.groupBtnBidding[index] = this.btnBidding;
        this.groupResultBr[index] = this.resultBr;
      })
    );
  }

  private displayButtons(brResult: BussinessRulesFunctionEnum): void {
    const statusForm = this.brFormService.filterBussinessRules(brResult);
    this.displayBtnOpenDate = statusForm === FormStatusEnum.EDIT_OPENING_DATE;
  }

  private getWorkflowNextStep(
    documentPackage: BiddingProcessDocumentPackage
  ): Observable<string> {
    const stepBody: WorkflowLastStepRequestBody = {
      entityTypeId: documentPackage.id,
      projectBucketId: this.projectBucketId,
      idEntityType: WorkflowIdEntityType.DOCUMENT_PACKAGE,
    };

    return this.workflowApi.getLastStep(stepBody).pipe(
      mergeMap((response: WorkflowLastStepResponse) => {
        if (!!response) {
          return of(String(response.actionSelected));
        }
        return throwError(String());
      }),
      catchError((error) => {
        this.notificationGlobalService.showError(
          this.translate.instant('FI.CNVG.FP.FORMS.WORKFLOW.ERROR')
        );
        return throwError(error);
      })
    );
  }

  public getContact(): Observable<ContactState> {
    return this.storeContact.select('contact');
  }

  public getPreferences(): Observable<UsrPreferencesState> {
    return this.storePreferences.select('preferences');
  }

  viewFileAction(data): void {
    this.loading = true;
    const sub = this.brFormService
      .getPreview(
        data.event.item,
        this.formStatus,
        this.brFormService.mapNameDocument(data.event.item.groupCode),
        this.operationNumber,
        this.selectedLanguage,
        this.selectedProject,
        this.processProcurementProcessId
      )
      .subscribe(
        (response) => {
          this.loading = response;
        },
        () => {
          this.loading = false;
        }
      );
    this.subscriptions.add(sub);
  }

  checkVisibilityBtnPublication(
    docPackage: BiddingProcessDocumentPackage,
    document: any
  ): void {
    if (document?.biddingDocumentId === '') {
      return;
    }
    this.showBtnPublication =
      docPackage.status === DocumentPackagesStatus.COMPLETE &&
      document?.status === FiduciaryProcessDocumentsStatuses.uploaded;
  }

  refreshFiles(index: number): void {
    this.collapseDetail(index);
    this.expandRow(index);
  }

  findProcurementStatus(
    statusProcurement: BiddingProcessProcurementProcessStatuses
  ): boolean {
    const statusProcurements: BiddingProcessProcurementProcessStatuses[] = [
      BiddingProcessProcurementProcessStatuses.PROCUREMENT_COMPLETE,
      BiddingProcessProcurementProcessStatuses.UNSUCCESFUL_PROCESS,
      BiddingProcessProcurementProcessStatuses.PROCUREMENT_INELIGIBLE,
      BiddingProcessProcurementProcessStatuses.REJECTION_BIDS,
      BiddingProcessProcurementProcessStatuses.CONTRACT_TERMINATED,
      BiddingProcessProcurementProcessStatuses.CANCELLED,
      BiddingProcessProcurementProcessStatuses.MODIFIED,
      BiddingProcessProcurementProcessStatuses.UNDER_REVIEW_MODIFIED,
    ];

    return statusProcurements.includes(statusProcurement);
  }
}
