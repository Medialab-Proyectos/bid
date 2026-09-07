import { HttpRequest } from '@angular/common/http';
import { DEMO_ENUMS, DEMO_LOCATION_ENUMS } from './data/demo-enums';
import { DEMO_OPERATIONS, DEMO_PROJECT_COUNTRIES } from './data/demo-projects';
import {
  DEMO_PERMISSIONS,
  DEMO_PREFERENCES,
  DEMO_ROLES,
  DEMO_SIDEBAR,
} from './data/demo-user-data';
import { buildDemoActivities } from './data/demo-activities';
import {
  buildDemoDocumentGroups,
  buildDemoDocumentPackages,
} from './data/demo-doc-packages';
import {
  buildDemoParticipants,
  buildDemoParticipantsSettings,
} from './data/demo-participants';
import {
  buildDemoBiddingContracts,
  buildDemoContractEnum,
} from './data/demo-contracts';
import {
  addDemoPayments,
  buildDemoCommitment,
  buildDemoCommitmentPayments,
  buildDemoExchangeRatePayments,
  buildDemoExchangeRates,
  buildDemoPaymentRecordSummary,
  buildDemoPlannedPayments,
  buildDemoFundingTotals,
  buildDemoImportTemplate,
  buildDemoProjectComponents,
  buildDemoStatementCandidates,
  buildDemoStatementDraft,
  buildDemoCurrentDraft,
  buildDemoPickablePayments,
  buildDemoStatementComponent,
  buildDemoStatementPayments,
  buildDemoPreviousStatements,
  setDemoStatementPayments,
  saveDemoStatementComponent,
  saveDemoStatementDraft,
  addDemoAccumulatedPayment,
  addDemoManualPayment,
  buildDemoCurrencyCeilings,
  confirmDemoImportedPayments,
  deleteDemoPayment,
  generateDemoStatement,
  importDemoPayments,
  saveDemoPaymentMechanism,
  saveDemoExchangeRates,
  updateDemoPayment,
} from './data/demo-payment-record';
import {
  buildDemoAvailableNumbers,
  buildDemoBalances,
  buildDemoBeneficiaries,
  buildDemoBeneficiaryDetail,
  buildDemoPendingTransactions,
  buildDemoTransactionTypes,
  buildDemoTransactionComponents,
  buildDemoTransactions,
} from './data/demo-financial';
import {
  buildDemoActiveWorkflows,
  buildDemoWorkflowConfig,
  buildDemoWorkflowInstitutionUsers,
  buildDemoWorkflowInstitutions,
  buildDemoWorkflowLastStep,
} from './data/demo-workflow';
import {
  buildDemoProcurementPlan,
  buildDemoProcurementProcessById,
  buildDemoProcurementProcesses,
} from './data/demo-procurement';

/** Everything a route handler needs to build its answer. */
export interface DemoRequestContext {
  /** Path without the API host and without the query string. */
  path: string;
  /** Groups captured by the route pattern. */
  params: string[];
  query: URLSearchParams;
  request: HttpRequest<unknown>;
}

interface DemoRoute {
  method: string;
  pattern: RegExp;
  handler: (context: DemoRequestContext) => unknown;
}

