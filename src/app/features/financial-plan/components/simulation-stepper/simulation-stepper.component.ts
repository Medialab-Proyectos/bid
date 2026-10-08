import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DialogService } from '@progress/kendo-angular-dialog';
import { TranslateService } from '@ngx-translate/core';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared/services/notification-global.service';
import {
  FinancialPlanDraft,
  FinancialPlanJustificationSummary,
  FinancialPlanSimulation,
  SimulationStepId,
} from '../../models/financial-plan.model';
import { FinancialPlanApiService } from '../../services/financial-plan-api.service';
import { ComponentDetailDialogComponent } from '../component-detail-dialog/component-detail-dialog.component';
import { AdjustRateDialogComponent } from '../adjust-rate-dialog/adjust-rate-dialog.component';
import { AdjustPlanDialogComponent } from '../adjust-plan-dialog/adjust-plan-dialog.component';
import { ConfirmPlanDialogComponent } from '../confirm-plan-dialog/confirm-plan-dialog.component';

/**
 * "Simulación": the stepper that builds the next plan before it is sent for
 * approval. The Figma reference's own stepper has a fourth step, Revisión y
 * aprobación, which this module drops -- that approval stage already exists
 * elsewhere in the product, so repeating it here would be a second, competing
 * copy of the same step.
 *
 * Only step 1, Información, is real so far: it is the one piece of the draft
 * every later step depends on (the period and the exchange rates a
 * simulation needs to run). Steps 2 and 3 render as a holding notice until
 * built.
 */
@Component({
  selector: 'fi-simulation-stepper',
  templateUrl: './simulation-stepper.component.html',
  styleUrls: ['../../financial-plan.shared.scss'],
})
export class SimulationStepperComponent implements OnInit {
  @Input() projectBucketId: string;
  /** "Salir": abandons the draft and hands control back to "Plan activo". */
  @Output() readonly exit = new EventEmitter<void>();

  readonly steps: SimulationStepId[] = ['information', 'simulation', 'confirmation'];
  step: SimulationStepId = 'information';

  draft: FinancialPlanDraft;
  loading = false;
  saving = false;

  startDate: Date | null = null;
  endDate: Date | null = null;

  simulation: FinancialPlanSimulation;
  simulationLoading = false;
  savingDraft = false;
  /** Set by every edit to step 2's own table (see `onSimulationFieldChange`),
   *  cleared by a successful "Guardar borrador" -- what `requestExit` checks
   *  before leaving, since nothing here is saved automatically. */
  hasUnsavedChanges = false;

  /** Step 3's own gate -- how much of the simulation's total expense is
   *  currently backed by a ticked row, against the threshold it takes to
   *  confirm the plan. */
  readonly justificationThreshold = 80;
  justification: FinancialPlanJustificationSummary | null = null;
  justificationLoading = false;
  confirming = false;

  /** Demo-only: lets whoever is showing the module flip to "what does the
   *  blocked state look like" without having to actually untick components
   *  first. Purely a display override -- `justification` itself, and every
   *  real selection behind it, is untouched, so turning this back off always
   *  returns to the real computed state. */
  previewBlocked = false;

