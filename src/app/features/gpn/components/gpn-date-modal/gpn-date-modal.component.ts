import { Component, Input } from '@angular/core';
import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';

@Component({
  selector: 'fi-gpn-date-modal',
  templateUrl: './gpn-date-modal.component.html',
})
export class GpnDateModalComponent extends DialogContentBase {
  @Input() defaultDate = Date();
  date: Date = new Date();
  currendaDate: Date = new Date();

  constructor(public dialog: DialogRef) {
    super(dialog);
  }

  saveDate(): void {
    this.date = new Date(this.defaultDate);
    this.dialog.close({
      date: this.defaultDate,
    });
  }
}
