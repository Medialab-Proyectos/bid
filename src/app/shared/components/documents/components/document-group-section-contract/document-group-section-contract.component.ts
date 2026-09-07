import { Component, Input, OnDestroy } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { PermissionEnum, DocumentDomain, DocEnum } from '@core/enums';

import {
  BiddingProcessDocumentPackagesApiService,
  GeneralProcurementDocumentsApiService,
} from '@core/services/apis';
import { EnumsStoreService } from '@core/services/store-services';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared/services/notification-global.service';

import { TranslateService } from '@ngx-translate/core';
import { Subscription, take } from 'rxjs';

import {
  EventDocument,
  EventFileDelete,
  EventFileEdit,
} from '@fiduciary-interface/app/features/procurement/features/procurement-process/features/process-doc-packages/models/event-document.model';
import {
  Enumerator,
  Enums,
  FiduciaryProcessDocument,
  FiduciaryProcessDocumentGroup,
} from '@core/models';
import { AppStateWithUsrPreferences, EnumState } from '@core/store';
import { Store } from '@ngrx/store';
import { ContractsService } from '@fiduciary-interface/app/features/procurement/features/procurement-process/features/process-contracts/services/contracts.service';

const duplicateErrorMessage =
  'SHARED.DOCUMENT.PROCESS_DOC.DOCUMENT_MESSAGES.DUPLICATE_ERROR';
@Component({
  selector: 'fi-document-group-section-contract',
  templateUrl: './document-group-section-contract.component.html',
})
export class DocumentGroupSectionContractComponent implements OnDestroy {
  private readonly subscriptions = new Subscription();
  _mode: DocEnum;

  @Input() number: number;
  @Input() title: string;
  @Input() noDocumentsMessage: string;
  @Input() contractId: string;

  @Input() viewPermissions: PermissionEnum[] = [PermissionEnum.SPECIAL];
  @Input() editPermissions: PermissionEnum[] = [PermissionEnum.SPECIAL];
  @Input() deletePermissions: PermissionEnum[] = [PermissionEnum.SPECIAL];

  documentsToUpload: FiduciaryProcessDocument[] = [];
  enumBiddingProcessDocumentGroupCodes: Enumerator[];
  selectedLanguage: string;
  @Input() set mode(value: DocEnum) {
    this._mode = value;
    if (this.enumsState !== undefined) {
      this.checkAllDataNeeded(this.enumsState);
    }
  }

  @Input() groupEnum: string;
  @Input() groupParentId = '';
  @Input() domain: DocumentDomain = null;

  @Input() showReadOnly = false;
  @Input() isUploading = false;

  @Input() control = new UntypedFormControl();

  enumsState: EnumState;

  constructor(
    readonly documentApi: GeneralProcurementDocumentsApiService,
    readonly documentsPackageSvc: BiddingProcessDocumentPackagesApiService,
    private readonly notificationGlobalService: NotificationGlobalService,
    private readonly translate: TranslateService,
    private readonly enumsSvc: EnumsStoreService,
    readonly storePreferences: Store<AppStateWithUsrPreferences>,
    private readonly contractsSvc: ContractsService
  ) {
    this.checkEnumsLoaded();
    this.getCurrentLang();
  }

  get groups(): FiduciaryProcessDocumentGroup[] {
    return this.control.value;
  }

