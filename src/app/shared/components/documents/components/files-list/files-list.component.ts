import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnChanges,
  OnDestroy,
} from '@angular/core';
import {
  BiddingProcessDocumentGroup,
  BiddingProcessDocumentPackage,
  BiddingProcessProcurementProcess,
  Enumerator,
  Enums,
  FiduciaryProcessDocument,
  FiduciaryProcessDocumentGroup,
  ParticipantAwarded,
  WorkflowDocument,
} from '@core/models';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared/services/notification-global.service';
import { FileService } from '@fiduciary-interface/app/shared/services/file.service';
import { TranslateService } from '@ngx-translate/core';
import { FileSaverService } from 'ngx-filesaver';
import {
  BiddingProcessDocumentGroupsResults,
  PermissionEnum,
  DocEnum,
  BiddingProcessProcurementProcessStatuses,
  DocumentGroupMandatoryPublicationEnum,
} from '@core/enums';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { map, mergeMap, takeLast } from 'rxjs/operators';
import {
  BiddingProcessDocumentPackagesApiService,
  ParticipantsApiService,
  WorkflowApiService,
} from '@core/services/apis';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AppStateWithBiddingProcessDocumentPackages,
  AppStateWithUsrPreferences,
  AppStateWithWorkflowDocumentssState,
} from '@core/store';
import { Store } from '@ngrx/store';
import * as documentPackagesOptions from '@core/store/bidding-process-document-packages/actions/bidding-process-document-packages.actions';
import * as workflowDocsActions from '@core/store/workflow-documents/actions/workflow-documents.actions';
import { EventDocument } from '@fiduciary-interface/app/features/procurement/features/procurement-process/features/process-doc-packages/models/event-document.model';
import {
  BiddingProcessDocumentPackagesStoreService,
  BiddingProcessPlanStoreService,
} from '@core/services/store-services';
import { FormStatusEnum } from '@fiduciary-interface/app/features/forms/enums/form-status.enum';
import { PermissionService } from '@core/services/app/permission/permission.service';
import {
  FileListUndbActions,
  FileListUndbActionType,
  PackagesFilesListConfiguration,
} from '../../models';
import { BiddingDocumentService } from '@fiduciary-interface/app/features/forms/services/bidding-document/bidding-document.service';
import { FormControl } from '@angular/forms';
import { DocumentGroupCode } from '../../enums';
import { WorkflowSharedService } from '../../../flows-sticky-footer/services';
import { GroupCodeEnum } from '@core/enums/groupCode.enum';

interface newDescriptionInterface {
  descriptionChangeSubject: Subject<EventDocument>;
  subscription: Subscription;
  modifiedDesc: boolean;
  newDescription: string;
  doc: {
    relationalId: string;
    packageId: string;
    groupId: string;
    description: string;
  };
  document: any;
}

@Component({
  selector: 'fi-files-list',
  templateUrl: './files-list.component.html',
})
export class FilesListComponent implements OnInit, OnChanges, OnDestroy {
  @Input() set configuration(value: PackagesFilesListConfiguration) {
    this.filesConfig = [];
    this.filesConfig.push({ ...value?.readonlyDocs, readonly: true });
    this.filesConfig.push({ ...value?.aviableDocs, readonly: false });
    this.showHeaderResult = value?.showHeaderResult;
    this.showComponent = this.filesConfig.some((el) => el.docs.length >= 1);

    this.filesConfig[1].docs.forEach((e, index) => {
      const newSubject = new Subject<EventDocument>();
      this.descriptions.push({
        descriptionChangeSubject: newSubject,
        subscription: null,
        modifiedDesc: false,
        newDescription: e.description,
        doc: null,
        document: e,
      });
      this.calculate(e, index);
    });
  }
  @Input() set files(f: FiduciaryProcessDocument[]) {
    this.showAwardedSelector = [];
    this.fileList = [];
    f.forEach((file) => {
      this.fileList.push({ ...file });
    });
    this.dropdownValue = [];
    this.fileList.forEach((f) => {
      this.dropdownValue.push(f.groupCode);
      this.showAwardedSelector.push(false);
    });
  }
  @Input() public deletePermission: PermissionEnum[] = [PermissionEnum.SPECIAL];
  @Input() public editPermission: PermissionEnum[] = [PermissionEnum.SPECIAL];
  @Input() procurementProcess: BiddingProcessProcurementProcess;
  _mode: DocEnum;

