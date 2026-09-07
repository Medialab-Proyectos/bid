/**
 * Payment Record (Reporte de Pagos Efectuados).
 *
 * An executing agency reports, commitment by commitment, the payments it has
 * actually made against a loan. A commitment is either a procurement contract
 * or a direct expense with no procurement process behind it.
 */

export enum CommitmentType {
  CONTRACT = 'CONTRACT',
  NON_PROCUREMENT = 'NON_PROCUREMENT',
}

/**
 * Life of a reported payment.
 *
 * A payment only becomes JUSTIFIED once the Bank has approved the transaction
 * that carried it; from that moment it can never be sent again in another
 * statement of expenditures, which is what prevents the same expense from
 * being charged twice against the loan.
 */
export enum PaymentRecordStatus {
  /** Taken from the payment schedule, not yet reported as paid. */
  SCHEDULED = 'SCHEDULED',
  /** Reported as actually paid. Candidate for a statement of expenditures. */
  PAID = 'PAID',
  /**
   * Carried by a statement the agency already sent, while the Bank decides.
   * The payment is spoken for: it cannot enter another statement, and it is
   * not justified yet either, so it can still come back if the Bank rejects
   * the transaction.
   */
  PENDING_JUSTIFICATION = 'PENDING_JUSTIFICATION',
  /** Included in a statement the Bank approved. Final. */
  JUSTIFIED = 'JUSTIFIED',
  /**
   * A lump sum reported for the contract instead of payment by payment. It
   * counts towards the financial progress but can never enter a statement:
   * the agency that takes this route keeps producing its own statements.
   */
  ACCUMULATED = 'ACCUMULATED',
}

/**
 * Transaction a statement of expenditures generates. The codes are the ones
 * the Bank uses in `TransactionsTypes`, so the statement can hand the request
 * straight to the transactions module.
 *
 * Note DPB, the reimbursement made while the project is running, is not DRP,
 * the retroactive reimbursement of expenses incurred before the loan was
 * signed. Both exist in the catalogue and only DPB belongs here.
 */
export enum ExpenditureStatementType {
  /** Advance of funds and justification in one request. */
  ATJ = 'ATJ',
  /** Justification of an advance the Bank already made. */
  ANJ = 'ANJ',
  /** Reimbursement of expenses the agency paid with its own funds. */
  DPB = 'DPB',
  /** Direct payment to a third party. */
  DPS = 'DPS',
}

/**
 * Which payments each transaction type can carry, decided by the
 * "is this subject to reimbursement by the IDB?" answer on the payment.
 */
export const STATEMENT_REQUIRES_REIMBURSABLE: {
  [type in ExpenditureStatementType]: boolean;
} = {
  [ExpenditureStatementType.ATJ]: false,
  [ExpenditureStatementType.ANJ]: false,
  [ExpenditureStatementType.DPB]: true,
  [ExpenditureStatementType.DPS]: true,
};

/**
 * Types the agency cannot request yet.
 *
 * ATJ carries an advance of funds on top of the justification, and the amount
 * of that advance comes from the financial plan, a module that does not exist
 * yet. It stays on the list because the agency needs to see the catalogue is
 * complete, and it says why it is closed instead of hiding it.
 */
export const STATEMENT_TYPE_UNAVAILABLE: {
  [type in ExpenditureStatementType]?: boolean;
} = {
  [ExpenditureStatementType.ATJ]: true,
};

/**
 * DPS is built the other way round.
 *
 * In a justification or a reimbursement the agency has already paid, so the
 * system sweeps a date range and offers what it finds. In a direct payment the
 * Bank is the one who will pay the third party, so nothing has been paid yet:
 * the agency picks the payments by hand, and they may still be scheduled.
 */
export const STATEMENT_PICKS_PAYMENTS: {
  [type in ExpenditureStatementType]: boolean;
} = {
  [ExpenditureStatementType.ATJ]: false,
  [ExpenditureStatementType.ANJ]: false,
  [ExpenditureStatementType.DPB]: false,
  [ExpenditureStatementType.DPS]: true,
};

/**
 * Types where the Bank pays money out, so the transaction has to name the
 * account that receives it. The account itself is asked for in the
 * transactions module, which already owns that form.
 */
export const STATEMENT_NEEDS_ACCOUNT: {
  [type in ExpenditureStatementType]: boolean;
} = {
  [ExpenditureStatementType.ATJ]: true,
  [ExpenditureStatementType.ANJ]: false,
  [ExpenditureStatementType.DPB]: true,
  [ExpenditureStatementType.DPS]: true,
};

/** An amount together with the currency it is expressed in. */
export interface CurrencyAmount {
  currency: string;
  amount: number;
}

