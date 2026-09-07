import { Component, Input } from '@angular/core';
import { FiduciaryProcessDocumentsStatuses } from '@core/enums';

import { Enums } from '@core/models';

@Component({
  selector: 'fi-document-state-tag',
  templateUrl: './document-state-tag.component.html',
})
export class DocumentStateTagComponent {
  DocumentStatuses = Enums.fiduciaryProcessDocumentsStatuses;
  public enumDraft = FiduciaryProcessDocumentsStatuses.draftUploadedBlobStorage;
  public enumRevision = FiduciaryProcessDocumentsStatuses.underReview;
  public enumPublished = FiduciaryProcessDocumentsStatuses.uploaded;
  public enumRejected = FiduciaryProcessDocumentsStatuses.rejected;

  @Input() tag: FiduciaryProcessDocumentsStatuses;
}
