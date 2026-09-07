import { Component, OnInit } from '@angular/core';
import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';
import {
  ImportValidationResult,
  ImportedPaymentRow,
} from '../../models/payment-record.model';
import { PaymentRecordApiService } from '../../services/payment-record-api.service';

/**
 * "Pagos importados": what the back end read out of the spreadsheet, for the
 * user to confirm before anything is registered.
 */
@Component({
  selector: 'fi-imported-payments-dialog',
  templateUrl: './imported-payments-dialog.component.html',
  styleUrls: ['../../payment-record.shared.scss'],
})
export class ImportedPaymentsDialogComponent
  extends DialogContentBase
  implements OnInit
{
  commitmentId: string;
  result: ImportValidationResult;

  rows: ImportedPaymentRow[] = [];
  filteredRows: ImportedPaymentRow[] = [];
  selection: { [rowNumber: number]: boolean } = {};
  searchTerm = '';
  saving = false;

  constructor(dialog: DialogRef, private readonly api: PaymentRecordApiService) {
    super(dialog);
  }

  ngOnInit(): void {
    this.rows = this.result?.rows ?? [];
    this.filteredRows = [...this.rows];
  }

  get selectedRowNumbers(): number[] {
    return this.rows
      .filter((row) => this.selection[row.rowNumber])
      .map((row) => row.rowNumber);
  }

  get selectedTotal(): number {
    return this.rows
      .filter((row) => this.selection[row.rowNumber])
      .reduce((total, row) => total + row.equivalentAmount, 0);
  }

  get allSelected(): boolean {
    return (
      this.filteredRows.length > 0 &&
      this.filteredRows.every((row) => this.selection[row.rowNumber])
    );
  }

  toggleAll(): void {
    const select = !this.allSelected;
    this.filteredRows.forEach((row) => {
      this.selection[row.rowNumber] = select;
    });
  }

  onSearch(term: string): void {
    this.searchTerm = (term ?? '').toLocaleLowerCase().trim();
    if (!this.searchTerm) {
      this.filteredRows = [...this.rows];
      return;
    }
    this.filteredRows = this.rows.filter((row) =>
      [row.commitmentNumber, row.concept, row.beneficiaryName, row.accountingVoucher]
        .join(' ')
        .toLocaleLowerCase()
        .includes(this.searchTerm)
    );
  }

  cancel(): void {
    this.dialog.close();
  }

  confirm(): void {
    const rowNumbers = this.selectedRowNumbers;
    if (rowNumbers.length === 0) {
      return;
    }

    this.saving = true;
    this.api
      .confirmImportedPayments(this.commitmentId, rowNumbers)
      .subscribe({
        next: () => {
          this.saving = false;
          this.dialog.close({ saved: true });
        },
        error: () => {
          this.saving = false;
        },
      });
  }
}