  @Input() set mode(value: DocEnum) {
    this._mode = value;
    if (DocEnum.WORKFLOWS === value) {
      this.isWorkflowDocs = true;
    }
    if (DocEnum.PACKAGES === value) {
      this.isDocumentTap = true;
    }
  }

  @Input() set docPackage(newDocPackage: BiddingProcessDocumentPackage) {
    this._docPackage = newDocPackage;
  }

  @Input() set cleanSelection(file: FiduciaryProcessDocument) {
    this.removeSelectedGroup(file);
  }

  @Input() set groupEnum(value: Enumerator[]) {
    this.auxgroupEnum = value;
  }
  @Input() documentDownloadDocumentGuestPermission = [PermissionEnum.SPECIAL];
  @Input() documentDownloadDocumentPermission = [PermissionEnum.SPECIAL];
  @Input() showBtnDeleteByBussnes?: boolean;
  @Input() isAdditionalDoc = false;
  @Input() set workflowDocs(value: any[]) {
    this.descriptionsWorkflowDocs = [];
    value.forEach(() => {
      const newSubject = new Subject<WorkflowDocument>();
      this.descriptionsWorkflowDocs.push(newSubject);
    });
    this.filesConfig = value;
    if (this.filesConfig.length > 0) {
      this.showComponent = true;
    }
  }
  @Input() public workflowDropDown: Enumerator[] = [];

  @Input()
  docGroups: FiduciaryProcessDocumentGroup[];

  @Output() deleteFile = new EventEmitter<unknown>();
  @Output() editFile = new EventEmitter<unknown>();
  @Output() previewFile = new EventEmitter<unknown>();
  @Output() editWorkflowDocDescription = new EventEmitter<unknown>();
  @Output() editWorkflowDocVisibility = new EventEmitter<unknown>();
  private readonly subscriptions = new Subscription();

  GroupCodeEnum = GroupCodeEnum;
  showComponent: boolean;
  filesConfig = [];
  showHeaderResult: boolean;
  readOnlyFileList: FiduciaryProcessDocument[] = [];
  _docPackage: BiddingProcessDocumentPackage;
  results: boolean[] = [];
  fileList: FiduciaryProcessDocument[] = [];
  isDowloading: boolean;
  Enum = Enums;
  EnumPackageCode = Enums.biddingProcessDocumentGroupCodes;
  auxgroupEnum: Enumerator[];
  filteredGroupsCodes: number[] = [];
  newDocPackage: BiddingProcessDocumentPackage;
  descriptionsWorkflowDocs: Subject<WorkflowDocument>[];

  showHeaderResultReadOnlyDocs: boolean;

  dropdownValue: number[] = [];
  readOnlyDropdownValue: number[] = [];
  dropdownResult: number[] = [];
  resultType$: Observable<Enumerator[]>[] = [];
  resutEmpty: boolean[];
  participantsAwarded: ParticipantAwarded[] = [];

  processId: string;

  AWARDED_ENUM = BiddingProcessDocumentGroupsResults.AWARDED;
  groupTypes$: Observable<Enumerator[]> = of([]);
  allGroupTypes$: Observable<Enumerator[]> = of([]);
  documentPackagesCodes: Enumerator[];
  documentGroupCode: Enumerator[];

  showAwardedSelector: boolean[] = [];
  readOnlyShowAwardedSelector: boolean[] = [];
  biddingProcessProcurementProcessId: string =
    this.route.snapshot.paramMap.get('processId');

  packageGroupEnum = Enums.biddingProcessDocumentGroupCodes;
  formStatusEnum = FormStatusEnum;
  disableByPermission = false;
  allPackages;
  language: string;
  isDocumentTap: boolean;
  hasPermissionDownloadGuest: boolean;
  hasPermissionDownload: boolean;
  textareaControl = new FormControl('');
  resultado: string;
  isWorkflowDocs = false;

  groupCodeEnum = GroupCodeEnum;

