import { demoError } from '../demo-backend.routes';
import { DEMO_OPERATIONS } from './demo-projects';

/**
 * Demo data for the payment record module.
 *
 * Unlike the rest of the demo backend this file keeps mutable state: adding,
 * editing and deleting payments has to survive within the session, otherwise
 * the flow of the screens cannot be shown. State lives in memory only and is
 * lost on reload.
 */

const day = 24 * 60 * 60 * 1000;
const daysAgo = (days: number): string =>
  new Date(Date.now() - days * day).toISOString();

const inDays = (days: number): string =>
  new Date(Date.now() + days * day).toISOString();

const operationOf = (projectBucketId: string) =>
  DEMO_OPERATIONS.find((item) => item.id === projectBucketId) ??
  DEMO_OPERATIONS[0];

const COMPONENTS = [
  '1- Strengthening of tax and financial administration',
  '2- Installation and strengthening of capacities',
  '3- Improvement of the service network',
  '4- Sustainability of the delivered services',
];

/** Components and outputs of the loan; every payment is charged to one pair. */
const PROJECT_COMPONENTS = [
  {
    code: 'C1',
    name: '1- Strengthening of tax and financial administration',
    products: [
      { code: 'C1-P1', name: 'Tax administration software' },
      { code: 'C1-P2', name: 'Staff training' },
    ],
  },
  {
    code: 'C2',
    name: '2- Installation and strengthening of capacities',
    products: [
      { code: 'C2-P1', name: 'Equipment and supplies' },
      { code: 'C2-P2', name: 'Technical assistance' },
    ],
  },
  {
    code: 'C3',
    name: '3- Improvement of the service network',
    products: [
      { code: 'C3-P1', name: 'Civil works' },
      { code: 'C3-P2', name: 'Supervision' },
    ],
  },
];

const allocationFor = (index: number) => {
  const component = PROJECT_COMPONENTS[index % PROJECT_COMPONENTS.length];
  const product = component.products[index % component.products.length];
  return {
    componentCode: component.code,
    componentName: component.name,
    productCode: product.code,
    productName: product.name,
  };
};

const BENEFICIARIES = [
  'Maria Perez',
  'Julio Cardenaz',
  'Lilia Florez',
  'Arturo Ventura',
];

interface CommitmentSeed {
  suffix: string;
  type: 'CONTRACT' | 'NON_PROCUREMENT';
  component: number;
  beneficiary: number;
  amounts: Array<{ currency: string; amount: number }>;
  currentIdbAmount: number;
}

const COMMITMENT_SEEDS: CommitmentSeed[] = [
  {
    suffix: 'P00123-C01',
    type: 'CONTRACT',
    component: 0,
    beneficiary: 0,
    amounts: [{ currency: 'COP', amount: 9543145.75 }],
    currentIdbAmount: 2862.94,
  },
  {
    suffix: 'P00123-C02',
    type: 'CONTRACT',
    component: 1,
    beneficiary: 1,
    amounts: [{ currency: 'USD', amount: 100000 }],
    currentIdbAmount: 100000,
  },
  {
    suffix: 'P00124-C01',
    type: 'CONTRACT',
    component: 3,
    beneficiary: 2,
    amounts: [
      { currency: 'USD', amount: 257000 },
      { currency: 'COP', amount: 2111060353.85 },
    ],
    currentIdbAmount: 890318.11,
  },
  {
    suffix: '09919',
    type: 'NON_PROCUREMENT',
    component: 0,
    beneficiary: 3,
    amounts: [{ currency: 'USD', amount: 21000 }],
    currentIdbAmount: 21000,
  },
];

const commitmentId = (projectBucketId: string, suffix: string): string => {
  const operation = operationOf(projectBucketId);
  return `${operation.project}-${suffix}`;
};

function buildCommitment(projectBucketId: string, seed: CommitmentSeed) {
  const operation = operationOf(projectBucketId);
  const id = commitmentId(projectBucketId, seed.suffix);
  const total = seed.amounts[0].amount;

  return {
    id,
    commitmentNumber: id,
    type: seed.type,
    // A contract carries where it came from, so the payment record can send
    // the user to it. The ids follow the shape the demo procurement data uses,
    // so the link lands on a process that exists. A non-procurement commitment
    // has no such page.
    procurement:
      seed.type === 'CONTRACT'
        ? {
            procurementId: `plan-${projectBucketId}`,
            processId: `plan-${projectBucketId}-process-${seed.component + 1}`,
          }
        : undefined,
    componentName: COMPONENTS[seed.component],
    beneficiaryName: BENEFICIARIES[seed.beneficiary],
    originalAmounts: seed.amounts,
    currentIdbAmount: seed.currentIdbAmount,
    country: operation.countryCode,
    effectiveStartDate: daysAgo(600),
    effectiveEndDate: inDays(130),
    // Not derived from `seed.amounts` -- that list is the commitment's own
    // breakdown by funding source (IDB in USD, local counterpart in COP for
    // one of these), not its approval currency. Taking the last entry's
    // currency happened to pick COP for that one commitment, which is not
    // what any real commitment's approval currency actually is.
    approvalCurrency: DEMO_APPROVAL_CURRENCY,
    totalPlannedAmount: 100000,
    totalCommittedAmount: 21000,
    idbAmount: 21000,
    localContributionAmount: 0,
    cofinancingAmount: 0,
    paidAmount: 2000,
    pendingAmount: 19000,
    justifiedAmount: 1000,
    toJustifyAmount: 1000,
    projectBucketId,
    total,
  };
}

/** projectBucketId -> commitments. Built once per project on first access. */
const commitmentsByProject = new Map<string, ReturnType<typeof buildCommitment>[]>();

function commitmentsOf(projectBucketId: string) {
  if (!commitmentsByProject.has(projectBucketId)) {
    commitmentsByProject.set(
      projectBucketId,
      COMMITMENT_SEEDS.map((seed) => buildCommitment(projectBucketId, seed))
    );
  }
  return commitmentsByProject.get(projectBucketId);
}

function findCommitment(id: string) {
  for (const projectBucketId of commitmentsByProject.keys()) {
    const match = commitmentsByProject
      .get(projectBucketId)
      .find((commitment) => commitment.id === id);
    if (match) {
      return match;
    }
  }

  // Deep link straight into a commitment: seed the project it belongs to.
  for (const operation of DEMO_OPERATIONS) {
    const match = commitmentsOf(operation.id).find(
      (commitment) => commitment.id === id
    );
    if (match) {
      return match;
    }
  }
  return null;
}

