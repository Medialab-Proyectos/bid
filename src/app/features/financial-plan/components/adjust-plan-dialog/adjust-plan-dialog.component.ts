import { Component, OnInit } from '@angular/core';
import { DialogContentBase, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { TranslateService } from '@ngx-translate/core';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared/services/notification-global.service';
import {
  EstimatedDisbursement,
  EstimatedDisbursementComponent,
  FinancialPlanComponentOption,
  FinancialPlanMonth,
  PotentialProcess,
} from '../../models/financial-plan.model';
import { FinancialPlanApiService } from '../../services/financial-plan-api.service';
import { potentialProcessStatusClass } from '../../utils/potential-process-status';
import { ConfirmPlanDialogComponent } from '../confirm-plan-dialog/confirm-plan-dialog.component';

type AdjustPlanScreen = 'list' | 'estimated-amount';

/**
 * "Incluir procesos potencialmente a ser ejecutables" plus, on the same
 * dialog, "Monto estimado a desembolsar" -- one screen "Monto a desembolsar"
 * switches to rather than a second dialog stacked on top of it. Ticking one
 * or more processes replaces the footer's own "Añadir procesos" with "Monto
 * a desembolsar" until every ticked process has one: clicking it walks the
 * selection one at a time (`sequence`/`sequenceIndex`) through the same
 * "Monto estimado a desembolsar" screen, Back stepping to the previous one
 * instead of the list until the first, Save stepping to the next instead of
 * the list until the last. Only once every ticked process carries an
 * estimate does "Añadir procesos" reappear, itself gated behind one more
 * "¿Deseas continuar?" check before it actually saves the selection.
 */
@Component({
  selector: 'fi-adjust-plan-dialog',
  templateUrl: './adjust-plan-dialog.component.html',
  styleUrls: ['../../financial-plan.shared.scss'],
})
export class AdjustPlanDialogComponent extends DialogContentBase implements OnInit {
  projectBucketId: string;
  /** The simulation's own period months -- what "Monto estimado a
   *  desembolsar"'s own distribution table lines up with. */
  months: FinancialPlanMonth[] = [];

  screen: AdjustPlanScreen = 'list';

  // ---- list screen
  processes: PotentialProcess[] = [];
  filtered: PotentialProcess[] = [];
  searchTerm = '';
  loading = true;
  saving = false;

  // ---- "Monto estimado a desembolsar" screen
  editingProcess: PotentialProcess | null = null;
  componentOptions: FinancialPlanComponentOption[] = [];
  concept = '';
  components: EstimatedDisbursementComponent[] = [];
  savingEstimate = false;

  /** The ticked processes "Monto a desembolsar" is currently walking through,
   *  in order -- empty outside of that sequence. */
  sequence: PotentialProcess[] = [];
  sequenceIndex = 0;

  constructor(
    dialog: DialogRef,
    private readonly api: FinancialPlanApiService,
    private readonly dialogService: DialogService,
    private readonly translate: TranslateService,
    private readonly notificationSvc: NotificationGlobalService
  ) {
    super(dialog);
  }

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.api.getPotentialProcesses(this.projectBucketId).subscribe({
      next: (processes) => {
        // Reopening this dialog is a fresh pass, not a continuation: a
        // process already added on a previous visit (it carries an
        // estimate) starts unticked again here, same as a brand-new one --
        // touching it again is an explicit choice, not something left over
        // from before. A process still mid-selection from earlier in THIS
        // session (ticked but never actually saved) keeps whatever it was
        // left at, same as the demo's own "first row recommended" seed.
        processes.forEach((process) => {
          if (process.estimatedDisbursement) {
            process.selected = false;
          }
        });
        this.processes = processes;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.processes = [];
        this.filtered = [];
        this.loading = false;
      },
    });
  }

  onSearch(term: string): void {
    this.searchTerm = (term ?? '').toLocaleLowerCase().trim();
    this.applyFilter();
  }

  private applyFilter(): void {
    if (!this.searchTerm) {
      this.filtered = [...this.processes];
      return;
    }
    this.filtered = this.processes.filter((process) =>
      [process.code, process.name, process.beneficiary]
        .join(' ')
        .toLocaleLowerCase()
        .includes(this.searchTerm)
    );
  }

  statusClass(status: string): string {
    return potentialProcessStatusClass(status);
  }

  trackProcess(_index: number, process: PotentialProcess): string {
    return process.code;
  }

  get selectedCount(): number {
    return this.processes.filter((process) => process.selected).length;
  }

  /** Sum of what was actually estimated so far for ticked processes -- not
   *  their own `totalAmount`, which is the full process, not the portion of
   *  it this plan would disburse. */
  get selectedAmount(): number {
    return this.processes
      .filter((process) => process.selected)
      .reduce((sum, process) => sum + this.estimatedTotal(process), 0);
  }

  estimatedTotal(process: PotentialProcess): number {
    const disbursement = process.estimatedDisbursement;
    if (!disbursement) {
      return 0;
    }
    return disbursement.components.reduce(
      (sum, component) =>
        sum + (component.idbAmount || 0) + (component.localAmount || 0) + (component.cofinancingAmount || 0),
      0
    );
  }

  toggle(process: PotentialProcess): void {
    process.selected = !process.selected;
  }

  /** Only what the search currently shows -- ticking "select all" while
   *  filtered down to a handful of processes shouldn't reach out and select
   *  everything else hidden by the search. */
  get allSelected(): boolean {
    return this.filtered.length > 0 && this.filtered.every((process) => process.selected);
  }

  toggleAll(): void {
    const select = !this.allSelected;
    this.filtered.forEach((process) => (process.selected = select));
  }

  /** "Añadir procesos" only ever shows once there is nothing left for "Monto
   *  a desembolsar" to collect -- a ticked process with no estimate yet
   *  keeps the footer on that button instead. */
  get allFilled(): boolean {
    const selected = this.processes.filter((process) => process.selected);
    return selected.length > 0 && selected.every((process) => Boolean(process.estimatedDisbursement));
  }

  cancel(): void {
    this.dialog.close();
  }

  /** Opens the same "¿Deseas continuar?" check `confirmPlan()` already puts
   *  in front of "Confirmar Plan Financiero" -- the actual save only fires
   *  once that comes back confirmed. Deliberately doesn't touch `screen`
   *  itself: called from the list screen's own "Añadir procesos" button it
   *  stacks over the list, and called right after saving the last process
   *  in a sequence (before that screen resets) it stacks over "Monto
   *  estimado a desembolsar" instead of flashing back to the list first. */
  confirm(): void {
    if (this.selectedCount === 0 || this.saving || !this.allFilled) {
      return;
    }
    const dialog = this.dialogService.open({
      title: this.translate.instant('FINANCIAL_PLAN.SIMULATION.ADJUST_PLAN.CONFIRM'),
      content: ConfirmPlanDialogComponent,
      cssClass: 'fp-modal',
      width: 560,
    });

    const instance = dialog.content.instance as ConfirmPlanDialogComponent;
    instance.messageKey = 'FINANCIAL_PLAN.SIMULATION.ADJUST_PLAN.CONFIRM_BODY';

    dialog.result.subscribe((result) => {
      if ((result as { confirmed?: boolean })?.confirmed) {
        this.submitSelection();
      } else {
        // Declining leaves nothing left to do on whatever screen is still
        // showing underneath -- settle back onto the list either way.
        this.exitSequence();
      }
    });
  }

  private submitSelection(): void {
    this.saving = true;
    const codes = this.processes.filter((process) => process.selected).map((process) => process.code);
    this.api.saveSelectedProcesses(this.projectBucketId, codes).subscribe({
      next: (processes) => {
        this.saving = false;
        this.notificationSvc.showSuccess(
          this.translate.instant('FINANCIAL_PLAN.SIMULATION.ADJUST_PLAN.ADD_SUCCESS')
        );
        this.dialog.close({ confirmed: true, processes });
      },
      error: () => {
        this.saving = false;
      },
    });
  }

  /** "Monto a desembolsar": every ticked process, in the order they were
   *  ticked, one "Monto estimado a desembolsar" screen at a time. */
  startDisbursementSequence(): void {
    this.sequence = this.processes.filter((process) => process.selected);
    this.sequenceIndex = 0;
    if (this.sequence.length === 0) {
      return;
    }
    this.openEstimatedAmount(this.sequence[this.sequenceIndex]);
  }

  // ----------------------------------- "Monto estimado a desembolsar" screen

  /** Always starts blank, even for a process that already carries an
   *  estimate from a previous visit -- ticking it again is a fresh pass at
   *  it, not a continuation, so nothing here should look like it already
   *  has an answer. Saving still fully replaces whatever was there before
   *  (see `saveEstimate()`), it just never shows it back first. */
  openEstimatedAmount(process: PotentialProcess): void {
    this.editingProcess = process;
    this.concept = '';
    this.components = [this.blankComponent()];

    if (this.componentOptions.length === 0) {
      this.api.getComponentOptions(this.projectBucketId).subscribe({
        next: (options) => {
          this.componentOptions = options;
        },
        error: () => {
          this.componentOptions = [];
        },
      });
    }

    this.screen = 'estimated-amount';
    this.setTitle('FINANCIAL_PLAN.SIMULATION.ADJUST_PLAN.ESTIMATED_AMOUNT.TITLE');
  }

  /** "Regresar" -- inside a multi-process sequence this is "previous
   *  process", not "back to the list"; only the first process (or a sequence
   *  of one) actually leaves the screen. Whatever was being typed into the
   *  screen this leaves is dropped either way, same as closing the old
   *  stacked dialog without saving used to. */
  backToList(): void {
    if (this.sequenceIndex > 0) {
      this.sequenceIndex -= 1;
      this.openEstimatedAmount(this.sequence[this.sequenceIndex]);
      return;
    }
    this.exitSequence();
  }

  private exitSequence(): void {
    this.editingProcess = null;
    this.sequence = [];
    this.sequenceIndex = 0;
    this.screen = 'list';
    this.setTitle('FINANCIAL_PLAN.SIMULATION.ADJUST_PLAN.TITLE');
  }

  /** The dialog's own title bar is set once by whoever opens it
   *  (`DialogService.open`'s `title` option) -- switching screens inside the
   *  same dialog has to reach into the live Dialog instance to change it
   *  again, there is no template binding for a title that lives outside this
   *  component's own content. */
  private setTitle(key: string, params?: Record<string, unknown>): void {
    const instance = this.dialog.dialog?.instance;
    if (instance) {
      instance.title = this.translate.instant(key, params);
    }
  }

  private blankComponent(): EstimatedDisbursementComponent {
    return {
      componentCode: '',
      idbAmount: null,
      localAmount: null,
      cofinancingAmount: null,
      monthlyAmounts: this.months.map(() => 0),
    };
  }

  componentName(code: string): string {
    return this.componentOptions.find((option) => option.code === code)?.name ?? '';
  }

  rowTotal(row: EstimatedDisbursementComponent): number {
    return (row.idbAmount || 0) + (row.localAmount || 0) + (row.cofinancingAmount || 0);
  }

  get grandTotal(): number {
    return this.components.reduce((sum, row) => sum + this.rowTotal(row), 0);
  }

  monthlyTotal(row: EstimatedDisbursementComponent): number {
    return row.monthlyAmounts.reduce((sum, value) => sum + (value || 0), 0);
  }

  /** Rounded to cents before comparing -- summing a column of `n2` amounts
   *  can land a cent off from the IDB amount itself through plain floating
   *  point error, which would block a save that is, in every way a person
   *  reading the screen can tell, already fully distributed. */
  remainingToDistribute(row: EstimatedDisbursementComponent): number {
    const remaining = (row.idbAmount || 0) - this.monthlyTotal(row);
    return Math.round(remaining * 100) / 100;
  }

  isFullyDistributed(row: EstimatedDisbursementComponent): boolean {
    return this.remainingToDistribute(row) === 0;
  }

  isOverDistributed(row: EstimatedDisbursementComponent): boolean {
    return this.remainingToDistribute(row) < 0;
  }

  overflowAmount(row: EstimatedDisbursementComponent): number {
    return Math.abs(this.remainingToDistribute(row));
  }

  addComponent(): void {
    this.components.push(this.blankComponent());
  }

  /** The trash icon only ever shows once there is more than one row (see the
   *  template) -- this is the matching guard so a stray call can't drop the
   *  plan's own last, required component row. */
  removeComponent(index: number): void {
    if (this.components.length <= 1) {
      return;
    }
    this.components.splice(index, 1);
  }

  trackByIndex(index: number): number {
    return index;
  }

  /** Whether saving this screen will land on another process ("Siguiente")
   *  or actually finish the sequence ("Cambiar monto") -- outside of a
   *  sequence (sequence.length <= 1) saving always finishes. */
  get isLastInSequence(): boolean {
    return this.sequence.length <= 1 || this.sequenceIndex >= this.sequence.length - 1;
  }

  get canSaveEstimate(): boolean {
    return (
      Boolean(this.concept) &&
      this.components.every(
        (row) => Boolean(row.componentCode) && this.rowTotal(row) > 0 && this.isFullyDistributed(row)
      )
    );
  }

  saveEstimate(): void {
    if (!this.canSaveEstimate || this.savingEstimate || !this.editingProcess) {
      return;
    }
    this.savingEstimate = true;
    const disbursement: EstimatedDisbursement = {
      paymentDate: null,
      concept: this.concept,
      components: this.components,
    };

    this.api
      .saveEstimatedDisbursement(this.projectBucketId, this.editingProcess.code, disbursement)
      .subscribe({
        next: () => {
          this.savingEstimate = false;
          this.editingProcess.estimatedDisbursement = disbursement;
          this.notificationSvc.showSuccess(
            this.translate.instant('FINANCIAL_PLAN.SIMULATION.ADJUST_PLAN.ESTIMATED_AMOUNT.SAVE_SUCCESS')
          );

          // Mid-sequence: move on to the next ticked process instead of
          // dropping back to the list. Saving the LAST one finishes the
          // whole point of the sequence, so it goes straight into "¿Deseas
          // continuar?" instead of leaving the user to find and click "Add
          // processes" themselves on a list screen they only pass through --
          // `screen` is left as 'estimated-amount' on purpose so that dialog
          // stacks over the screen the user was just looking at, not over a
          // list screen that only flashes in behind it for a frame.
          if (this.sequenceIndex < this.sequence.length - 1) {
            this.sequenceIndex += 1;
            this.openEstimatedAmount(this.sequence[this.sequenceIndex]);
          } else {
            this.confirm();
          }
        },
        error: () => {
          this.savingEstimate = false;
        },
      });
  }
}
