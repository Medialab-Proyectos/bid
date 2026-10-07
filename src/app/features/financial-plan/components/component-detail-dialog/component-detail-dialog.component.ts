import { Component, OnInit } from '@angular/core';
import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';
import { TranslateService } from '@ngx-translate/core';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared/services/notification-global.service';
import { FinancialPlanComponentDetail } from '../../models/financial-plan.model';
import { FinancialPlanApiService } from '../../services/financial-plan-api.service';

/**
 * "Detalle de componente", opened from either "Plan activo" or the
 * simulation's own table: what makes up one component's egresos row -- the
 * procurement processes behind it, each breakable down into its commitments,
 * and whatever is paid outside procurement entirely. A modal over the plan,
 * the same way every other drill-down in this module's sibling screens
 * works, not a page of its own.
 *
 * Two modes, set by the opener: "Plan activo" opens it read-only (Cerrar,
 * no checkboxes) -- the plan is already approved, there is nothing left to
 * choose. The simulation opens it `selectable` -- checkboxes on every
 * process, commitment and non-procurement row let the agency decide what
 * belongs in the plan being built, and the footer becomes "Guardar y
 * recalcular" instead of a plain close.
 */
@Component({
  selector: 'fi-component-detail-dialog',
  templateUrl: './component-detail-dialog.component.html',
  styleUrls: ['../../financial-plan.shared.scss'],
})
export class ComponentDetailDialogComponent extends DialogContentBase implements OnInit {
  projectBucketId: string;
  componentCode: string;
  /** Set by the opener so the header can show the name immediately, instead
   *  of waiting on this dialog's own fetch of the rest of the detail. */
  componentName: string;
  selectable = false;

  detail: FinancialPlanComponentDetail;
  loading = false;
  saving = false;
  expanded = new Set<string>();

  constructor(
    dialog: DialogRef,
    private readonly api: FinancialPlanApiService,
    private readonly translate: TranslateService,
    private readonly notificationSvc: NotificationGlobalService
  ) {
    super(dialog);
  }

  ngOnInit(): void {
    this.loading = true;
    this.api.getComponentDetail(this.projectBucketId, this.componentCode).subscribe({
      next: (detail) => {
        this.detail = detail;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  toggle(processId: string): void {
    if (this.expanded.has(processId)) {
      this.expanded.delete(processId);
    } else {
      this.expanded.add(processId);
    }
  }

  isExpanded(processId: string): boolean {
    return this.expanded.has(processId);
  }

  processesTotal(): number {
    return this.detail.processes.reduce((s, p) => s + p.totalAmount, 0);
  }

  processesMonthlyTotal(monthIndex: number): number {
    return this.detail.processes.reduce((s, p) => s + p.monthlyAmounts[monthIndex], 0);
  }

  nonProcurementTotal(): number {
    return this.detail.nonProcurement.reduce((s, r) => s + r.totalAmount, 0);
  }

  nonProcurementMonthlyTotal(monthIndex: number): number {
    return this.detail.nonProcurement.reduce((s, r) => s + r.monthlyAmounts[monthIndex], 0);
  }

  /** Checking/unchecking a process cascades to its own commitments -- a
   *  commitment belongs to the plan only as part of the process it is
   *  billed under, so leaving them out of step with their process would let
   *  the table show a process as included while every line under it reads
   *  as excluded. */
  toggleProcess(process: { selected?: boolean; commitments: { selected?: boolean }[] }): void {
    process.selected = !process.selected;
    process.commitments.forEach((c) => (c.selected = process.selected));
  }

  toggleCommitment(commitment: { selected?: boolean }): void {
    commitment.selected = !commitment.selected;
  }

  toggleNonProcurement(row: { selected?: boolean }): void {
    row.selected = !row.selected;
  }

  close(): void {
    this.dialog.close();
  }

  save(): void {
    this.saving = true;
    this.api.saveComponentSelection(this.projectBucketId, this.componentCode, this.detail).subscribe({
      next: () => {
        this.saving = false;
        this.notificationSvc.showSuccess(
          this.translate.instant('FINANCIAL_PLAN.COMPONENT_DETAIL.SAVE_SUCCESS')
        );
        this.dialog.close({ confirmed: true });
      },
      error: () => {
        this.saving = false;
      },
    });
  }
}
