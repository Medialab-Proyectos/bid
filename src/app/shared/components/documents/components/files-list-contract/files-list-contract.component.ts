import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
} from '@angular/core';
import {
  Enumerator,
  Enums,
  FiduciaryProcessDocument,
  FiduciaryProcessDocumentGroup,
} from '@core/models';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared/services/notification-global.service';
import { FileService } from '@fiduciary-interface/app/shared/services/file.service';
import { TranslateService } from '@ngx-translate/core';
import { FileSaverService } from 'ngx-filesaver';
import {
  PermissionEnum,
  DocEnum,
  BiddingContractDocumentGroupCode,
} from '@core/enums';
import { Observable, of } from 'rxjs';
import { EventDocument } from '@fiduciary-interface/app/features/procurement/features/procurement-process/features/process-doc-packages/models/event-document.model';
import { PermissionService } from '@core/services/app/permission/permission.service';
import { ContractsService } from '@fiduciary-interface/app/features/procurement/features/procurement-process/features/process-contracts/services/contracts.service';

@Component({
  selector: 'fi-files-list-contract',
  templateUrl: './files-list-contract.component.html',
})
export class FilesListContractComponent implements OnInit, OnChanges {
  @Input() set files(f: FiduciaryProcessDocument[]) {
    this.fileList = [];
    this.originalDescriptions = {}; // Resetear el objeto auxiliar

    f.forEach((file) => {
      this.fileList.push({
        ...file,
        newDescription: file.description,
      });
      this.originalDescriptions[file.id || file.name] = file.description;
    });
    this.populateEnumsGroupCodes();
  }
  @Input() public deletePermission: PermissionEnum[] = [PermissionEnum.SPECIAL];
  @Input() public editPermission: PermissionEnum[] = [PermissionEnum.SPECIAL];
  @Input() showReadOnly: boolean;
  _mode: DocEnum;

  @Input() set mode(value: DocEnum) {
    this._mode = value;
    this.populateEnumsGroupCodes();
  }
  @Input() groupsList: FiduciaryProcessDocumentGroup[];
  @Input() set groupEnum(value: Enumerator[]) {
    this.auxgroupEnum = value;
    this.populateEnumsGroupCodes();
  }

  @Output() deleteFile = new EventEmitter<unknown>();
  @Output() editFile = new EventEmitter<unknown>();

  fileList: FiduciaryProcessDocument[] = [];
  isDowloading: boolean;
  Enum = Enums;
  auxgroupEnum: Enumerator[];
  groupTypes$: Observable<Enumerator[]> = of([]);

  disableByPermission = false;
  originalDescriptions: { [key: string]: string } = {};

  constructor(
    readonly fileServices: FileService,
    readonly fileSaverService: FileSaverService,
    private readonly translate: TranslateService,
    readonly notificationGlobalSvc: NotificationGlobalService,
    private readonly permissionSvc: PermissionService,
    private readonly contractsSvc: ContractsService
  ) {
    this.populateEnumsGroupCodes();
  }

  ngOnInit(): void {
    this.disableByPermission =
      this.permissionSvc.haveSomePermissions(this.editPermission) ||
      this.editPermission.includes(PermissionEnum.SPECIAL);
  }

  ngOnChanges(): void {
    this.populateEnumsGroupCodes();
  }

  populateEnumsGroupCodes(): void {
    this.groupTypes$ = of(
      this.auxgroupEnum?.filter((group) =>
        this.groupsList?.find((g) => g.groupCode === group.id)
      )
    );
  }

  donwloadDocument(doc: FiduciaryProcessDocument): void {
    if (doc.id) {
      this.isDowloading = true;
      this.fileServices
        .downloadFile(doc.id)
        .subscribe(
          (res: ArrayBuffer) => {
            this.fileSaverService.save(
              new Blob([new Uint8Array(res).buffer]),
              doc.name
            );
          },
          () => {
            this.donwloadErrorMessage();
          }
        )
        .add(() => (this.isDowloading = false));
    }
  }

  donwloadErrorMessage(): void {
    const message = this.translate.instant(
      'SHARED.DOCUMENT.DOCUMENT_FINISHED.ERROR_DOWNLOAD'
    );
    this.notificationGlobalSvc.showError(message);
  }

  onChangeDocumentType(event: number, item: FiduciaryProcessDocument): void {
    const isOtherType =
      event === BiddingContractDocumentGroupCode.OTHER ||
      event === BiddingContractDocumentGroupCode.AMENDMENT_DOC_OTHER;

    if (isOtherType && item.newDescription.trim() === '') {
      const message = this.translate.instant(
        'PROCESS_DOC.DOCUMENT_TAB.DOCUMENT_MESSAGES.NO_DESCRIPTION_ERROR'
      );
      this.notificationGlobalSvc.showError(message);

      const index = this.fileList.indexOf(item);
      if (index !== -1) {
        const revertedGroupCode =
          item.id === null
            ? null
            : this.fileList.find((f) => f.name === item.name)?.groupCode;

        this.fileList = [
          ...this.fileList.slice(0, index),
          { ...item, groupCode: revertedGroupCode },
          ...this.fileList.slice(index + 1),
        ];
      }

      return;
    }
    const isContractsOrAmendment =
      this._mode === DocEnum.CONTRACTS || this._mode === DocEnum.AMENDMENTS;
    if (isContractsOrAmendment) {
      const documentObj: EventDocument = {
        groupCode: event,
        item,
      };
      this.editFile.emit(documentObj);
    }
  }

  onDescriptionChange(value: string, item: FiduciaryProcessDocument): void {
    if (item.id === '') {
      item.description = value;
    } else {
      item.newDescription = value;
    }
    const docsToUpload = this.fileList.filter((f) => f.id === null);
    this.contractsSvc.setDocumentsToUpload(docsToUpload);
  }

  hasDescriptionChanged(item: FiduciaryProcessDocument): boolean {
    const key = item.id || item.name;
    const originalDesc = this.originalDescriptions[key];
    return item.newDescription !== originalDesc;
  }

  saveDescription(item: FiduciaryProcessDocument): void {
    const isOtherType = [
      BiddingContractDocumentGroupCode.OTHER,
      BiddingContractDocumentGroupCode.AMENDMENT_DOC_OTHER,
    ];

    if (
      isOtherType.includes(item.groupCode) &&
      item.newDescription.trim() === ''
    ) {
      const message = this.translate.instant(
        'PROCESS_DOC.DOCUMENT_TAB.DOCUMENT_MESSAGES.NO_DESCRIPTION_ERROR'
      );
      this.notificationGlobalSvc.showError(message);
      return;
    }
    const groupCode = this.groupsList.find((g) =>
      g.fiduciaryProcessDocuments.find((d) => d.id === item.id)
    )?.groupCode;

    const documentObj: EventDocument = {
      groupCode: groupCode,
      item: {
        ...item,
        description: item.newDescription,
      },
    };

    this.editFile.emit(documentObj);

    const key = item.id || item.name;
    this.originalDescriptions[key] = item.newDescription;
  }

  revertDescription(item: FiduciaryProcessDocument): void {
    const key = item.id || item.name;
    item.newDescription = this.originalDescriptions[key];
  }

  textAreaChange(item: FiduciaryProcessDocument): void {
    this.saveDescription(item);
  }
}
