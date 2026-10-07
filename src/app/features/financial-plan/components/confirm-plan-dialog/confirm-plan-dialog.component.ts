import { Component, Input } from '@angular/core';
import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';

/**
 * "¿Deseas continuar?" -- the one-line gut check before an action that can't
 * be walked back fires: "Confirmar Plan Financiero" and "Añadir procesos"
 * both reuse this same dialog, each with their own `messageKey`. Nothing of
 * its own to load or validate -- the step behind it already worked out
 * whether confirming is even allowed, this only exists to catch an
 * accidental click on the real thing.
 */
@Component({
  selector: 'fi-confirm-plan-dialog',
  templateUrl: './confirm-plan-dialog.component.html',
  styleUrls: ['../../financial-plan.shared.scss'],
})
export class ConfirmPlanDialogComponent extends DialogContentBase {
  @Input() messageKey = 'FINANCIAL_PLAN.SIMULATION.CONFIRMATION.MODAL_BODY';

  constructor(dialog: DialogRef) {
    super(dialog);
  }

  cancel(): void {
    this.dialog.close();
  }

  confirm(): void {
    this.dialog.close({ confirmed: true });
  }
}
