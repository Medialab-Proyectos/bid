import {
  BlockingReason,
  Commitment,
  CommitmentDetail,
  CommitmentPayment,
  CommitmentPaymentsResponse,
  ExecutorSituation,
  PaymentRecordStatus,
  PaymentRecordSummary,
  PreviousStatement,
  SituationBlocker,
  SituationDeadline,
} from '../models/payment-record.model';

/**
 * Turns the same payments the rest of the module already reads -- commitment
 * totals, the payments grid, the previous statements -- into the agency's own
 * position. No field here comes from anywhere new; this only reads what is
 * already reported and adds up differently.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

function daysBetween(from: string | Date, to: string | Date): number {
  const a = new Date(from).getTime();
  const b = new Date(to).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) {
    return 0;
  }
  return Math.round((b - a) / DAY_MS);
}

function sum<T>(items: T[], pick: (item: T) => number): number {
  return items.reduce((total, item) => total + (pick(item) || 0), 0);
}

function oldest(dates: Array<string | undefined>): string | undefined {
  const valid = dates.filter((d): d is string => !!d);
  if (!valid.length) {
    return undefined;
  }
  return valid.reduce((min, d) => (new Date(d) < new Date(min) ? d : min));
}

function median(values: number[]): number {
  if (!values.length) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

/**
 * Which single reason keeps a paid payment from travelling, checked in the
 * order the agency would actually work through it: an amount reported as a
 * lump sum can never be split apart no matter what else is filled in, so that
 * comes first; then the two fields that block the payment outright.
 *
 * Exported so the commitment detail screen can narrow its own list to the
 * exact payments a blocker on "Tu situación" pointed at, instead of sending
 * the agency to an unfiltered table with no sign of what they were sent to
 * find.
 */
export function blockerReasonFor(payment: CommitmentPayment): BlockingReason | null {
  if (payment.accumulated || payment.status === PaymentRecordStatus.ACCUMULATED) {
    return BlockingReason.ACCUMULATED_ONLY;
  }
  if (payment.status !== PaymentRecordStatus.PAID) {
    return null;
  }
  if (!payment.componentCode) {
    return BlockingReason.NO_COMPONENT;
  }
  if (!payment.accountingVoucher) {
    return BlockingReason.NO_VOUCHER;
  }
  if (!payment.exchangeRate) {
    return BlockingReason.NO_EXCHANGE_RATE;
  }
  return null;
}

function groupBlockers(
  entries: Array<{ payment: CommitmentPayment; reason: BlockingReason }>,
  commitmentNumberById: Map<string, string>
): SituationBlocker[] {
  const byReason = new Map<BlockingReason, Array<{ payment: CommitmentPayment }>>();
  for (const entry of entries) {
    const list = byReason.get(entry.reason) ?? [];
    list.push(entry);
    byReason.set(entry.reason, list);
  }

  const blockers: SituationBlocker[] = [];
  for (const [reason, list] of byReason) {
    const paymentsByCommitment = new Map<string, number>();
    for (const { payment } of list) {
      paymentsByCommitment.set(
        payment.commitmentId,
        (paymentsByCommitment.get(payment.commitmentId) ?? 0) + 1
      );
    }
    blockers.push({
      reason,
      amount: sum(list, (e) => e.payment.equivalentAmount),
      payments: list.length,
      commitments: Array.from(paymentsByCommitment.entries()).map(
        ([commitmentId, payments]) => ({
          commitmentId,
          commitmentNumber: commitmentNumberById.get(commitmentId) ?? commitmentId,
          payments,
        })
      ),
    });
  }

  // Most affected first -- the agency's own read of "ordered by how many
  // payments they hold."
  return blockers.sort((a, b) => b.payments - a.payments);
}

