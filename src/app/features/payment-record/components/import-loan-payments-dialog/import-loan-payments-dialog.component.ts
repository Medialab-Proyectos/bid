import { Component } from '@angular/core';
import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';
import { FileRestrictions, SelectEvent } from '@progress/kendo-angular-upload';
import { TranslateService } from '@ngx-translate/core';
import { ImportValidationResult } from '../../models/payment-record.model';
import { PaymentRecordApiService } from '../../services/payment-record-api.service';

const ACCEPTED_EXTENSIONS = ['.xlsx', '.xls', '.csv'];
const MAX_FILE_SIZE_MB = 10;

/**
 * "Importar pagos" from the report list: the loan-wide sibling of the
 * "Import from a file" step inside "Añadir pagos". Kept as its own dialog
 * instead of a mode of `AddPaymentsDialogComponent` because the other three
 * sources there (schedule, manual entry, accumulated amount) are all
 * inherently about one commitment's own ledger -- forcing them to cope with
 * "no commitment chosen yet" would have complicated that component for a
 * combination that can never actually happen. This one only ever does the
 * file step, so it stays a plain, self-contained copy of it instead.
 *
 * The template it hands out carries its own "Compromiso" column, and a row
 * of the uploaded file can belong to any commitment of the project -- no
 * "which commitment is this file for?" step first, unlike the per-commitment
 * import.
 */
@Component({
  selector: 'fi-import-loan-payments-dialog',
  templateUrl: './import-loan-payments-dialog.component.html',
  styleUrls: ['../../payment-record.shared.scss'],
})
export class ImportLoanPaymentsDialogComponent extends DialogContentBase {
  projectBucketId: string;

  readonly acceptedFormats = ACCEPTED_EXTENSIONS.join(', ');
  readonly maxFileSizeMb = MAX_FILE_SIZE_MB;
  readonly fileRestrictions: FileRestrictions = {
    allowedExtensions: ACCEPTED_EXTENSIONS,
    maxFileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
  };

  uploading = false;
  saving = false;
  importResult: ImportValidationResult;

  constructor(
    dialog: DialogRef,
    private readonly api: PaymentRecordApiService,
    private readonly translate: TranslateService
  ) {
    super(dialog);
  }

  get hasImportErrors(): boolean {
    return (this.importResult?.errors?.length ?? 0) > 0;
  }

  get importAccepted(): boolean {
    return Boolean(this.importResult) && !this.hasImportErrors;
  }

  /** Every row blocked on something, once each -- one row can fail more than
   *  one check, and the chips are meant to be scanned, not counted twice. */
  get blockingRowNumbers(): number[] {
    const rows = new Set<number>();
    for (const error of this.importResult?.errors ?? []) {
      for (const row of error.rows) {
        rows.add(row.rowNumber);
      }
    }
    return [...rows].sort((a, b) => a - b);
  }

  /** What the footer says, mirroring `AddPaymentsDialogComponent`'s own
   *  file-source logic since this dialog only ever does that one step. */
  get blockingReason(): string {
    if (this.saving) {
      return 'PAYMENT_RECORD.ADD_PAYMENTS.BLOCKED_SAVING';
    }
    if (this.hasImportErrors) {
      return 'PAYMENT_RECORD.ADD_PAYMENTS.BLOCKED_FILE_ERRORS';
    }
    return this.importAccepted ? '' : 'PAYMENT_RECORD.ADD_PAYMENTS.BLOCKED_FILE';
  }

  downloadTemplate(): void {
    this.api.downloadLoanImportTemplate(this.projectBucketId).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payment-import-template-${this.projectBucketId}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    });
  }

  onFileSelected(event: SelectEvent): void {
    const file = event.files[0]?.rawFile;
    if (!file) {
      return;
    }

    this.uploading = true;
    this.importResult = null;
    this.api.importLoanPayments(this.projectBucketId, file).subscribe({
      next: (result) => {
        this.importResult = result;
        this.uploading = false;
      },
      error: () => {
        this.uploading = false;
      },
    });
  }

  /** Clears the failed attempt so the corrected file can be dropped again. */
  retryUpload(): void {
    this.importResult = null;
  }

  /**
   * A CSV built from what the dialog already has -- no endpoint of its own --
   * so the agency can hand the row/problem list to whoever fixes the file
   * without re-reading every card on screen. Mirrors
   * `AddPaymentsDialogComponent.downloadErrorReport()`.
   */
  downloadErrorReport(): void {
    const rowHeader = this.translate.instant('PAYMENT_RECORD.IMPORT.COLUMNS.ROW');
    const issueHeader = this.translate.instant('PAYMENT_RECORD.IMPORT.RULES_TITLE');
    const lines = [`${rowHeader};${issueHeader}`];

    for (const error of this.importResult?.errors ?? []) {
      const message = this.translate.instant(error.message);
      for (const row of error.rows) {
        lines.push(`${row.rowNumber};${message}`);
      }
    }
    for (const row of this.importResult?.duplicateRows ?? []) {
      const duplicateLabel = this.translate.instant(
        'PAYMENT_RECORD.IMPORT.DUPLICATE_ROWS'
      );
      lines.push(`${row};${duplicateLabel}`);
    }

    const blob = new Blob([lines.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.importResult?.fileName ?? 'import'}-errores.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  cancel(): void {
    this.dialog.close();
  }

  confirm(): void {
    // The imported rows are reviewed in a screen of their own, same as the
    // per-commitment import.
    this.dialog.close({ imported: this.importResult });
  }
}