  autogeneratedDocumentActions: FileListUndbActions[] = [
    {
      text: 'UNDB.PREVIEW.TITLE',
      action: (item: FiduciaryProcessDocument) => this.previewNotice(item),
      iconClass: 'far fa-search',
      type: FileListUndbActionType.PREVIEW_NOTICE,
      permissions: [PermissionEnum.VIEW_PROCUREMENT_INFORMATION],
    },
    {
      text: 'UNDB.DOCUMENT_PACKAGES.REVIEW_AND_PUBLISH_MODAL.CONFIRM_BTN',
      action: (item: FiduciaryProcessDocument) => this.editNotice(item),
      type: FileListUndbActionType.EDIT_NOTICE,
      iconClass: 'far fa-pencil',
      permissions: this.editPermission,
    },
    {
      text: 'UNDB.FILE_LIST.ACTIONS.DELETE_NOTICE',
      action: (item: FiduciaryProcessDocument) => this.deleteFile.emit(item),
      type: FileListUndbActionType.DELETE_NOTICE,
      iconClass: 'far fa-trash',
      permissions: this.deletePermission,
    },
  ];

  autogeneratedDocumentActionsNoDelete: FileListUndbActions[] = [
    {
      text: 'UNDB.PREVIEW.TITLE',
      action: (item: FiduciaryProcessDocument) => this.previewNotice(item),
      iconClass: 'far fa-search',
      type: FileListUndbActionType.PREVIEW_NOTICE,
      permissions: [PermissionEnum.VIEW_PROCUREMENT_INFORMATION],
    },
    {
      text: 'UNDB.DOCUMENT_PACKAGES.REVIEW_AND_PUBLISH_MODAL.CONFIRM_BTN',
      action: (item: FiduciaryProcessDocument) => this.editNotice(item),
      type: FileListUndbActionType.EDIT_NOTICE,
      iconClass: 'far fa-pencil',
      permissions: this.editPermission,
    },
  ];

  private descriptionChangeSubject = new Subject<EventDocument>();
  public loading = false;
  descriptions: newDescriptionInterface[] = [];

  constructor(
    readonly fileServices: FileService,
    readonly fileSaverService: FileSaverService,
    private readonly translate: TranslateService,
    readonly notificationGlobalSvc: NotificationGlobalService,
    private readonly participantsService: ParticipantsApiService,
    private readonly activatedRoute: ActivatedRoute,
    readonly docPackageSvc: BiddingProcessDocumentPackagesApiService,
    readonly storePackages: Store<AppStateWithBiddingProcessDocumentPackages>,
    readonly documentPackageStore: BiddingProcessDocumentPackagesStoreService,
    private readonly route: ActivatedRoute,
    readonly permissionSvc: PermissionService,
    readonly biddingDocumentService: BiddingDocumentService,
    readonly storePreferences: Store<AppStateWithUsrPreferences>,
    readonly biddingStoreSvc: BiddingProcessPlanStoreService,
    readonly workflowApi: WorkflowApiService,
    readonly storeWorkFlowDocs: Store<AppStateWithWorkflowDocumentssState>,
    readonly workFlowSharedSvc: WorkflowSharedService,
    readonly router: Router
  ) {
    this.processId = this.activatedRoute.snapshot.params.processId;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.descriptionChangeSubject) {
      this.descriptionChangeSubject.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.disableByPermission =
      this.permissionSvc.haveSomePermissions(this.editPermission) ||
      this.editPermission.includes(PermissionEnum.SPECIAL);
    this.getLanguage();
    this.filterDocConfigsForEoi();
  }
  ngOnChanges(): void {
    if (this.isDocumentTap) {
      this.checkPermissionTodownload();
    }
  }

  /**
   * * Filters the files configurations by EOI mandatory publication value (Y, N, O) in cases where is optional or required we filter out the expression of interest document type
   * ? Should this also account for SPN/SPD notices mandatory flag?
   * TODO refactor, this is more of a band-aid solution. Look a way to make it more robust and easy to understand
   */
  filterDocConfigsForEoi() {
    if (!this.docGroups) return;

    // When publication type of EOI is Optional or Not required it should show the document type for expression of interest in the dropdown
    const validPublicationTypes = [
      DocumentGroupMandatoryPublicationEnum.OPTIONAL,
      DocumentGroupMandatoryPublicationEnum.NOT_REQUIRED,
    ];

    const groupsToCheck = [
      GroupCodeEnum.EOI,
      GroupCodeEnum.SPN,
      GroupCodeEnum.PV_SPN,
    ];
    const groupsToFilter = [];

    groupsToCheck.forEach((groupCode) => {
      const docGroup = this.docGroups.find(
        (group) => group.groupCode === groupCode
      );

      const isOptionalNotRequired = validPublicationTypes.includes(
        docGroup?.documentGroupConfiguration.isMandatoryPublication
      );

      if (!isOptionalNotRequired) {
        groupsToFilter.push(groupCode);
      }
    });

    if (groupsToFilter.length > 0) {
      this.filesConfig = this.filesConfig.map((config) => {
        return {
          ...config,
          codes: config.codes.filter(
            (code) => !groupsToFilter.includes(code.id)
          ),
        };
      });
    }
  }

