import { Component, OnDestroy, OnInit } from '@angular/core';
import { DialogService } from '@progress/kendo-angular-dialog';
import { Subscription, filter, take } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ProjectStoreService } from '@core/services/store-services';
import { VisibilityService } from '@core/services/view';
import { ActiveFinancialPlan, AniRequestDraft } from '../../models/financial-plan.model';
import { FinancialPlanApiService } from '../../services/financial-plan-api.service';
import { ConfirmAniDialogComponent } from '../../components/confirm-ani-dialog/confirm-ani-dialog.component';
import { ComponentDetailDialogComponent } from '../../components/component-detail-dialog/component-detail-dialog.component';

/**
 * "Plan financiero", landed on "Plan activo": the plan the Bank has already
 * approved for disbursement, read-only except for one action -- requesting
 * an additional advance (ANI) against it.
 *
 * The other two tabs of the module, Simulación (building the next plan) and
 * Planes anteriores (its own history), are not built yet; they render as
 * disabled so the shell's final shape is in place without claiming screens
 * that do not exist.
 */
@Component({
  selector: 'fi-active-plan',
  templateUrl: './active-plan.component.html',
  styleUrls: ['../../financial-plan.shared.scss'],
})
export class ActivePlanComponent implements OnInit, OnDestroy {
  private readonly subscriptions = new Subscription();

  projectBucketId: string;
  tab: 'active' | 'simulation' | 'previous' = 'active';
  plan: ActiveFinancialPlan;
  loading = false;

  editingAni = false;
  saving = false;
  draft: AniRequestDraft;

