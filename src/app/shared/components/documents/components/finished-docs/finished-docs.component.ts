import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FileSaverService } from 'ngx-filesaver';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared/services/notification-global.service';
import { FileService } from '@fiduciary-interface/app/shared/services/file.service';
import {
  BiddingProcessDocumentPackage,
  Enums,
  FiduciaryProcessDocument,
  FiduciaryProcessDocumentGroup,
} from '@core/models';
import {
  BiddingProcessDocumentGroupsResults,
  DocEnum,
  BiddingProcessProcurementProcessStatuses,
  PermissionEnum,
  FiduciaryProcessDocumentsStatusIdEnum,
  DocumentGroupMandatoryPublicationEnum,
} from '@core/enums';
import { DocumentPackageStatusEnum } from '@core/enums/packageDocumentStatus.enum';
import { BiddingProcessPlanStoreService } from '@core/services/store-services';
import { Subscription } from 'rxjs';

type ColumnsVisibility = {
  showResultColumn: boolean;
  showAwardedsColumn: boolean;
};
import { BiddingDocumentService } from '@fiduciary-interface/app/features/forms/services/bidding-document/bidding-document.service';
import { AppStateWithUsrPreferences } from '@core/store';
import { Store } from '@ngrx/store';
import { PermissionService } from '@core/services/app/permission/permission.service';
import { GroupCodeEnum } from '@core/enums/groupCode.enum';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FinishedDocsUndbActions,
  FinishedDocsUndbActionType,
} from '../../models/finished-docs.model';
import { ConfirmNoticeEvent } from '../../models';
import { DocumentPackageCodeToNoticeType } from '@core/enums/documentPackageCode.enum';

@Component({
  selector: 'fi-finished-docs',
  templateUrl: './finished-docs.component.html',
})
export class FinishedDocsComponent implements OnInit, OnChanges, OnDestroy {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  @Input() set files(value: FiduciaryProcessDocument[]) {
    this._files = value;
    this.containsDocumentByBiddingDocument =
      this.searchDocumentByBiddingDocument(value);

    const noticesFiles = [
      GroupCodeEnum.EOI,
      GroupCodeEnum.SPN,
      GroupCodeEnum.PV_SPN,
    ];
    this.hasGeneratedNotice = this._files.some(
      (file) => noticesFiles.includes(file.groupCode) && file.noticeId
    );

    if (this._mode === DocEnum.PACKAGES) {
      this._files = value.filter(
        (d) => d.packageDocumentStatus === DocumentPackageStatusEnum.CONFIRMED
      );

      if (this.hasGeneratedNotice) {
        this._files.sort((a, b) =>
          this.sortFiduciaryDocumentByNoticeVersion(a, b)
        );
        this.showStatusColumn = true;
        this.showActionsColumn = true;
      }
    }
    this.awardeedsNames = [];
    this.awardeedsNames = this.getAwardeedsNames(this._files);
    const columnsVisibility = this.getColumnsVisibility(
      this._mode,
      this._files
    );
    this.showResultColumn = columnsVisibility.showResultColumn;
    this.showAwardedsColum = columnsVisibility.showAwardedsColumn;
    this.columClasses = this.getColumnsStyles(
      this._mode,
      this.showResultColumn,
      this.showAwardedsColum
    );
  }
  @Input() set mode(_mode: DocEnum) {
    this.showMandatoryColumn = false;
    this._mode = _mode;
    switch (_mode) {
      case DocEnum.CONTRACTS:
        this.enumType = this.enum.biddingContractDocumentGroupCodes;
        break;
      case DocEnum.AMENDMENTS:
        this.enumType = this.enum.biddingContractAmendmentDocumentGroupCodes;
        break;
      case DocEnum.TRANSACTIONS:
        this.enumType = this.enum.transactionDocumentGroupCodes;
        break;
      case DocEnum.PACKAGES:
        this.isDocumentTap = true;
        this.showMandatoryColumn = true;
        this.enumType = this.enum.biddingProcessDocumentGroupCodes;
        break;
      default:
        this.enumType = this.enum.biddingProcessDocumentGroupCodes;
        break;
    }
  }
  @Input() documentDownloadDocumentGuestPermission = [PermissionEnum.SPECIAL];
  @Input() documentDownloadDocumentPermission = [PermissionEnum.SPECIAL];
  @Input() docPackage: BiddingProcessDocumentPackage;
  @Input() docGroups: FiduciaryProcessDocumentGroup[];
  @Output() previewFile = new EventEmitter<unknown>();
  @Output() deleteFile = new EventEmitter<FiduciaryProcessDocument>();
  @Output() confirmNotice = new EventEmitter<ConfirmNoticeEvent>();
  private readonly subscriptions = new Subscription();