  checkPermissionTodownload(): void {
    this.biddingStoreSvc.biddingProcessPlan().subscribe((data) => {
      if (data.selectedBiddingProcessProcurementProcess) {
        if (
          BiddingProcessProcurementProcessStatuses.EXPECTED ===
            data.selectedBiddingProcessProcurementProcess.status ||
          BiddingProcessProcurementProcessStatuses.MODIFIED ===
            data.selectedBiddingProcessProcurementProcess.status ||
          BiddingProcessProcurementProcessStatuses.PROCESS_ONGOING ===
            data.selectedBiddingProcessProcurementProcess.status ||
          BiddingProcessProcurementProcessStatuses.TECHNICAL_EVALUATION_OF_BIDS_PROPOSALS ===
            data.selectedBiddingProcessProcurementProcess.status ||
          BiddingProcessProcurementProcessStatuses.EVAL_BID_PROPOSAL ===
            data.selectedBiddingProcessProcurementProcess.status
        ) {
          this.hasPermissionDownloadGuest =
            this.permissionSvc.haveSomePermissions(
              this.documentDownloadDocumentGuestPermission
            );
        } else {
          this.hasPermissionDownload = this.permissionSvc.haveSomePermissions(
            this.documentDownloadDocumentPermission
          );
        }
      }
    });
  }

  resultChange(event, index, item: FiduciaryProcessDocument): void {
    this.documentPackageStore.changeResultConfigAction(
      this.biddingProcessProcurementProcessId,
      this._docPackage.id
    );
    const group = this._docPackage.biddingProcessDocumentGroups.find(
      (g) => g.documentGroupCode === item.groupCode
    );
    if (event === BiddingProcessDocumentGroupsResults.AWARDED) {
      this.participantsService
        .getAwardedParticipants(this.processId)
        .pipe(
          mergeMap((r) => {
            return of(r as any);
          }),
          mergeMap((r) => {
            return this.docPackageSvc.getPackagesAwardeds(group.id).pipe(
              map((p) => {
                const newPackage = { ...r };
                newPackage.options = p.documentGroupAwardedIdList;
                return newPackage;
              })
            );
          })
        )
        .subscribe((data: any) => {
          this.participantsAwarded = data.participantsAwarded;
          this.showAwardedSelector[index] = true;
          this.storePackages.dispatch(
            documentPackagesOptions.getParticipantsAndActualParticipantsSucces({
              documentId: item.id,
              groupId: group.id,
              packageId: this._docPackage.id,
              processId: this.procurementProcess.id,
              participantsOptions: data.participantsAwarded,
              awardeds: [],
            })
          );
          this.setPackageLoading(true);
          this.docPackageSvc
            .updateResultAndAwardeds(group.id, event, [])
            .subscribe(
              () => {
                this.dispatchChangeResult(group, item, event);
              },
              (error) => {
                if (
                  error.error.detail.includes(
                    'at least one awarded participant'
                  )
                ) {
                  this.documentPackageStore.changeResultConfigActionSuccess(
                    this.biddingProcessProcurementProcessId,
                    this._docPackage.id,
                    group.id,
                    item.id,
                    event
                  );
                }
              },
              () => {
                this.setPackageLoading(false);
              }
            );
        });
    } else {
      this.showAwardedSelector[index] = false;
      this.setPackageLoading(true);
      this.docPackageSvc
        .updateResultAndAwardeds(group.id, event, [])
        .subscribe(() => {
          this.dispatchChangeResult(group, item, event);
          this.setPackageLoading(false);
        });
    }
  }

  dispatchChangeResult(
    group: BiddingProcessDocumentGroup,
    item: FiduciaryProcessDocument,
    event: any
  ) {
    this.documentPackageStore.changeResultConfigActionSuccess(
      this.biddingProcessProcurementProcessId,
      this._docPackage.id,
      group.id,
      item.id,
      event
    );
  }