export function buildExecutorSituation(
  summary: PaymentRecordSummary,
  details: CommitmentDetail[],
  paymentResponses: CommitmentPaymentsResponse[],
  previousStatements: PreviousStatement[]
): ExecutorSituation {
  const approvalCurrency = summary.approvalCurrency;
  const commitmentNumberById = new Map<string, string>(
    summary.commitments.map((c: Commitment) => [c.id, c.commitmentNumber])
  );
  const statementByNumber = new Map(
    previousStatements.map((s) => [s.transactionNumber, s])
  );

  const allPayments: CommitmentPayment[] = paymentResponses.flatMap(
    (r) => r.payments ?? []
  );

  // ---- ready to justify ---------------------------------------------
  const readyPayments = allPayments.filter(
    (p) => p.status === PaymentRecordStatus.PAID && !blockerReasonFor(p)
  );
  const readyToJustify = {
    amount: sum(readyPayments, (p) => p.equivalentAmount),
    payments: readyPayments.length,
    oldestDate: oldest(readyPayments.map((p) => p.paymentDate)),
  };

  // ---- awaiting the Bank ----------------------------------------------
  const awaitingPayments = allPayments.filter(
    (p) => p.status === PaymentRecordStatus.PENDING_JUSTIFICATION
  );
  const awaitingBank = {
    amount: sum(awaitingPayments, (p) => p.equivalentAmount),
    payments: awaitingPayments.length,
  };

  // ---- blocked ---------------------------------------------------------
  const blockedEntries = allPayments
    .map((p) => ({ payment: p, reason: blockerReasonFor(p) }))
    .filter(
      (e): e is { payment: CommitmentPayment; reason: BlockingReason } =>
        e.reason !== null
    );

  const blocked = {
    amount: sum(blockedEntries, (e) => e.payment.equivalentAmount),
    payments: blockedEntries.length,
  };

  const blockers = groupBlockers(blockedEntries, commitmentNumberById);

  // ---- what runs out first ----------------------------------------------
  const today = new Date();
  const deadlines: SituationDeadline[] = details
    .filter((d) => !!d.effectiveEndDate && !!d.effectiveStartDate)
    .map((d) => {
      const daysRemaining = daysBetween(today, d.effectiveEndDate);
      const totalSpan = daysBetween(d.effectiveStartDate, d.effectiveEndDate);
      const elapsedSpan = daysBetween(d.effectiveStartDate, today);
      const elapsedPercent = totalSpan > 0 ? clampPercent((elapsedSpan / totalSpan) * 100) : 0;
      const paidPercent =
        d.totalPlannedAmount > 0
          ? clampPercent((d.paidAmount / d.totalPlannedAmount) * 100)
          : 0;
      return {
        commitmentId: d.id,
        commitmentNumber: d.commitmentNumber,
        beneficiaryName: d.beneficiaryName,
        componentName: d.componentName,
        effectiveEndDate: d.effectiveEndDate,
        daysRemaining,
        paidPercent: Math.round(paidPercent),
        elapsedPercent: Math.round(elapsedPercent),
      };
    })
    // Only what is actually urgent: past its term, closing within two months,
    // or already lagging the calendar by a wide margin. Everything else is
    // still healthy and does not need a place on this list.
    .filter(
      (d) =>
        d.daysRemaining < 0 ||
        d.daysRemaining <= 60 ||
        d.elapsedPercent - d.paidPercent >= 25
    )
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, 6);

  // ---- how the cycle is moving -------------------------------------------
  const travelled = allPayments.filter(
    (p) =>
      p.status === PaymentRecordStatus.PENDING_JUSTIFICATION ||
      p.status === PaymentRecordStatus.JUSTIFIED
  );
  const reportable = allPayments.filter(
    (p) =>
      p.status === PaymentRecordStatus.PAID ||
      p.status === PaymentRecordStatus.PENDING_JUSTIFICATION ||
      p.status === PaymentRecordStatus.JUSTIFIED
  );
  const travelDays = travelled
    .map((p) => {
      const statement = p.statementTransactionNumber
        ? statementByNumber.get(p.statementTransactionNumber)
        : null;
      return statement ? daysBetween(p.paymentDate, statement.createdOn) : null;
    })
    .filter((d): d is number => d !== null && d >= 0);

  const cycle = {
    medianDaysToTravel: median(travelDays),
    longestWaitDays: readyPayments.length
      ? Math.max(...readyPayments.map((p) => daysBetween(p.paymentDate, today)))
      : 0,
    travelledPercent: reportable.length
      ? Math.round((travelled.length / reportable.length) * 100)
      : 0,
  };

  return {
    approvalCurrency,
    readyToJustify,
    awaitingBank,
    blocked,
    blockers,
    deadlines,
    cycle,
  };
}
