import { DEMO_OPERATIONS } from './demo-projects';

const day = 24 * 60 * 60 * 1000;
const daysAgo = (days: number): Date => new Date(Date.now() - days * day);
const inDays = (days: number): Date => new Date(Date.now() + days * day);

/** Header balances of the financial screens, derived from the operation. */
export function buildDemoBalances(projectBucketId: string) {
  const operation =
    DEMO_OPERATIONS.find((item) => item.id === projectBucketId) ??
    DEMO_OPERATIONS[0];
  const currentIdb = operation.currentApprovedAmount;
  const disbursed = Math.round(currentIdb * 0.42);
  const available = currentIdb - disbursed;
  const localCounterpart = Math.round(currentIdb * 0.1);

  return {
    originalIdb: operation.originalApprovedAmount,
    currentIdb,
    availableBalance: available,
    projectedAvailableBalance: available - Math.round(currentIdb * 0.05),
    disbursedAmount: disbursed,
    disbursedPercent: 42,
    lastDisbursementDate: daysAgo(21),
    cofinanced: 0,
    cancellations: operation.originalApprovedAmount - currentIdb,
    budgetContributionProjectedAvailableBalance: Math.round(available * 0.8),
    budgetContributionAvailableBalance: available,
    localCounterpart,
    totalAmountPendingJustification: Math.round(disbursed * 0.12),
    minimumAmountPendingJustification: Math.round(disbursed * 0.05),
    toJustifyPercent: 12,
    coFinancedDisbursed: 0,
    localCounterpartDisbursed: Math.round(localCounterpart * 0.35),
    cumulativeExtension: 0,
    currentDisbExpiration: inDays(420).toISOString(),
    financialPeriodDeadline: inDays(90).toISOString(),
    lastAdvanceOfFoundsANTDate: daysAgo(21).toISOString(),
    lastAdvanceOfFoundsANTAmount: 1800000,
    lastRequestNumber: 14,
    retroactiveFinancingInformation: {
      hasRetroactiveFinancing: false,
      rfCurrentAmount: 0,
      rfOriginalAmount: 0,
      disbRfAmount: 0,
      availRfAmount: 0,
      projAvailRfAmount: 0,
      projDisbRfAmount: 0,
    },
  };
}

const TRANSACTION_STATUS_COMPLETED = 17770;
const TRANSACTION_STATUS_PVAL = 17766;
const TRANSACTION_STATUS_DRAFT = 17764;

const transaction = (
  id: number,
  type: string,
  requestNumber: number,
  amount: number,
  statusId: number,
  statusCode: string,
  ageInDays: number
) => ({
  id,
  transactionNumber: `TR-${100000 + id}`,
  transactionType: type,
  requestNumber,
  partNumber: 1,
  currency: 'USD',
  amount,
  status: statusCode,
  approvalDate: daysAgo(ageInDays),
  lastUpdatedBy: 'Demo User',
  lastUpdate: daysAgo(ageInDays - 1),
  valueDate: daysAgo(ageInDays - 2),
  transactionActions: [],
  transactionTypeCode: type,
  transactionStatusCode: statusCode,
  transactionStatusId: statusId,
  parentId: null,
});

/** `GET /api/projectBuckets/{id}/transactions`. */
export function buildDemoTransactions() {
  const transactions = [
    transaction(1, 'ANT', 14, 1800000, TRANSACTION_STATUS_COMPLETED, 'COMPLETED', 21),
    transaction(2, 'ANJ', 13, 1450000, TRANSACTION_STATUS_COMPLETED, 'COMPLETED', 54),
    transaction(3, 'DPS', 12, 620000, TRANSACTION_STATUS_PVAL, 'PVAL', 9),
    transaction(4, 'ANT', 12, 900000, TRANSACTION_STATUS_COMPLETED, 'COMPLETED', 88),
    transaction(5, 'DRP', 11, 240000, TRANSACTION_STATUS_DRAFT, 'DRAFT', 3),
  ];

  return { itemsCount: transactions.length, transactions };
}

/** `GET /api/projectBuckets/{id}/transactions/pending`. */
export function buildDemoPendingTransactions() {
  return [
    {
      id: 3,
      transactionNumber: 'TR-100003',
      transactionType: 'DPS',
      status: 'PVAL',
    },
  ];
}

/** `GET /api/projectBuckets/{id}/transactions/types`. */
export function buildDemoTransactionTypes() {
  return {
    transactionTypes: [
      { code: 'ANT', name: 'Advance of funds', enabled: true },
      { code: 'ANJ', name: 'Justification of advance', enabled: true },
      { code: 'DPS', name: 'Direct payment to supplier', enabled: true },
      { code: 'DRP', name: 'Reimbursement of payments', enabled: true },
    ],
  };
}

/** `GET /api/projectBuckets/{id}/transactions/availableRequestAndPartNumber`. */
export function buildDemoAvailableNumbers() {
  return {
    requestNumber: 1,
    partNumber: 1,
    // Keyed by request number, each holding the part numbers already taken
    // for it -- empty because nothing is occupied in a fresh demo project.
    currentRequestPartNumbers: {},
  };
}