  setPackageLoading(loading: boolean): void {
    this.storePackages.dispatch(
      documentPackagesOptions.setLoadingPackage({
        processId: this.processId,
        packageId: this._docPackage.id,
        loading,
      })
    );
  }

  awardedsChange(
    event: ParticipantAwarded[],
    item: FiduciaryProcessDocument
  ): void {
    const group = this._docPackage.biddingProcessDocumentGroups.find(
      (g) => g.documentGroupCode === item.groupCode
    );
    const participantsId: string[] = [];
    event.forEach((e) => participantsId.push(e.biddingProcessParticipantId));
    this.setPackageLoading(true);
    this.docPackageSvc
      .updateResultAndAwardeds(group.id, item.result, participantsId)
      .subscribe(
        () => {
          this.storePackages.dispatch(
            documentPackagesOptions.setAwardeds({
              documentId: item.id,
              groupId: group.id,
              packageId: this._docPackage.id,
              processId: this.procurementProcess.id,
              awardeds: event.map((p) => {
                return p.biddingProcessParticipantId;
              }),
            })
          );
        },
        (error) => {
          if (error.error.detail.includes('at least one awarded participant')) {
            this.storePackages.dispatch(
              documentPackagesOptions.setAwardeds({
                documentId: item.id,
                groupId: group.id,
                packageId: this._docPackage.id,
                processId: this.procurementProcess.id,
                awardeds: event.map((p) => {
                  return p.biddingProcessParticipantId;
                }),
              })
            );
          }
        },
        () => {
          this.setPackageLoading(false);
        }
      );
  }

  onChangeDocumentType(
    event: number,
    item: FiduciaryProcessDocument,
    index: number
  ): void {
    const otherCode = [
      DocumentGroupCode.OTHER,
      DocumentGroupCode.OTHER_AFTER_COMPLETION,
      DocumentGroupCode.CLARIFICATIONS,
    ];
    const filesConfigAux = JSON.parse(JSON.stringify(this.filesConfig));
    if (
      (otherCode.includes(event) &&
        item.description.trim() === '' &&
        item.id !== '') ||
      (otherCode.includes(event) &&
        this.descriptions[index].newDescription.trim() === '' &&
        item.id === '')
    ) {
      this.filesConfig = filesConfigAux;
      const message = this.translate.instant(
        'PROCESS_DOC.DOCUMENT_TAB.DOCUMENT_MESSAGES.NO_DESCRIPTION_ERROR'
      );
      this.notificationGlobalSvc.showError(message);

      const groupOfDoc = this._docPackage.biddingProcessDocumentGroups.find(
        (el) => el.documentGroupCode === event
      );

      const packageCode = this._docPackage.code;
      const isResult = groupOfDoc?.documentGroupConfiguration.isResult;
      const documentObj: EventDocument = {
        groupCode: null,
        item,
        isResult,
        packageCode,
      };
      this.results[index] = isResult;

      this.editFile.emit(documentObj);

      return;
    }
    if (item.id === '') {
      const auxItem = {
        ...item,
        description: this.descriptions[index].newDescription,
      };
      item = auxItem;
    }

    const isContractsOrAmendment =
      this._mode === DocEnum.CONTRACTS || this._mode === DocEnum.AMENDMENTS;
    if (isContractsOrAmendment) {
      const documentObj: EventDocument = {
        groupCode: event,
        item,
      };
      this.editFile.emit(documentObj);
    } else {
      const groupOfDoc = this._docPackage.biddingProcessDocumentGroups.find(
        (el) => el.documentGroupCode === event
      );
      const packageCode = this._docPackage.code;
      const isResult = groupOfDoc?.documentGroupConfiguration.isResult;
      const documentObj: EventDocument = {
        groupCode: event,
        item,
        isResult,
        packageCode,
      };
      this.results[index] = isResult;

      this.editFile.emit(documentObj);
    }
  }
  onChangeDescriptionWorkflowDocs(
    event: string,
    item: FiduciaryProcessDocument,
    index: number
  ) {
    item.newDescription = event;
    this.descriptionsWorkflowDocs[index].next({
      created: item.created,
      description: item.description,
      id: item.id,
      name: item.name,
      visibility: item.visibility,
      newDescription: event,
    });
  }

  changeDescriptionWorkflowDocs(item: WorkflowDocument) {
    this.editWorkflowDocDescription.emit(item);
  }
  resetDescriptionWorkflowDocs(item: WorkflowDocument) {
    item.newDescription = item.description;
  }