interface DemoPayment {
  id: string;
  commitmentId: string;
  componentCode: string;
  componentName: string;
  productCode: string;
  productName: string;
  concept: string;
  accountingVoucher: string;
  paymentDate: string;
  currency: string;
  amount: number;
  exchangeRate: number;
  equivalentAmount: number;
  status: string;
  country: string;
  beneficiaryName: string;
  idbFinancingAmount: number;
  localFinancingAmount: number;
  cofinancingAmount: number;
  accumulated?: boolean;
  reimbursable: boolean;
  reimbursementAmount: number;
  statementTransactionNumber?: string;
}

const paymentsByCommitment = new Map<string, DemoPayment[]>();

function seedPayments(id: string): DemoPayment[] {
  const commitment = findCommitment(id);
  const beneficiary = commitment ? commitment.beneficiaryName : 'Demo User';
  const country = commitment ? commitment.country : 'CO';

  // Payments are drawn from the currencies of the contract and sized so ten of
  // them stay well inside the ceiling; otherwise the currency rule would reject
  // every new entry on a commitment that starts out already overdrawn.
  const contracted = commitment
    ? commitment.originalAmounts
    : [{ currency: 'USD', amount: 400000 }];

  return Array.from({ length: 10 }, (_value, index) => {
    const position = index + 1;
    const slot = contracted[index % contracted.length];
    const currency = slot.currency;
    const amount = Math.round((slot.amount / 40) * 100) / 100;
    const rate = currency === 'USD' ? 1 : 0.0003;

    // The first two are history: already reported and already justified to the
    // Bank, so the statement screen has something it must refuse to reuse.
    const alreadyJustified = position <= 2;
    const reported = position <= 5;

    return {
      // Unique across the loan, and shaped the way the design shows it:
      // the commitment plus the payment. Repeating `I001` under every
      // commitment made two different payments share one identity.
      id: `${id}-I${String(position).padStart(3, '0')}`,
      commitmentId: id,
      ...allocationFor(position),
      concept: `Networking ${String(position).padStart(2, '0')}`,
      accountingVoucher: reported ? `2023${String(position).padStart(3, '0')}` : '',
      paymentDate: daysAgo(420 - position * 30),
      currency,
      amount,
      exchangeRate: rate,
      equivalentAmount: Math.round(amount * rate * 100) / 100,
      status: alreadyJustified ? 'JUSTIFIED' : reported ? 'PAID' : 'SCHEDULED',
      country,
      beneficiaryName: beneficiary,
      // Split across the three sources of funds, so the statement table has
      // something to show in each column. Every third payment carries local
      // contribution and every fifth carries cofinancing, which is roughly how
      // a real portfolio looks.
      idbFinancingAmount: Math.round(amount * rate * 0.85 * 100) / 100,
      localFinancingAmount:
        position % 3 === 0 ? Math.round(amount * rate * 0.1 * 100) / 100 : 0,
      cofinancingAmount:
        position % 5 === 0 ? Math.round(amount * rate * 0.05 * 100) / 100 : 0,
      // Half of them travel as reimbursement, so both statement branches have
      // candidates to show.
      reimbursable: position % 2 === 0,
      reimbursementAmount: 0,
      statementTransactionNumber: alreadyJustified ? 'ODTR-100900' : undefined,
    };
  });
}

function paymentsOf(id: string): DemoPayment[] {
  if (!paymentsByCommitment.has(id)) {
    paymentsByCommitment.set(id, seedPayments(id));
  }
  return paymentsByCommitment.get(id);
}

function totalsOf(payments: DemoPayment[]) {
  const byCurrency = new Map<string, { amount: number; equivalent: number }>();

  payments.forEach((payment) => {
    const current = byCurrency.get(payment.currency) ?? {
      amount: 0,
      equivalent: 0,
    };
    current.amount += payment.amount;
    current.equivalent += payment.equivalentAmount;
    byCurrency.set(payment.currency, current);
  });

  return [...byCurrency.entries()].map(([currency, totals]) => ({
    currency,
    amount: Math.round(totals.amount * 100) / 100,
    equivalentAmount: Math.round(totals.equivalent * 100) / 100,
  }));
}

const paymentsResponse = (id: string) => {
  const payments = paymentsOf(id);
  return { payments, totals: totalsOf(payments) };
};

/** `GET /api/v3/payment-records/{projectBucketId}/commitments`. */
export function buildDemoPaymentRecordSummary(projectBucketId: string) {
  const operation = operationOf(projectBucketId);
  return {
    operationNumber: operation.project,
    operationName: operation.projectName.en,
    operationStatus: 'Disbursement',
    approvalCurrency: 'USD',
    commitments: commitmentsOf(projectBucketId),
  };
}

/** `GET /api/v3/payment-records/commitments/{id}`. */
export function buildDemoCommitment(id: string) {
  return findCommitment(id) ?? buildCommitment(DEMO_OPERATIONS[0].id, COMMITMENT_SEEDS[0]);
}

/** `GET /api/v3/payment-records/commitments/{id}/payments`. */
export function buildDemoCommitmentPayments(id: string) {
  return paymentsResponse(id);
}

/** `GET /api/v3/payment-records/commitments/{id}/planned-payments`. */
export function buildDemoPlannedPayments(id: string) {
  const reported = paymentsOf(id).length;

  return Array.from({ length: 5 }, (_value, index) => {
    const position = reported + index + 1;
    const isLocal = index === 3;
    return {
      number: position,
      ...allocationFor(position),
      concept: `Networking ${String(position).padStart(2, '0')}`,
      estimatedDate: daysAgo(120 - index * 30),
      currency: isLocal ? 'COP' : 'USD',
      idbAmount: isLocal ? 2111060353.85 : 100000000 / (index + 1),
      localContributionAmount: index % 2 === 1 ? 50000000 : 0,
      cofinancingAmount: 0,
      paymentAmount: isLocal ? 657021.11 : 100000000 / (index + 1),
    };
  });
}