  getCurrentLang(): void {
    const sub = this.storePreferences
      .select('preferences')
      .subscribe((data) => {
        if (data.preferences.preferredLanguage) {
          this.selectedLanguage = data.preferences.preferredLanguage;
        }
      });
    this.subscriptions.add(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getGroupIdByCode(code: number): string {
    return this.groups.find((group) => group.groupCode === code).id;
  }

  getGroupById(id: string): FiduciaryProcessDocumentGroup {
    return this.groups.find((group) => group.id === id);
  }

  onFileChange(event: any): void {
    const files = event.files as File[];
    if (files.length === 0) {
      this.errorMessage(
        'SHARED.DOCUMENT.PROCESS_DOC.DOCUMENT_MESSAGES.FORMAT_ERROR'
      );
      return;
    }

    let fileList: FiduciaryProcessDocument[] = [];
    for (const group of this.groups) {
      fileList.push(...group.fiduciaryProcessDocuments);
    }

    fileList = fileList.concat(this.documentsToUpload);
    for (const file of files) {
      const alreadyExists = fileList.find((f) => f.name === file.name);

      if (!alreadyExists) {
        this.documentsToUpload.push({
          id: null,
          relationalId: '',
          status: 0,
          type: 0,
          operationsDocumentId: 0,
          ezshareNumber: '',
          name: file.name,
          created: new Date(),
          createdBy: '',
          modified: new Date(),
          file,
          needBeUploaded: true,
          groupCode: null,
          description: '',
          newDescription: '',
        });
        this.contractsSvc.setDocumentsToUpload(this.documentsToUpload);
      } else {
        this.errorMessage(duplicateErrorMessage);
      }
    }
    this.documentsToUpload = [...this.documentsToUpload];
  }

  onDeleteFile(event: EventFileDelete) {
    const documentId = event.document.id;
    for (const group of this.groups) {
      const document = group.fiduciaryProcessDocuments.find(
        (file) => file.id === documentId
      );
      if (document) {
        this.isUploading = true;
        this.documentApi
          .deleteContractDocument(this.contractId, documentId)
          .subscribe(
            () => {
              group.fiduciaryProcessDocuments =
                group.fiduciaryProcessDocuments.filter(
                  (file) => file.id !== documentId
                );
            },
            () =>
              this.errorMessage(
                'PROCESS_DOC.DOCUMENT_TAB.DOCUMENT_MESSAGES.DELETE_ERROR'
              )
          )
          .add(() => {
            this.isUploading = false;
            this.documentsToUpload = [
              ...this.documentsToUpload.filter(
                (file) => file.id !== documentId
              ),
            ];
          });
      }
    }
    this.documentsToUpload = [
      ...this.documentsToUpload.filter((file) => file.id !== documentId),
    ];
  }

  onEditFile(data: EventFileEdit): void {
    const event: EventDocument = data.event;
    const groupId = this.getGroupIdByCode(event.groupCode);
    this.isUploading = true;
    if (event.item.needBeUploaded) {
      this.uploadDocument(groupId, event, event.item.newDescription);
    } else {
      this.changeGroupDocument(groupId, event);
    }
  }

  uploadDocument(
    groupId: string,
    event: EventDocument,
    description: string
  ): void {
    this.documentsPackageSvc
      .uploadDocumentsContracts(
        this.contractId,
        groupId,
        event.item.file,
        this.domain,
        description
      )
      .subscribe(
        (response: any) => {
          const group = this.getGroupById(groupId);
          /* event.item.relationalId = response.relationalId; */
          const originalName = event.item.name;
          event.item.name = response.fileName;
          event.item.id = response.documentId;
          event.item.needBeUploaded = false;
          event.item.groupCode = group.groupCode;
          event.item.description = description;
          group.fiduciaryProcessDocuments.push(event.item);
          this.contractsSvc.documentsToUpload$
            .pipe(take(1))
            .subscribe((docs) => {
              const filterDocs = docs
                .filter((f) => f.id === null)
                .filter((f) => f.file.name !== originalName)
                .map((d) => {
                  return { ...d, description: d.newDescription };
                });
              this.contractsSvc.setDocumentsToUpload(filterDocs);
              this.documentsToUpload = filterDocs;
            });
        },
        (error) => {
          this.errorToast(error);
        }
      )
      .add(() => (this.isUploading = false));
  }

  changeGroupDocument(groupId: string, event: EventDocument): void {
    const oldGroup = this.groups.find((group) =>
      group.fiduciaryProcessDocuments.find((doc) => doc.id === event.item.id)
    );

    this.documentsPackageSvc
      .editDocumentsContracts(
        this.contractId,
        groupId,
        event.item.id,
        event.item.description
      )
      .subscribe(
        (data: any) => {
          oldGroup.fiduciaryProcessDocuments =
            oldGroup.fiduciaryProcessDocuments.filter(
              (doc) => doc.id !== event.item.id
            );

          const newGroup = this.groups.find(
            (group) => group.groupCode === event.groupCode
          );

          newGroup.fiduciaryProcessDocuments.push({
            ...event.item,
            name: data.fileName,
            groupCode: event.groupCode,
            id: data.documentId,
          });
          this.control.setValue([...this.groups]);
        },
        (error) => {
          this.errorToast(error);
        }
      )
      .add(() => (this.isUploading = false));
  }

  errorToast(error: any) {
    if (error.status === 500) {
      this.errorMessage(duplicateErrorMessage);
      return;
    }

    this.errorMessage(
      'PROCESS_DOC.DOCUMENT_TAB.DOCUMENT_MESSAGES.UPLOAD_ERROR'
    );
  }

  errorMessage(typeError: string): void {
    const message = this.translate.instant(typeError);
    this.notificationGlobalService.showError(message);
  }

  checkAllDataNeeded(data: EnumState): void {
    const contractCodeEnum =
      data.enumsLoaded[Enums.biddingContractDocumentGroupCodes];
    const amendmentCodeEnum =
      data.enumsLoaded[Enums.biddingContractAmendmentDocumentGroupCodes];
    const packageStatusEnum =
      data.enumsLoaded[Enums.biddingProcessDocumentPackageStatuses];
    const groupCodeEnum =
      data.enumsLoaded[Enums.biddingProcessDocumentGroupCodes];

    const isEnumLoaded =
      contractCodeEnum &&
      packageStatusEnum &&
      groupCodeEnum &&
      amendmentCodeEnum;
    if (isEnumLoaded && this._mode !== undefined) {
      if (this._mode === DocEnum.CONTRACTS) {
        this.enumBiddingProcessDocumentGroupCodes =
          data['biddingContractDocumentGroupCodes'];
      } else {
        if (this._mode === DocEnum.AMENDMENTS) {
          this.enumBiddingProcessDocumentGroupCodes =
            data['biddingContractAmendmentDocumentGroupCodes'];
        }
      }
    }
  }

  checkEnumsLoaded(): void {
    this.subscriptions.add(
      this.enumsSvc.selectEnums().subscribe((data) => {
        this.enumsState = data;
        this.checkAllDataNeeded(data);
      })
    );
  }
}
