import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from '@progress/kendo-angular-dialog';
import { Subscription, filter, take } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ProjectStoreService } from '@core/services/store-services';
import { VisibilityService } from '@core/services/view';
import { ActiveFinancialPlan, AniRequestDraft } from '../../models/financial-plan.model';
import { FinancialPlanApiService } from '../../services/financial-plan-api.service';
import { ConfirmAniDialogComponent } from '../../components/confirm-ani-dialog/confirm-ani-dialog.component';

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
export class ActivePlanComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly subscriptions = new Subscription();
  /** The pinned header; its height is what the simulation's own pinned
   *  stepper offsets itself by, so the two stack instead of overlapping. */
  @ViewChild('stickyHead') private stickyHead: ElementRef<HTMLElement>;
  private stickyObserver: ResizeObserver;

  projectBucketId: string;
  /** «4921/OC-EC · EC-L1248» -- shown in the pinned header, so the operation
   *  stays in view after the portal's own operation card scrolls away. */
  operationLabel = '';
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
    private readonly translate: TranslateService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
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
        this.operationLabel = [state.selectedProject.contract, state.selectedProject.operationNumber]
          .filter((part) => !!part)
          .join(' · ');
        this.load();
        this.restoreInProgressSimulationTab();
      });
    this.subscriptions.add(sub);
  }

  /** Leaving the module entirely (not just "Salir" inside the simulator,
   *  but navigating away to another screen and back) tears this whole
   *  component down -- `tab` itself has nothing to remember it was ever on
   *  "Simulación". A period already saved on the draft is what `fi-
   *  simulation-stepper`'s own `ngOnInit` already uses to jump straight to
   *  step 2 once it renders; checking the same thing here is what gets it
   *  rendered in the first place, landing back on "Simulación" instead of
   *  defaulting to "Plan activo" as if nothing were in progress. */
  private restoreInProgressSimulationTab(): void {
    const sub = this.api.getDraft(this.projectBucketId).subscribe({
      next: (draft) => {
        if (draft.period) {
          this.tab = 'simulation';
        }
      },
    });
    this.subscriptions.add(sub);
  }

  ngAfterViewInit(): void {
    const head = this.stickyHead?.nativeElement;
    if (!head || typeof ResizeObserver === 'undefined') {
      return;
    }
    this.stickyObserver = new ResizeObserver(() =>
      head.parentElement?.style.setProperty('--fp-sticky-h', `${head.offsetHeight}px`)
    );
    this.stickyObserver.observe(head);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.stickyObserver?.disconnect();
  }

  load(): void {
    this.loading = true;
    const sub = this.api.getActivePlan(this.projectBucketId).subscribe({
      next: (plan) => {
        this.plan = plan;
        this.loading = false;
        // First plan of the operation: there is nothing to show under
        // "Plan activo", so it goes straight to the simulation (09/10).
        if (!plan) {
          this.tab = 'simulation';
        }
      },
      error: () => {
        this.loading = false;
        this.tab = 'simulation';
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

  /** A screen of its own (`financial-plan/components/:componentCode`), read
   *  only -- no `?selectable=1`, unlike the simulation's own link into the
   *  same route. */
  openComponent(componentCode: string): void {
    this.router.navigate(['components', componentCode], { relativeTo: this.route });
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
   *  reported figure in this module. The first month is locked outright
   *  regardless of its own value: it's already underway (or past) by the
   *  time anyone opens "Solicitar ANI", so there's no month left before it
   *  to actually disburse a new advance into. */
  advanceEditable(monthIndex: number): boolean {
    if (monthIndex === 0) {
      return false;
    }
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
