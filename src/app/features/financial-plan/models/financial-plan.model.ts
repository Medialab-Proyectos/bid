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

  /** The ANT financial transaction the advance drawn against this plan is
   *  actually recorded under in "Transacciones financieras" -- shown at the
   *  top of "Plan activo" so the plan's own number is never the only
   *  reference to it; unset until the plan has an advance to point to. */
  antTransactionId?: string;
  antTransactionDate?: string;

  /** The ANI transaction "Solicitar ANI" files once a request is confirmed
   *  -- a second, separate transaction from `antTransactionId`: one plan
   *  can draw its original advance under one ANT transaction and still
   *  request further advances afterward, each under its own ANI one.
   *  Unset until the plan has had an ANI request confirmed against it. */
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

/** One actual disbursement, not a monthly subtotal -- a process (or a
 *  commitment under it) pays out in several separate transactions within
 *  the same month (different invoices, different beneficiaries under the
 *  same contract), and `date` is what sorts/groups them back under the
 *  right month in the drill-down. `concept` is what that specific payment
 *  was actually for -- not every payment carries one, so the drill-down
 *  only shows the column's value when it's there. */
export interface ProcessPayment {
  date: string;
  concept?: string;
  /** Always USD, the approval currency: what every total adds up. */
  amount: number;
  /** The currency the payment is scheduled in, and the amount in it. Only
   *  payments from a payment schedule carry them (contracts and other
   *  activities); a potential process is estimated straight in USD. */
  currency?: string;
  currencyAmount?: number;
}

export interface ProcessCommitmentRow {
  commitmentId: string;
  monthlyAmounts: number[];
  /** Same level of detail as `ProcessRow.payments` -- a commitment is still
   *  paid out in separate transactions, not one lump sum, so its own
   *  drill-down needs the same date/concept/amount rows the process above
   *  it gets, not just a monthly total per column. */
  payments: ProcessPayment[];
  /** Only meaningful in the simulation's own "selectable" mode -- whether
   *  this commitment is included in the plan being built. */
  selected?: boolean;
}

export interface ProcessRow {
  processId: string;
  description: string;
  contractName: string;
  totalAmount: number;
  monthlyAmounts: number[];
  /** Every individual payment behind `monthlyAmounts` -- each month's own
   *  figure is just these grouped by month and summed, kept here instead of
   *  only as a total so the drill-down can show "4 pagos en enero" instead
   *  of one opaque monthly number. */
  payments: ProcessPayment[];
  commitments: ProcessCommitmentRow[];
  selected?: boolean;
  /** Set only on a row added here because "Ajustar Plan Financiero" already
   *  distributed an amount for it -- that other screen is the only place
   *  left to change or remove it, so this row's own checkbox renders
   *  checked and disabled instead of lying about being untouchable while
   *  still inviting a click. */
  locked?: boolean;
  /** Where a `locked` row came from: a potential process or a contract with
   *  no payment schedule (legacy), both entered as monthly totals. */
  origin?: 'POTENTIAL' | 'LEGACY_CONTRACT';
}

export interface NonProcurementRow {
  scheduleId: string;
  description: string;
  contractName: string;
  totalAmount: number;
  monthlyAmounts: number[];
  /** Same level of detail as `ProcessRow.payments` -- this row is still
   *  paid out in separate transactions, not one lump sum. */
  payments: ProcessPayment[];
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
 * One component a process's estimated disbursement touches -- its IDB
 * amount, plus how that amount spreads across the plan's months. A process
 * can carry more than one of these (it may touch more than one component),
 * which is also why each one needs its own `componentCode`.
 */
export interface EstimatedDisbursementComponent {
  componentCode: string;
  /** Always USD. For a legacy contract it is calculated, never typed:
   *  `currencyAmount` x `rateToUsd`. */
  idbAmount: number;
  /** Legacy contracts only: the currency the amount was recorded in, the
   *  amount in that currency and the rate used to turn it into `idbAmount`. */
  currency?: string;
  currencyAmount?: number;
  rateToUsd?: number;
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

/** 'LEGACY_CONTRACT': a contract signed before the system, with no payment
 *  schedule (26/10). It is picked and distributed like a potential process,
 *  but recorded in its own currency. */
export type PotentialProcessKind = 'PROCESS' | 'LEGACY_CONTRACT';

export interface PotentialProcess {
  code: string;
  /** Missing means 'PROCESS'. */
  kind?: PotentialProcessKind;
  /** Legacy contracts: every currency the contract is written in (up to four). */
  currencies?: string[];
  /** Legacy contracts: the contract's current start and end dates, as they
   *  stand after any amendment (Rafael, 26/10). */
  contractStartDate?: string;
  contractEndDate?: string;
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
