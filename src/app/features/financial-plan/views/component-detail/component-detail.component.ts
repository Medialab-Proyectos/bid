import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from '@progress/kendo-angular-dialog';
import { Subscription, filter, switchMap, take } from 'rxjs';
import { ProjectStoreService } from '@core/services/store-services';
import { VisibilityService } from '@core/services/view';
import { TranslateService } from '@ngx-translate/core';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared/services/notification-global.service';
import {
  FinancialPlanComponentDetail,
  NonProcurementRow,
  ProcessCommitmentRow,
  ProcessRow,
} from '../../models/financial-plan.model';
import { FinancialPlanApiService } from '../../services/financial-plan-api.service';
import { ConfirmPlanDialogComponent } from '../../components/confirm-plan-dialog/confirm-plan-dialog.component';
import { ProcessPaymentsDialogComponent } from '../../components/process-payments-dialog/process-payments-dialog.component';

/**
 * "Detalle de componente", reached from either "Plan activo" or the
 * simulation's own table: what makes up one component's egresos row -- the
 * procurement processes behind it, each breakable down into its commitments,
 * and whatever is paid outside procurement entirely. A screen of its own
 * (`financial-plan/components/:componentCode`), not a modal over the plan --
 * the two extra columns this table carries (description, contract name) on
 * top of a month per period made a dialog too cramped to read comfortably.
 *
 * Two modes, set by the `?selectable=1` query param the opener links with:
 * "Plan activo" links in read-only (no checkboxes, "Volver" is the only
 * action) -- the plan is already approved, there is nothing left to choose.
 * The simulation links in `selectable` -- checkboxes on every process,
 * commitment and non-procurement row let the agency decide what belongs in
 * the plan being built, and the footer becomes "Guardar y recalcular"
 * instead of a plain back link.
 */
@Component({
  selector: 'fi-component-detail',
  templateUrl: './component-detail.component.html',
  styleUrls: ['../../financial-plan.shared.scss'],
})
export class ComponentDetailComponent implements OnInit, OnDestroy {
  private readonly subscriptions = new Subscription();

  projectBucketId: string;
  componentCode: string;
  selectable = false;

  detail: FinancialPlanComponentDetail;
  loading = false;
  saving = false;

  /** Which processes currently show their commitment rows -- collapsed by
   *  default, same as the first version of this screen; the payment-detail
   *  modal (`openProcessPayments`/`openCommitmentPayments`) is a separate
   *  action from just seeing which commitments make up a process. */
  private readonly expandedProcesses = new Set<string>();
  /** «4921/OC-EC · EC-L1248», shown in the pinned header. */
  operationLabel = '';

  constructor(
    private readonly api: FinancialPlanApiService,
    private readonly projectStore: ProjectStoreService,
    private readonly visibilitySvc: VisibilityService,
    private readonly dialogService: DialogService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly translate: TranslateService,
    private readonly notificationSvc: NotificationGlobalService
  ) {}