/** `POST /api/v3/payment-records/commitments/{id}/payments`. */
export function addDemoPayments(id: string, body: unknown) {
  const payload = (body ?? {}) as { payments?: Array<Record<string, unknown>> };
  const incoming = payload.payments ?? [];
  const payments = paymentsOf(id);
  const commitment = findCommitment(id);

  incoming.forEach((planned, index) => {
    const position = payments.length + index + 1;
    const amount = Number(planned.paymentAmount) || 0;
    const currency = String(planned.currency ?? 'USD');
    const rate = currency === 'USD' ? 1 : 0.0003;

    payments.push({
      // Unique across the loan, and shaped the way the design shows it:
      // the commitment plus the payment. Repeating `I001` under every
      // commitment made two different payments share one identity.
      id: `${id}-I${String(position).padStart(3, '0')}`,
      commitmentId: id,
      componentCode: String(planned.componentCode ?? ''),
      componentName: String(planned.componentName ?? ''),
      productCode: String(planned.productCode ?? ''),
      productName: String(planned.productName ?? ''),
      concept: String(planned.concept ?? ''),
      accountingVoucher: '',
      paymentDate: String(planned.estimatedDate ?? new Date().toISOString()),
      currency,
      amount,
      exchangeRate: rate,
      equivalentAmount: Math.round(amount * rate * 100) / 100,
      status: 'SCHEDULED',
      country: commitment ? commitment.country : 'CO',
      beneficiaryName: commitment ? commitment.beneficiaryName : 'Demo User',
      idbFinancingAmount: Number(planned.idbAmount) || 0,
      localFinancingAmount: Number(planned.localContributionAmount) || 0,
      cofinancingAmount: Number(planned.cofinancingAmount) || 0,
      reimbursable: false,
      reimbursementAmount: 0,
    });
  });

  return paymentsResponse(id);
}

/**
 * `PUT /api/v3/payment-records/payments/{paymentId}`.
 *
 * A payment that carries an accounting voucher counts as actually paid, which
 * is what flips the row to the green "Pagado" badge.
 */
export function updateDemoPayment(paymentId: string, body: unknown) {
  const updated = (body ?? {}) as Partial<DemoPayment>;
  const id = updated.commitmentId ?? '';
  const payments = paymentsOf(id);
  const index = payments.findIndex((payment) => payment.id === paymentId);

  if (index >= 0) {
    const merged = { ...payments[index], ...updated } as DemoPayment;
    merged.status = merged.accountingVoucher ? 'PAID' : 'SCHEDULED';
    merged.equivalentAmount =
      Math.round(merged.amount * merged.exchangeRate * 100) / 100;
    payments[index] = merged;
  }

  return paymentsResponse(id);
}

/** `DELETE /api/v3/payment-records/payments/{paymentId}`. */
export function deleteDemoPayment(paymentId: string) {
  for (const id of paymentsByCommitment.keys()) {
    const payments = paymentsByCommitment.get(id);
    const index = payments.findIndex((payment) => payment.id === paymentId);
    if (index >= 0) {
      payments.splice(index, 1);
      return paymentsResponse(id);
    }
  }
  return { payments: [], totals: [] };
}

interface DemoRate {
  currency: string;
  rate: number;
  equivalentUsd: number;
}

const ratesByProject = new Map<string, DemoRate[]>();
const lastRateUpdate = new Map<string, string>();

const DEFAULT_RATES: DemoRate[] = [
  { currency: 'COP', rate: 0.0003, equivalentUsd: 3333.33 },
  { currency: 'EUR', rate: 1.0871, equivalentUsd: 0.9199 },
  { currency: 'BRL', rate: 0.1842, equivalentUsd: 5.4289 },
];

/** `GET /api/v3/payment-records/{projectBucketId}/exchange-rates`. */
export function buildDemoExchangeRates(projectBucketId: string) {
  if (!ratesByProject.has(projectBucketId)) {
    ratesByProject.set(
      projectBucketId,
      DEFAULT_RATES.map((rate) => ({ ...rate }))
    );
    lastRateUpdate.set(projectBucketId, daysAgo(30));
  }

  return {
    rates: ratesByProject.get(projectBucketId),
    lastUpdate: lastRateUpdate.get(projectBucketId),
  };
}

/**
 * `GET /api/v3/payment-records/{projectBucketId}/exchange-rate-payments`.
 *
 * Every payment of the loan a new rate could apply to, across every
 * commitment -- never a `JUSTIFIED` one, whose amount the Bank has already
 * approved and a later rate change can no longer reopen.
 */
export function buildDemoExchangeRatePayments(projectBucketId: string) {
  const rows: Array<DemoPayment & { commitmentNumber: string }> = [];
  commitmentsOf(projectBucketId).forEach((commitment) => {
    paymentsOf(commitment.id).forEach((payment) => {
      if (payment.status !== 'JUSTIFIED') {
        rows.push({ ...payment, commitmentNumber: commitment.commitmentNumber });
      }
    });
  });
  return rows;
}

/**
 * `PUT /api/v3/payment-records/{projectBucketId}/exchange-rates`.
 *
 * Saving rates recalculates the equivalent amount of `paymentIds` only --
 * the picker step ahead of this one already left `JUSTIFIED` payments out,
 * but the check is repeated here too: nothing reopens an amount the Bank has
 * already approved, no matter what the picker sent.
 */
export function saveDemoExchangeRates(projectBucketId: string, body: unknown) {
  const payload = (body ?? {}) as {
    rates?: DemoRate[];
    paymentIds?: string[];
  };
  const rates = (payload.rates ?? []).map((rate) => ({ ...rate }));
  const paymentIds = new Set(payload.paymentIds ?? []);

  ratesByProject.set(projectBucketId, rates);
  lastRateUpdate.set(projectBucketId, new Date().toISOString());

  const byCurrency = new Map(rates.map((rate) => [rate.currency, rate.rate]));
  paymentsByCommitment.forEach((payments) => {
    payments.forEach((payment) => {
      if (
        paymentIds.has(payment.id) &&
        payment.status !== 'JUSTIFIED' &&
        byCurrency.has(payment.currency)
      ) {
        payment.exchangeRate = byCurrency.get(payment.currency);
        payment.equivalentAmount =
          Math.round(payment.amount * payment.exchangeRate * 100) / 100;
      }
    });
  });

  return {
    rates,
    lastUpdate: lastRateUpdate.get(projectBucketId),
  };
}

/** `GET /api/v3/payment-records/{projectBucketId}/components`. */
export function buildDemoProjectComponents() {
  return PROJECT_COMPONENTS;
}

/** Payments each statement type may carry, by the reimbursement answer. */
const STATEMENT_REQUIRES_REIMBURSABLE: { [type: string]: boolean } = {
  ANJ: false,
  DPB: true,
  DPS: true,
};

let statementSequence = 900;

/**
 * `GET /api/v3/payment-records/{id}/expenditure-statements/candidates`.
 *
 * Sweeps every commitment of the loan, not just one: the statement is built at
 * loan level. A payment qualifies when it is reported as paid, falls in the
 * range, is not already justified nor carried by another statement, and its
 * reimbursement flag matches the transaction type.
 */
