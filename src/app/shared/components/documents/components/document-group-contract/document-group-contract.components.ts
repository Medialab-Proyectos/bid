import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
} from '@angular/core';
import {
  ControlValueAccessor,
  UntypedFormControl,
  UntypedFormGroup,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import {
  PermissionEnum,
  DocEnum,
  BiddingContractAmendmentDocumentGroupCode,
} from '@core/enums';
import {
  Enumerator,
  FiduciaryProcessDocument,
  FiduciaryProcessDocumentGroup,
  Group,
} from '@core/models';
import { EventDocument } from '@fiduciary-interface/app/features/procurement/features/procurement-process/features/process-doc-packages/models/event-document.model';

@Component({
  selector: 'fi-document-group-contract',
  templateUrl: './document-group-contract.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DocumentGroupContractComponent),
      multi: true,
    },
  ],
})
export class DocumentGroupContractComponent implements ControlValueAccessor {
  @Input() groupsList: Group[];
  @Input() viewPermissions: PermissionEnum[] = [PermissionEnum.SPECIAL];
  @Input() editPermissions: PermissionEnum[] = [PermissionEnum.SPECIAL];
  @Input() deletePermissions: PermissionEnum[] = [PermissionEnum.SPECIAL];
  @Input() set groups(value: FiduciaryProcessDocumentGroup[]) {
    this._groups = value;
    if (this._groups?.length > 0) {
      this.bankResponseDocuments();
    }
    this.allDocuments = this.getAllDocuments();
  }
  @Input() set documentsToUpload(value: FiduciaryProcessDocument[]) {
    this._documentsToUpload = value;
    this.allDocuments = this.getAllDocuments();
  }
  @Input() noDocumentsMessage: string;
  @Input() set groupEnum(value: Enumerator[]) {
    this.groupEnumAux = value;
    this.groupEnumAux = value.filter((group) => {
      return (
        group.id !==
        BiddingContractAmendmentDocumentGroupCode.AMENDMENT_BANK_RESPONSE
      );
    });
  }
  @Input() groupParentId = String();
  @Input() showReadOnly = false;
  @Input() isUploading = false;
  @Input() mode: DocEnum;

  @Output() editFile: EventEmitter<any> = new EventEmitter<any>();
  @Output() deleteFile: EventEmitter<any> = new EventEmitter<any>();
  @Output() fileChange: EventEmitter<any> = new EventEmitter<any>();

  onTouched!: Function;
  onChanged: boolean;
  selected!: string;

  allDocuments: FiduciaryProcessDocument[] = [];
  _groups: FiduciaryProcessDocumentGroup[] = [];
  _documentsToUpload: FiduciaryProcessDocument[];
  validGroups = new UntypedFormGroup({
    state: new UntypedFormControl('', []),
  });

  showFinishedDocs = false;
  bankResponseDocs: FiduciaryProcessDocument[];
  groupEnumAux: Enumerator[];
  constructor() {}

  bankResponseDocuments(): void {
    const bankResponseGroup = this._groups.find((group) => {
      return (
        group.groupCode ===
        BiddingContractAmendmentDocumentGroupCode.AMENDMENT_BANK_RESPONSE
      );
    });
    this.showFinishedDocs =
      bankResponseGroup?.fiduciaryProcessDocuments?.length > 0;

    this.bankResponseDocs = bankResponseGroup
      ? [...bankResponseGroup?.fiduciaryProcessDocuments]
      : [];
  }

  get validDocs(): UntypedFormControl {
    return this.validGroups.get('state') as UntypedFormControl;
  }

  writeValue(value: string): void {
    this.selected = value ?? 'IN';
  }

  registerOnChange(fn: boolean): void {
    this.onChanged = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  getMandatoryGroups(): FiduciaryProcessDocumentGroup[] {
    let groups = this._groups?.filter((g) => g.isMandatory === true);
    let hasDocs = true;
    if (groups?.length > 0) {
      groups?.forEach((g) => {
        if (
          g.fiduciaryProcessDocuments &&
          g.fiduciaryProcessDocuments.length <= 0
        ) {
          hasDocs = false;
        }
      });
    } else {
      hasDocs = false;
    }
    this.onChanged = hasDocs;

    groups = this.orderGroup(groups);

    if (groups) {
      return groups;
    } else {
      return [];
    }
  }

  getOptionalGroups(isMandatory = false): FiduciaryProcessDocumentGroup[] {
    let filteredGroups: FiduciaryProcessDocumentGroup[];
    if (this.showReadOnly) {
      filteredGroups = this._groups?.filter(
        (g) => g.isMandatory === isMandatory
      );
    } else {
      filteredGroups = this._groups?.filter(
        (g) =>
          g.isMandatory === isMandatory &&
          g.groupCode !==
            BiddingContractAmendmentDocumentGroupCode.AMENDMENT_BANK_RESPONSE
      );
    }

    this._groups?.filter(
      (g) =>
        g.isMandatory === isMandatory &&
        g.groupCode !==
          BiddingContractAmendmentDocumentGroupCode.AMENDMENT_BANK_RESPONSE
    );

    filteredGroups = this.orderGroup(filteredGroups);

    if (filteredGroups) {
      return filteredGroups;
    } else {
      return [];
    }
  }

  orderGroup(group: FiduciaryProcessDocumentGroup[]) {
    return group?.sort((a, b) => {
      if (a.groupCode === b.groupCode) {
        return 0;
      }
      if (a.groupCode < b.groupCode) {
        return -1;
      }
      return 1;
    });
  }

  editFileAction(event: EventDocument): void {
    this.editFile.emit({
      event,
      parentId: this.groupParentId,
    });
  }

  deleteFileAction(document: FiduciaryProcessDocument): void {
    this.deleteFile.emit({
      document,
      parentId: this.groupParentId,
    });
  }

  handlerFilesChanged(files): void {
    this.fileChange.emit({
      files,
      parentId: this.groupParentId,
    });
  }

  getAllDocuments(): FiduciaryProcessDocument[] {
    const docs: FiduciaryProcessDocument[] = [];

    const newGroups: FiduciaryProcessDocumentGroup[] = [
      ...this.getMandatoryGroups(),
      ...this.getOptionalGroups(),
    ];
    newGroups.forEach((group) => {
      if (group.fiduciaryProcessDocuments) {
        group.fiduciaryProcessDocuments.forEach((doc) => {
          docs.push(doc);
        });
      }
    });

    if (!!this._documentsToUpload) {
      this._documentsToUpload.forEach((d) => docs.push(d));
    }
    return docs;
  }
}