  changenWorkflowDocsVisibility(event: number, item: WorkflowDocument) {
    this.editWorkflowDocVisibility.emit({
      newVisibility: event,
      document: item,
    });
  }

  onChangeDescription(
    event: string,
    item: FiduciaryProcessDocument,
    index: number
  ): void {
    if (item.description !== event) {
      if (
        event.trim() !== '' ||
        (item.groupCode !== DocumentGroupCode.OTHER &&
          item.groupCode !== DocumentGroupCode.OTHER_AFTER_COMPLETION)
      ) {
        this.descriptions[index].modifiedDesc = true;
        this.descriptions[index].newDescription = event;
      } else {
        this.descriptions[index].modifiedDesc = false;
      }
    } else {
      this.descriptions[index].modifiedDesc = false;
      this.descriptions[index].newDescription = event;
    }
    const filesConfigAux = JSON.parse(JSON.stringify(this.filesConfig));
    const auxItem = { ...item, description: event };
    if (item.groupCode === undefined) {
      const packageCode = this._docPackage.code;
      const documentObj: EventDocument = {
        item: auxItem,
        packageCode,
      };
      this.descriptions[index].descriptionChangeSubject.next({
        ...documentObj,
        updatingDescription: true,
      });
    } else {
      if (
        event.trim() === '' &&
        (item.groupCode === DocumentGroupCode.OTHER ||
          item.groupCode === DocumentGroupCode.OTHER_AFTER_COMPLETION)
      ) {
        const message = this.translate.instant(
          'PROCESS_DOC.DOCUMENT_TAB.DOCUMENT_MESSAGES.NO_DESCRIPTION_ERROR'
        );
        this.notificationGlobalSvc.showError(message);
        this.filesConfig = filesConfigAux;
        return;
      } else {
        const groupOfDoc = this._docPackage.biddingProcessDocumentGroups.find(
          (el) => el.documentGroupCode === item.groupCode
        );
        const packageCode = this._docPackage.code;
        const isResult = groupOfDoc?.documentGroupConfiguration.isResult;
        const documentObj: EventDocument = {
          groupCode: item.groupCode,
          item: auxItem,
          isResult,
          packageCode,
        };
        this.descriptions[index].descriptionChangeSubject.next({
          ...documentObj,
          updatingDescription: true,
        });
      }
    }
  }

  calculate(e: any, index: number) {
    if (e.id !== '' && e.description !== e.newDescription) {
      const groupId = this._docPackage.biddingProcessDocumentGroups.find(
        (g) => e.groupCode === g.documentGroupCode
      ).id;
      const packageId = this._docPackage.id;
      const relationalId = e.relationalId;
      this.descriptions[index].doc = {
        description: e.newDescription,
        groupId,
        packageId,
        relationalId,
      };
    }
  }

  onFocusWorkflowDesc(index: number) {
    this.descriptionsWorkflowDocs[index].pipe(takeLast(1)).subscribe((data) => {
      this.storeWorkFlowDocs.dispatch(
        workflowDocsActions.updateWorkflowDocumentDescription({
          docId: data.id,
          instanceId: this.workFlowSharedSvc.workflowInstaceId,
          newDescription: data.newDescription,
        })
      );
    });
  }

  onFocus(index: number) {
    if (this.descriptions[index].document.id !== '') {
      this.descriptions[index].subscription = this.descriptions[
        index
      ].descriptionChangeSubject
        .pipe(takeLast(1))
        .subscribe(
          (value) => {
            // Aquí obtendrás el último valor emitido cuando el Observable se complete
            const relationalId = value.item.relationalId;
            const packageId = this._docPackage.id;
            const groupId = this._docPackage.biddingProcessDocumentGroups.find(
              (g) => value.groupCode === g.documentGroupCode
            ).id;
            const description = this.descriptions[index].newDescription;
            this.descriptions[index].doc = {
              description,
              relationalId,
              groupId,
              packageId,
            };
            this.editFile.emit({ ...value, updatingDescription: true });
          },
          () => {},
          () => {}
        );
    }
  }

  onBlurWorkFlowDesc(index: number) {
    this.descriptionsWorkflowDocs[index].complete();
  }

  onBlur(index: number) {
    this.descriptions[index].descriptionChangeSubject.complete();
  }