export function buildDemoStatementCandidates(
  projectBucketId: string,
  transactionType: string,
  dateFrom: string,
  dateTo: string
) {
  const from = new Date(dateFrom).getTime();
  const to = new Date(dateTo).getTime();
  const wantsReimbursable = STATEMENT_REQUIRES_REIMBURSABLE[transactionType];

  const grouped = new Map<string, { name: string; payments: DemoPayment[] }>();

  commitmentsOf(projectBucketId).forEach((commitment) => {
    paymentsOf(commitment.id)
      .filter((payment) => {
        const paidOn = new Date(payment.paymentDate).getTime();
        return (
          payment.status === 'PAID' &&
          !payment.statementTransactionNumber &&
          paidOn >= from &&
          paidOn <= to &&
          payment.reimbursable === wantsReimbursable
        );
      })
      .forEach((payment) => {
        const entry = grouped.get(payment.componentCode) ?? {
          name: payment.componentName,
          payments: [],
        };
        entry.payments.push(payment);
        grouped.set(payment.componentCode, entry);
      });
  });

  return {
    currency: 'USD',
    components: [...grouped.entries()].map(([componentCode, entry]) => ({
      componentCode,
      componentName: entry.name,
      payments: entry.payments,
    })),
  };
}

/**
 * `POST /api/v3/payment-records/{id}/expenditure-statements`.
 *
 * Creates the transaction and stamps it on every payment it carries. The
 * payments stay PAID: they only become JUSTIFIED once the Bank approves that
 * transaction, which happens in the transactions flow.
 */
export function generateDemoStatement(projectBucketId: string, body: unknown) {
  const request = (body ?? {}) as {
    transactionType?: string;
    paymentIds?: string[];
  };
  const ids = new Set(request.paymentIds ?? []);
  const transactionNumber = `ODTR-${++statementSequence}`;

  let total = 0;
  let included = 0;

  commitmentsOf(projectBucketId).forEach((commitment) => {
    paymentsOf(commitment.id).forEach((payment) => {
      if (!ids.has(payment.id) || payment.statementTransactionNumber) {
        return;
      }
      payment.statementTransactionNumber = transactionNumber;
      // Spoken for, but not justified: the Bank has not ruled on it yet.
      if (payment.status === 'PAID' || payment.status === 'SCHEDULED') {
        payment.status = 'PENDING_JUSTIFICATION';
      }
      total += payment.equivalentAmount;
      included++;
    });
  });

  const statement = {
    transactionNumber,
    transactionType: request.transactionType ?? 'ANJ',
    currency: 'USD',
    totalAmount: Math.round(total * 100) / 100,
    paymentsIncluded: included,
  };
  recordDemoStatement(projectBucketId, statement);
  return statement;
}

const TEMPLATE_COLUMNS = [
  'Nro. de pago',
  'Componente',
  'Producto',
  'Concepto de gasto o pago',
  'N. del comprobante contable',
  'Fecha de pago (dd/mm/aaaa)',
  'Moneda',
  'Monto de gasto o pago',
  'Monto BID',
  'Monto Aporte Local',
  'Monto de cofinanciamiento',
];

/**
 * `GET .../commitments/{id}/payments/import/template`.
 *
 * The real template is a spreadsheet carrying the components and outputs of the
 * loan as dropdowns; the demo serves the same columns as CSV so the download
 * works without a spreadsheet library.
 */
export function buildDemoImportTemplate() {
  const example = [
    '1',
    PROJECT_COMPONENTS[0].code,
    PROJECT_COMPONENTS[0].products[0].code,
    '',
    '',
    '',
    'USD',
    '',
    '',
    '',
    '',
  ];
  const lines = [TEMPLATE_COLUMNS.join(';'), example.join(';'), ''];

  return new Blob([lines.join(String.fromCharCode(10))], {
    type: 'text/csv;charset=utf-8',
  });
}

/** Rows the demo pretends to have read out of the uploaded spreadsheet. */
function buildImportedRows(commitmentId: string) {
  const commitment = findCommitment(commitmentId);
  const country = commitment ? commitment.country : 'CO';

  const slot = commitment
    ? commitment.originalAmounts[0]
    : { currency: 'USD', amount: 400000 };

  return Array.from({ length: 155 }, (_value, index) => {
    const rowNumber = index + 1;
    const amount = Math.round((slot.amount / 4000) * 100) / 100;
    return {
      rowNumber,
      country,
      commitmentNumber: commitmentId,
      ...allocationFor(rowNumber),
      concept: `Networking ${String(rowNumber + 11).padStart(2, '0')}`,
      beneficiaryName: commitment ? commitment.beneficiaryName : 'Demo User',
      accountingVoucher: String(900000000 + rowNumber * 137),
      paymentDate: daysAgo(300 - (rowNumber % 60) * 3),
      currency: slot.currency,
      amount,
      equivalentAmount: amount,
    };
  });
}

/** Commitments whose file has already been rejected once. */
const importAttempts = new Set<string>();
const importedRowsByCommitment = new Map<
  string,
  ReturnType<typeof buildImportedRows>
>();

/**
 * `POST .../commitments/{id}/payments/import`.
 *
 * The first upload comes back with the validation report the design shows;
 * uploading again stands for the corrected file and is accepted. The real back
 * end decides by parsing; the demo only needs both paths to be reachable.
 */
export function importDemoPayments(commitmentId: string) {
  const commitment = findCommitment(commitmentId);
  const firstAttempt = !importAttempts.has(commitmentId);
  importAttempts.add(commitmentId);

  const base = {
    fileName: 'pagos.xlsx',
    rowCount: 155,
    executingAgency: commitment
      ? commitment.beneficiaryName
      : 'Executing agency',
    loanContractNumber: commitment ? commitment.commitmentNumber : '',
    importedOn: new Date().toISOString(),
  };

  if (firstAttempt) {
    const failing = [1, 15, 22, 58, 120].map((rowNumber) => ({
      rowNumber,
      commitmentNumber: commitmentId,
      concept: rowNumber === 15 ? '' : 'Lorem ipsum dolor sit amet',
      beneficiaryName: rowNumber === 1 ? '' : 'Andrea Monroy',
      accountingVoucher: rowNumber === 22 ? '' : String(12345670 + rowNumber),
      paymentDate: rowNumber === 120 ? '21 Set 20221' : '21 Set 2022',
      equivalentAmount: rowNumber === 58 ? 0 : 953000126.21,
    }));

    return {
      ...base,
      duplicateRows: [4, 19, 37, 88, 141],
      errors: [
        {
          code: 'MISSING_DATA',
          message: 'PAYMENT_RECORD.IMPORT.ERRORS.MISSING_DATA',
          rows: failing,
        },
      ],
      rows: [],
    };
  }

  const rows = buildImportedRows(commitmentId);
  importedRowsByCommitment.set(commitmentId, rows);

  return { ...base, duplicateRows: [], errors: [], rows };
}

