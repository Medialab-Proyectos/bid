import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { DocEnum } from '@core/enums';
import {
  Enums,
  FiduciaryProcessDocumentObj,
  GetFiduciaryProcessDocumentsIdResponse,
} from '@core/models';
import {
  BiddingProcessDocumentPackagesApiService,
  GeneralProcurementDocumentsApiService,
} from '@core/services/apis';
import { AppStateWithUsrPreferences } from '@core/store';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { catchError, map, mergeMap, retry, tap } from 'rxjs/operators';
import { TransactionsStatus, TransactionsTypes } from '../../enums';
import {
  TransactionData,
  TransactionDocumentGroup,
  TransactionDocumentGroupResponse,
  TransactionEventDocument,
} from '../../models';
import { FiTransactionsApiService } from '../../services';

@Component({
  selector: 'fi-transaction-documents',
  templateUrl: './transaction-documents.component.html',
})
export class TransactionDocumentsComponent implements OnInit, OnDestroy {
  readonly subscriptions = new Subscription();
  groupEnum = Enums.transactionDocumentGroupCodes;

  @Input() domain = 5;
  @Input() title = 'TRANSACTION.DOCUMENTS.TITLE';
  @Input() number: number;
  @Input() showReadOnly = false;
  @Input() set transactionData(data: TransactionData) {
    if (!!data) {
      this.transaction = data;
      this.loadDocuments(data.id, data.type);
    }
  }
  @Input() showAlert: boolean;

  @Output() oneDocumentValidation = new EventEmitter<boolean>();

  mode = DocEnum.TRANSACTIONS;
  documentGroups: TransactionDocumentGroup[] = [];
  documents: FiduciaryProcessDocumentObj[] = [];
  resetSelectedGroup: FiduciaryProcessDocumentObj = null;
  setSelectedGroup: FiduciaryProcessDocumentObj = null;
  transaction: TransactionData;
  projectBucketId: string;
  isLoading = false;
  isLoadingDoc = false;

  constructor(
    readonly transactionsApi: FiTransactionsApiService,
    readonly documentsApi: BiddingProcessDocumentPackagesApiService,
    readonly documentApi: GeneralProcurementDocumentsApiService,
    readonly translate: TranslateService,
    readonly notificationGlobalService: NotificationGlobalService,
    readonly storePreferences: Store<AppStateWithUsrPreferences>
  ) {}