  dropdownButtonData: FinishedDocsUndbActions[] = [
    {
      text: 'UNDB.FINISHED_DOCUMENTS.CONFIRM_AMENDMENT',
      action: (item: FiduciaryProcessDocument) => this.confirmDocument(item),
      iconClass: 'far fa-clipboard-check',
      permissions: [PermissionEnum.SEND_OFFICIAL_PROCUREMENT_COMUNICATIONS],
      type: FinishedDocsUndbActionType.CONFIRM_AMENDMENT,
    },
    {
      text: 'UNDB.FINISHED_DOCUMENTS.EDIT_AMENDMENT',
      action: (item: FiduciaryProcessDocument) => this.editPublication(item),
      iconClass: 'far fa-pencil-alt',
      permissions: [
        PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
      ],
      type: FinishedDocsUndbActionType.EDIT_AMENDMENT,
    },
    {
      text: 'UNDB.FINISHED_DOCUMENTS.PREVIEW_AMENDMENT',
      action: (item: FiduciaryProcessDocument) => this.viewNotice(item),
      iconClass: 'far fa-search',
      permissions: [
        PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
      ],
      type: FinishedDocsUndbActionType.PREVIEW_AMENDMENT,
    },

    {
      text: 'UNDB.FINISHED_DOCUMENTS.DELETE_AMENDMENT',
      action: (item: FiduciaryProcessDocument) => {
        this.deleteDocument(item);
      },
      iconClass: 'far fa-trash-alt',
      permissions: [
        PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
      ],
      type: FinishedDocsUndbActionType.DELETE_AMENDMENT,
    },
  ];

  _mode: DocEnum;
  showResultColumn: boolean;
  showAwardedsColum: boolean;
  showMandatoryColumn: boolean;
  enum = Enums;
  enumType: string;
  isDowloading: boolean;
  _files: FiduciaryProcessDocument[];
  awardeedsNames: string[][];
  columClasses: string[] = ['', '', '', '', ''];
  language: string;
  hasPermissionDownloadGuest: boolean;
  hasPermissionDownload: boolean;
  isDocumentTap: boolean;
  containsDocumentByBiddingDocument: boolean;
  hasGeneratedNotice;
  fiduciaryProcessDocumentStatusIdEnum = FiduciaryProcessDocumentsStatusIdEnum;
  showStatusColumn = false;
  showActionsColumn = false;
  constructor(
    private readonly notificationGlobalSvc: NotificationGlobalService,
    private readonly fileSaverService: FileSaverService,
    private readonly translate: TranslateService,
    readonly fileServices: FileService,
    readonly biddingDocumentService: BiddingDocumentService,
    readonly storePreferences: Store<AppStateWithUsrPreferences>,
    readonly biddingStoreSvc: BiddingProcessPlanStoreService,
    readonly permissionSvc: PermissionService
  ) {}
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngOnInit(): void {
    this.getLanguage();
    if (this.isDocumentTap) {
      this.checkPermissionTodownload();
    }
  }

