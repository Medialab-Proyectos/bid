/**
 * Plan Financiero (Financial Plan) module.
 *
 * First slice built: "Plan activo", the read-only view of the plan the Bank
 * has already approved for disbursement, plus the one action it supports --
 * requesting an additional advance (ANI) against it. The other two tabs
 * (Simulación, Planes anteriores) are reachable but inert until built.
 */

export interface FinancialPlanPeriod {
  startDate: string;
  endDate: string;
}

export interface FinancialPlanMonth {
  /** First day of the month, ISO. What every `monthlyAmounts[i]` lines up with. */
  date: string;
  /** "Ene 2024" -- already localized by the back end, like the rest of this app's dates. */
  label: string;
}

export interface FinancialPlanComponentExpense {
  componentCode: string;
  componentName: string;
  monthlyAmounts: number[];
}

/**
 * The active plan's cash-flow table, one row per figure the agency reads
 * month over month. Every `number[]` here is aligned to `months`.
 */
export interface ActiveFinancialPlan {
  id: string;
  projectBucketId: string;
  approvalCurrency: string;
  period: FinancialPlanPeriod;
  months: FinancialPlanMonth[];

  openingBalance: number[];

  components: FinancialPlanComponentExpense[];
  expenseSubtotal: number[];
  balanceAfterExpenses: number[];

  /** Advances already drawn against the loan -- zero in most months. */
  advanceAmount: number[];
  balanceAfterAdvance: number[];
  reimbursements: number[];
  directPayments: number[];

  finalBalance: number[];

  /** The ANI (Anticipo) financial transaction the advance drawn against this
   *  plan is actually recorded under in "Transacciones financieras" --
   *  shown at the top of "Plan activo" so the plan's own number is never
   *  the only reference to it; unset until the plan has an advance to point
   *  to. */
  aniTransactionId?: string;
  aniTransactionDate?: string;

  lastUpdatedOn?: string;
  /** Set only on an entry in "Planes anteriores" -- "Fecha valor" in the
   *  Figma reference, when the plan that replaced this one was confirmed,
   *  i.e. when this one stopped being active. */
  confirmedOn?: string;
  /** Set only on an entry in "Planes anteriores". Every plan this demo ever
   *  files into history got there by being superseded, never by an actual
   *  rejection flow (not built), so this is always 'COMPLETED' in practice
   *  -- 'REJECTED' exists so the list's own status column has somewhere to
   *  read a second state from without inventing one at render time. */
  status?: 'COMPLETED' | 'REJECTED';
}

/**
 * What the agency is editing while "Solicitar ANI" is open: the same three
 * rows of the table that accept a number (advance, reimbursements, direct
 * payments), seeded from the plan's own values so only what they actually
 * change reads as new.
 */
export interface AniRequestDraft {
  advanceAmount: number[];
  reimbursements: number[];
  directPayments: number[];
}

export interface AniConfirmSummary {
  period: FinancialPlanPeriod;
  currency: string;
  /** The advance already on the approved plan before this request. */
  existingAdvanceAmount: number;
  /** The new amount this request adds, read off the one month that changed. */
  aniAmount: number;
  aniDate: string;
}

export interface ProcessCommitmentRow {
  commitmentId: string;
  monthlyAmounts: number[];
  /** Only meaningful in the simulation's own "selectable" mode -- whether
   *  this commitment is included in the plan being built. */
  selected?: boolean;
}

export interface ProcessRow {
  processId: string;
  totalAmount: number;
  monthlyAmounts: number[];
  commitments: ProcessCommitmentRow[];
  selected?: boolean;
}

export interface NonProcurementRow {
  scheduleId: string;
  totalAmount: number;
  monthlyAmounts: number[];
  selected?: boolean;
}

export interface FinancialPlanComponentDetail {
  componentCode: string;
  componentName: string;
  period: FinancialPlanPeriod;
  months: FinancialPlanMonth[];
  processes: ProcessRow[];
  nonProcurement: NonProcurementRow[];
}

/**
 * "Simulación": building the next plan before it is sent for approval.
 * Three steps -- Información, Simulación, Confirmar -- matching the Figma
 * reference's own stepper with its fourth step, Revisión y aprobación,
 * dropped (that approval stage already happens elsewhere in the product).
 */