  ngOnInit(): void {
    this.getCurrentLang();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getCurrentLang(): void {
    const sub = this.storePreferences
      .select('selectedProject')
      .subscribe((data) => {
        if (data.selectedProject.projectBucketId) {
          this.projectBucketId = data.selectedProject.projectBucketId;
        }
      });
    this.subscriptions.add(sub);
  }

  onEditDocumentEvent(event: TransactionEventDocument): void {
    if (!!event) {
      if (event.document.id === null) {
        this.uploadDocument(event);
      } else {
        this.modifyDocument(event);
      }
    }
  }

  onDeleteDocumentEvent(doc: FiduciaryProcessDocumentObj): void {
    if (doc.id) {
      this.isLoading = true;
      this.documentApi
        .deleteGeneralProcurementDocument(doc.id, this.domain)
        .subscribe(
          (_) => {
            this.documents = this.documents.filter((d) => d.id !== doc.id);
            const group = this.documentGroups.find(
              (dg) => dg.documentGroupCode === doc.groupCode
            );
            group.documents = group.documents.filter((d) => d.id !== doc.id);
            this.checkOneDocumentValidation();
          },
          (_) => {
            this.errorMessage(
              'PROCESS_DOC.DOCUMENT_TAB.DOCUMENT_MESSAGES.DELETE_ERROR'
            );
          }
        )
        .add(() => (this.isLoading = false));
    } else {
      this.documents = this.documents.filter((d) => d.name !== doc.name);
    }
  }

  onSelectedFiles(files: any[]): void {
    if (!!files && files.length > 0) {
      for (const f of files) {
        if (!this.documents.find((d) => d.name === f.name)) {
          this.documents.push({
            id: null,
            relationalId: String(),
            status: 0,
            type: 0,
            ezshareNumber: String(),
            name: f.name,
            created: new Date(),
            modified: new Date(),
            createdBy: String(),
            file: f,
            operationsDocumentId: 0,
            groupCode: null,
            description: '',
          });
        } else {
          this.errorMessage(
            'SHARED.DOCUMENT.PROCESS_DOC.DOCUMENT_MESSAGES.DUPLICATE_ERROR'
          );
        }
      }
    } else {
      this.errorMessage(
        'SHARED.DOCUMENT.PROCESS_DOC.DOCUMENT_MESSAGES.FORMAT_ERROR'
      );
    }
  }

  modifyDocument(event: TransactionEventDocument): void {
    const oldGroup = this.documentGroups.find((group) =>
      group.documents.find((doc) => doc.id === event.document.id)
    );
    const newGroup = this.documentGroups.find(
      (group) => group.documentGroupCode === event.documentGroupCode
    );

    this.isLoading = true;
    this.documentApi
      .changeGroupOfDocument(event.document.id, newGroup.id, this.domain)
      .subscribe(
        (_) => {
          const oldGroup = this.documentGroups.find((group) =>
            group.documents.find((doc) => doc.id === event.document.id)
          );
          oldGroup.documents = oldGroup.documents.filter(
            (doc) => doc.id !== event.document.id
          );
          newGroup.documents.push(event.document);

          this.documents = [];
          this.loadDocuments(this.transaction.id, this.transaction.type);
          this.checkOneDocumentValidation();
        },
        (error) => {
          if (error.status === 500) {
            this.errorMessage(
              'SHARED.DOCUMENT.PROCESS_DOC.DOCUMENT_MESSAGES.DUPLICATE_ERROR'
            );
          } else {
            this.errorMessage(
              'PROCESS_DOC.DOCUMENT_TAB.DOCUMENT_MESSAGES.UPLOAD_ERROR'
            );
          }
          event.document.groupCode = oldGroup.documentGroupCode;
          this.setSelectedGroup = event.document;
        }
      )
      .add(() => (this.isLoading = false));
  }

  uploadDocument(event: TransactionEventDocument): void {
    const group: TransactionDocumentGroup = this.documentGroups.find(
      (g) => g.documentGroupCode === event.documentGroupCode
    );

    if (!!group) {
      this.isLoading = true;
      this.documentsApi
        .uploadDocumentsTransactions(
          group.id,
          event.document.file,
          this.projectBucketId
        )
        .subscribe(
          (r: any) => {
            /* event.document.relationalId = r.relationalId; */
            event.document.name = r.fileName;
            event.document.id = r.documentId;
            group.documents = [...group.documents, { ...event.document }];
            this.checkOneDocumentValidation();
          },
          (_) => {
            this.resetSelectedGroup = event.document;
            this.errorMessage(
              'PROCESS_DOC.DOCUMENT_TAB.DOCUMENT_MESSAGES.UNIQUENESS_ERROR'
            );
          }
        )
        .add(() => (this.isLoading = false));
    }
  }

  loadDocuments(id: number, type: TransactionsTypes): void {
    this.isLoadingDoc = true;
    this.subscriptions.add(
      this.getDocumentGroups(id, type)
        .pipe(
          mergeMap((groups) => {
            this.documentGroups = groups;
            const docRequests = [];

            for (const group of groups) {
              docRequests.push(this.getPopulatedDocuments(group));
            }

            return forkJoin(docRequests);
          }),
          tap((response: FiduciaryProcessDocumentObj[][]) => {
            for (const docs of response) {
              if (docs.length > 0) {
                const dg = this.documentGroups.find(
                  (g) => g.documentGroupCode === docs[0].groupCode
                );
                dg.documents = docs;
                this.documents = [...this.documents, ...docs];
                this.documents[this.documents.length - 1].systemGenerated =
                  dg.systemGenerated;

                const uniqueDocuments = Array.from(
                  new Map(this.documents.map((doc) => [doc.id, doc])).values()
                );

                this.documents = uniqueDocuments;
              }
            }

            if (
              this.transaction.status === TransactionsStatus.ERETURNED ||
              this.transaction.status === TransactionsStatus.ERETURNEDBYIDB
            ) {
              this.documents = this.documents.filter((d) => !d.systemGenerated);
            }
          })
        )
        .subscribe((_) => this.checkOneDocumentValidation())
        .add(() => (this.isLoadingDoc = false))
    );
  }

  getDocumentGroups(
    id: number,
    type: TransactionsTypes
  ): Observable<TransactionDocumentGroup[]> {
    return this.transactionsApi.getDocumentGroups(id, type).pipe(
      map((data: TransactionDocumentGroupResponse) => {
        if (!!data && !!data.transactionsDocumentGroups) {
          return data.transactionsDocumentGroups.map((dg) => {
            dg.documents = [];
            return dg;
          });
        }
        return [];
      }),
      retry(2)
    );
  }

  getPopulatedDocuments(
    group: TransactionDocumentGroup
  ): Observable<FiduciaryProcessDocumentObj[]> {
    return this.getDocuments(group).pipe(
      map((response: GetFiduciaryProcessDocumentsIdResponse) => {
        return response.fiduciaryProcessDocuments.map((doc) => {
          doc.groupCode = group.documentGroupCode;
          return doc as FiduciaryProcessDocumentObj;
        });
      })
    );
  }

  getDocuments(
    group: TransactionDocumentGroup
  ): Observable<GetFiduciaryProcessDocumentsIdResponse> {
    const response: GetFiduciaryProcessDocumentsIdResponse = {
      parentId: group.id,
      fiduciaryProcessDocuments: [],
    };
    return this.documentsApi
      .getFiduciaryProcessDocuments(group.id, this.domain)
      .pipe(
        catchError(() => {
          return of(response);
        }),
        map((data: GetFiduciaryProcessDocumentsIdResponse) => {
          if (!!data && !!data.fiduciaryProcessDocuments) {
            return data;
          }
          return response;
        })
      );
  }

  checkOneDocumentValidation(): void {
    this.oneDocumentValidation.emit(
      this.documents.filter((d) => !!d.id)?.length > 0
    );
  }

  errorMessage(typeError: string): void {
    const message = this.translate.instant(typeError);
    this.notificationGlobalService.showError(message);
  }
}