/** `POST .../commitments/{id}/payments/import/confirm`. */
export function confirmDemoImportedPayments(
  commitmentId: string,
  body: unknown
) {
  const request = (body ?? {}) as { rowNumbers?: number[] };
  const wanted = new Set(request.rowNumbers ?? []);
  const imported = importedRowsByCommitment.get(commitmentId) ?? [];
  const payments = paymentsOf(commitmentId);

  imported
    .filter((row) => wanted.has(row.rowNumber))
    .forEach((row, index) => {
      const position = payments.length + index + 1;
      payments.push({
        id: `${commitmentId}-I${String(position).padStart(3, '0')}`,
        commitmentId,
        componentCode: row.componentCode,
        componentName: row.componentName,
        productCode: row.productCode,
        productName: row.productName,
        concept: row.concept,
        accountingVoucher: row.accountingVoucher,
        paymentDate: row.paymentDate,
        currency: row.currency,
        amount: row.amount,
        exchangeRate: 1,
        equivalentAmount: row.equivalentAmount,
        // An imported row carries its accounting evidence, so it arrives
        // reported as paid rather than merely scheduled.
        status: 'PAID',
        country: row.country,
        beneficiaryName: row.beneficiaryName,
        idbFinancingAmount: row.amount,
        localFinancingAmount: 0,
        cofinancingAmount: 0,
        reimbursable: false,
        reimbursementAmount: 0,
      });
    });

  return paymentsResponse(commitmentId);
}

/** `GET .../commitments/{id}/funding-totals`. */
export function buildDemoFundingTotals(commitmentId: string) {
  const payments = paymentsOf(commitmentId);
  const sum = (pick: (payment: DemoPayment) => number) =>
    Math.round(payments.reduce((total, p) => total + pick(p), 0) * 100) / 100;

  return {
    idbFinancingAmount: sum((p) => p.idbFinancingAmount),
    localFinancingAmount: sum((p) => p.localFinancingAmount),
    cofinancingAmount: sum((p) => p.cofinancingAmount),
    currency: 'USD',
  };
}

/**
 * `PUT .../commitments/{id}/payment-mechanism`.
 *
 * Own funds means the agency will claim the money back, which is the same flag
 * the per-payment question sets and what the statement screen filters on.
 */
export function saveDemoPaymentMechanism(commitmentId: string, body: unknown) {
  const request = (body ?? {}) as {
    mechanism?: string;
    paymentIds?: string[];
  };
  const ownFunds = request.mechanism === 'OWN_FUNDS';
  const selected = new Set(request.paymentIds ?? []);

  paymentsOf(commitmentId).forEach((payment) => {
    if (payment.status !== 'PAID' || !selected.has(payment.id)) {
      return;
    }
    payment.reimbursable = ownFunds;
    payment.reimbursementAmount = ownFunds ? payment.equivalentAmount : 0;
  });

  return paymentsResponse(commitmentId);
}

/**
 * How much each currency of the contract still admits.
 *
 * A contract is signed in up to four currencies and the reported payments must
 * never exceed what was signed in each of them, amendments included.
 */
export function buildDemoCurrencyCeilings(commitmentId: string) {
  const commitment = findCommitment(commitmentId);
  const payments = paymentsOf(commitmentId);
  const contracted = commitment ? commitment.originalAmounts : [];

  return contracted.map((entry) => {
    const reported = payments
      .filter((payment) => payment.currency === entry.currency)
      .reduce((total, payment) => total + payment.amount, 0);

    return {
      currency: entry.currency,
      contracted: entry.amount,
      reported: Math.round(reported * 100) / 100,
      available: Math.round((entry.amount - reported) * 100) / 100,
    };
  });
}

/** Rejects an amount that would push a currency past what was signed. */
function ceilingBreach(
  commitmentId: string,
  currency: string,
  amount: number,
  ignorePaymentId?: string
) {
  const commitment = findCommitment(commitmentId);
  const contracted = commitment
    ? commitment.originalAmounts.find((entry) => entry.currency === currency)
    : null;

  if (!contracted) {
    return {
      code: 'CURRENCY_NOT_IN_CONTRACT',
      message: 'PAYMENT_RECORD.ERRORS.CURRENCY_NOT_IN_CONTRACT',
      params: { currency },
    };
  }

  const reported = paymentsOf(commitmentId)
    .filter(
      (payment) =>
        payment.currency === currency && payment.id !== ignorePaymentId
    )
    .reduce((total, payment) => total + payment.amount, 0);

  if (reported + amount > contracted.amount) {
    return {
      code: 'CURRENCY_CEILING_EXCEEDED',
      message: 'PAYMENT_RECORD.ERRORS.CURRENCY_CEILING_EXCEEDED',
      params: {
        currency,
        available: Math.round((contracted.amount - reported) * 100) / 100,
      },
    };
  }

  return null;
}

/** `POST .../commitments/{id}/payments/manual`. */
export function addDemoManualPayment(commitmentId: string, body: unknown) {
  const input = (body ?? {}) as Record<string, unknown>;
  const currency = String(input.currency ?? 'USD');
  const amount = Number(input.amount) || 0;

  const breach = ceilingBreach(commitmentId, currency, amount);
  if (breach) {
    return demoError(409, breach);
  }

  const payments = paymentsOf(commitmentId);
  const commitment = findCommitment(commitmentId);
  const rate = Number(input.exchangeRate) || 1;
  const position = payments.length + 1;

  payments.push({
    id: `${commitmentId}-I${String(position).padStart(3, '0')}`,
    commitmentId,
    componentCode: String(input.componentCode ?? ''),
    componentName: String(input.componentName ?? ''),
    productCode: String(input.productCode ?? ''),
    productName: String(input.productName ?? ''),
    concept: String(input.concept ?? ''),
    accountingVoucher: String(input.accountingVoucher ?? ''),
    paymentDate: String(input.paymentDate ?? new Date().toISOString()),
    currency,
    amount,
    exchangeRate: rate,
    equivalentAmount: Math.round(amount * rate * 100) / 100,
    status: 'PAID',
    country: commitment ? commitment.country : 'CO',
    beneficiaryName: commitment ? commitment.beneficiaryName : 'Demo User',
    // Falls back to the old assumption (100% BID) only when the form left
    // the split out entirely -- once it is filled in, that is what actually
    // gets saved instead of a number nobody typed.
    idbFinancingAmount:
      input.idbFinancingAmount != null ? Number(input.idbFinancingAmount) : amount,
    localFinancingAmount: Number(input.localFinancingAmount) || 0,
    cofinancingAmount: Number(input.cofinancingAmount) || 0,
    reimbursable: Boolean(input.reimbursable),
    reimbursementAmount: 0,
  });

  return paymentsResponse(commitmentId);
}

