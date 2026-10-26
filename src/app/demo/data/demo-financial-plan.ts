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
  ProcessPayment,
  ProcessRow,
} from '@fiduciary-interface/app/features/financial-plan/models/financial-plan.model';
import { buildDemoProjectComponents } from './demo-payment-record';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const ALL_MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
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
    antTransactionId: '202600019087',
    antTransactionDate: new Date(2024, 1, 15).toISOString(),
    // Example ANI, same reasoning as `antTransactionId` just above -- seeded
    // so the "Linked ANI financial transaction" section has something to
    // show the first time the module opens, not only after a real
    // "Solicitar ANI" is confirmed (see `requestDemoAni`, which overwrites
    // both fields with its own transaction once that happens for real).
    aniTransactionId: '202600028716',
    aniTransactionDate: new Date(2024, 5, 3).toISOString(),
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

/** Every ANI request confirmed across every project in this demo session
 *  gets its own, never-repeated transaction number -- same "2026000" prefix
 *  the seeded ANT transactions already use, just its own counter so the two
 *  never collide. */
let aniTransactionCounter = 31001;

/**
 * Applies an ANI request in place: the edited advance/reimbursement/direct
 * payment rows replace the plan's own, every downstream subtotal is
 * recomputed from them, the month that gained a new advance is handed back
 * so the confirmation dialog can show which one it was, and the request
 * itself files its own ANI transaction against the plan -- separate from
 * `antTransactionId`, which stays whatever it already was.
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
  plan.aniTransactionId = `2026000${aniTransactionCounter++}`;
  plan.aniTransactionDate = new Date().toISOString();

  // Every month after the first rolls its opening balance forward from the
  // PREVIOUS month's own final balance -- the new advance doesn't just
  // change the one month it lands in, it cascades through every later
  // opening balance too. Same sequential chain `recalculate()` already
  // walks for the simulation's own table; this was previously only
  // recomputing `balanceAfterAdvance`/`finalBalance`, leaving every later
  // `openingBalance`/`balanceAfterExpenses` stuck at the plan's original
  // seed figures even after the advance changed.
  plan.months.forEach((_, i) => {
    plan.openingBalance[i] = i === 0 ? plan.openingBalance[0] : plan.finalBalance[i - 1];
    plan.balanceAfterExpenses[i] = plan.openingBalance[i] - plan.expenseSubtotal[i];
    plan.balanceAfterAdvance[i] = plan.balanceAfterExpenses[i] + plan.advanceAmount[i];
    plan.finalBalance[i] =
      plan.balanceAfterAdvance[i] + plan.reimbursements[i] + plan.directPayments[i];
  });
  plan.lastUpdatedOn = new Date().toISOString();

  return { plan, aniAmount, aniMonthIndex };
}

const COMPONENT_DETAILS = new Map<string, FinancialPlanComponentDetail>();

/** How many separate payments make up this process' given month -- cycling
 *  through a fixed pattern (offset by `seed` so different processes don't
 *  all land on the same counts for the same month) is enough to show the
 *  drill-down varying from month to month without inventing a whole payment
 *  schedule neither has. */
const PAYMENT_COUNT_PATTERN = [4, 5, 3, 2, 4, 3, 5, 2, 4, 3, 5, 2];

/** What each individual payment was actually for -- cycled the same way
 *  `PAYMENT_COUNT_PATTERN` is, so the concept column has real-looking
 *  variety instead of repeating the process' own description on every row
 *  (which would make the concept column redundant with the one next to it). */
const PAYMENT_CONCEPTS = [
  'Pago de avance de obra',
  'Pago de honorarios profesionales',
  'Reembolso de gastos',
  'Pago de materiales y suministros',
  'Pago final de contrato',
];

/** Splits each month's own total into that many individual payments, dated
 *  evenly across the month, instead of leaving `monthlyAmounts` as the only
 *  figure the drill-down can show -- see `ProcessPayment`. */