/** One row of the commitments grid. */
export interface Commitment {
  id: string;
  commitmentNumber: string;
  type: CommitmentType;
  componentName: string;
  beneficiaryName: string;
  originalAmounts: CurrencyAmount[];
  currentIdbAmount: number;
}

/**
 * Everything the list screen needs on top of the project balances, which come
 * from the shared `/api/projectBuckets/{id}/balances` endpoint.
 */
export interface PaymentRecordSummary {
  operationNumber: string;
  operationName: string;
  operationStatus: string;
  approvalCurrency: string;
  commitments: Commitment[];
}

/** Header of the commitment detail screen. */
export interface CommitmentDetail extends Commitment {
  /**
   * Where the contract came from, when a procurement process is behind it.
   * The contract page hangs off two identifiers, the plan and the process, so
   * both travel together. Absent for a commitment with no procurement behind
   * it, which has no contract page to open.
   */
  procurement?: { procurementId: string; processId: string };
  country: string;
  effectiveStartDate: string;
  effectiveEndDate: string;
  approvalCurrency: string;
  totalPlannedAmount: number;
  totalCommittedAmount: number;
  idbAmount: number;
  localContributionAmount: number;
  cofinancingAmount: number;
  paidAmount: number;
  pendingAmount: number;
  justifiedAmount: number;
  toJustifyAmount: number;
}

/** Component and output the money is charged to. */
export interface BudgetAllocation {
  componentCode: string;
  componentName: string;
  productCode: string;
  productName: string;
}

/** A component of the loan with the outputs that hang from it. */
export interface ProjectComponent {
  code: string;
  name: string;
  products: Array<{ code: string; name: string }>;
}

/** One reported payment of a commitment. */
export interface CommitmentPayment extends BudgetAllocation {
  id: string;
  commitmentId: string;
  concept: string;
  accountingVoucher: string;
  paymentDate: string;
  currency: string;
  amount: number;
  exchangeRate: number;
  /** `amount` converted to the currency of the contract. */
  equivalentAmount: number;
  status: PaymentRecordStatus;
  country: string;
  beneficiaryName: string;
  idbFinancingAmount: number;
  localFinancingAmount: number;
  cofinancingAmount: number;
  /** True for a lump sum that carries no payment by payment detail. */
  accumulated?: boolean;
  /** Paid by the agency with its own funds and claimed back from the IDB. */
  reimbursable: boolean;
  reimbursementAmount: number;
  /**
   * Statement that already carries this payment, while the Bank decides.
   * Present means the payment is spoken for and cannot enter another
   * statement.
   */
  statementTransactionNumber?: string;
}

/** Totals row of the payments grid, one entry per currency in use. */
export interface PaymentTotal {
  currency: string;
  amount: number;
  equivalentAmount: number;
}

export interface CommitmentPaymentsResponse {
  payments: CommitmentPayment[];
  totals: PaymentTotal[];
}

/** What the API answers when a rule rejects the operation. */
export interface PaymentRecordError {
  code: string;
  message: string;
  params?: { [key: string]: string | number };
}

/** A row of the payment schedule offered by the "add payments" dialog. */
export interface PlannedPayment extends BudgetAllocation {
  number: number;
  concept: string;
  estimatedDate: string;
  currency: string;
  idbAmount: number;
  localContributionAmount: number;
  cofinancingAmount: number;
  paymentAmount: number;
}

export interface PaymentExchangeRate {
  currency: string;
  /** Units of the contract currency per unit of `currency`. */
  rate: number;
  equivalentUsd: number;
}

export interface ExchangeRateSettings {
  rates: PaymentExchangeRate[];
  lastUpdate: string;
}

/**
 * A payment offered in "Ajustar tasa de cambio"'s payment picker. Carries its
 * own commitment number because the picker spans every commitment of the
 * loan, unlike `CommitmentPayment` which is always read inside one
 * commitment's own screen. Never includes a `JUSTIFIED` payment -- once the
 * Bank has approved the statement that carries it, its amount is final.
 */
export interface ExchangeRatePayment extends CommitmentPayment {
  commitmentNumber: string;
}

/** One component of a statement, with the payments charged to it. */
export interface StatementComponent {
  componentCode: string;
  componentName: string;
  payments: CommitmentPayment[];
}

/** Payments that may enter a statement, grouped the way the screen shows them. */
export interface StatementCandidates {
  currency: string;
  components: StatementComponent[];
}

export interface GenerateStatementRequest {
  transactionType: ExpenditureStatementType;
  dateFrom: string;
  dateTo: string;
  paymentIds: string[];
}

export interface GeneratedStatement {
  transactionNumber: string;
  transactionType: ExpenditureStatementType;
  currency: string;
  totalAmount: number;
  paymentsIncluded: number;
}