/**
 * `POST .../commitments/{id}/payments/accumulated`.
 *
 * One record per component, marked as accumulated. These count towards the
 * financial progress of the contract but never enter a statement: the agency
 * that reports this way keeps producing its statements outside the portal.
 */
export function addDemoAccumulatedPayment(commitmentId: string, body: unknown) {
  const request = (body ?? {}) as {
    cutOffDate?: string;
    currency?: string;
    components?: Array<{
      componentCode?: string;
      componentName?: string;
      amount?: number;
    }>;
  };

  const currency = String(request.currency ?? 'USD');
  const lines = (request.components ?? []).filter(
    (line) => Number(line.amount) > 0
  );
  const total = lines.reduce((sum, line) => sum + Number(line.amount), 0);

  const breach = ceilingBreach(commitmentId, currency, total);
  if (breach) {
    return demoError(409, breach);
  }

  const payments = paymentsOf(commitmentId);
  const commitment = findCommitment(commitmentId);
  const cutOffDate = String(request.cutOffDate ?? new Date().toISOString());

  lines.forEach((line, index) => {
    const position = payments.length + index + 1;
    const amount = Number(line.amount);

    payments.push({
      id: `A${String(position).padStart(3, '0')}`,
      commitmentId,
      componentCode: String(line.componentCode ?? ''),
      componentName: String(line.componentName ?? ''),
      productCode: '',
      productName: '',
      concept: 'PAYMENT_RECORD.ACCUMULATED.CONCEPT',
      accountingVoucher: '',
      paymentDate: cutOffDate,
      currency,
      amount,
      exchangeRate: 1,
      equivalentAmount: amount,
      status: 'ACCUMULATED',
      country: commitment ? commitment.country : 'CO',
      beneficiaryName: commitment ? commitment.beneficiaryName : 'Demo User',
      idbFinancingAmount: amount,
      localFinancingAmount: 0,
      cofinancingAmount: 0,
      accumulated: true,
      reimbursable: false,
      reimbursementAmount: 0,
    });
  });

  return paymentsResponse(commitmentId);
}

// ---------------------------------------------------------------------------
// Statement of expenditures.
//
// The statement is built at loan level and lives across two screens: the
// amounts by component, and the drill-down where the user drops payments that
// should not be sent yet. It has to survive that round trip, so the draft is
// kept here in memory, one per project.
// ---------------------------------------------------------------------------

interface DemoBreakdown {
  idb: number;
  localContribution: number;
  cofinancing: number;
}

interface DemoDraft {
  id: string;
  transactionType: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  /** Payment id -> travels in this statement. */
  selection: { [paymentId: string]: boolean };
  /** Direct payments picked by hand instead of swept by date. */
  pickedPaymentIds?: string[];
  lastUpdatedOn?: string;
  lastUpdatedBy?: string;
  transactionNumber?: string;
}

interface DemoStatementRow {
  rowNumber: number;
  kind: string;
  componentCode: string;
  componentName: string;
  toJustify: DemoBreakdown;
  availableBalance: DemoBreakdown;
  paymentsSelected: number;
  paymentsTotal: number;
}

const draftsByProject = new Map<string, DemoDraft>();
const previousStatements = new Map<string, unknown[]>();

const DEMO_STATEMENT_USER = 'Maria Flores';

/** Currency the loan was approved in; the whole statement is expressed in it. */
const DEMO_APPROVAL_CURRENCY = 'USD';

/**
 * What each component of the loan was approved for. The available balance is
 * that figure less what the statement on screen is about to charge, which is
 * what the column header promises: the balance after the present
 * justification.
 */
const COMPONENT_APPROVED: { [code: string]: DemoBreakdown } = {
  C1: { idb: 1500000, localContribution: 180000, cofinancing: 40000 },
  C2: { idb: 900000, localContribution: 50000, cofinancing: 120000 },
  // Every component that receives payments needs a budget in each source it
  // receives them from. C3 had no cofinancing approved while its payments
  // carried some, which showed the agency a negative balance available.
  C3: { idb: 2100000, localContribution: 60000, cofinancing: 90000 },
};

const emptyBreakdown = (): DemoBreakdown => ({
  idb: 0,
  localContribution: 0,
  cofinancing: 0,
});

const addInto = (target: DemoBreakdown, payment: DemoPayment): void => {
  target.idb += payment.idbFinancingAmount;
  target.localContribution += payment.localFinancingAmount;
  target.cofinancing += payment.cofinancingAmount;
};

const roundBreakdown = (value: DemoBreakdown): DemoBreakdown => ({
  idb: Math.round(value.idb * 100) / 100,
  localContribution: Math.round(value.localContribution * 100) / 100,
  cofinancing: Math.round(value.cofinancing * 100) / 100,
});

/** Payments of the loan that may still enter a statement of this type. */
function statementCandidates(
  projectBucketId: string,
  draft: DemoDraft
): DemoPayment[] {
  const wantsReimbursable =
    STATEMENT_REQUIRES_REIMBURSABLE[draft.transactionType];
  const picked = draft.pickedPaymentIds;
  const from = draft.dateFrom ? new Date(draft.dateFrom).getTime() : 0;
  const to = draft.dateTo ? new Date(draft.dateTo).getTime() : Number.MAX_VALUE;

  const found: DemoPayment[] = [];
  commitmentsOf(projectBucketId).forEach((commitment) => {
    paymentsOf(commitment.id).forEach((payment) => {
      if (payment.statementTransactionNumber || payment.accumulated) {
        return;
      }

      // A direct payment is chosen by hand and may still be scheduled: the
      // Bank has not paid the third party yet, so nothing was disbursed.
      if (picked) {
        if (picked.indexOf(payment.id) >= 0) {
          found.push(payment);
        }
        return;
      }

      const paidOn = new Date(payment.paymentDate).getTime();
      if (
        payment.status === 'PAID' &&
        payment.reimbursable === wantsReimbursable &&
        paidOn >= from &&
        paidOn <= to
      ) {
        found.push(payment);
      }
    });
  });

  return found;
}