function splitIntoPayments(
  months: FinancialPlanMonth[],
  monthlyAmounts: number[],
  seed: number
): ProcessPayment[] {
  const payments: ProcessPayment[] = [];
  let paymentIndex = 0;
  months.forEach((month, i) => {
    const total = monthlyAmounts[i] ?? 0;
    if (total <= 0) {
      return;
    }
    const count = PAYMENT_COUNT_PATTERN[(i + seed) % PAYMENT_COUNT_PATTERN.length];
    const base = Math.floor(total / count);
    const remainder = total - base * count;
    const monthDate = new Date(month.date);
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
    for (let p = 0; p < count; p++) {
      const amount = base + (p === count - 1 ? remainder : 0);
      const day = Math.min(daysInMonth, 3 + Math.round((p * daysInMonth) / count));
      payments.push({
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), day).toISOString(),
        concept: PAYMENT_CONCEPTS[(paymentIndex + seed) % PAYMENT_CONCEPTS.length],
        amount,
      });
      paymentIndex++;
    }
  });
  return payments;
}

/** Every process "Ajustar Plan Financiero" has an estimate for, turned into
 *  one read-only row per component its estimate touches -- appended
 *  alongside the component's own two editable processes so the drill-down
 *  shows the full picture of what the plan now includes. Computed fresh on
 *  every read instead of folded into `COMPONENT_DETAILS`'s own cache, so a
 *  process added via "Ajustar Plan Financiero" after this component was
 *  first opened still shows up without needing a save here first -- and so
 *  a row removed there (its `estimatedDisbursement` cleared) stops
 *  appearing here too, instead of lingering from a stale cache entry. */
function buildInjectedProcessRows(
  projectBucketId: string,
  componentCode: string,
  months: FinancialPlanMonth[]
): ProcessRow[] {
  const potentialProcesses = buildDemoFinancialPlanPotentialProcesses(projectBucketId);
  const rows: ProcessRow[] = [];
  potentialProcesses.forEach((process) => {
    const match = process.estimatedDisbursement?.components.find(
      (c) => c.componentCode === componentCode
    );
    if (!match) {
      return;
    }
    const monthlyAmounts = months.map((_, i) => match.monthlyAmounts[i] ?? 0);
    const legacy = process.kind === 'LEGACY_CONTRACT';
    rows.push({
      processId: process.code,
      description: process.estimatedDisbursement.concept,
      contractName: legacy ? process.name : '',
      origin: legacy ? 'LEGACY_CONTRACT' : 'POTENTIAL',
      totalAmount: match.idbAmount || 0,
      monthlyAmounts,
      payments: splitIntoPayments(months, monthlyAmounts, 2),
      selected: true,
      locked: true,
      commitments: [],
    });
  });
  return rows;
}

export function buildDemoFinancialPlanComponent(
  projectBucketId: string,
  componentCode: string
): FinancialPlanComponentDetail {
  const cacheKey = `${projectBucketId}:${componentCode}`;
  if (COMPONENT_DETAILS.has(cacheKey)) {
    const cached = COMPONENT_DETAILS.get(cacheKey);
    return {
      ...cached,
      processes: [
        ...cached.processes,
        ...buildInjectedProcessRows(projectBucketId, componentCode, cached.months),
      ],
    };
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
        description: 'Consultoria para la construccion de lineamientos de politica publica',
        contractName: `Contrato ${componentCode}-01/2024`,
        totalAmount: processAShare.reduce((s, v) => s + v, 0),
        monthlyAmounts: processAShare,
        payments: splitIntoPayments(months, processAShare, 0),
        selected: true,
        commitments: (() => {
          const c01Share = processAShare.map((v) => Math.round(v * 0.6));
          const c02Share = processAShare.map((v, i) => v - c01Share[i]);
          return [
            {
              commitmentId: `PR-${componentCode}-01-C01`,
              monthlyAmounts: c01Share,
              payments: splitIntoPayments(months, c01Share, 3),
              selected: true,
            },
            {
              commitmentId: `PR-${componentCode}-01-C02`,
              monthlyAmounts: c02Share,
              payments: splitIntoPayments(months, c02Share, 4),
              selected: true,
            },
          ];
        })(),
      },
      {
        processId: `PR-${componentCode}-02`,
        description: 'Adquisicion de equipos para fortalecimiento institucional',
        contractName: `Contrato ${componentCode}-02/2024`,
        totalAmount: processBShare.reduce((s, v) => s + v, 0),
        monthlyAmounts: processBShare,
        payments: splitIntoPayments(months, processBShare, 1),
        selected: true,
        commitments: [],
      },
    ],
    nonProcurement: [
      {
        scheduleId: `NP-${componentCode}-01`,
        description: 'Gastos de personal y operacion del programa',
        contractName: `Contrato ${componentCode}-NP01/2024`,
        totalAmount: processAShare.reduce((s, v) => s + v, 0),
        monthlyAmounts: processAShare,
        payments: splitIntoPayments(months, processAShare, 5),
        selected: true,
      },
      {
        scheduleId: `NP-${componentCode}-02`,
        description: 'Auditoria y seguimiento del proyecto',
        contractName: `Contrato ${componentCode}-NP02/2024`,
        totalAmount: processBShare.reduce((s, v) => s + v, 0),
        monthlyAmounts: processBShare,
        payments: splitIntoPayments(months, processBShare, 6),
        selected: true,
      },
    ],
  };

  COMPONENT_DETAILS.set(cacheKey, detail);
  return {
    ...detail,
    processes: [...detail.processes, ...buildInjectedProcessRows(projectBucketId, componentCode, months)],
  };
}

