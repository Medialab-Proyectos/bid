import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PermissionEnum } from '@core/enums/permission.enum';
import { FileInfo, SelectEvent } from '@progress/kendo-angular-upload';

@Component({
  selector: 'fi-file-selector',
  templateUrl: './file-selector.component.html',
})
export class FileSelectorComponent {
  @Input() public setAllowedTransactionExtensions = false;
  @Input() public permission: PermissionEnum[] = [PermissionEnum.SPECIAL];
  @Output() valueChange = new EventEmitter<FileInfo[]>();

  allowedExtensions = [
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.ppt',
    '.pptx',
    '.jpg',
    '.jpeg',
    '.png',
    '.svg',
    '.msg',
  ];

  allowedTransactionExtensions = [
    '.pdf',
    '.xls',
    '.xlsx',
    '.pst',
    '.ppt',
    '.pptx',
    '.mpp',
    '.pub',
    '.vsd',
    '.vss',
    '.vst',
    '.vdx',
    '.vsx',
    '.vtx',
    '.doc',
    '.docx',
    '.wpd',
    '.msg',
    '.jpg',
    '.jpeg',
    '.png',
  ];

  onValueChange(event: SelectEvent): void {
    const filtered = event.files.filter((item) =>
      this.setAllowedTransactionExtensions
        ? this.allowedTransactionExtensions.find(
            (elem) => elem === item.extension.toLowerCase()
          )
        : this.allowedExtensions.find(
            (elem) => elem === item.extension.toLowerCase()
          )
    );
    this.valueChange.emit(filtered);
  }
}