  ngOnChanges(simpleChanges: SimpleChanges): void {
    if (
      simpleChanges.files ||
      simpleChanges.mode ||
      simpleChanges.documentDownloadDocumentGuestPermission ||
      simpleChanges.documentDownloadDocumentPermission
    ) {
      if (this.isDocumentTap) {
        this.checkPermissionTodownload();
        const columnsVisibility = this.getColumnsVisibility(
          this._mode,
          this._files
        );
        this.showResultColumn = columnsVisibility.showResultColumn;
        this.showAwardedsColum = columnsVisibility.showAwardedsColumn;
        this.columClasses = this.getColumnsStyles(
          this._mode,
          this.showResultColumn,
          this.showAwardedsColum
        );
      }
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
    this.notificationGlobalSvc.showError(message, 'right', 'top', 7000);
  }

  getColumnsVisibility(
    _mode: DocEnum,
    _files: FiduciaryProcessDocument[]
  ): ColumnsVisibility {
    let showResultColumn = false;
    let showAwardedsColumn = false;
    if (_mode === DocEnum.PACKAGES) {
      showResultColumn = _files.some((f) => f.result !== -1);
      if (showResultColumn) {
        showAwardedsColumn = _files.some(
          (f) => f.result === BiddingProcessDocumentGroupsResults.AWARDED
        );
      }
    }
    return { showResultColumn, showAwardedsColumn };
  }

  getAwardeedsNames(files: FiduciaryProcessDocument[]): string[][] {
    const filesAwardeeds = [];
    files.forEach((f) => {
      const avaiableOptions = f.participantsOptions;
      const awardeeds = [];
      f?.awardeds?.forEach((awardeed) => {
        const name = avaiableOptions.find(
          (op) => op.biddingProcessParticipantId === awardeed
        ).name;
        awardeeds.push(name);
      });
      filesAwardeeds.push(awardeeds);
    });
    return filesAwardeeds;
  }

  getColumnsStyles(
    _mode: DocEnum,
    showResultColumn: boolean,
    showAwardeesColumn: boolean
  ): string[] {
    if (_mode === DocEnum.PACKAGES) {
      if (!(this.hasPermissionDownload || this.hasPermissionDownloadGuest)) {
        return [
          'col-3', // File
          'col-3', // Document Type
          'col-3', // Mandatory
          'col-3', // Document ID
          '', // Results
          '', // Awardees
          'd-none', // Creation Date
          'd-none', // Description
          '', // Status
          '', // Actions
        ];
      }
      if (showResultColumn && showAwardeesColumn) {
        return [
          'col-2', // File
          'col-2', // Document Type
          'col-1', // Mandatory
          'col-2', // Document ID
          'col-1', // Results
          'col-1', // Awardees
          'col-1', // Creation Date
          'col-2', // Description
          '', // Status
          '', // Actions
        ];
      } else if (showResultColumn && !showAwardeesColumn) {
        return [
          'col-2', // File
          'col-2', // Document Type
          'col-1', // Mandatory
          'col-2', // Document ID
          'col-1', // Results
          '', // Awardees
          'col-1', // Creation Date
          'col-3', // Description
          '', // Status
          '', // Actions
        ];
      } else if (!showResultColumn && !showAwardeesColumn) {
        if (this.hasGeneratedNotice) {
          return [
            'col-2', // File
            'col-2', // Document Type
            'col-1', // Mandatory
            'col-2', // Document ID
            '', // Results
            '', // Awardees
            'col-1', // Creation Date
            'col-2', // Description
            'col-1', // Status
            'col-1', // Actions
          ];
        }
        return [
          'col-3', // File
          'col-2', // Document Type
          'col-1', // Mandatory
          'col-2', // Document ID
          '', // Results
          '', // Awardees
          'col-1', // Creation Date
          'col-3', // Description
          '', // Status
          '', // Actions
        ];
      }
    } else {
      return [
        'col-4', // File
        'col-4', // Document Type
        '', // Mandatory
        'col-4', // Document ID
        'd-none', // Results
        'd-none', // Awardees
        'd-none', // Creation Date
        'd-none', // Description
        'd-none', // Status
        'd-none', // Actions
      ];
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

  searchDocumentByBiddingDocument(arr: any[]): boolean {
    for (let objeto of arr) {
      if (objeto.biddingDocumentId !== '') {
        return true;
      }
    }
    return false;
  }

  previewDocument(item: FiduciaryProcessDocument): void {
    this.previewFile.emit({ item });
  }

  editPublication(_: FiduciaryProcessDocument) {
    const docGroup = this.getDocGroupByCode(GroupCodeEnum.EOI);

    if (docGroup) {
      this.router.navigate(
        [this.docPackage.id, 'eoi', docGroup.id, 'update-amendment'],
        { relativeTo: this.activatedRoute }
      );
    }
  }

  viewNotice(document: FiduciaryProcessDocument) {
    this.router.navigate(
      [this.docPackage.id, 'eoi', 'preview', document.noticeId],
      { relativeTo: this.activatedRoute }
    );
  }

  viewAmendment(document: FiduciaryProcessDocument) {
    if (document.noticeVersion >= 1) {
      const docGroup = this.getDocGroupByCode(GroupCodeEnum.EOI);
      this.router.navigate(
        [
          this.docPackage.id,
          'eoi',
          'preview',
          document.noticeId,
          docGroup.id,
          'readonly',
        ],
        { relativeTo: this.activatedRoute }
      );
    }
  }

  deleteDocument(item: FiduciaryProcessDocument) {
    this.deleteFile.emit(item);
  }

  showAmendmentActions(index: number): boolean {
    return (
      this.isCurrentNoticeAutogenerated(index) &&
      this.isCurrentNoticeRegistered(index) &&
      this.isPreviousNoticeStatusValid(index)
    );
  }

  isPreviousNoticeStatusValid(index: number): boolean {
    if (this._files.length === 1) return false;
    if (index === 0) return false;

    const mandatoryPublication = this.getDocGroupByCode(GroupCodeEnum.EOI)
      .documentGroupConfiguration.isMandatoryPublication;

    if (
      mandatoryPublication === DocumentGroupMandatoryPublicationEnum.OPTIONAL
    ) {
      return [
        FiduciaryProcessDocumentsStatusIdEnum.PUBLISHED,
        FiduciaryProcessDocumentsStatusIdEnum.SENT_TO_PUBLICATION,
        FiduciaryProcessDocumentsStatusIdEnum.CONFIRMED,
      ].includes(this._files[index - 1]?.noticeStatus.id);
    }

    if (mandatoryPublication === DocumentGroupMandatoryPublicationEnum.YES) {
      return [
        FiduciaryProcessDocumentsStatusIdEnum.PUBLISHED,
        FiduciaryProcessDocumentsStatusIdEnum.SENT_TO_PUBLICATION,
      ].includes(this._files[index - 1]?.noticeStatus.id);
    }
    return false;
  }

  isCurrentNoticeAutogenerated(index: number): boolean {
    return !!this._files[index].noticeId;
  }

  isCurrentNoticeRegistered(index: number) {
    return (
      this._files[index]?.noticeStatus.id ===
      this.fiduciaryProcessDocumentStatusIdEnum.REGISTERED
    );
  }

  getDocGroupByCode(groupCode: GroupCodeEnum): FiduciaryProcessDocumentGroup {
    return this.docGroups.find((group) => group.groupCode === groupCode);
  }

  /**
   * Sorts the fiduciaryDocument by noticeId in ascending order, for those documents that are not autogenerated (noticesId=null) the original order is kept
   */
  sortFiduciaryDocumentByNoticeVersion(
    a: FiduciaryProcessDocument,
    b: FiduciaryProcessDocument
  ) {
    const aVersion = a.noticeVersion;
    const bVersion = b.noticeVersion;

    const aIsNull = aVersion === null || aVersion === undefined;
    const bIsNull = bVersion === null || bVersion === undefined;

    if (aIsNull && bIsNull) return 0;
    if (aIsNull) return 1; // a goes after b
    if (bIsNull) return -1; // b goes after a

    return aVersion - bVersion; // normal ascending sort
  }

  confirmDocument(item: FiduciaryProcessDocument) {
    const confirmNoticeEvent: ConfirmNoticeEvent = {
      noticeId: item.noticeId,
      noticeType: DocumentPackageCodeToNoticeType[this.docPackage.code],
    };
    this.confirmNotice.emit(confirmNoticeEvent);
  }

  getNoticeStatus(item: FiduciaryProcessDocument): string {
    if (!item?.noticeStatus) {
      return '';
    }

    if (
      item.noticeVersion !== null &&
      item.noticeStatus.id === FiduciaryProcessDocumentsStatusIdEnum.CONFIRMED
    ) {
      const confirmedMessages: Record<string, string> = {
        en: 'Package confirmed, notice pending publication',
        es: 'Paquete confirmado, aviso pendiente de publicación',
        fr: 'Paquet confirmé, avis en attente de publication',
        pt: 'Pacote confirmado, aviso pendente de publicação',
      };
      return confirmedMessages[this.language] || '';
    }

    return item.noticeStatus.name?.[this.language] || '';
  }
}