/** One row the back end parsed out of the uploaded spreadsheet. */
export interface ImportedPaymentRow extends BudgetAllocation {
  rowNumber: number;
  country: string;
  commitmentNumber: string;
  concept: string;
  beneficiaryName: string;
  accountingVoucher: string;
  paymentDate: string;
  currency: string;
  amount: number;
  equivalentAmount: number;
}

/** A row the file cannot be accepted with, and why. */
export interface ImportErrorRow {
  rowNumber: number;
  commitmentNumber: string;
  concept: string;
  beneficiaryName: string;
  accountingVoucher: string;
  paymentDate: string;
  equivalentAmount: number;
}

export interface ImportError {
  code: string;
  message: string;
  rows: ImportErrorRow[];
}

/**
 * Outcome of uploading the spreadsheet. The back end parses and validates it;
 * the dialog only reports what came back.
 */
export interface ImportValidationResult {
  fileName: string;
  rowCount: number;
  /** Rows repeated inside the file. A warning, not a blocker. */
  duplicateRows: number[];
  /** Blocking problems; the file has to be corrected and uploaded again. */
  errors: ImportError[];
  /** Present only when the file passes validation. */
  rows: ImportedPaymentRow[];
  executingAgency: string;
  loanContractNumber: string;
  importedOn: string;
}

/** How the expenses of a contract were funded. */
export enum PaymentMechanism {
  /** IDB financing, local contribution and/or cofinancing. */
  BANK_FUNDS = 'BANK_FUNDS',
  /** The agency paid with its own money and claims it back. */
  OWN_FUNDS = 'OWN_FUNDS',
}

/** Amounts already reported on a commitment, shown before reclassifying. */
export interface CommitmentFundingTotals {
  idbFinancingAmount: number;
  localFinancingAmount: number;
  cofinancingAmount: number;
  currency: string;
}

export interface PaymentMechanismRequest {
  mechanism: PaymentMechanism;
  paymentIds: string[];
}

/** Where the payments added through the dialog come from. */
export enum AddPaymentsSource {
  SCHEDULE = 'SCHEDULE',
  MANUAL = 'MANUAL',
  FILE = 'FILE',
  /** One lump sum per component, with no payment by payment detail. */
  ACCUMULATED = 'ACCUMULATED',
}

/** A single payment typed by hand. */
export interface ManualPaymentRequest extends BudgetAllocation {
  concept: string;
  accountingVoucher: string;
  paymentDate: string;
  currency: string;
  amount: number;
  exchangeRate: number;
  reimbursable: boolean;
}

/** One line of an accumulated report: how much went to a component. */
export interface AccumulatedComponentAmount {
  componentCode: string;
  componentName: string;
  amount: number;
}

/**
 * Financial progress reported as a lump sum up to a cut-off date, broken down
 * by component so the figure stays traceable.
 */
export interface AccumulatedPaymentRequest {
  cutOffDate: string;
  currency: string;
  components: AccumulatedComponentAmount[];
}

/** How much of the contract is already committed in each currency. */
export interface CurrencyCeiling {
  currency: string;
  /** Signed amount of the contract, amendments included. */
  contracted: number;
  reported: number;
  available: number;
}

/**
 * The statement of expenditures splits every amount by who is funding it, and
 * the screen shows the three side by side. They always travel together.
 */
export interface FinancingBreakdown {
  idb: number;
  localContribution: number;
  cofinancing: number;
}

/**
 * Rows of the component table that are not components.
 *
 * The advance line carries what the Bank put up front and has no payments
 * behind it; the pending line is what is registered as paid but has not been
 * sent to the Bank yet. Both come from the balances, not from this statement,
 * so they are shown but never opened.
 */
export enum StatementRowKind {
  COMPONENT = 'COMPONENT',
  ADVANCE = 'ADVANCE',
  PENDING = 'PENDING',
}

/** One line of the "amounts by component" table. */
export interface StatementRow {
  rowNumber: number;
  kind: StatementRowKind;
  componentCode: string;
  componentName: string;
  /** What this statement charges to the component. */
  toJustify: FinancingBreakdown;
  /** What is left to invest once the Bank approves this statement. */
  availableBalance: FinancingBreakdown;
  paymentsSelected: number;
  paymentsTotal: number;
}

export enum StatementDraftStatus {
  /** Built on screen, never saved. */
  NEW = 'NEW',
  /** Saved, so the user can come back to it. */
  DRAFT = 'DRAFT',
  /** A transaction was generated out of it. */
  GENERATED = 'GENERATED',
}

