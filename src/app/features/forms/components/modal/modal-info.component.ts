import { Component, Input } from '@angular/core';
import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';
@Component({
  selector: 'fi-modal-info',
  templateUrl: './modal-info.component.html',
})
export class ModalInfoComponent extends DialogContentBase {
  @Input() defaultDate = Date();
  date: Date = new Date();
  min: Date = new Date();
  numberDay: number;
  groupText: string;
  newNumberDay: number = 0;
  constructor(public dialog: DialogRef) {
    super(dialog);
  }
  saveDate(): void {
    this.date = new Date(this.defaultDate);
    this.dialog.close({
      date: this.defaultDate,
    });
  }
  close(): void {
    this.dialog.close();
  }
  onValueChange(event: any) {
    const fechaInicio = this.min.getTime();
    const fechaFin = new Date(event).getTime();
    const diff = fechaFin - fechaInicio;
    const diferenciaDias = diff / (1000 * 60 * 60 * 24);
    this.newNumberDay = Math.trunc(diferenciaDias);
  }
}
