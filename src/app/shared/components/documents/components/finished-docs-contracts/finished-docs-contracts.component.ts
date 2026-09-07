import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FileSaverService } from 'ngx-filesaver';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared/services/notification-global.service';
import { FileService } from '@fiduciary-interface/app/shared/services/file.service';
import { Enums, FiduciaryProcessDocument } from '@core/models';
import { DocEnum } from '@core/enums';

@Component({
  selector: 'fi-finished-docs-contracts',
  templateUrl: './finished-docs-contracts.component.html',
})
export class FinishedDocsContractsComponent {
  @Input() set files(value: FiduciaryProcessDocument[]) {
    this._files = value;
  }
  @Input() noDocumentsMessage = 'PROCESS_DOC.DOCUMENT_TAB.NO_DOCUMENTS';
  @Input() set mode(_mode: DocEnum) {
    this._mode = _mode;
    switch (_mode) {
      case DocEnum.CONTRACTS:
        this.enumType = this.enum.biddingContractDocumentGroupCodes;
        break;
      case DocEnum.AMENDMENTS:
        this.enumType = this.enum.biddingContractAmendmentDocumentGroupCodes;
        break;
      default:
        this.enumType = this.enum.biddingProcessDocumentGroupCodes;
        break;
    }
  }

  _mode: DocEnum;
  enum = Enums;
  enumType: string;
  isDowloading: boolean;
  _files: FiduciaryProcessDocument[];

  constructor(
    private readonly notificationGlobalSvc: NotificationGlobalService,
    readonly fileSaverService: FileSaverService,
    private readonly translate: TranslateService,
    readonly fileServices: FileService
  ) {}

  donwloadDocument(doc: FiduciaryProcessDocument): void {
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

  donwloadErrorMessage(): void {
    const message = this.translate.instant(
      'SHARED.DOCUMENT.DOCUMENT_FINISHED.ERROR_DOWNLOAD'
    );
    this.notificationGlobalSvc.showError(message, 'right', 'top', 7000);
  }
}
