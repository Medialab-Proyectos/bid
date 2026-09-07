import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocEnum, PermissionEnum } from '@core/enums';
import { Enums, FiduciaryProcessDocumentGroup } from '@core/models';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateEnumPipeSa } from '../../pipes/translate-enum-standalone.pipe';
import { DisplayByPermissionsSaDirective } from '../../directives/display-by-permissions-standalone.directive';

@Component({
  selector: 'fi-mat-doc-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    TranslateModule,
    TranslateEnumPipeSa,
    DisplayByPermissionsSaDirective,
  ],
  templateUrl: './mat-doc-list.component.html',
  styleUrls: ['./mat-doc-list.component.scss'],
})
export class MatDocListComponent {
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