const number = (value: string, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

/** `GET /api/v2/project-buckets` with its cursor pagination and filters. */
function listProjectBuckets(context: DemoRequestContext) {
  const operation = context.query.get('operation');
  const projectNumber = context.query.get('projectNumber');
  const countryCode = context.query.get('countryCode');
  const pageSize = number(context.query.get('pageSize'), 20);

  let data = [...DEMO_OPERATIONS];
  if (operation) {
    const needle = decodeURIComponent(operation).toLowerCase();
    data = data.filter((item) => item.operation.toLowerCase().includes(needle));
  }
  if (projectNumber) {
    const needle = decodeURIComponent(projectNumber).toLowerCase();
    data = data.filter((item) => item.project.toLowerCase().includes(needle));
  }
  if (countryCode) {
    data = data.filter((item) => item.countryCode === countryCode);
  }

  const page = data.slice(0, pageSize);
  return {
    // An empty cursor tells the dashboard there is nothing left to load.
    cursor: '',
    data: page,
    total: data.length,
  };
}

function listPermissions(context: DemoRequestContext) {
  const contractNumber = context.query.get('contractNumber');
  if (!contractNumber) {
    return DEMO_PERMISSIONS;
  }
  const contract = decodeURIComponent(contractNumber);
  const scoped = DEMO_PERMISSIONS.filter(
    (item) => item.contractNumber === contract
  );
  return scoped.length > 0 ? scoped : DEMO_PERMISSIONS;
}

const routes: DemoRoute[] = [
  // ---------------------------------------------------------------- settings
  {
    method: 'GET',
    pattern: /^\/api\/v2\/settings\/users$/,
    handler: () => DEMO_PREFERENCES,
  },
  {
    method: 'POST',
    pattern: /^\/api\/v2\/settings\/users$/,
    handler: (context) => context.request.body ?? DEMO_PREFERENCES,
  },
  {
    method: 'GET',
    pattern: /^\/api\/configurations\/sidebar$/,
    handler: () => DEMO_SIDEBAR,
  },

  // ------------------------------------------------------- users and access
  {
    method: 'GET',
    pattern: /^\/api\/v2\/users\/permissions$/,
    handler: listPermissions,
  },
  { method: 'GET', pattern: /^\/api\/groups$/, handler: () => DEMO_ROLES },

  // ---------------------------------------------------------------- projects
  {
    method: 'GET',
    pattern: /^\/api\/v2\/project-buckets\/countries$/,
    handler: () => DEMO_PROJECT_COUNTRIES,
  },
  {
    method: 'GET',
    pattern: /^\/api\/v2\/project-buckets$/,
    handler: listProjectBuckets,
  },
  {
    method: 'GET',
    pattern: /^\/api\/projectBuckets\/[^/]+\/projectTasks$/,
    handler: () => ({ projectTasks: [] }),
  },
  {
    method: 'GET',
    pattern: /^\/api\/projectTasks\/[^/]+\/projectTaskChilds$/,
    handler: () => ({ projectTasks: [] }),
  },

  // ------------------------------------------------------------- activities
  {
    method: 'POST',
    pattern: /^\/api\/v2\/activities$/,
    handler: (context) =>
      buildDemoActivities(
        number(context.query.get('index'), 1),
        number(context.query.get('size'), 10)
      ),
  },

  // ------------------------------------------------------------ procurement
  {
    method: 'GET',
    pattern: /^\/api\/v3\/procurement-plans\/active$/,
    handler: (context) =>
      buildDemoProcurementPlan(
        context.query.get('projectBucketId') ?? DEMO_OPERATIONS[0].id
      ),
  },
  {
    method: 'GET',
    pattern: /^\/api\/v3\/procurement-processes\/([^/]+)$/,
    handler: (context) => buildDemoProcurementProcesses(context.params[0]),
  },
  {
    method: 'GET',
    pattern: /^\/api\/projectBuckets\/[^/]+\/biddingProcessPlans\/approved$/,
    handler: () => [],
  },
  {
    method: 'GET',
    pattern: /^\/api\/biddingProcessProcurementProcesses\/([^/]+)$/,
    handler: (context) => buildDemoProcurementProcessById(context.params[0]),
  },
  {
    method: 'GET',
    pattern:
      /^\/api\/biddingProcessProcurementProcesses\/[^/]+\/biddingContracts$/,
    handler: () => buildDemoBiddingContracts(),
  },
  {
    method: 'GET',
    pattern: /^\/api\/v3\/bidding-contracts\/enums\/([^/]+)$/,
    handler: (context) => buildDemoContractEnum(context.params[0]),
  },

  // -------------------------------------------------------------- financial
  {
    method: 'GET',
    pattern: /^\/api\/projectBuckets\/([^/]+)\/balances$/,
    handler: (context) => buildDemoBalances(context.params[0]),
  },
  {
    method: 'GET',
    pattern: /^\/api\/projectBuckets\/[^/]+\/transactions$/,
    handler: () => buildDemoTransactions(),
  },
  {
    method: 'GET',
    pattern: /^\/api\/projectBuckets\/[^/]+\/transactions\/pending$/,
    handler: () => buildDemoPendingTransactions(),
  },
  {
    method: 'GET',
    pattern: /^\/api\/projectBuckets\/[^/]+\/transactions\/types$/,
    handler: () => buildDemoTransactionTypes(),
  },
  {
    method: 'GET',
    pattern: /^\/api\/projectBuckets\/([^/]+)\/transactions\/[^/]+\/components$/,
    handler: (context) => buildDemoTransactionComponents(context.params[0]),
  },
  {
    method: 'GET',
    pattern:
      /^\/api\/projectBuckets\/[^/]+\/transactions\/availableRequestAndPartNumber$/,
    handler: () => buildDemoAvailableNumbers(),
  },
  {
    method: 'GET',
    pattern: /^\/api\/projectBuckets\/[^/]+\/beneficiaries$/,
    handler: (context) =>
      buildDemoBeneficiaries(context.query.get('searchText') ?? ''),
  },
  {
    method: 'GET',
    pattern: /^\/api\/projectBuckets\/[^/]+\/beneficiaries\/[^/]+$/,
    handler: () => buildDemoBeneficiaryDetail(),
  },
  {
    method: 'GET',
    pattern: /^\/api\/projectBuckets\/[^/]+\/approvedCurrencies$/,
    handler: () => 'USD',
  },

  // ---------------------------------------------------- document packages
  {
    method: 'GET',
    pattern:
      /^\/api\/v3\/procurement-processes\/([^/]+)\/document-packages$/,
    handler: (context) =>
      buildDemoDocumentPackages(
        context.params[0],
        context.query.get('isOptional') === 'true'
      ),
  },
  {
    method: 'GET',
    pattern:
      /^\/api\/v3\/procurement-processes\/document-packages\/[^/]+\/document-groups$/,
    handler: () => buildDemoDocumentGroups(),
  },

  // ------------------------------------------------------------- settings
  {
    method: 'GET',
    pattern: /^\/api\/v2\/settings$/,
    handler: () => ({ settings: [] }),
  },
  {
    method: 'GET',
    pattern: /^\/api\/v2\/settings\/participants$/,
    handler: (context) =>
      buildDemoParticipantsSettings(context.query.get('packageCodeId') ?? ''),
  },
  {
    method: 'GET',
    pattern: /^\/api\/v2\/procurement-process\/([^/]+)\/participants$/,
    handler: (context) => buildDemoParticipants(context.params[0]),
  },

  // --------------------------------------------------------- payment record
  {
    method: 'GET',
    pattern: /^\/api\/v3\/payment-records\/([^/]+)\/commitments$/,
    handler: (context) => buildDemoPaymentRecordSummary(context.params[0]),
  },
  {
    method: 'GET',
    pattern: /^\/api\/v3\/payment-records\/commitments\/([^/]+)$/,
    handler: (context) =>
      buildDemoCommitment(decodeURIComponent(context.params[0])),
  },
  {
    method: 'GET',
    pattern: /^\/api\/v3\/payment-records\/commitments\/([^/]+)\/payments$/,
    handler: (context) =>
      buildDemoCommitmentPayments(decodeURIComponent(context.params[0])),
  },
  {
    method: 'POST',
    pattern: /^\/api\/v3\/payment-records\/commitments\/([^/]+)\/payments$/,
    handler: (context) =>
      addDemoPayments(
        decodeURIComponent(context.params[0]),
        context.request.body
      ),
  },
  {
    method: 'GET',
    pattern:
      /^\/api\/v3\/payment-records\/commitments\/([^/]+)\/planned-payments$/,
    handler: (context) =>
      buildDemoPlannedPayments(decodeURIComponent(context.params[0])),
  },
  {
    method: 'PUT',
    pattern: /^\/api\/v3\/payment-records\/payments\/([^/]+)$/,
    handler: (context) =>
      updateDemoPayment(
        decodeURIComponent(context.params[0]),
        context.request.body
      ),
  },
  {
    method: 'DELETE',
    pattern: /^\/api\/v3\/payment-records\/payments\/([^/]+)$/,
    handler: (context) =>
      deleteDemoPayment(decodeURIComponent(context.params[0])),
  },
  {
    method: 'POST',
    pattern:
      /^\/api\/v3\/payment-records\/commitments\/([^/]+)\/payments\/manual$/,
    handler: (context) =>
      addDemoManualPayment(
        decodeURIComponent(context.params[0]),
        context.request.body
      ),
  },
  {
    method: 'POST',
    pattern:
      /^\/api\/v3\/payment-records\/commitments\/([^/]+)\/payments\/accumulated$/,
    handler: (context) =>
      addDemoAccumulatedPayment(
        decodeURIComponent(context.params[0]),
        context.request.body
      ),
  },
  {
    method: 'GET',
    pattern:
      /^\/api\/v3\/payment-records\/commitments\/([^/]+)\/currency-ceilings$/,
    handler: (context) =>
      buildDemoCurrencyCeilings(decodeURIComponent(context.params[0])),
  },
  {
    method: 'GET',
    pattern:
      /^\/api\/v3\/payment-records\/commitments\/([^/]+)\/payments\/import\/template$/,
    handler: () => buildDemoImportTemplate(),
  },
  {
    method: 'POST',
    pattern:
      /^\/api\/v3\/payment-records\/commitments\/([^/]+)\/payments\/import$/,
    handler: (context) =>
      importDemoPayments(decodeURIComponent(context.params[0])),
  },
  {
    method: 'POST',
    pattern:
      /^\/api\/v3\/payment-records\/commitments\/([^/]+)\/payments\/import\/confirm$/,
    handler: (context) =>
      confirmDemoImportedPayments(
        decodeURIComponent(context.params[0]),
        context.request.body
      ),
  },
  {
    method: 'GET',
    pattern:
      /^\/api\/v3\/payment-records\/commitments\/([^/]+)\/funding-totals$/,
    handler: (context) =>
      buildDemoFundingTotals(decodeURIComponent(context.params[0])),
  },
  {
    method: 'PUT',
    pattern:
      /^\/api\/v3\/payment-records\/commitments\/([^/]+)\/payment-mechanism$/,
    handler: (context) =>
      saveDemoPaymentMechanism(
        decodeURIComponent(context.params[0]),
        context.request.body
      ),
  },
  {
    method: 'GET',
    pattern: /^\/api\/v3\/payment-records\/[^/]+\/components$/,
    handler: () => buildDemoProjectComponents(),
  },
  {
    method: 'GET',
    pattern:
      /^\/api\/v3\/payment-records\/([^/]+)\/expenditure-statements\/candidates$/,
    handler: (context) =>
      buildDemoStatementCandidates(
        context.params[0],
        context.query.get('transactionType') ?? 'ANJ',
        context.query.get('dateFrom') ?? '',
        context.query.get('dateTo') ?? ''
      ),
  },
  {
    method: 'GET',
    pattern:
      /^\/api\/v3\/payment-records\/([^/]+)\/expenditure-statements\/draft\/current$/,
    handler: (context) => buildDemoCurrentDraft(context.params[0]),
  },
  {
    method: 'GET',
    pattern:
      /^\/api\/v3\/payment-records\/([^/]+)\/expenditure-statements\/pickable$/,
    handler: (context) => buildDemoPickablePayments(context.params[0]),
  },
  {
    method: 'GET',
    pattern:
      /^\/api\/v3\/payment-records\/([^/]+)\/expenditure-statements\/draft$/,
    handler: (context) =>
      buildDemoStatementDraft(
        context.params[0],
        context.query.get('transactionType') ?? 'ANJ',
        context.query.get('dateFrom') ?? '',
        context.query.get('dateTo') ?? ''
      ),
  },
  {
    method: 'POST',
    pattern:
      /^\/api\/v3\/payment-records\/([^/]+)\/expenditure-statements\/draft\/payments$/,
    handler: (context) =>
      setDemoStatementPayments(context.params[0], context.request.body),
  },
  {
    method: 'GET',
    pattern:
      /^\/api\/v3\/payment-records\/([^/]+)\/expenditure-statements\/draft\/payments$/,
    handler: (context) => buildDemoStatementPayments(context.params[0]),
  },
  {
    method: 'GET',
    pattern:
      /^\/api\/v3\/payment-records\/([^/]+)\/expenditure-statements\/draft\/components\/([^/]+)$/,
    handler: (context) =>
      buildDemoStatementComponent(context.params[0], context.params[1]),
  },
  {
    method: 'PUT',
    pattern:
      /^\/api\/v3\/payment-records\/([^/]+)\/expenditure-statements\/draft\/components\/([^/]+)$/,
    handler: (context) =>
      saveDemoStatementComponent(
        context.params[0],
        context.params[1],
        context.request.body
      ),
  },
  {
    method: 'PUT',
    pattern:
      /^\/api\/v3\/payment-records\/([^/]+)\/expenditure-statements\/draft$/,
    handler: (context) => saveDemoStatementDraft(context.params[0]),
  },
  {
    method: 'GET',
    pattern: /^\/api\/v3\/payment-records\/([^/]+)\/expenditure-statements$/,
    handler: (context) => buildDemoPreviousStatements(context.params[0]),
  },
  {
    method: 'POST',
    pattern: /^\/api\/v3\/payment-records\/([^/]+)\/expenditure-statements$/,
    handler: (context) =>
      generateDemoStatement(context.params[0], context.request.body),
  },
  {
    method: 'GET',
    pattern: /^\/api\/v3\/payment-records\/([^/]+)\/exchange-rates$/,
    handler: (context) => buildDemoExchangeRates(context.params[0]),
  },
  {
    method: 'PUT',
    pattern: /^\/api\/v3\/payment-records\/([^/]+)\/exchange-rates$/,
    handler: (context) =>
      saveDemoExchangeRates(context.params[0], context.request.body),
  },
  {
    method: 'GET',
    pattern: /^\/api\/v3\/payment-records\/([^/]+)\/exchange-rate-payments$/,
    handler: (context) => buildDemoExchangeRatePayments(context.params[0]),
  },

  // -------------------------------------------------------- business rules
  {
    // Decides which action the user may take on a notice document. GENERATE
    // is the entry state, which keeps the GPN and SPN forms interactive.
    method: 'POST',
    pattern: /^\/api\/biddingDocuments\/getFunctionToDoOnDocument$/,
    handler: () => ({ result: 'GENERATE' }),
  },

  // --------------------------------------------------------- notifications
  {
    method: 'POST',
    pattern: /^\/api\/notification\/decode\/user$/,
    handler: () => ({ notifications: [], total: 0 }),
  },

  // ------------------------------------------------------------- documents
  {
    method: 'GET',
    pattern: /^\/api\/v3\/documents$/,
    handler: (context) => ({
      parentId: context.query.get('parentId') ?? '',
      fiduciaryProcessDocuments: [],
    }),
  },

  // ------------------------------------------------------------- workflows
  {
    method: 'GET',
    pattern: /^\/api\/v3\/workflows\/last-step$/,
    handler: (context) => buildDemoWorkflowLastStep(context.query),
  },
  {
    method: 'GET',
    pattern: /^\/api\/workFlowOD\/([^/]+)\/configuration$/,
    handler: (context) => buildDemoWorkflowConfig(context.params[0]),
  },
  {
    method: 'GET',
    pattern: /^\/api\/workFlowOD\/([^/]+)\/configuration\/[^/]+$/,
    handler: (context) => buildDemoWorkflowConfig(context.params[0]),
  },
  {
    method: 'GET',
    pattern: /^\/api\/workFlowOD\/[^/]+\/institutions$/,
    handler: () => buildDemoWorkflowInstitutions(),
  },
  {
    method: 'GET',
    pattern: /^\/api\/workFlowOD\/[^/]+\/institutions\/[^/]+\/users$/,
    handler: () => buildDemoWorkflowInstitutionUsers(),
  },
  {
    method: 'POST',
    pattern: /^\/api\/workflow\/getAllWorkflowActive$/,
    handler: () => buildDemoActiveWorkflows(),
  },

  // ----------------------------------------------------------------- common
  {
    method: 'GET',
    pattern: /^\/api\/common\/currencies$/,
    handler: () => [
      { currency: 'USD', isHard: true, isBorrowing: true, numberOfDecimals: 2 },
      { currency: 'EUR', isHard: true, isBorrowing: true, numberOfDecimals: 2 },
      { currency: 'BRL', isHard: false, isBorrowing: true, numberOfDecimals: 2 },
      { currency: 'COP', isHard: false, isBorrowing: true, numberOfDecimals: 2 },
      { currency: 'MXN', isHard: false, isBorrowing: true, numberOfDecimals: 2 },
      { currency: 'PEN', isHard: false, isBorrowing: true, numberOfDecimals: 2 },
    ],
  },

  // ------------------------------------------------------------ master data
  {
    method: 'GET',
    pattern: /^\/api\/v[12]\/master-data\/.+$/,
    handler: () => [],
  },

  // ------------------------------------------------------------------ enums
  // Must stay last: `/api/{enumType}` would otherwise swallow other routes.
  {
    method: 'GET',
    pattern: /^\/api\/([A-Za-z]+)$/,
    handler: (context) => {
      const enumType = context.params[0];
      if (DEMO_LOCATION_ENUMS[enumType]) {
        return { enumerator: DEMO_LOCATION_ENUMS[enumType] };
      }
      return { enumerator: DEMO_ENUMS[enumType] ?? [] };
    },
  },
];

/**
 * Answer used when a screen calls an endpoint that has no demo data yet.
 *
 * `[]` is the safest generic body: `.length`, `.map` and `.filter` all work on
 * it, and reading any property yields `undefined` instead of throwing. Add an
 * entry to `routes` above whenever a screen needs something richer.
 */
function fallback(request: HttpRequest<unknown>): unknown {
  return request.method === 'GET' ? [] : { success: true };
}

/**
 * A handler returns this when a business rule rejects the request; the
 * interceptor turns it into a failed response so the screens exercise their
 * error paths, not just the happy one.
 */
export interface DemoErrorBody {
  __demoError: { status: number; body: unknown };
}

export function demoError(status: number, body: unknown): DemoErrorBody {
  return { __demoError: { status, body } };
}

export function isDemoError(body: unknown): body is DemoErrorBody {
  return Boolean((body as DemoErrorBody)?.__demoError);
}

export interface DemoResolution {
  body: unknown;
  matched: boolean;
}

/** Resolves a request against the demo route table. */
export function resolveDemoRequest(
  request: HttpRequest<unknown>,
  path: string,
  query: URLSearchParams
): DemoResolution {
  for (const route of routes) {
    if (route.method !== request.method) {
      continue;
    }
    const match = route.pattern.exec(path);
    if (!match) {
      continue;
    }
    return {
      body: route.handler({
        path,
        params: match.slice(1),
        query,
        request,
      }),
      matched: true,
    };
  }

  return { body: fallback(request), matched: false };
}