/**
 * "Guardar y recalcular", from the simulation's own component drill-down:
 * which processes, commitments and non-procurement items the agency wants
 * included in this plan. Persisted so reopening the same component keeps
 * what was unchecked, the same way everything else in this module remembers
 * its own in-progress edits.
 *
 * `locked` rows (see `buildInjectedProcessRows`) travel in `detail.processes`
 * the same as every editable one -- the frontend never tells them apart --
 * so they have to be filtered back out before caching, or the next read
 * would recompute them fresh AND find the stale copy this save just cached,
 * doubling every process "Ajustar Plan Financiero" ever added.
 */
export function saveDemoFinancialPlanComponentSelection(
  projectBucketId: string,
  componentCode: string,
  detail: FinancialPlanComponentDetail
): FinancialPlanComponentDetail {
  const cacheKey = `${projectBucketId}:${componentCode}`;
  COMPONENT_DETAILS.set(cacheKey, {
    ...detail,
    processes: detail.processes.filter((process) => !process.locked),
  });
  return buildDemoFinancialPlanComponent(projectBucketId, componentCode);
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
  const periodChanged =
    !draft.period ||
    draft.period.startDate !== period.startDate ||
    draft.period.endDate !== period.endDate;
  draft.period = period;
  draft.exchangeRates = exchangeRates;
  // A saved step-2 draft is keyed to the months of the period it was saved
  // under -- carrying it over into a different period would show a table
  // whose own month columns no longer match what was just typed here. See
  // `buildDemoFinancialPlanSimulation`, which regenerates a fresh table from
  // the new period once there's nothing left in `SIMULATION_DRAFTS`.
  if (periodChanged) {
    SIMULATION_DRAFTS.delete(projectBucketId);
  }
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

/** Contracts signed before the system, with no payment schedule (26/10). The
 *  first is in Canadian dollars, the currency no draft carries a rate for:
 *  recording it is what brings CAD into the rate table. */
const LEGACY_CONTRACTS: { code: string; name: string; beneficiary: string; currencies: string[]; totalAmount: number }[] = [
  {
    code: 'CO-L1229-C01',
    name: 'Construccion de la planta de tratamiento, fase 1',
    beneficiary: 'Consorcio Aguas del Norte',
    currencies: ['CAD'],
    totalAmount: 4_800_000,
  },
  {
    code: 'CO-L1229-C02',
    name: 'Supervision tecnica de las obras',
    beneficiary: 'Ingenieria Andina S.A.S.',
    currencies: ['COP'],
    totalAmount: 2_150_000_000,
  },
  {
    code: 'CO-L1229-C03',
    name: 'Suministro de equipos de laboratorio',
    beneficiary: 'LabTech Europe GmbH',
    currencies: ['EUR', 'USD'],
    totalAmount: 1_250_000,
  },
];

function seedPotentialProcesses(): PotentialProcess[] {
  const legacy = LEGACY_CONTRACTS.map((contract, i): PotentialProcess => ({
    ...contract,
    kind: 'LEGACY_CONTRACT',
    status: 'EXECUTION',
    currency: contract.currencies.join(', '),
    executionDate: new Date(2021, 6, 12 + i).toISOString(),
    selected: false,
    estimatedDisbursement: null,
  }));
  return [...seedProcesses(), ...legacy];
}

function seedProcesses(): PotentialProcess[] {
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

/** "Limpiar datos", step 2's own button: undoes every process "Ajustar Plan
 *  Financiero" has ever added -- ticks and distributed amounts alike --
 *  without touching the opening balance, advance, reimbursements or direct
 *  payments the payment schedule seeds, since those aren't what this button
 *  is for. */
export function clearDemoFinancialPlanPotentialProcesses(projectBucketId: string): PotentialProcess[] {
  const processes = buildDemoFinancialPlanPotentialProcesses(projectBucketId);
  processes.forEach((process) => {
    process.selected = false;
    process.estimatedDisbursement = null;
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

  // A legacy contract in a currency the plan had no rate for brings that rate
  // with it: set in its form the first time, editable later in "Ajustar tasa
  // de cambio" like any other (26/10).
  const draft = buildDemoFinancialPlanDraft(projectBucketId);
  disbursement.components.forEach((component) => {
    if (!component.currency || component.currency === 'USD' || !component.rateToUsd) {
      return;
    }
    const known = draft.exchangeRates.find((rate) => rate.currency === component.currency);
    if (!known) {
      draft.exchangeRates = [
        ...draft.exchangeRates,
        { currency: component.currency, rateToUsd: component.rateToUsd },
      ];
    } else if (!known.rateToUsd) {
      known.rateToUsd = component.rateToUsd;
    }
  });
  return process;
}

/** Undoes a single process's own "Ajustar Plan Financiero" distribution --
 *  reached from unchecking its row in the component drill-down (see
 *  `buildInjectedProcessRows`), after confirming, since that's the only
 *  other screen the row's own checkbox can be unchecked from. Narrower than
 *  `clearDemoFinancialPlanPotentialProcesses`, which clears every process
 *  at once. */
export function clearDemoFinancialPlanEstimatedDisbursement(
  projectBucketId: string,
  code: string
): PotentialProcess {
  const processes = buildDemoFinancialPlanPotentialProcesses(projectBucketId);
  const process = processes.find((p) => p.code === code);
  if (!process) {
    return null;
  }
  process.selected = false;
  process.estimatedDisbursement = null;
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

/** Three example entries so "Planes anteriores" has something to click into
 *  before a real confirmation ever files one -- same cash-flow figures as
 *  the active plan itself (cloned, not independently invented), so the
 *  read-only detail dialog's own table stays internally consistent; only
 *  the id, period, linked ANT/ANI transactions and status change per entry.
 *  `id` is the plan's own sequential number, shown as plain text -- it's
 *  never a link into the plan's detail, since `antTransactionId` (the
 *  "Número de Transacción" column) is the only way in, so every entry here
 *  needs one. `antTransactionDate` can still be empty on its own (a
 *  rejected plan's transaction never settles) -- that's a second, narrower
 *  kind of gap than a missing id. The second entry is deliberately
 *  'REJECTED' so the status column has an example of both states, not
 *  just 'COMPLETED'. Only the first entry also carries an
 *  `aniTransactionId` -- "si corresponde": most plans never had an ANI
 *  requested against them, so the column needs an example of both states. */
function seedPlanHistory(projectBucketId: string): ActiveFinancialPlan[] {
  const base = seedPlan(projectBucketId);
  // Plain sequential, not `FP-${projectBucketId}-00N` -- `projectBucketId`
  // is the project's internal id (a GUID in this demo), fine as a lookup
  // key but unreadable the one place this id is actually shown on screen.
  return [
    {
      ...base,
      id: 'FP-001',
      period: { startDate: '2024-01-01', endDate: '2024-06-30' },
      antTransactionId: '202600023212',
      antTransactionDate: new Date(2024, 9, 22).toISOString(),
      aniTransactionId: '202600030544',
      aniTransactionDate: new Date(2024, 10, 2).toISOString(),
      confirmedOn: new Date(2024, 9, 22).toISOString(),
      status: 'COMPLETED',
    },
    {
      ...base,
      id: 'FP-002',
      period: { startDate: '2023-07-01', endDate: '2023-12-31' },
      antTransactionId: '202600023198',
      antTransactionDate: undefined,
      confirmedOn: new Date(2024, 0, 8).toISOString(),
      status: 'REJECTED',
    },
    {
      ...base,
      id: 'FP-003',
      period: { startDate: '2024-01-10', endDate: '2024-06-30' },
      antTransactionId: '202600023225',
      antTransactionDate: new Date(2024, 10, 5).toISOString(),
      confirmedOn: new Date(2024, 10, 3).toISOString(),
      status: 'COMPLETED',
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