  resetDescription(index: number) {
    if (!this.descriptions[index].subscription.closed) {
      this.descriptions[index].descriptionChangeSubject.complete();
    }
    this.storePackages.dispatch(
      documentPackagesOptions.restoreDescriptiongDoc({
        relationalId: this.descriptions[index].doc.relationalId,
        packageId: this.descriptions[index].doc.packageId,
        groupId: {
          biddingProcessDocumentGroupId: this.descriptions[index].doc.groupId,
        },
        procurementProcessId: this.biddingProcessProcurementProcessId,
      })
    );
  }

  changeDescription(index: number) {
    if (!this.descriptions[index].subscription.closed) {
      this.descriptions[index].descriptionChangeSubject.complete();
    }
    this.storePackages.dispatch(
      documentPackagesOptions.updateDescriptiongDoc({
        relationalId: this.descriptions[index].doc.relationalId,
        description: this.descriptions[index].doc.description,
        groupId: {
          biddingProcessDocumentGroupId: this.descriptions[index].doc.groupId,
        },
        packageId: this.descriptions[index].doc.packageId,
        procurementProcessId: this.biddingProcessProcurementProcessId,
      })
    );
  }

  donwloadDocument(doc: FiduciaryProcessDocument): void {
    if (doc.id) {
      this.isDowloading = true;
      if (doc.biddingDocumentId !== '') {
        this.biddingDocumentService
          .downloadDocument(doc.id, this.language)
          .subscribe(
            (res) => {
              this.saveDocument(res.body, doc.name);
            },
            () => {
              this.donwloadErrorMessage();
            }
          )
          .add(() => (this.isDowloading = false));
      } else {
        this.fileServices
          .downloadFile(doc.id)
          .subscribe(
            (res: ArrayBuffer) => {
              this.saveDocument(res, doc.name);
            },
            () => {
              this.donwloadErrorMessage();
            }
          )
          .add(() => (this.isDowloading = false));
      }
    }
  }

  donwloadErrorMessage(): void {
    const message = this.translate.instant(
      'SHARED.DOCUMENT.DOCUMENT_FINISHED.ERROR_DOWNLOAD'
    );
    this.notificationGlobalSvc.showError(message);
  }

  removeSelectedGroup(file: FiduciaryProcessDocument): void {
    const idx = this.fileList.findIndex((f) => f?.name === file?.name);

    if (idx >= 0) {
      this.dropdownValue[idx] = null;
      this.fileList[idx].groupCode = null;
    }
  }

  getLanguage(): void {
    this.subscriptions.add(
      this.storePreferences.select('preferences').subscribe((data) => {
        this.language = data.preferences.preferredLanguage;
      })
    );
  }

  saveDocument(res: ArrayBuffer, docName: string): void {
    this.fileSaverService.save(new Blob([new Uint8Array(res).buffer]), docName);
  }

  previewDocument(item: FiduciaryProcessDocument): void {
    this.previewFile.emit({ item });
  }

  checkStatusDocument(item: FiduciaryProcessDocument): boolean {
    return !(item.biddingDocumentId !== '' && !this.showBtnDeleteByBussnes);
  }

  editNotice(notice) {
    console.log(notice);
    const routeConfig = {
      [GroupCodeEnum.EOI]: [
        this._docPackage.id,
        'eoi',
        notice.noticeId,
        'update',
      ],
      [GroupCodeEnum.SPN]: [
        this._docPackage.id,
        'spn',
        notice.noticeId,
        'update',
      ],
      [GroupCodeEnum.PV_SPN]: [
        this._docPackage.id,
        'spn',
        notice.noticeId,
        'update',
      ],
    };

    const route = routeConfig[notice.groupCode];
    if (route) {
      this.router.navigate(route, { relativeTo: this.activatedRoute });
    }
  }

  previewNotice(notice) {
    const routeConfig = {
      [GroupCodeEnum.SPN]: [
        this._docPackage.id,
        'spn',
        notice.noticeId,
        'preview',
      ],
      [GroupCodeEnum.PV_SPN]: [
        this._docPackage.id,
        'spn',
        notice.noticeId,
        'preview',
      ],
      [GroupCodeEnum.EOI]: [
        this._docPackage.id,
        'eoi',
        'preview',
        notice.noticeId,
      ],
    };
    const route = routeConfig[notice.groupCode];
    if (route) {
      this.router.navigate(route, { relativeTo: this.activatedRoute });
    }
  }
}