/** Everything the two statement screens read, recomputed from the selection. */
function buildDraftResponse(projectBucketId: string, draft: DemoDraft) {
  const candidates = statementCandidates(projectBucketId, draft);

  const grouped = new Map<
    string,
    { name: string; toJustify: DemoBreakdown; total: number; selected: number }
  >();

  candidates.forEach((payment) => {
    const entry = grouped.get(payment.componentCode) ?? {
      name: payment.componentName,
      toJustify: emptyBreakdown(),
      total: 0,
      selected: 0,
    };
    entry.total++;
    if (draft.selection[payment.id]) {
      entry.selected++;
      addInto(entry.toJustify, payment);
    }
    grouped.set(payment.componentCode, entry);
  });

  const rows: DemoStatementRow[] = [...grouped.entries()].map(
    ([code, entry], index) => {
      const approved = COMPONENT_APPROVED[code] ?? {
        idb: 500000,
        localContribution: 0,
        cofinancing: 0,
      };
      return {
        rowNumber: index + 1,
        kind: 'COMPONENT',
        componentCode: code,
        componentName: entry.name,
        toJustify: roundBreakdown(entry.toJustify),
        availableBalance: roundBreakdown({
          idb: approved.idb - entry.toJustify.idb,
          localContribution:
            approved.localContribution - entry.toJustify.localContribution,
          cofinancing: approved.cofinancing - entry.toJustify.cofinancing,
        }),
        paymentsSelected: entry.selected,
        paymentsTotal: entry.total,
      };
    }
  );

  // Two lines that are not components: what the Bank put up front, and what is
  // registered as paid but is not travelling in this statement. Neither opens.
  const pendingToSend = candidates
    .filter((payment) => !draft.selection[payment.id])
    .reduce((total, payment) => total + payment.equivalentAmount, 0);

  rows.push({
    rowNumber: 86,
    kind: 'ADVANCE',
    componentCode: '',
    componentName: 'ADVANCE',
    toJustify: emptyBreakdown(),
    availableBalance: { idb: 690000, localContribution: 0, cofinancing: 0 },
    paymentsSelected: 0,
    paymentsTotal: 0,
  });

  rows.push({
    rowNumber: 88,
    kind: 'PENDING',
    componentCode: '',
    componentName: 'PENDING',
    toJustify: emptyBreakdown(),
    availableBalance: {
      idb: Math.round(pendingToSend * 100) / 100,
      localContribution: 0,
      cofinancing: 0,
    },
    paymentsSelected: 0,
    paymentsTotal: 0,
  });

  const sum = (pick: (row: DemoStatementRow) => DemoBreakdown) =>
    roundBreakdown(
      rows.reduce(
        (total, row) => ({
          idb: total.idb + pick(row).idb,
          localContribution:
            total.localContribution + pick(row).localContribution,
          cofinancing: total.cofinancing + pick(row).cofinancing,
        }),
        emptyBreakdown()
      )
    );

  const selectedPayments = candidates.filter(
    (payment) => draft.selection[payment.id]
  );

  return {
    id: draft.id,
    transactionType: draft.transactionType,
    status: draft.status,
    dateFrom: draft.dateFrom,
    dateTo: draft.dateTo,
    approvalCurrency: DEMO_APPROVAL_CURRENCY,
    rows,
    totals: {
      toJustify: sum((row) => row.toJustify),
      availableBalance: sum((row) => row.availableBalance),
    },
    paymentsSelected: selectedPayments.length,
    lastUpdatedOn: draft.lastUpdatedOn,
    lastUpdatedBy: draft.lastUpdatedBy,
    transactionNumber: draft.transactionNumber,
    // Only the direct payment screen lists them flat; the others group by
    // component and open the detail instead.
    payments: draft.pickedPaymentIds ? selectedPayments : undefined,
  };
}

function draftOf(projectBucketId: string): DemoDraft {
  return draftsByProject.get(projectBucketId);
}

const noDraft = () =>
  demoError(404, {
    code: 'STATEMENT_NOT_STARTED',
    message: 'PAYMENT_RECORD.STATEMENT.ERRORS.NOT_STARTED',
  });

/** `GET .../{id}/expenditure-statements/draft`. */
export function buildDemoStatementDraft(
  projectBucketId: string,
  transactionType: string,
  dateFrom: string,
  dateTo: string
) {
  const draft: DemoDraft = {
    id: 'DRAFT-' + projectBucketId.slice(0, 8),
    transactionType,
    status: 'NEW',
    dateFrom,
    dateTo,
    selection: {},
  };
  draftsByProject.set(projectBucketId, draft);

  // Everything in range travels unless the user says otherwise.
  statementCandidates(projectBucketId, draft).forEach((payment) => {
    draft.selection[payment.id] = true;
  });

  return buildDraftResponse(projectBucketId, draft);
}

/**
 * `GET .../draft/current`.
 *
 * Answers the statement in progress. Not having one is the normal case when
 * the screen is opened fresh, so it is a 404 rather than an empty payload.
 */
export function buildDemoCurrentDraft(projectBucketId: string) {
  const draft = draftOf(projectBucketId);
  if (!draft || draft.status === 'GENERATED') {
    return noDraft();
  }
  return buildDraftResponse(projectBucketId, draft);
}

/** `POST .../{id}/expenditure-statements/draft/payments`. */
export function setDemoStatementPayments(
  projectBucketId: string,
  body: unknown
) {
  const request = (body ?? {}) as {
    transactionType?: string;
    paymentIds?: string[];
  };
  const draft: DemoDraft = {
    id: 'DRAFT-' + projectBucketId.slice(0, 8),
    transactionType: request.transactionType ?? 'DPS',
    status: 'NEW',
    dateFrom: '',
    dateTo: '',
    selection: {},
    pickedPaymentIds: request.paymentIds ?? [],
  };
  draftsByProject.set(projectBucketId, draft);

  (request.paymentIds ?? []).forEach((id) => {
    draft.selection[id] = true;
  });

  return buildDraftResponse(projectBucketId, draft);
}

