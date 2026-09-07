import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmCancelDialogData {
  headerIcon?: string;
  headerEnum: string;
  bodyTextEnum: string;
  confirmButtonEnum: string;
  cancelButtonEnum?: string;
}

@Component({
  templateUrl: './confirm-cancel-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmCancelDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmCancelDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmCancelDialogData
  ) {}

  closeDialog() {
    this.dialogRef.close();
  }
}
