import {
  ActiveFinancialPlan,
  AniRequestDraft,
  EstimatedDisbursement,
  FinancialPlanComponentDetail,
  FinancialPlanDraft,
  FinancialPlanJustificationSummary,
  FinancialPlanMonth,
  FinancialPlanPeriod,
  FinancialPlanSimulation,
  PotentialProcess,
  PotentialProcessStatus,
} from '@fiduciary-interface/app/features/financial-plan/models/financial-plan.model';
import { buildDemoProjectComponents } from './demo-payment-record';

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
const ALL_MONTH_NAMES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic',
];

function buildMonths(): FinancialPlanMonth[] {
  return MONTH_LABELS.map((label, i) => ({
    date: new Date(2024, i, 1).toISOString(),
    label: `${label} 2024`,
  }));
}

/** Every first-of-month between a period's two dates, inclusive -- the
 *  simulation's own month range follows whatever period step 1 chose,
 *  unlike the active plan's fixed six months. */
function monthsInRange(startDate: string, endDate: string): FinancialPlanMonth[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const months: FinancialPlanMonth[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cursor <= end) {
    months.push({
      date: cursor.toISOString(),
      label: `${ALL_MONTH_NAMES[cursor.getMonth()]} ${cursor.getFullYear()}`,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}

/**
 * One in-memory plan per project, so an ANI request made in one demo session
 * is reflected back the next time the screen is opened without a reload
 * losing it -- the same "seed once, mutate in place" approach
 * `demo-payment-record.ts` uses for commitments and payments.
 */
const PLANS = new Map<string, ActiveFinancialPlan>();

function seedPlan(projectBucketId: string): ActiveFinancialPlan {
  const components = buildDemoProjectComponents();
  const months = buildMonths();

  // Figures below are the module's one hand-built example (see the Figma
  // reference), kept internally consistent: each month's opening balance is
  // the prior month's final balance, and every subtotal is the real sum of
  // the rows above it rather than an independent guess.
  const openingBalance = [30_000_000, 23_000_000, 81_500_000, 74_500_000, 63_500_000, 57_000_000];
  const componentAmounts = [
    [3_000_000, 5_000_000, 4_000_000, 7_000_000, 2_000_000, 3_000_000],
    [3_000_000, 1_000_000, 2_000_000, 3_000_000, 4_000_000, 3_000_000],
    [3_000_000, 2_000_000, 1_000_000, 1_000_000, 500_000, 3_000_000],
  ];
  const expenseSubtotal = months.map((_, i) =>
    componentAmounts.reduce((sum, row) => sum + row[i], 0)
  );
  const balanceAfterExpenses = months.map((_, i) => openingBalance[i] - expenseSubtotal[i]);
  const advanceAmount = [0, 65_000_000, 0, 0, 0, 0];
  const balanceAfterAdvance = months.map((_, i) => balanceAfterExpenses[i] + advanceAmount[i]);
  const reimbursements = [1_000_000, 500_000, 0, 0, 0, 400_000];
  const directPayments = [1_000_000, 1_000_000, 0, 0, 0, 0];
  const finalBalance = months.map(
    (_, i) => balanceAfterAdvance[i] + reimbursements[i] + directPayments[i]
  );

  return {
    id: `FP-${projectBucketId}`,
    projectBucketId,
    approvalCurrency: 'USD',
    period: { startDate: '2024-01-10', endDate: '2024-06-30' },
    months,
    openingBalance,
    components: components.map((c, i) => ({
      componentCode: c.code,
      componentName: c.name,
      monthlyAmounts: componentAmounts[i] ?? months.map(() => 0),
    })),
    expenseSubtotal,
    balanceAfterExpenses,
    advanceAmount,
    balanceAfterAdvance,
    reimbursements,
    directPayments,
    finalBalance,
    aniTransactionId: '202600019087',
    aniTransactionDate: new Date(2024, 1, 15).toISOString(),
    lastUpdatedOn: new Date().toISOString(),
  };
}

export function buildDemoActiveFinancialPlan(projectBucketId: string): ActiveFinancialPlan {
  if (!PLANS.has(projectBucketId)) {
    PLANS.set(projectBucketId, seedPlan(projectBucketId));
  }
  return PLANS.get(projectBucketId);
}

/** Code and name only -- what the "Componente" dropdown in "Monto estimado a
 *  desembolsar" needs, same list every other component picker reads from. */
export function buildDemoFinancialPlanComponentOptions(
  projectBucketId: string
): Array<{ code: string; name: string }> {
  return buildDemoActiveFinancialPlan(projectBucketId).components.map((c) => ({
    code: c.componentCode,
    name: c.componentName,
  }));
}

/**
 * Applies an ANI request in place: the edited advance/reimbursement/direct
 * payment rows replace the plan's own, every downstream subtotal is
 * recomputed from them, and the month that gained a new advance is handed
 * back so the confirmation dialog can show which one it was.
 */
export function requestDemoAni(
  projectBucketId: string,
  draft: AniRequestDraft
): { plan: ActiveFinancialPlan; aniAmount: number; aniMonthIndex: number } {
  const plan = buildDemoActiveFinancialPlan(projectBucketId);

  let aniMonthIndex = -1;
  let aniAmount = 0;
  plan.months.forEach((_, i) => {
    const delta = (draft.advanceAmount[i] ?? 0) - plan.advanceAmount[i];
    if (delta > 0) {
      aniMonthIndex = i;
      aniAmount = delta;
    }
  });

  plan.advanceAmount = draft.advanceAmount.slice();
  plan.reimbursements = draft.reimbursements.slice();
  plan.directPayments = draft.directPayments.slice();
  plan.balanceAfterAdvance = plan.months.map(
    (_, i) => plan.balanceAfterExpenses[i] + plan.advanceAmount[i]
  );
  plan.finalBalance = plan.months.map(
    (_, i) => plan.balanceAfterAdvance[i] + plan.reimbursements[i] + plan.directPayments[i]
  );
  plan.lastUpdatedOn = new Date().toISOString();

  return { plan, aniAmount, aniMonthIndex };
}

const COMPONENT_DETAILS = new Map<string, FinancialPlanComponentDetail>();

export function buildDemoFinancialPlanComponent(
  projectBucketId: string,
  componentCode: string
): FinancialPlanComponentDetail {
  const cacheKey = `${projectBucketId}:${componentCode}`;
  if (COMPONENT_DETAILS.has(cacheKey)) {
    return COMPONENT_DETAILS.get(cacheKey);
  }

  const plan = buildDemoActiveFinancialPlan(projectBucketId);
  const component = plan.components.find((c) => c.componentCode === componentCode);
  const months = plan.months;

  // Split the component's own monthly total across two processes, each with
  // two commitments underneath it, and a matching "No adquisiciones"
  // cronograma -- enough structure to show the drill-down's two sections
  // without inventing numbers unrelated to the row the agency opened.
  const total = (i: number) => component?.monthlyAmounts[i] ?? 0;
  const processAShare = months.map((_, i) => Math.round(total(i) * 0.6));
  const processBShare = months.map((_, i) => total(i) - processAShare[i]);

  const detail: FinancialPlanComponentDetail = {
    componentCode: component?.componentCode ?? componentCode,
    componentName: component?.componentName ?? componentCode,
    period: plan.period,
    months,
    processes: [
      {
        processId: `PR-${componentCode}-01`,
        totalAmount: processAShare.reduce((s, v) => s + v, 0),
        monthlyAmounts: processAShare,
        selected: true,
        commitments: [
          {
            commitmentId: `PR-${componentCode}-01-C01`,
            monthlyAmounts: processAShare.map((v) => Math.round(v * 0.6)),
            selected: true,
          },
          {
            commitmentId: `PR-${componentCode}-01-C02`,
            monthlyAmounts: processAShare.map((v) => v - Math.round(v * 0.6)),
            selected: true,
          },
        ],
      },
      {
        processId: `PR-${componentCode}-02`,
        totalAmount: processBShare.reduce((s, v) => s + v, 0),
        monthlyAmounts: processBShare,
        selected: true,
        commitments: [],
      },
    ],
    nonProcurement: [
      {
        scheduleId: `NP-${componentCode}-01`,
        totalAmount: processAShare.reduce((s, v) => s + v, 0),
        monthlyAmounts: processAShare,
        selected: true,
      },
      {
        scheduleId: `NP-${componentCode}-02`,
        totalAmount: processBShare.reduce((s, v) => s + v, 0),
        monthlyAmounts: processBShare,
        selected: true,
      },
    ],
  };

  COMPONENT_DETAILS.set(cacheKey, detail);
  return detail;
}

/**
 * "Guardar y recalcular", from the simulation's own component drill-down:
 * which processes, commitments and non-procurement items the agency wants
 * included in this plan. Persisted so reopening the same component keeps
 * what was unchecked, the same way everything else in this module remembers
 * its own in-progress edits.
 */
export function saveDemoFinancialPlanComponentSelection(
  projectBucketId: string,
  componentCode: string,
  detail: FinancialPlanComponentDetail
): FinancialPlanComponentDetail {
  const cacheKey = `${projectBucketId}:${componentCode}`;
  COMPONENT_DETAILS.set(cacheKey, detail);
  return detail;
}

// ---------------------------------------------------------------------------
// "Simulación": the draft of the next plan, started from "Simular nuevo Plan
// Financiero" on the active plan. Step 1 only so far -- Información -- the
// rest of the stepper is not built yet.
// ---------------------------------------------------------------------------

/** Every non-USD currency this demo's contracts can be written in (see the
 *  `/api/common/currencies` list in demo-backend.routes.ts) -- the exact set
 *  a real draft would need a rate for, not Figma's own placeholder three. */
const DRAFT_CURRENCIES = ['EUR', 'BRL', 'COP', 'MXN', 'PEN'];

const DRAFTS = new Map<string, FinancialPlanDraft>();

function seedDraft(projectBucketId: string): FinancialPlanDraft {
  return {
    projectBucketId,
    period: null,
    exchangeRates: DRAFT_CURRENCIES.map((currency) => ({ currency, rateToUsd: null })),
  };
}

export function buildDemoFinancialPlanDraft(projectBucketId: string): FinancialPlanDraft {
  if (!DRAFTS.has(projectBucketId)) {
    DRAFTS.set(projectBucketId, seedDraft(projectBucketId));
  }
  return DRAFTS.get(projectBucketId);
}

export function saveDemoFinancialPlanDraftInformation(
  projectBucketId: string,
  period: FinancialPlanPeriod,
  exchangeRates: { currency: string; rateToUsd: number }[]
): FinancialPlanDraft {
  const draft = buildDemoFinancialPlanDraft(projectBucketId);
  draft.period = period;
  draft.exchangeRates = exchangeRates;
  return draft;
}

/** "Ajustar tasa de cambio": updates the draft's own rates without touching
 *  its period, reachable from the simulation step without leaving it. */
export function saveDemoFinancialPlanExchangeRates(
  projectBucketId: string,
  exchangeRates: { currency: string; rateToUsd: number }[]
): { exchangeRates: { currency: string; rateToUsd: number }[]; lastUpdatedOn: string } {
  const draft = buildDemoFinancialPlanDraft(projectBucketId);
  draft.exchangeRates = exchangeRates;
  return { exchangeRates: draft.exchangeRates, lastUpdatedOn: new Date().toISOString() };
}

/** "Guardar borrador": step 2's own in-progress edits, keyed by project so
 *  leaving mid-simulation and coming back (even a plain page reload, since
 *  this lives on the demo "server" side, not in the component) restores
 *  exactly what was last saved instead of the blank starting figures. */
const SIMULATION_DRAFTS = new Map<string, FinancialPlanSimulation>();

export function saveDemoFinancialPlanSimulationDraft(
  projectBucketId: string,
  simulation: FinancialPlanSimulation
): FinancialPlanSimulation {
  SIMULATION_DRAFTS.set(projectBucketId, simulation);
  return simulation;
}

/**
 * Step 2's givens: expenses by component (read-only, pulled from the payment
 * schedule, the same way they are everywhere else in the module) and the
 * reimbursements/direct payments the schedule already commits the agency to
 * -- a starting point here, not a lock, since the agency can still edit
 * either across the whole period. Opening balance and advance amount are
 * left at 0; step 2's own screen is where the agency fills those in, and
 * every other figure in the table is derived from them on the client.
 *
 * A saved draft (see `saveDemoFinancialPlanSimulationDraft`) takes priority
 * over all of that and is returned as-is -- once the agency has saved
 * something, reopening step 2 is about picking up where they left off, not
 * about seeing the schedule's own starting point again.
 */
export function buildDemoFinancialPlanSimulation(projectBucketId: string): FinancialPlanSimulation {
  const savedDraft = SIMULATION_DRAFTS.get(projectBucketId);
  if (savedDraft) {
    return savedDraft;
  }

  const draft = buildDemoFinancialPlanDraft(projectBucketId);
  const months = draft.period
    ? monthsInRange(draft.period.startDate, draft.period.endDate)
    : buildMonths();

  const components = buildDemoProjectComponents();
  const componentAmounts = components.map((_, ci) =>
    months.map((_, mi) => 300_000 + ci * 150_000 + (mi % 4) * 120_000)
  );
  const expenseSubtotal = months.map((_, i) =>
    componentAmounts.reduce((sum, row) => sum + row[i], 0)
  );
  const reimbursements = months.map((_, i) => (i % 3 === 2 ? 450_000 : 0));
  const directPayments = months.map((_, i) => (i % 4 === 3 ? 600_000 : 0));

  return {
    months,
    openingBalance: months.map(() => 0),
    components: components.map((c, i) => ({
      componentCode: c.code,
      componentName: c.name,
      monthlyAmounts: componentAmounts[i],
    })),
    expenseSubtotal,
    balanceAfterExpenses: months.map(() => 0),
    advanceAmount: months.map(() => 0),
    balanceAfterAdvance: months.map(() => 0),
    reimbursements,
    directPayments,
    finalBalance: months.map(() => 0),
  };
}

// ---------------------------------------------------------------------------
// "Ajustar Plan Financiero": processes the schedule already knows about that
// the preliminary plan left out, pickable into the simulation being built.
// ---------------------------------------------------------------------------

const POTENTIAL_PROCESS_STATUSES: PotentialProcessStatus[] = [
  'EXECUTION',
  'EVALUATION',
  'EVALUATION',
  'EVALUATION',
  'IN_PROCESS',
  'IN_PROCESS',
  'WAITING',
  'WAITING',
];

const POTENTIAL_PROCESSES = new Map<string, PotentialProcess[]>();

function seedPotentialProcesses(): PotentialProcess[] {
  return POTENTIAL_PROCESS_STATUSES.map((status, i) => ({
    code: `CO-L1229-P${120 + i}`,
    name: 'Consultoria para la construccion de lineamientos de politica publica',
    beneficiary: 'Maria Perez Cortijo',
    status,
    currency: 'USD',
    totalAmount: i % 2 === 0 ? 21_000_000 : 10_000_000,
    executionDate: new Date(2024, 2, 5 + i).toISOString(),
    // Every row starts unticked -- selecting one is an explicit choice the
    // agency makes, not something the picker should make for them.
    selected: false,
    estimatedDisbursement: null,
  }));
}

export function buildDemoFinancialPlanPotentialProcesses(
  projectBucketId: string
): PotentialProcess[] {
  if (!POTENTIAL_PROCESSES.has(projectBucketId)) {
    POTENTIAL_PROCESSES.set(projectBucketId, seedPotentialProcesses());
  }
  return POTENTIAL_PROCESSES.get(projectBucketId);
}

/** "Añadir procesos": which processes stay ticked when the picker closes. */
export function saveDemoFinancialPlanPotentialProcessSelection(
  projectBucketId: string,
  codes: string[]
): PotentialProcess[] {
  const processes = buildDemoFinancialPlanPotentialProcesses(projectBucketId);
  const selectedCodes = new Set(codes);
  processes.forEach((process) => {
    process.selected = selectedCodes.has(process.code);
  });
  return processes;
}

/**
 * "Monto estimado a desembolsar", saved against the one process it was
 * opened from -- ticking it is implied by having an estimate to give it in
 * the first place, same as `estimatedDisbursement` only ever being read for a
 * `selected` row.
 */
export function saveDemoFinancialPlanEstimatedDisbursement(
  projectBucketId: string,
  code: string,
  disbursement: EstimatedDisbursement
): PotentialProcess {
  const processes = buildDemoFinancialPlanPotentialProcesses(projectBucketId);
  const process = processes.find((p) => p.code === code);
  if (!process) {
    return null;
  }
  process.selected = true;
  process.estimatedDisbursement = disbursement;
  return process;
}

// ---------------------------------------------------------------------------
// Step 3, "Confirmar Plan Financiero": the plan can only be confirmed once
// enough of its total expense is backed by a row the agency actually ticked,
// not left at the drill-down's own unreviewed default.
// ---------------------------------------------------------------------------

/**
 * Same basis on both sides of the ratio -- every process and non-procurement
 * row across every component, ticked or not -- so the percentage reads as
 * "how much of what COULD be justified actually is" rather than being
 * thrown off by `detail.processes` and `detail.nonProcurement` not summing
 * to the same total as each other (this demo seeds them as two independent
 * breakdowns of the same component, not a split that adds up to it once).
 */
export function buildDemoFinancialPlanJustification(
  projectBucketId: string
): FinancialPlanJustificationSummary {
  const simulation = buildDemoFinancialPlanSimulation(projectBucketId);

  let totalExpense = 0;
  let justifiedExpense = 0;
  simulation.components.forEach((component) => {
    const detail = buildDemoFinancialPlanComponent(projectBucketId, component.componentCode);
    [...detail.processes, ...detail.nonProcurement].forEach((row) => {
      totalExpense += row.totalAmount;
      if (row.selected) {
        justifiedExpense += row.totalAmount;
      }
    });
  });

  return {
    totalExpense,
    justifiedExpense,
    justifiedPercentage: totalExpense > 0 ? Math.round((justifiedExpense / totalExpense) * 100) : 100,
  };
}

/**
 * "Planes anteriores": every plan a confirmation has ever replaced, oldest
 * first -- `confirmDemoFinancialPlanSimulation` is the only place that ever
 * adds to this, right before it overwrites `PLANS` with the plan that just
 * replaced it.
 */
const PLAN_HISTORY = new Map<string, ActiveFinancialPlan[]>();

/** Two example entries so "Planes anteriores" has something to click into
 *  before a real confirmation ever files one -- same cash-flow figures as
 *  the active plan itself (cloned, not independently invented), so the
 *  read-only detail dialog's own table stays internally consistent; only
 *  the id, period, confirmation date and status change per entry. The
 *  second is deliberately 'REJECTED' so the list's status column has an
 *  example of both states to show, not just 'COMPLETED'. */
function seedPlanHistory(projectBucketId: string): ActiveFinancialPlan[] {
  const base = seedPlan(projectBucketId);
  return [
    {
      ...base,
      id: '202600023212',
      period: { startDate: '2024-01-01', endDate: '2024-06-30' },
      confirmedOn: new Date(2024, 9, 22).toISOString(),
      status: 'COMPLETED',
    },
    {
      ...base,
      id: '202600023198',
      period: { startDate: '2023-07-01', endDate: '2023-12-31' },
      confirmedOn: new Date(2024, 0, 8).toISOString(),
      status: 'REJECTED',
    },
  ];
}

export function buildDemoPreviousFinancialPlans(projectBucketId: string): ActiveFinancialPlan[] {
  if (!PLAN_HISTORY.has(projectBucketId)) {
    PLAN_HISTORY.set(projectBucketId, seedPlanHistory(projectBucketId));
  }
  return PLAN_HISTORY.get(projectBucketId);
}

/**
 * "Confirmar Plan Financiero": the simulation being built replaces whatever
 * "Plan activo" showed before -- the same in-place swap `requestDemoAni`
 * already does to the one `PLANS` entry this project keeps. Unlike that
 * swap, the plan being replaced here is not just overwritten: it is read
 * once more before that happens and filed into `PLAN_HISTORY`, on top of
 * the example entries `buildDemoPreviousFinancialPlans` seeds there.
 */
export function confirmDemoFinancialPlanSimulation(projectBucketId: string): ActiveFinancialPlan {
  const simulation = buildDemoFinancialPlanSimulation(projectBucketId);
  const draft = buildDemoFinancialPlanDraft(projectBucketId);

  const replaced = PLANS.get(projectBucketId);
  if (replaced) {
    const history = buildDemoPreviousFinancialPlans(projectBucketId);
    history.push({
      ...replaced,
      // The active plan's own id is stable (`FP-${projectBucketId}`) because
      // only one of it ever exists at a time -- once filed into history,
      // several of them coexist, so each copy needs an id of its own.
      id: `${replaced.id}-${history.length + 1}`,
      confirmedOn: new Date().toISOString(),
      status: 'COMPLETED',
    });
    PLAN_HISTORY.set(projectBucketId, history);
  }

  const plan: ActiveFinancialPlan = {
    id: `FP-${projectBucketId}`,
    projectBucketId,
    approvalCurrency: 'USD',
    period: draft.period ?? { startDate: '', endDate: '' },
    months: simulation.months,
    openingBalance: simulation.openingBalance,
    components: simulation.components,
    expenseSubtotal: simulation.expenseSubtotal,
    balanceAfterExpenses: simulation.balanceAfterExpenses,
    advanceAmount: simulation.advanceAmount,
    balanceAfterAdvance: simulation.balanceAfterAdvance,
    reimbursements: simulation.reimbursements,
    directPayments: simulation.directPayments,
    finalBalance: simulation.finalBalance,
    lastUpdatedOn: new Date().toISOString(),
  };

  PLANS.set(projectBucketId, plan);
  return plan;
}
