import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Enums, FiduciaryProcessDocumentObj } from '@core/models';
import { FileService } from '@fiduciary-interface/app/shared';
import { FileSaverService } from 'ngx-filesaver';
import { Subscription } from 'rxjs';
import {
  TransactionDocumentGroup,
  TransactionEventDocument,
} from '../../models';
import { TransactionsFormService } from '../../services';

@Component({
  selector: 'fi-transaction-document-list',
  templateUrl: './transaction-document-list.component.html',
})
export class TransactionDocumentListComponent implements OnInit, OnDestroy {
  private readonly subscriptions = new Subscription();

  @Output() editDocumentEvent = new EventEmitter<TransactionEventDocument>();
  @Output() deleteDocumentEvent =
    new EventEmitter<FiduciaryProcessDocumentObj>();

  @Input() documents: FiduciaryProcessDocumentObj[] = [];
  @Input() set documentGroups(dg: TransactionDocumentGroup[]) {
    this.transactionDocumentGroup = dg;
  }
  @Input() set resetSelectedGroup(f: FiduciaryProcessDocumentObj) {
    this.removeSelectedGroup(f);
  }
  @Input() set setSelectedGroup(f: FiduciaryProcessDocumentObj) {
    this.rollBackSelectedGroup(f);
  }

  transactionDocumentGroup: TransactionDocumentGroup[] = [];
  groupEnum = Enums.transactionDocumentGroupCodes;

  dropdownValue: number[] = [];

  isDowloading = false;
  isLoading = false;

  constructor(
    readonly transactionFormService: TransactionsFormService,
    readonly fileSaverService: FileSaverService,
    readonly fileServices: FileService
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  itemDisabled(itemArgs: {
    dataItem: TransactionDocumentGroup;
    index: number;
  }): boolean {
    return itemArgs.dataItem.systemGenerated;
  }

  onChangeDocumentType(
    groupCode: number,
    doc: FiduciaryProcessDocumentObj
  ): void {
    this.editDocumentEvent.emit({
      documentGroupCode: groupCode,
      document: doc,
    });
  }

  onDeleteDocument(doc: FiduciaryProcessDocumentObj): void {
    this.deleteDocumentEvent.emit(doc);
  }

  downloadDocument(doc: FiduciaryProcessDocumentObj): void {
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
            this.transactionFormService.showErrorToast(
              'SHARED.DOCUMENT.DOCUMENT_FINISHED.ERROR_DOWNLOAD'
            );
          }
        )
        .add(() => (this.isDowloading = false));
    }
  }

  removeSelectedGroup(file: FiduciaryProcessDocumentObj): void {
    const idx = this.documents.findIndex((f) => f?.name === file?.name);
    if (idx >= 0) {
      this.dropdownValue[idx] = null;
      this.documents[idx] = {
        id: null,
        relationalId: String(),
        status: 0,
        type: 0,
        ezshareNumber: String(),
        name: file.name,
        created: new Date(),
        modified: new Date(),
        createdBy: String(),
        file: file.file,
        operationsDocumentId: 0,
        groupCode: null,
        description: '',
      };
    }
  }

  rollBackSelectedGroup(file: FiduciaryProcessDocumentObj): void {
    const idx = this.documents.findIndex((f) => f?.id === file?.id);
    if (idx >= 0) {
      this.dropdownValue[idx] = file.groupCode;
    }
  }
}
