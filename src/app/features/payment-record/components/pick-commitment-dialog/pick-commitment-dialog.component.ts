import { Component, Input, OnInit } from '@angular/core';
import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';
import { Commitment } from '../../models/payment-record.model';

/**
 * "Importar pagos" from the report list has no commitment of its own yet --
 * the list shows every commitment of the loan. This dialog is the missing
 * step before the real import: pick the one commitment the file belongs to,
 * then the caller opens `AddPaymentsDialogComponent` (file mode) for it.
 */
@Component({
  selector: 'fi-pick-commitment-dialog',
  templateUrl: './pick-commitment-dialog.component.html',
  styleUrls: ['../../payment-record.shared.scss'],
})
export class PickCommitmentDialogComponent
  extends DialogContentBase
  implements OnInit
{
  @Input() commitments: Commitment[] = [];

  filtered: Commitment[] = [];
  searchTerm = '';

  constructor(dialog: DialogRef) {
    super(dialog);
  }

  ngOnInit(): void {
    this.filtered = [...this.commitments];
  }

  onSearch(term: string): void {
    this.searchTerm = (term ?? '').toLocaleLowerCase().trim();
    if (!this.searchTerm) {
      this.filtered = [...this.commitments];
      return;
    }
    this.filtered = this.commitments.filter((commitment) =>
      [commitment.commitmentNumber, commitment.componentName, commitment.beneficiaryName]
        .join(' ')
        .toLocaleLowerCase()
        .includes(this.searchTerm)
    );
  }

  select(commitment: Commitment): void {
    this.dialog.close({ commitmentId: commitment.id });
  }

  cancel(): void {
    this.dialog.close();
  }
}