  ngOnInit(): void {
    // Reached from "Plan financiero", already one level into it -- the
    // generic shell header would be a second repeat of the same project
    // identity this deep in (same reasoning as payment-record's own
    // `StatementComponentComponent`).
    this.visibilitySvc.setVisiblityProjectHeader(false);
    // Without this the crumb falls back to the url segment ("components").
    this.visibilitySvc.breadcrumbService.set(
      '@financialPlanComponentDetail',
      'FINANCIAL_PLAN.COMPONENT_DETAIL.TITLE'
    );
    this.componentCode = this.route.snapshot.paramMap.get('componentCode');
    this.selectable = this.route.snapshot.queryParamMap.get('selectable') === '1';

    this.loading = true;
    const sub = this.projectStore
      .selectedProject()
      .pipe(
        filter((state) => !!state && !!state.selectedProject),
        take(1),
        switchMap((state) => {
          this.projectBucketId = state.selectedProject.projectBucketId;
          this.operationLabel = [state.selectedProject.contract, state.selectedProject.operationNumber]
            .filter((part) => !!part)
            .join(' · ');
          return this.api.getComponentDetail(this.projectBucketId, this.componentCode);
        })
      )
      .subscribe({
        next: (detail) => {
          this.detail = detail;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
    this.subscriptions.add(sub);
  }

  ngOnDestroy(): void {
    this.visibilitySvc.setVisiblityProjectHeader(true);
    this.subscriptions.unsubscribe();
  }

  /** The date/concept/amount breakdown used to unfold inline right under
   *  this row -- a dialog instead, since that pushed the rest of the page
   *  down and scrolled the row it belonged to out of view. */
  openProcessPayments(process: ProcessRow): void {
    const instance = this.openPaymentsDialog();
    instance.itemId = process.processId;
    instance.description = process.description;
    instance.contractName = process.contractName;
    instance.totalAmount = process.totalAmount;
    instance.payments = process.payments;
    // Without an accordion there are no dated payments to show: one line per
    // month. A process with commitments (an accordion) keeps date and month.
    instance.perMonth = !process.commitments.length;
  }

  /** Same dialog, same level of detail -- a commitment is still paid out in
   *  separate transactions, not one lump sum, same as the process it
   *  belongs to. Needs its OWN process passed in (a commitment carries no
   *  `contractName` of its own) -- same contract its process is billed
   *  under, and the same "X% del proceso" figure the main table's own
   *  caption already reads off `commitmentPercent`. */
  openCommitmentPayments(commitment: ProcessCommitmentRow, process: ProcessRow): void {
    const instance = this.openPaymentsDialog();
    instance.itemId = commitment.commitmentId;
    instance.description = this.translate.instant('FINANCIAL_PLAN.COMPONENT_DETAIL.COMMITMENT_CAPTION', {
      percent: this.commitmentPercent(process, commitment),
    });
    instance.contractName = process.contractName;
    instance.totalAmount = this.commitmentTotal(commitment);
    instance.payments = commitment.payments;
  }

  /** Same dialog, same level of detail -- a non-procurement row is still
   *  paid out in separate transactions, not one lump sum, it just never has
   *  commitments underneath it. */
  openNonProcurementPayments(row: NonProcurementRow): void {
    const instance = this.openPaymentsDialog();
    instance.itemId = row.scheduleId;
    instance.description = row.description;
    instance.contractName = row.contractName;
    instance.totalAmount = row.totalAmount;
    instance.payments = row.payments;
    // No accordion here either: one line per month.
    instance.perMonth = true;
  }

  isExpanded(processId: string): boolean {
    return this.expandedProcesses.has(processId);
  }

  toggleExpand(processId: string): void {
    if (this.expandedProcesses.has(processId)) {
      this.expandedProcesses.delete(processId);
    } else {
      this.expandedProcesses.add(processId);
    }
  }

  private openPaymentsDialog(): ProcessPaymentsDialogComponent {
    const dialog = this.dialogService.open({
      content: ProcessPaymentsDialogComponent,
      cssClass: 'fp-modal',
      width: 900,
    });
    const instance = dialog.content.instance as ProcessPaymentsDialogComponent;
    instance.months = this.detail.months;
    instance.periodStart = this.detail.period.startDate;
    instance.periodEnd = this.detail.period.endDate;
    return instance;
  }

  /** "2 procesos · 3 compromisos" -- the processes section's own header
   *  caption, read straight off how many commitment rows all of them carry
   *  together rather than a figure the back end has to compute separately. */
  processesCommitmentCount(): number {
    return this.detail.processes.reduce((s, p) => s + p.commitments.length, 0);
  }

  /** How much of its process a commitment accounts for -- `ProcessCommitmentRow`
   *  never got its own percentage field, this is always worked out from the
   *  two totals it already has. Used both by the main table's own caption
   *  under a commitment's ID and by its payments dialog's subtitle. */
  commitmentPercent(process: ProcessRow, commitment: ProcessCommitmentRow): number {
    if (!process.totalAmount) {
      return 0;
    }
    return Math.round((this.commitmentTotal(commitment) / process.totalAmount) * 100);
  }

  processesTotal(): number {
    return this.detail.processes.reduce((s, p) => s + p.totalAmount, 0);
  }

  processesMonthlyTotal(monthIndex: number): number {
    return this.detail.processes.reduce((s, p) => s + p.monthlyAmounts[monthIndex], 0);
  }

  /** `ProcessCommitmentRow` never got its own `totalAmount` field -- a
   *  commitment's total was always just "how much of its process", so the
   *  main table reads it straight off `monthlyAmounts` instead. */
  commitmentTotal(commitment: ProcessCommitmentRow): number {
    return commitment.monthlyAmounts.reduce((s, v) => s + v, 0);
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
   *  as excluded.
   *
   *  Bound to `(change)`, which only ever fires after the browser has
   *  already flipped the checkbox -- for a plain row that's exactly the
   *  value this goes on to set `process.selected` to, so there's nothing
   *  left to reconcile. A `locked` row is different: it carries an actual
   *  "Ajustar Plan Financiero" distribution behind it, so unchecking it
   *  needs to confirm first. Declining has to put the checkbox back,
   *  and `[checked]="process.selected"` alone can't do that -- Angular
   *  only touches the DOM when the value it's tracking changes, and
   *  `process.selected` never does here, so the browser's own already-
   *  applied flip would otherwise just sit there unreverted. Grabbing the
   *  native element straight off the event and setting `.checked` back by
   *  hand is the direct fix (calling `event.preventDefault()` instead was
   *  tried and does not work: a checkbox's "canceled activation steps"
   *  revert `.checked` to its PRE-click value unconditionally once the
   *  event finishes dispatching, which stomps right back over a *kept*
   *  change the same way it does a declined one -- it can only ever
   *  revert, never let a real toggle through). */
  toggleProcess(process: ProcessRow, event: Event): void {
    if (process.locked) {
      const checkbox = event.target as HTMLInputElement;
      if (!checkbox.checked) {
        this.confirmRemoveLockedProcess(process, checkbox);
      }
      return;
    }
    process.selected = !process.selected;
    process.commitments.forEach((c) => (c.selected = process.selected));
  }

  /** "¿Estás seguro de no incluir este proceso?" -- unchecking a `locked`
   *  row doesn't just drop it from this table, it erases the distribution
   *  "Ajustar Plan Financiero" made for it, so this confirms before that
   *  happens rather than after. Declining puts the checkbox's native
   *  `.checked` back by hand (see `toggleProcess`'s own note on why). */
  private confirmRemoveLockedProcess(process: ProcessRow, checkbox: HTMLInputElement): void {
    const dialog = this.dialogService.open({
      title: this.translate.instant('FINANCIAL_PLAN.COMPONENT_DETAIL.REMOVE_LOCKED_CONFIRM.TITLE'),
      content: ConfirmPlanDialogComponent,
      cssClass: 'fp-modal',
      width: 560,
    });
    const instance = dialog.content.instance as ConfirmPlanDialogComponent;
    instance.messageKey = 'FINANCIAL_PLAN.COMPONENT_DETAIL.REMOVE_LOCKED_CONFIRM.BODY';

    const sub = dialog.result.subscribe((result) => {
      if ((result as { confirmed?: boolean })?.confirmed) {
        this.removeLockedProcess(process);
      } else {
        checkbox.checked = true;
      }
    });
    this.subscriptions.add(sub);
  }

  private removeLockedProcess(process: ProcessRow): void {
    const sub = this.api.clearEstimatedDisbursement(this.projectBucketId, process.processId).subscribe({
      next: () => {
        this.detail = {
          ...this.detail,
          processes: this.detail.processes.filter((p) => p !== process),
        };
        this.notificationSvc.showSuccess(
          this.translate.instant('FINANCIAL_PLAN.COMPONENT_DETAIL.REMOVE_LOCKED_SUCCESS')
        );
      },
    });
    this.subscriptions.add(sub);
  }

  toggleCommitment(commitment: { selected?: boolean }): void {
    commitment.selected = !commitment.selected;
  }

  toggleNonProcurement(row: { selected?: boolean }): void {
    row.selected = !row.selected;
  }

  /** One level up from `components/:componentCode` lands back on
   *  `financial-plan`'s own default route (`ActivePlanComponent`). */
  back(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  /** Whether this component currently carries at least one row
   *  "Ajustar Plan Financiero" added (see `locked` on `ProcessRow`) -- what
   *  `save()` checks before letting a change here through, since saving
   *  recalculates this component's own totals and the agency should know
   *  that touches the same figures that other screen already committed to. */
  private get hasLockedProcess(): boolean {
    return !!this.detail?.processes.some((process) => process.locked);
  }

  save(): void {
    if (this.hasLockedProcess) {
      const dialog = this.dialogService.open({
        title: this.translate.instant('FINANCIAL_PLAN.COMPONENT_DETAIL.SAVE_CONFIRM.TITLE'),
        content: ConfirmPlanDialogComponent,
        cssClass: 'fp-modal',
        width: 560,
      });
      const instance = dialog.content.instance as ConfirmPlanDialogComponent;
      instance.messageKey = 'FINANCIAL_PLAN.COMPONENT_DETAIL.SAVE_CONFIRM.BODY';

      const sub = dialog.result.subscribe((result) => {
        if ((result as { confirmed?: boolean })?.confirmed) {
          this.submitSelection();
        }
      });
      this.subscriptions.add(sub);
      return;
    }
    this.submitSelection();
  }

  private submitSelection(): void {
    this.saving = true;
    const sub = this.api
      .saveComponentSelection(this.projectBucketId, this.componentCode, this.detail)
      .subscribe({
        next: () => {
          this.saving = false;
          this.notificationSvc.showSuccess(
            this.translate.instant('FINANCIAL_PLAN.COMPONENT_DETAIL.SAVE_SUCCESS')
          );
          this.back();
        },
        error: () => {
          this.saving = false;
        },
      });
    this.subscriptions.add(sub);
  }
}