/** The statement being built, as the screen needs it. */
export interface StatementDraft {
  id: string;
  transactionType: ExpenditureStatementType;
  status: StatementDraftStatus;
  dateFrom: string;
  dateTo: string;
  /** Currency the loan was approved in; every amount on the table is in it. */
  approvalCurrency: string;
  rows: StatementRow[];
  totals: {
    toJustify: FinancingBreakdown;
    availableBalance: FinancingBreakdown;
  };
  paymentsSelected: number;
  lastUpdatedOn?: string;
  lastUpdatedBy?: string;
  /** Set once a transaction came out of it. */
  transactionNumber?: string;
  /**
   * Direct payments are picked by hand instead of swept by date, so the screen
   * lists them one by one rather than grouped by component.
   */
  payments?: CommitmentPayment[];
}

/** The drill-down of one component of the statement. */
export interface StatementComponentDetail {
  rowNumber: number;
  componentCode: string;
  componentName: string;
  approvalCurrency: string;
  /** Currency the contracts behind these payments are signed in. */
  contractCurrency: string;
  /** What the component holds today, before this statement. */
  currentAmount: FinancingBreakdown;
  toJustify: FinancingBreakdown;
  availableBalance: FinancingBreakdown;
  payments: CommitmentPayment[];
  selectedPaymentIds: string[];
}

/** A statement already sent, listed under the "previous" tab. */
export interface PreviousStatement {
  transactionNumber: string;
  transactionType: ExpenditureStatementType;
  createdOn: string;
  /** The date the Bank actually valued the transaction, once it has one --
   *  distinct from `createdOn`, when the agency sent it. */
  valueDate?: string;
  createdBy: string;
  currency: string;
  totalAmount: number;
  /** `totalAmount` converted to the loan's approval currency. */
  equivalentAmount: number;
  paymentsIncluded: number;
  /** Mirrors the transaction: draft, waiting on the Bank, or approved. */
  status: 'DRAFT' | 'PENDING_IDB' | 'APPROVED';
}

// ---------------------------------------------------------------------------
// Situation of the executing agency.
//
// The module asks the agency for data and hands nothing back. This is the
// other direction: what the agency can justify today, what is waiting on the
// Bank, what is stuck and why. Nothing here is new data -- it is the same
// payments, read as a position instead of as a ledger.
// ---------------------------------------------------------------------------

/** Why a reported payment cannot travel in a statement yet. */
export enum BlockingReason {
  NO_COMPONENT = 'NO_COMPONENT',
  NO_VOUCHER = 'NO_VOUCHER',
  NO_EXCHANGE_RATE = 'NO_EXCHANGE_RATE',
  OVER_COMPONENT_BALANCE = 'OVER_COMPONENT_BALANCE',
  ACCUMULATED_ONLY = 'ACCUMULATED_ONLY',
}

/** One thing standing between the agency and its next statement. */
export interface SituationBlocker {
  reason: BlockingReason;
  payments: number;
  amount: number;
  /**
   * Where the affected payments live. One entry means one place to go; more
   * than one means the screen has to let the agency choose rather than pick a
   * commitment on its behalf and leave them wondering why they landed there.
   *
   * `commitmentId` is the routable id (what the rest of the module navigates
   * with); `commitmentNumber` is the human-readable code shown on screen --
   * the same split the commitments grid already keeps between a row's link
   * target and its link text.
   */
  commitments: Array<{
    commitmentId: string;
    commitmentNumber: string;
    payments: number;
  }>;
}

/** A figure with the count of payments behind it. */
export interface SituationFigure {
  amount: number;
  payments: number;
  /** Oldest payment in the group, so the delay is visible, not just the sum. */
  oldestDate?: string;
}

/** A commitment about to run out of time. */
export interface SituationDeadline {
  /** Routable id -- see the note on `SituationBlocker.commitments`. */
  commitmentId: string;
  commitmentNumber: string;
  /** Who receives the money, which is how people recognise a contract. */
  beneficiaryName: string;
  componentName: string;
  effectiveEndDate: string;
  daysRemaining: number;
  paidPercent: number;
  elapsedPercent: number;
}

/**
 * Cycle measures rather than volume measures.
 *
 * "Payments loaded this month" counts activity. These count movement: how long
 * money sits before it is claimed, and how much of what was registered ever
 * reaches the Bank.
 */
export interface SituationCycle {
  /** Median days a payment waits between being paid and travelling. */
  medianDaysToTravel: number;
  /** Longest a payment has been sitting reported and unclaimed. */
  longestWaitDays: number;
  /** Share of reported payments that have travelled at least once. */
  travelledPercent: number;
}

export interface ExecutorSituation {
  approvalCurrency: string;
  /** Reported, free, and ready to enter a statement. */
  readyToJustify: SituationFigure;
  /** Carried by a statement the Bank has not ruled on. */
  awaitingBank: SituationFigure;
  /** Reported but held back by something the agency can fix. */
  blocked: SituationFigure;
  blockers: SituationBlocker[];
  deadlines: SituationDeadline[];
  cycle: SituationCycle;
}
