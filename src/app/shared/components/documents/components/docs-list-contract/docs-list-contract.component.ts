import { Component, Input } from '@angular/core';
import { DocEnum, PermissionEnum } from '@core/enums';
import { Enums, FiduciaryProcessDocumentGroup } from '@core/models';

@Component({
  selector: 'fi-docs-list-contract',
  templateUrl: './docs-list-contract.component.html',
  providers: [],
})
export class DocsListContractComponent {
  @Input() set mode(value: string) {
    switch (value) {
      case DocEnum.CONTRACTS:
        this.groupEnum = Enums.biddingContractDocumentGroupCodes;
        break;
      case DocEnum.AMENDMENTS:
        this.groupEnum = Enums.biddingContractAmendmentDocumentGroupCodes;
        break;
      default:
        this.groupEnum = Enums.biddingProcessDocumentGroupCodes;
        break;
    }
  }
  @Input() mandatoryDocs: FiduciaryProcessDocumentGroup[] = [];
  @Input() optionalDocs: FiduciaryProcessDocumentGroup[] = [];
  @Input() permissions: PermissionEnum[] = [PermissionEnum.SPECIAL];
  groupEnum: string;
}