export type SimulationStepId = 'information' | 'simulation' | 'confirmation';

export interface FinancialPlanExchangeRate {
  currency: string;
  rateToUsd: number;
}

/**
 * Step 1's own data: the period the new plan covers and the exchange rates
 * that convert every contract's own currency into the loan's approval
 * currency for that period -- both required before a simulation can run,
 * which is why "Continuar" stays closed until both are filled in.
 */
export interface FinancialPlanDraft {
  projectBucketId: string;
  period: FinancialPlanPeriod | null;
  exchangeRates: FinancialPlanExchangeRate[];
}

/**
 * Step 2's own table: the same cash-flow shape "Plan activo" shows, but
 * worked out from scratch instead of read. The expenses by component are
 * read-only, pulled from the payment schedule; the opening balance of the
 * first month, the advance amount of the first two months, and the
 * reimbursements/direct payments of every month are the cells the agency
 * actually fills in -- the schedule only seeds their starting values, it
 * doesn't lock them. Every other figure -- every later opening balance,
 * both subtotals, the final balance -- is derived from those.
 */
export interface FinancialPlanSimulation {
  months: FinancialPlanMonth[];
  /** Index 0 only is entered by hand; later months roll forward from the
   *  previous month's final balance instead. */
  openingBalance: number[];
  components: FinancialPlanComponentExpense[];
  expenseSubtotal: number[];
  balanceAfterExpenses: number[];
  /** Only indexes 0 and 1 accept a value -- the advance is drawn once, near
   *  the start of the plan, not spread across the period. */
  advanceAmount: number[];
  balanceAfterAdvance: number[];
  reimbursements: number[];
  directPayments: number[];
  finalBalance: number[];
}

/**
 * "Ajustar Plan Financiero": a process the schedule already knows about but
 * the preliminary plan left out -- the agency can still pull it in here if it
 * turns out to be executable within the period after all.
 */
export type PotentialProcessStatus = 'EXECUTION' | 'EVALUATION' | 'IN_PROCESS' | 'WAITING';

/**
 * One funding-source breakdown within a process's estimated disbursement --
 * same BID/aporte local/cofinanciamiento split the payment dialogs already
 * use, plus how that component's own BID amount spreads across the plan's
 * months. A process can carry more than one of these (it may touch more than
 * one component), which is also why each one needs its own `componentCode`.
 */
export interface EstimatedDisbursementComponent {
  componentCode: string;
  idbAmount: number;
  localAmount: number;
  cofinancingAmount: number;
  /** Aligned to the owning process list's own `months` -- how this
   *  component's `idbAmount` is spread across the period. */
  monthlyAmounts: number[];
}

/**
 * "Monto estimado a desembolsar": filled in only once a process is ticked
 * for inclusion -- there is nothing to estimate for a process that is not
 * going into the plan. Unlike the processes already in the plan, these
 * amounts are entered directly in the plan's own approval currency, so there
 * is no currency field here to convert from.
 */
export interface EstimatedDisbursement {
  paymentDate: string | null;
  concept: string;
  components: EstimatedDisbursementComponent[];
}

/** The project's own components, as the "Componente" dropdown in "Monto
 *  estimado a desembolsar" needs them -- code and name only, same as every
 *  other component picker in this module. */
export interface FinancialPlanComponentOption {
  code: string;
  name: string;
}

/**
 * Step 3's own gate: a process or non-procurement row only counts as
 * "justified" once it is ticked (the same checkboxes `ComponentDetailDialog`
 * already offers in its `selectable` mode) -- the plan can only be confirmed
 * once enough of the simulation's total expense is backed by a ticked row,
 * not left as an unreviewed default.
 */
export interface FinancialPlanJustificationSummary {
  totalExpense: number;
  justifiedExpense: number;
  /** 0-100. */
  justifiedPercentage: number;
}

export interface PotentialProcess {
  code: string;
  name: string;
  beneficiary: string;
  status: PotentialProcessStatus;
  currency: string;
  totalAmount: number;
  executionDate: string;
  /** Whether this process is ticked for inclusion in the plan being built. */
  selected: boolean;
  estimatedDisbursement: EstimatedDisbursement | null;
}