/** `GET .../draft/components/{code}`. */
export function buildDemoStatementComponent(
  projectBucketId: string,
  componentCode: string
) {
  const draft = draftOf(projectBucketId);
  if (!draft) {
    return noDraft();
  }

  const payments = statementCandidates(projectBucketId, draft).filter(
    (payment) => payment.componentCode === componentCode
  );

  const toJustify = emptyBreakdown();
  payments
    .filter((payment) => draft.selection[payment.id])
    .forEach((payment) => addInto(toJustify, payment));

  const current = emptyBreakdown();
  payments.forEach((payment) => addInto(current, payment));

  const approved = COMPONENT_APPROVED[componentCode] ?? {
    idb: 500000,
    localContribution: 0,
    cofinancing: 0,
  };

  return {
    rowNumber: 1,
    componentCode,
    componentName: payments[0] ? payments[0].componentName : componentCode,
    approvalCurrency: DEMO_APPROVAL_CURRENCY,
    contractCurrency: payments[0] ? payments[0].currency : 'USD',
    currentAmount: roundBreakdown(current),
    toJustify: roundBreakdown(toJustify),
    availableBalance: roundBreakdown({
      idb: approved.idb - toJustify.idb,
      localContribution:
        approved.localContribution - toJustify.localContribution,
      cofinancing: approved.cofinancing - toJustify.cofinancing,
    }),
    payments,
    selectedPaymentIds: payments
      .filter((payment) => draft.selection[payment.id])
      .map((payment) => payment.id),
  };
}

/** `PUT .../draft/components/{code}`. */
export function saveDemoStatementComponent(
  projectBucketId: string,
  componentCode: string,
  body: unknown
) {
  const draft = draftOf(projectBucketId);
  if (!draft) {
    return noDraft();
  }

  const kept = new Set(
    ((body ?? {}) as { paymentIds?: string[] }).paymentIds ?? []
  );
  statementCandidates(projectBucketId, draft)
    .filter((payment) => payment.componentCode === componentCode)
    .forEach((payment) => {
      draft.selection[payment.id] = kept.has(payment.id);
    });

  draft.lastUpdatedOn = new Date().toISOString();
  draft.lastUpdatedBy = DEMO_STATEMENT_USER;

  return buildDraftResponse(projectBucketId, draft);
}

/** `PUT .../draft` -- saves without sending. */
export function saveDemoStatementDraft(projectBucketId: string) {
  const draft = draftOf(projectBucketId);
  if (!draft) {
    return noDraft();
  }

  draft.status = 'DRAFT';
  draft.lastUpdatedOn = new Date().toISOString();
  draft.lastUpdatedBy = DEMO_STATEMENT_USER;

  return buildDraftResponse(projectBucketId, draft);
}

/** `GET .../draft/payments` -- the rows behind the spreadsheet download. */
export function buildDemoStatementPayments(projectBucketId: string) {
  const draft = draftOf(projectBucketId);
  if (!draft) {
    return [];
  }

  const grouped = new Map<string, DemoPayment[]>();
  statementCandidates(projectBucketId, draft)
    .filter((payment) => draft.selection[payment.id])
    .forEach((payment) => {
      const entry = grouped.get(payment.componentCode) ?? [];
      entry.push(payment);
      grouped.set(payment.componentCode, entry);
    });

  return [...grouped.entries()].map(([code, payments]) => ({
    rowNumber: 1,
    componentCode: code,
    componentName: payments[0].componentName,
    approvalCurrency: 'USD',
    contractCurrency: payments[0].currency,
    currentAmount: emptyBreakdown(),
    toJustify: emptyBreakdown(),
    availableBalance: emptyBreakdown(),
    payments,
    selectedPaymentIds: payments.map((payment) => payment.id),
  }));
}

/** `GET .../{id}/expenditure-statements` -- the list of previous statements. */
export function buildDemoPreviousStatements(projectBucketId: string) {
  if (!previousStatements.has(projectBucketId)) {
    previousStatements.set(projectBucketId, [
      {
        transactionNumber: 'ODTR-100900',
        transactionType: 'ANJ',
        createdOn: daysAgo(96),
        valueDate: daysAgo(90),
        createdBy: DEMO_STATEMENT_USER,
        // A different currency from the loan's own approval currency (USD)
        // on purpose -- the two amount columns showing the same number for
        // every row is what made this column read as missing rather than
        // just quiet.
        currency: 'COP',
        totalAmount: 600000000,
        equivalentAmount: 145000,
        paymentsIncluded: 8,
        status: 'APPROVED',
      },
      {
        transactionNumber: 'ODTR-100912',
        transactionType: 'DPB',
        createdOn: daysAgo(34),
        // Not yet valued by the Bank -- still pending, so there is no date.
        valueDate: null,
        createdBy: DEMO_STATEMENT_USER,
        currency: 'USD',
        totalAmount: 32000,
        equivalentAmount: 32000,
        paymentsIncluded: 3,
        status: 'PENDING_IDB',
      },
    ]);
  }
  return previousStatements.get(projectBucketId);
}

/**
 * Records a generated statement so the list of previous ones grows as the
 * demo is used, and marks its payments as spoken for.
 */
export function recordDemoStatement(
  projectBucketId: string,
  statement: {
    transactionNumber: string;
    transactionType: string;
    currency: string;
    totalAmount: number;
    paymentsIncluded: number;
  }
): void {
  const list = buildDemoPreviousStatements(projectBucketId) as unknown[];
  list.unshift({
    transactionNumber: statement.transactionNumber,
    transactionType: statement.transactionType,
    createdOn: new Date().toISOString(),
    createdBy: DEMO_STATEMENT_USER,
    currency: statement.currency,
    totalAmount: statement.totalAmount,
    paymentsIncluded: statement.paymentsIncluded,
    status: 'PENDING_IDB',
  });

  const draft = draftOf(projectBucketId);
  if (draft) {
    draft.status = 'GENERATED';
    draft.transactionNumber = statement.transactionNumber;
  }
}

/**
 * `GET .../{id}/expenditure-statements/pickable`.
 *
 * Candidates for a direct payment: anything of the loan that is not spoken for
 * and is not a lump sum. Scheduled ones count, because in a direct payment the
 * Bank pays the third party and the agency has not paid anyone yet.
 */
export function buildDemoPickablePayments(projectBucketId: string) {
  const found: DemoPayment[] = [];
  commitmentsOf(projectBucketId).forEach((commitment) => {
    paymentsOf(commitment.id).forEach((payment) => {
      if (
        !payment.statementTransactionNumber &&
        !payment.accumulated &&
        (payment.status === 'SCHEDULED' || payment.status === 'PAID')
      ) {
        found.push(payment);
      }
    });
  });
  return found;
}
