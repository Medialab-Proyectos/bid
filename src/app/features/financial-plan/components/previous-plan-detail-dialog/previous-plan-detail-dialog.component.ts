import { Component } from '@angular/core';
import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';
import { TranslateService } from '@ngx-translate/core';
import { ActiveFinancialPlan } from '../../models/financial-plan.model';

/**
 * "Plan Financiero {id}", opened from "Planes anteriores": the same
 * cash-flow table "Plan activo" shows for the current plan, but nothing on
 * it can be acted on -- no component drill-down (plain text here, not the
 * link "Plan activo" opens), no "Simular nuevo Plan Financiero", no
 * "Solicitar ANI". "Descargar Plan Financiero" is the one control the Figma
 * reference still keeps: exporting a copy doesn't change the record itself,
 * unlike everything else that normally sits in this footer.
 */
@Component({
  selector: 'fi-previous-plan-detail-dialog',
  templateUrl: './previous-plan-detail-dialog.component.html',
  styleUrls: ['../../financial-plan.shared.scss'],
})
export class PreviousPlanDetailDialogComponent extends DialogContentBase {
  plan: ActiveFinancialPlan;

  constructor(dialog: DialogRef, private readonly translate: TranslateService) {
    super(dialog);
  }

  trackByIndex(index: number): number {
    return index;
  }

  close(): void {
    this.dialog.close();
  }

  /** Same client-side CSV export "Plan activo"'s own "Descargar" button
   *  already uses -- no server endpoint behind it, just this plan's own
   *  table written out as a file. */
  downloadPlan(): void {
    const t = (key: string) => this.translate.instant(key);
    const plan = this.plan;
    const header = ['', ...plan.months.map((m) => m.label)];
    const rows: string[][] = [
      [t('FINANCIAL_PLAN.ACTIVE.ROWS.OPENING_BALANCE'), ...plan.openingBalance.map(String)],
      [t('FINANCIAL_PLAN.ACTIVE.ROWS.EXPENSES_BY_COMPONENT')],
      ...plan.components.map((c) => [c.componentName, ...c.monthlyAmounts.map(String)]),
      [t('FINANCIAL_PLAN.ACTIVE.ROWS.EXPENSE_SUBTOTAL'), ...plan.expenseSubtotal.map(String)],
      [t('FINANCIAL_PLAN.ACTIVE.ROWS.BALANCE_AFTER_EXPENSES'), ...plan.balanceAfterExpenses.map(String)],
      [t('FINANCIAL_PLAN.ACTIVE.ROWS.ADVANCE_AMOUNT'), ...plan.advanceAmount.map(String)],
      [t('FINANCIAL_PLAN.ACTIVE.ROWS.BALANCE_AFTER_ADVANCE'), ...plan.balanceAfterAdvance.map(String)],
      [t('FINANCIAL_PLAN.ACTIVE.ROWS.REIMBURSEMENTS'), ...plan.reimbursements.map(String)],
      [t('FINANCIAL_PLAN.ACTIVE.ROWS.DIRECT_PAYMENTS'), ...plan.directPayments.map(String)],
      [t('FINANCIAL_PLAN.ACTIVE.ROWS.FINAL_BALANCE'), ...plan.finalBalance.map(String)],
    ];

    const separators = /[";\r\n]/;
    const escape = (cell: string) =>
      cell && separators.test(cell) ? '"' + cell.replace(/"/g, '""') + '"' : cell;
    const lines = [header, ...rows].map((row) => row.map(escape).join(';')).join('\r\n');

    const blob = new Blob([String.fromCharCode(0xfeff) + lines], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${plan.id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
