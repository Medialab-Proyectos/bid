import { Component, Input, OnInit } from '@angular/core';
import { Enums, GetWorkflowDocumentResponse } from '@core/models';
import {
  FileService,
  NotificationGlobalService,
} from '@fiduciary-interface/app/shared';
import { TranslateService } from '@ngx-translate/core';
import { FileSaverService } from 'ngx-filesaver';

@Component({
  selector: 'fi-activity-detail-documents',
  templateUrl: './activity-detail-documents.component.html',
  styleUrls: [],
})
export class ActivityDetailDocumentsComponent implements OnInit {
  public enum = Enums;
  workflowDocumentsVisbilityEnum: string;

  @Input() documents: GetWorkflowDocumentResponse[];
  
  constructor(
    readonly fileServices: FileService,
    readonly fileSaverService: FileSaverService,
    private readonly translate: TranslateService,
    readonly notificationGlobalSvc: NotificationGlobalService
  ) {}

  ngOnInit(): void {
    this.getVisibilityEnum();
  }
  download(doc: GetWorkflowDocumentResponse): void {
    if (doc.fiduciaryProcessDocumentId) {
      this.fileServices.downloadFile(doc.fiduciaryProcessDocumentId).subscribe(
        (res: ArrayBuffer) => {
          this.saveDocument(res, doc.fileName);
        },
        () => {
          this.donwloadErrorMessage();
        }
      );
    }
  }
  saveDocument(res: ArrayBuffer, docName: string): void {
    this.fileSaverService.save(new Blob([new Uint8Array(res).buffer]), docName);
  }
  donwloadErrorMessage(): void {
    const message = this.translate.instant(
      'SHARED.DOCUMENT.DOCUMENT_FINISHED.ERROR_DOWNLOAD'
    );
    this.notificationGlobalSvc.showError(message);
  }
  getVisibilityEnum(): void {
    this.workflowDocumentsVisbilityEnum =
      this.enum.WorkFlowDocumentVisibilities;
  }
}