const demoBeneficiaries = [
  {
    institutionName: 'Ministerio de Educación',
    acronym: 'COL-MIN-EDU',
    beneficiaryName: 'Ministerio de Educación',
    accountNumber: '9988-8887-00099-009',
    bankFlowId: 'demo-bankflow-1',
    beneficiaryId: 'demo-beneficiary-1',
  },
  {
    institutionName: 'Instituto Nacional de Vías',
    acronym: 'COL-INV',
    beneficiaryName: 'Instituto Nacional de Vías',
    accountNumber: '4455-2231-00081-004',
    bankFlowId: 'demo-bankflow-2',
    beneficiaryId: 'demo-beneficiary-2',
  },
];

/** `GET /api/projectBuckets/{id}/beneficiaries?searchText=...`. */
export function buildDemoBeneficiaries(searchText: string) {
  const term = (searchText ?? '').toLowerCase();
  const beneficiaries = term
    ? demoBeneficiaries.filter((beneficiary) =>
        [
          beneficiary.institutionName,
          beneficiary.acronym,
          beneficiary.beneficiaryName,
          beneficiary.accountNumber,
        ]
          .join(' ')
          .toLowerCase()
          .includes(term)
      )
    : demoBeneficiaries;

  return { beneficiaries, itemsCount: beneficiaries.length };
}

/** `GET /api/projectBuckets/{id}/beneficiaries/{beneficiaryId}`. */
export function buildDemoBeneficiaryDetail() {
  return {
    intermediaryBank: {
      name: '',
      branchName: '',
      swiftCode: '',
      abaRoutingCode: '',
      streetAddress: '',
      city: '',
      country: '',
      zipCode: '',
      specialInstructions: '',
    },
    beneficiaryBank: {
      name: 'Banco Nacional',
      branchName: 'Main Branch',
      swiftCode: 'BNALCOBB',
      abaRoutingCode: '021000021',
      streetAddress: 'Calle 10 # 5-50',
      city: 'Bogotá',
      country: 'Colombia',
      zipCode: '110111',
      specialInstructions: '',
    },
    beneficiaryBasicData: {
      institutionName: 'Ministerio de Educación',
      streetAddress: 'Calle 10 # 5-50',
      city: 'Bogotá',
      country: 'Colombia',
      zipCode: '110111',
      typeName: 'Government',
      type: 'GOV',
      id: '1',
      contactFirstName: 'Demo',
      contactEmail: 'demo@example.org',
    },
    beneficiaryAccountData: {
      name: 'Ministerio de Educación',
      bankAccountNumber: '9988-8887-00099-009',
      accountCurrency: 'USD',
      accountSpecialInstructions: '',
    },
  };
}

const componentAmounts = (idb: number) => ({
  distributeIbd: idb,
  distributeLocalCounterpart: Math.round(idb * 0.1),
  distributeCofinancing: 0,
});

/** `GET /api/projectBuckets/{id}/transactions/{type}/components`. */
export function buildDemoTransactionComponents(projectBucketId: string) {
  const balances = buildDemoBalances(projectBucketId);
  const components = [
    { id: 1, code: 1001, name: 'Component 1 - Infrastructure works' },
    { id: 2, code: 1002, name: 'Component 2 - Equipment and supplies' },
    { id: 3, code: 1003, name: 'Component 3 - Technical assistance' },
  ].map((component, index) => {
    const share = [0.55, 0.3, 0.15][index];
    const current = Math.round(balances.currentIdb * share);
    return {
      ...component,
      amountsDistribute: componentAmounts(Math.round(current * 0.42)),
      amountsProjectedAvailable: componentAmounts(Math.round(current * 0.58)),
      readOnly: false,
      componentTableInformation: [],
      type: 1,
    };
  });

  const disbursed = balances.disbursedAmount;
  const available = balances.availableBalance;

  return {
    amountAssignIdb: disbursed,
    amountAssignLocalCounterpart: balances.localCounterpartDisbursed,
    amountAssignCofinancing: 0,
    components,
    componentsTotalAmountAvailableCf: 0,
    componentsTotalAmountAvailableIdb: available,
    componentsTotalAmountAvailableLc: balances.localCounterpart,
    componentsTotalAmountCurrentCf: 0,
    componentsTotalAmountCurrentIdb: balances.currentIdb,
    componentsTotalAmountCurrentLc: balances.localCounterpart,
    componentsTotalAmountDisbursedCf: 0,
    componentsTotalAmountDisbursedIdb: disbursed,
    componentsTotalAmountDisbursedLc: balances.localCounterpartDisbursed,
    componentsTotalAmountProjectedCf: 0,
    componentsTotalAmountProjectedIdb: balances.projectedAvailableBalance,
    componentsTotalAmountProjectedLc: balances.localCounterpart,
  };
}