  constructor(
    private readonly api: FinancialPlanApiService,
    private readonly dialogService: DialogService,
    private readonly translate: TranslateService,
    private readonly notificationSvc: NotificationGlobalService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.api.getDraft(this.projectBucketId).subscribe({
      next: (draft) => {
        this.draft = draft;
        if (draft.period) {
          this.startDate = new Date(draft.period.startDate);
          this.endDate = new Date(draft.period.endDate);
          // Information was already filled in on a previous visit (whether
          // or not step 2's own table was ever saved) -- land back on the
          // screen that already shows the plan instead of making the agency
          // click back through a form that's already done.
          this.step = 'simulation';
          this.loadSimulation();
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  stepIndex(stepId: SimulationStepId): number {
    return this.steps.indexOf(stepId);
  }

  get canContinue(): boolean {
    return !!this.startDate && !!this.endDate;
  }

  goToStep(target: SimulationStepId): void {
    // Only backward navigation is free -- a later step depends on the period
    // and rates the earlier one collects, so it cannot be reached by
    // clicking ahead, only by completing what it needs first.
    if (this.stepIndex(target) <= this.stepIndex(this.step)) {
      this.step = target;
    }
  }

  saveInformation(): void {
    if (!this.canContinue) {
      return;
    }
    this.saving = true;
    this.api
      .saveDraftInformation(
        this.projectBucketId,
        {
          startDate: this.startDate.toISOString(),
          endDate: this.endDate.toISOString(),
        },
        this.draft.exchangeRates
      )
      .subscribe({
        next: (draft) => {
          this.draft = draft;
          this.saving = false;
          this.step = 'simulation';
          this.loadSimulation();
        },
        error: () => {
          this.saving = false;
        },
      });
  }

  private loadSimulation(): void {
    if (this.simulation) {
      return;
    }
    this.simulationLoading = true;
    this.api.getSimulation(this.projectBucketId).subscribe({
      next: (simulation) => {
        this.simulation = simulation;
        this.recalculate();
        this.simulationLoading = false;
      },
      error: () => {
        this.simulationLoading = false;
      },
    });
  }

  /** Only the first two months take an advance -- it is drawn once, near the
   *  start of the plan, not spread across the whole period. */
  advanceEditable(monthIndex: number): boolean {
    return monthIndex <= 1;
  }

  /** Same client-side CSV export "Plan activo"'s own "Descargar" button
   *  already uses -- no server endpoint behind it, just the review table
   *  already on screen written out as a file. */
  downloadSimulation(): void {
    const t = (key: string) => this.translate.instant(key);
    const sim = this.simulation;
    const header = ['', ...sim.months.map((m) => m.label)];
    const rows: string[][] = [
      [t('FINANCIAL_PLAN.ACTIVE.ROWS.OPENING_BALANCE'), ...sim.openingBalance.map(String)],
      [t('FINANCIAL_PLAN.ACTIVE.ROWS.EXPENSES_BY_COMPONENT')],
      ...sim.components.map((c) => [c.componentName, ...c.monthlyAmounts.map(String)]),
      [t('FINANCIAL_PLAN.ACTIVE.ROWS.EXPENSE_SUBTOTAL'), ...sim.expenseSubtotal.map(String)],
      [t('FINANCIAL_PLAN.ACTIVE.ROWS.BALANCE_AFTER_EXPENSES'), ...sim.balanceAfterExpenses.map(String)],
      [t('FINANCIAL_PLAN.ACTIVE.ROWS.ADVANCE_AMOUNT'), ...sim.advanceAmount.map(String)],
      [t('FINANCIAL_PLAN.ACTIVE.ROWS.BALANCE_AFTER_ADVANCE'), ...sim.balanceAfterAdvance.map(String)],
      [t('FINANCIAL_PLAN.ACTIVE.ROWS.REIMBURSEMENTS'), ...sim.reimbursements.map(String)],
      [t('FINANCIAL_PLAN.ACTIVE.ROWS.DIRECT_PAYMENTS'), ...sim.directPayments.map(String)],
      [t('FINANCIAL_PLAN.ACTIVE.ROWS.FINAL_BALANCE'), ...sim.finalBalance.map(String)],
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
    link.download = `plan-financiero-${this.projectBucketId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /** Without this, `*ngFor` over a plain `number[]` tracks each cell by its
   *  own value -- so typing a digit into one of these inputs (changing the
   *  value at that index) reads to Angular as "remove this number, insert a
   *  different one" instead of "this slot's value changed", and it rebuilds
   *  the cell's DOM node, including the `<input>` mid-keystroke. That drop of
   *  focus is what made these fields impossible to type a full number into
   *  continuously. Tracking by index instead keeps the same DOM node (and
   *  its focus) across the whole edit. */
  trackByIndex(index: number): number {
    return index;
  }

  /** Every other figure in the table follows from the opening balance of the
   *  first month and the advance amounts, recomputed top to bottom so each
   *  month's own opening balance is the previous month's final balance. */
  recalculate(): void {
    const sim = this.simulation;
    sim.months.forEach((_, i) => {
      sim.openingBalance[i] = i === 0 ? sim.openingBalance[0] || 0 : sim.finalBalance[i - 1];
      sim.balanceAfterExpenses[i] = sim.openingBalance[i] - sim.expenseSubtotal[i];
      sim.balanceAfterAdvance[i] = sim.balanceAfterExpenses[i] + (sim.advanceAmount[i] || 0);
      sim.finalBalance[i] =
        sim.balanceAfterAdvance[i] + sim.reimbursements[i] + sim.directPayments[i];
    });
  }

  /** Every editable cell in step 2's table calls this on blur instead of
   *  `recalculate()` directly -- the one thing that actually marks the
   *  table dirty, so `loadSimulation()`'s own first call to `recalculate()`
   *  (deriving balances from whatever was just loaded) doesn't itself look
   *  like an unsaved edit. */
  onSimulationFieldChange(): void {
    this.hasUnsavedChanges = true;
    this.recalculate();
  }

  /** "Limpiar datos": every figure the agency can actually type into --
   *  opening balance, advance, reimbursements, direct payments -- back to
   *  0, not back to the schedule's own starting figures (that's what a
   *  fresh, never-saved load already shows). A faster way to start over
   *  than clearing each cell by hand. */
  clearSimulationData(): void {
    if (!this.simulation) {
      return;
    }
    const sim = this.simulation;
    sim.openingBalance[0] = 0;
    sim.advanceAmount = sim.advanceAmount.map(() => 0);
    sim.reimbursements = sim.reimbursements.map(() => 0);
    sim.directPayments = sim.directPayments.map(() => 0);
    this.onSimulationFieldChange();
  }

  /** "Guardar borrador": persists step 2's table as it stands right now, so
   *  leaving and coming back (even a plain reload) picks it back up instead
   *  of starting over from the schedule's own starting figures. */
  saveDraft(): void {
    if (!this.simulation || this.savingDraft) {
      return;
    }
    this.savingDraft = true;
    this.api.saveSimulationDraft(this.projectBucketId, this.simulation).subscribe({
      next: (simulation) => {
        this.simulation = simulation;
        this.hasUnsavedChanges = false;
        this.savingDraft = false;
        this.notificationSvc.showSuccess(
          this.translate.instant('FINANCIAL_PLAN.SIMULATION.DRAFT_SAVED')
        );
      },
      error: () => {
        this.savingDraft = false;
      },
    });
  }

  /** "Salir" from step 2 or 3: a plain exit when the table has no unsaved
   *  edits, otherwise the same "¿Deseas continuar?" gate the rest of the
   *  module puts in front of a losing action, worded for this one and with
   *  its own Aceptar/Cancelar labels instead of the default Sí/No pair. */
  requestExit(): void {
    if (!this.hasUnsavedChanges) {
      this.exit.emit();
      return;
    }
    const dialog = this.dialogService.open({
      title: this.translate.instant('FINANCIAL_PLAN.SIMULATION.EXIT_CONFIRM.TITLE'),
      content: ConfirmPlanDialogComponent,
      cssClass: 'fp-modal',
      width: 560,
    });

    const instance = dialog.content.instance as ConfirmPlanDialogComponent;
    instance.messageKey = 'FINANCIAL_PLAN.SIMULATION.EXIT_CONFIRM.BODY';
    instance.noLabelKey = 'FINANCIAL_PLAN.SIMULATION.EXIT_CONFIRM.CANCEL';
    instance.yesLabelKey = 'FINANCIAL_PLAN.SIMULATION.EXIT_CONFIRM.ACCEPT';

    dialog.result.subscribe((result) => {
      if ((result as { confirmed?: boolean })?.confirmed) {
        this.exit.emit();
      }
    });
  }

  openComponent(componentCode: string, componentName: string): void {
    const dialog = this.dialogService.open({
      content: ComponentDetailDialogComponent,
      cssClass: 'fp-modal',
      width: 1100,
    });

    const instance = dialog.content.instance as ComponentDetailDialogComponent;
    instance.projectBucketId = this.projectBucketId;
    instance.componentCode = componentCode;
    instance.componentName = componentName;
    instance.selectable = true;
  }

  openAdjustRate(): void {
    const dialog = this.dialogService.open({
      title: this.translate.instant('FINANCIAL_PLAN.SIMULATION.ADJUST_RATE.TITLE'),
      content: AdjustRateDialogComponent,
      cssClass: 'fp-modal',
      width: 720,
    });

    const instance = dialog.content.instance as AdjustRateDialogComponent;
    instance.projectBucketId = this.projectBucketId;
    // A working copy: cancelling the dialog must not leave a half-edited
    // rate behind on the draft this step reads from.
    instance.rates = this.draft.exchangeRates.map((r) => ({ ...r }));

    dialog.result.subscribe((result) => {
      if ((result as { confirmed?: boolean }).confirmed) {
        this.draft.exchangeRates = instance.rates;
      }
    });
  }

  openAdjustPlan(): void {
    const dialog = this.dialogService.open({
      title: this.translate.instant('FINANCIAL_PLAN.SIMULATION.ADJUST_PLAN.TITLE'),
      content: AdjustPlanDialogComponent,
      cssClass: 'fp-modal',
      width: 1197,
    });

    const instance = dialog.content.instance as AdjustPlanDialogComponent;
    instance.projectBucketId = this.projectBucketId;
    instance.months = this.simulation?.months ?? [];
  }

  /** "Continuar" from the simulation table -- unlike `saveInformation()`,
   *  nothing here needs saving first: the table's own edits already live on
   *  `this.simulation`, step 3 only reads how much of it is justified. */
  continueToConfirmation(): void {
    this.step = 'confirmation';
    this.loadJustification();
  }

  private loadJustification(): void {
    this.justificationLoading = true;
    this.api.getJustification(this.projectBucketId).subscribe({
      next: (justification) => {
        this.justification = justification;
        this.justificationLoading = false;
      },
      error: () => {
        this.justificationLoading = false;
      },
    });
  }

  get canConfirmPlan(): boolean {
    if (this.previewBlocked) {
      return false;
    }
    return (this.justification?.justifiedPercentage ?? 0) >= this.justificationThreshold;
  }

  togglePreviewBlocked(): void {
    this.previewBlocked = !this.previewBlocked;
  }

  /** What the justification section actually renders -- the real data,
   *  unless the demo preview is on, in which case a representative example
   *  under the threshold stands in for it. Scaled off the real total when
   *  one is already loaded so the numbers still look like they belong to
   *  this plan rather than a fixed, unrelated figure. */
  get displayJustification(): FinancialPlanJustificationSummary | null {
    if (!this.previewBlocked) {
      return this.justification;
    }
    const totalExpense = this.justification?.totalExpense || 100_000_000;
    const justifiedPercentage = 48;
    return {
      totalExpense,
      justifiedExpense: Math.round((totalExpense * justifiedPercentage) / 100),
      justifiedPercentage,
    };
  }

  /** "Confirmar Plan Financiero" opens the "¿Deseas continuar?" check first
   *  -- the actual API call only fires once that comes back confirmed, same
   *  gating `confirmAni()` already puts in front of its own irreversible
   *  action. */
  confirmPlan(): void {
    if (!this.canConfirmPlan || this.confirming) {
      return;
    }
    const dialog = this.dialogService.open({
      title: this.translate.instant('FINANCIAL_PLAN.SIMULATION.CONFIRMATION.CONFIRM'),
      content: ConfirmPlanDialogComponent,
      cssClass: 'fp-modal',
      width: 560,
    });

    dialog.result.subscribe((result) => {
      if ((result as { confirmed?: boolean })?.confirmed) {
        this.submitPlan();
      }
    });
  }

  private submitPlan(): void {
    this.confirming = true;
    this.api.confirmSimulation(this.projectBucketId).subscribe({
      next: () => {
        this.confirming = false;
        this.notificationSvc.showSuccess(
          this.translate.instant('FINANCIAL_PLAN.SIMULATION.CONFIRMATION.SUCCESS')
        );
        // The simulation just became "Plan activo" -- hand control back to
        // it the same way "Salir" already does, so it reads the plan this
        // just replaced instead of the stale one it opened with.
        this.exit.emit();
      },
      error: () => {
        this.confirming = false;
      },
    });
  }
}
