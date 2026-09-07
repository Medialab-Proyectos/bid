import { Component, inject, Input, OnInit, signal } from '@angular/core';
import {
  Enumerator,
  FiduciaryProcessDocument,
  FiduciaryProcessDocumentGroup,
  GeneralProcurementDocumentResponse,
} from '@core/models';
import {
  BiddingContractDocumentGroupCode,
  DocEnum,
  DocumentDomain,
  PermissionEnum,
} from '@core/enums';
import {
  BiddingProcessDocumentPackagesApiService,
  GeneralProcurementDocumentsApiService,
} from '@core/services/apis';
import { finalize, map, switchMap } from 'rxjs';
import { NotificationGlobalService } from '../../../../../../../../shared';
import { TranslateService } from '@ngx-translate/core';
import { ContractDocumentState } from '../../rebrand-form';
import { ContractRebrandService } from '../../services/contract-rebrand.service';

@Component({
  selector: 'fi-r-contracts-documents',
  templateUrl: './r-contracts-documents.component.html',
  styleUrls: ['./r-contracts-documents.component.scss'],
})
export class RContractsDocumentsComponent implements OnInit {
  private biddingProcessDocumentPackagesApiService = inject(
    BiddingProcessDocumentPackagesApiService
  );
  private notificationService = inject(NotificationGlobalService);
  private documentsApiSvc = inject(GeneralProcurementDocumentsApiService);
  private readonly translate = inject(TranslateService);
  private contractsSvc = inject(ContractRebrandService);
  editPermissions = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  deletePermissions = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  viewPermissions = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  files = [];
  mode = DocEnum.CONTRACTS;
  error: string = '';

  @Input() biddingContractId: string;
  @Input() groupEnum: Enumerator[];
  @Input() groupsWDocuments: FiduciaryProcessDocumentGroup[] = [];

  _documentState = signal<ContractDocumentState>({
    pendingDocs: [],
    persistedDocs: [],
    availableTypes: [],
    groupsWDocuments: [],
    groupEnum: [],
    loading: false,
  });

  public documentState = this.contractsSvc._documentState.asReadonly();
  public allDocuments = this.contractsSvc.allDocuments;
  public groupEnums = this.contractsSvc.groupEnums;
  public isLoading = this.contractsSvc.isLoading;
  public mandatoryDocs = this.contractsSvc.mandatoryDocs;
  public optionalDocs = this.contractsSvc.optionalDocs;
  public canProceed = this.contractsSvc.canProceed;

  ngOnInit(): void {
    this.contractsSvc.initializeDocumentState(
      this.groupEnum,
      this.groupsWDocuments
    );
  }

  handlerFilesChanged(filesList) {
    if (this.contractsSvc.documentAlreadyExists(filesList)) {
      const errorMessage = this.translate.instant(
        'R.CONTRACTS.VALIDATION.SAME_DOCUMENT_NAME'
      );
      this.notificationService.showError(errorMessage);
      return;
    }
    const files: FiduciaryProcessDocument[] = filesList.map((event) => {
      const file = event as File;
      const newFile: FiduciaryProcessDocument = {
        created: new Date(),
        createdBy: '',
        description: '',
        ezshareNumber: '',
        id: null,
        modified: new Date(),
        name: event.name,
        operationsDocumentId: null,
        relationalId: '',
        status: null,
        type: null,
        file,
        needBeUploaded: true,
      };
      return newFile;
    });
    this.contractsSvc.updatePendingDocs(files);
  }

  deleteFileAction(event) {
    this.contractsSvc.setLoadingState(true);
    if (event.id !== null) {
      this.documentsApiSvc
        .deleteContractDocumentV3(this.biddingContractId, event.id)
        .pipe(finalize(() => this.contractsSvc.setLoadingState(false)))
        .subscribe({
          next: () => this.contractsSvc.removeDocumentFromState(event.id),
          error: (err) => console.error('Error deleting document:', err),
        });
    } else {
      this.contractsSvc.removePendingDocument(event.name);
      this.contractsSvc.setLoadingState(false);
    }
  }

  editFileAction(event: FiduciaryProcessDocument) {
    const group = this.contractsSvc.getGroup(event);
    const isNewFile = event.id === null;
    const isEditingDescription = event.previousGroupCode === undefined;
    if (
      this.contractsSvc.isValidOperation(
        this.contractsSvc._documentState(),
        group,
        isEditingDescription,
        event
      )
    ) {
      this.contractsSvc.setLoadingState(true);
      const operation$ = isNewFile
        ? this.biddingProcessDocumentPackagesApiService.uploadDocumentsV3(
            this.biddingContractId,
            group.id,
            event.file,
            DocumentDomain.BIDDINGCONTRACTDOCUMENTGROUP,
            event.description
          )
        : this.biddingProcessDocumentPackagesApiService.editDocumentsContractsV3(
            this.biddingContractId,
            group.id,
            event.id,
            event.description
          );
      operation$
        .pipe(
          switchMap((uploadResponse: any) =>
            this.documentsApiSvc
              .getGeneralProcurementDocuments(
                group.id,
                DocumentDomain.BIDDINGCONTRACTDOCUMENTGROUP
              )
              .pipe(
                map(
                  (documents) => documents as GeneralProcurementDocumentResponse
                ),
                map((documents) => ({ uploadResponse, documents }))
              )
          ),
          finalize(() => this.contractsSvc.setLoadingState(false))
        )
        .subscribe({
          next: ({ uploadResponse, documents }) => {
            const previousId = event.id;
            const updatedDoc = {
              ...documents.fiduciaryProcessDocuments.find(
                (d) => d.id === uploadResponse.documentId
              ),
              newDescription: event.description,
              groupCode: event.groupCode,
            };
            this.contractsSvc.updateDocOnSelectChange(
              isNewFile,
              event,
              updatedDoc,
              uploadResponse,
              previousId
            );
          },
          error: () => {
            this.notificationService.showError(
              this.translate.instant(
                'R_CONTRACTS_DOCUMENTS_ALREADY_EXISTS_LABEL'
              )
            );
          },
        });
    } else {
      const isEmpty = !event.description?.trim();

      const isSignedContract =
        group.groupCode === BiddingContractDocumentGroupCode.SIGNED_CONTRACT;

      const errorMessage = isEmpty
        ? isSignedContract
          ? this.translate.instant('R_CONTRACTS_DOCUMENTS_ALREADY_EXISTS_LABEL')
          : this.translate.instant(
              'R_CONTRACTS_DOCUMENTS_DESCRIPTION_REQUIRED_LABEL'
            )
        : this.translate.instant('R_CONTRACTS_DOCUMENTS_ALREADY_EXISTS_LABEL');

      this.notificationService.showError(errorMessage);

      this.contractsSvc.updateState(isNewFile, event, isEditingDescription);
    }
  }

  validate() {
    this.error = this.contractsSvc.getError();
  }
}
