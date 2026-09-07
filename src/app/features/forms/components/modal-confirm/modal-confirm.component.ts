import { Component } from '@angular/core';
import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';
@Component({
  selector: 'fi-modal-confirm',
  templateUrl: './modal-confirm.component.html',
})
export class ModalConfirmComponent extends DialogContentBase {
  confirm: boolean;
  groupText: string;
  constructor(public dialog: DialogRef) {
    super(dialog);
  }
  saveDate(): void {
    this.confirm = true;
    this.dialog.close({
      confirm: this.confirm,
    });
  }
  close(): void {
    this.dialog.close();
  }
}
