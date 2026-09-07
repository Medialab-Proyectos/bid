import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Enumerator, FiduciaryProcessDocument } from '@core/models';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'fi-mat-finished-docs',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './mat-finished-docs.component.html',
  styleUrls: ['./mat-finished-docs.component.scss'],
})
export class MatFinishedDocsComponent {
  @Input() documents: FiduciaryProcessDocument[];
  @Input() biddingContractDocumentGroupCodes: Enumerator[];
  @Output() downloadEmitter: EventEmitter<FiduciaryProcessDocument> =
    new EventEmitter<FiduciaryProcessDocument>();

  getGroupName(code) {
    return this.biddingContractDocumentGroupCodes.find((g) => g.id === code)
      .name;
  }

  downloadFile(doc) {
    this.downloadEmitter.emit(doc);
  }
}