  constructor(
    private readonly api: FinancialPlanApiService,
    private readonly projectStore: ProjectStoreService,
    private readonly visibilitySvc: VisibilityService,
    private readonly dialogService: DialogService,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    // Unlike expenditure-statement and its siblings, this screen keeps the
    // project header: the Figma reference shows the "PROYECTO ..." bar right
    // under the breadcrumb on every Plan Financiero screen, not hidden the
    // way those other sidebar-level destinations hide it.
    this.visibilitySvc.breadcrumbService.set(
      '@financialPlan',
      'SIDEBAR.FINANCIAL_PLAN'
    );

    const sub = this.projectStore
      .selectedProject()
      .pipe(
        filter((state) => !!state && !!state.selectedProject),
        take(1)
      )
      .subscribe((state) => {
        this.projectBucketId = state.selectedProject.projectBucketId;
        this.load();
      });
    this.subscriptions.add(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  load(): void {
    this.loading = true;
    const sub = this.api.getActivePlan(this.projectBucketId).subscribe({
      next: (plan) => {
        this.plan = plan;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
    this.subscriptions.add(sub);
  }

  /** Same client-side CSV export `expenditure-statement`'s own "Descargar"
   *  button already uses -- no server endpoint behind it, just the table
   *  already on screen written out as a file. */
  downloadPlan(): void {
    const t = (key: string) => this.translate.instant(key);
    const header = ['', ...this.plan.months.map((m) => m.label)];
    const rows: string[][] = [
      [t('FINANCIAL_PLAN.ACTIVE.ROWS.OPENING_BALANCE'), ...this.plan.openingBalance.map(String)],
      [t('FINANCIAL_PLAN.ACTIVE.ROWS.EXPENSES_BY_COMPONENT')],
      ...this.plan.components.map((c) => [c.componentName, ...c.monthlyAmounts.map(String)]),
      [t('FINANCIAL_PLAN.ACTIVE.ROWS.EXPENSE_SUBTOTAL'), ...this.plan.expenseSubtotal.map(String)],
      [
        t('FINANCIAL_PLAN.ACTIVE.ROWS.BALANCE_AFTER_EXPENSES'),
        ...this.plan.balanceAfterExpenses.map(String),
      ],
      [t('FINANCIAL_PLAN.ACTIVE.ROWS.ADVANCE_AMOUNT'), ...this.plan.advanceAmount.map(String)],
      [
        t('FINANCIAL_PLAN.ACTIVE.ROWS.BALANCE_AFTER_ADVANCE'),
        ...this.plan.balanceAfterAdvance.map(String),
      ],
      [t('FINANCIAL_PLAN.ACTIVE.ROWS.REIMBURSEMENTS'), ...this.plan.reimbursements.map(String)],
      [t('FINANCIAL_PLAN.ACTIVE.ROWS.DIRECT_PAYMENTS'), ...this.plan.directPayments.map(String)],
      [t('FINANCIAL_PLAN.ACTIVE.ROWS.FINAL_BALANCE'), ...this.plan.finalBalance.map(String)],
    ];

    const separators = /[";\r\n]/;
    const escape = (cell: string) =>
      cell && separators.test(cell) ? '"' + cell.replace(/"/g, '""') + '"' : cell;
    const lines = [header, ...rows].map((row) => row.map(escape).join(';')).join('\r\n');

    // The BOM is what makes Excel read the accents correctly.
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

  openComponent(componentCode: string, componentName: string): void {
    // No `title` string: Kendo's dialog title only takes plain text, with no
    // way to put the Figma reference's icon next to it or left-align it, so
    // the dialog builds its own header row instead and this stays an empty
    // native title bar (still carrying the native close button).
    const dialog = this.dialogService.open({
      content: ComponentDetailDialogComponent,
      cssClass: 'fp-modal',
      width: 1100,
    });

    const instance = dialog.content.instance as ComponentDetailDialogComponent;
    instance.projectBucketId = this.projectBucketId;
    instance.componentCode = componentCode;
    instance.componentName = componentName;
  }

  startSimulation(): void {
    this.tab = 'simulation';
  }

  /** "Salir" and "Confirmar Plan Financiero" both land here -- re-reading
   *  the plan is what picks up a just-confirmed simulation; for a plain
   *  "Salir" it just re-fetches the same plan that was already on screen. */
  exitSimulation(): void {
    this.tab = 'active';
    this.load();
  }

  startAni(): void {
    this.draft = {
      advanceAmount: this.plan.advanceAmount.slice(),
      reimbursements: this.plan.reimbursements.slice(),
      directPayments: this.plan.directPayments.slice(),
    };
    this.editingAni = true;
  }

  /** Only a month with no advance yet can take the new one -- the months the
   *  plan already drew against stay locked, same as every other already-
   *  reported figure in this module. */
  advanceEditable(monthIndex: number): boolean {
    return this.plan.advanceAmount[monthIndex] === 0;
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

  cancelAni(): void {
    this.editingAni = false;
    this.draft = null;
  }

  get aniDelta(): number {
    if (!this.draft) {
      return 0;
    }
    return this.draft.advanceAmount.reduce(
      (sum, value, i) => sum + Math.max(0, value - this.plan.advanceAmount[i]),
      0
    );
  }

  confirmAni(): void {
    if (this.aniDelta <= 0) {
      return;
    }

    let aniMonthIndex = -1;
    let aniAmount = 0;
    this.plan.months.forEach((_, i) => {
      const delta = this.draft.advanceAmount[i] - this.plan.advanceAmount[i];
      if (delta > 0) {
        aniMonthIndex = i;
        aniAmount = delta;
      }
    });

    const dialog = this.dialogService.open({
      title: this.translate.instant('FINANCIAL_PLAN.ACTIVE.ANI.CONFIRM_TITLE'),
      content: ConfirmAniDialogComponent,
      cssClass: 'fp-modal',
      width: 560,
    });

    const instance = dialog.content.instance as ConfirmAniDialogComponent;
    instance.projectBucketId = this.projectBucketId;
    instance.draft = this.draft;
    instance.summary = {
      period: this.plan.period,
      currency: this.plan.approvalCurrency,
      existingAdvanceAmount: this.plan.advanceAmount.reduce((s, v) => s + v, 0),
      aniAmount,
      aniDate: this.plan.months[aniMonthIndex]?.date,
    };

    const sub = dialog.result.subscribe((result) => {
      if ((result as { confirmed?: boolean }).confirmed) {
        this.editingAni = false;
        this.draft = null;
        this.load();
      }
    });
    this.subscriptions.add(sub);
  }
}
