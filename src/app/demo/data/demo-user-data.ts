import { PermissionEnum } from '@core/enums/permission.enum';
import { MenuItem, PreferencesModel } from '@core/models';
import { DEMO_OPERATIONS } from './demo-projects';

/** Two operations pinned as favourites so the dashboard opens with content. */
export const DEMO_PREFERENCES: PreferencesModel = {
  defaultLanguage: 'en',
  preferredLanguage: 'en',
  procurementPreferences: [],
  projects: DEMO_OPERATIONS.slice(0, 2).map((operation) => ({
    projectBucketId: operation.id,
    projectBucket: operation.id,
    contractNumber: operation.operation,
    operationNumber: operation.project,
    institutionName: operation.executor,
    totalApprovedAmount: operation.currentApprovedAmount,
    countryCode: operation.countryCode,
    projectName: operation.projectName,
  })),
};

const ALL_PERMISSIONS = Object.values(PermissionEnum).map((code, index) => ({
  permissionCode: code,
  permission: code,
  permissionDescription: `Demo permission ${index + 1}`,
}));

/**
 * `GET /api/v2/users/permissions` answers with a flat array: one entry per
 * role the user holds on a contract. In demo mode the user is granted every
 * permission on every operation.
 */
export const DEMO_PERMISSIONS = DEMO_OPERATIONS.map((operation) => ({
  roleIdCode: '23',
  roleName: 'Procurement Fiduciary Specialist',
  roleType: 'OPERATIONAL_TEAM',
  roleTypeOrigin: 'IDB',
  // The API misspells this field and the front end reads it as-is.
  contratNumber: operation.operation,
  contractNumber: operation.operation,
  operationNumber: operation.project,
  permissions: ALL_PERMISSIONS,
}));

export const DEMO_ROLES = {
  roles: [
    {
      roleIdCode: '23',
      roleName: 'Procurement Fiduciary Specialist',
      roleType: 'OPERATIONAL_TEAM',
    },
    {
      roleIdCode: '25',
      roleName: 'Operational Analyst',
      roleType: 'OPERATIONAL_TEAM',
    },
  ],
  paging: {
    totalRecords: 2,
    next: '',
    preview: '',
    last: '',
    first: '',
  },
};

/**
 * Left-hand navigation of the project detail screen, mirroring the menu of the
 * live product.
 *
 * Three details the real API also carries and the component depends on:
 *
 * - `icon` must include the Kendo base classes (`k-icon k-font-icon`), not just
 *   `k-i-*`; the panel bar copies the string verbatim into `class` and the
 *   glyph stays invisible without them.
 * - `index` is the 1-based position of the entry (`5.1` for a child). The
 *   sidebar derives the highlighted item from it, so an entry without an index
 *   never lights up when its screen is open.
 * - `routeTo: 'null'` marks an entry the component must ignore on click. It is
 *   used for the sections the live menu shows but this release does not
 *   implement yet (payment schedule, payment record, thresholds, component
 *   structure, FAQ), so the menu looks complete without dropping the user on
 *   the dashboard through the wildcard route.
 */
const INERT = 'null';

export const DEMO_SIDEBAR: MenuItem[] = [
  {
    icon: 'k-icon k-font-icon k-i-file-txt',
    index: '1',
    text: 'SIDEBAR.GENERAL_PROCUREMENT_NOTICE',
    routeTo: '/project/:code/:contract/gpn',
  },
  {
    icon: 'k-icon k-font-icon k-i-file-report',
    index: '2',
    text: 'SIDEBAR.PROCUREMENT_MANAGEMENT',
    routeTo: '/project/:code/:contract/procurement',
  },
  {
    icon: 'k-icon k-font-icon k-i-clipboard-text',
    index: '3',
    text: 'R.CONTRACT.PAYMENT_SCHEDULE.TITLE',
    routeTo: INERT,
  },
  {
    icon: 'k-icon k-font-icon k-i-dollar',
    index: '4',
    text: 'SIDEBAR.PAYMENT_RECORD',
    routeTo: '/project/:code/:contract/payment-record',
  },
  {
    icon: 'k-icon k-font-icon k-i-chart-line',
    index: '5',
    text: 'SIDEBAR.FINANCIAL_MANAGEMENT',
    // The order of the live product. The statement of expenditures was
    // reachable only through a button inside the payment record, which is not
    // where anyone looks for it: it is a screen of its own in the menu.
    items: [
      {
        index: '5.1',
        text: 'SIDEBAR.FINANCIAL_PLAN',
        routeTo: INERT,
      },
      {
        index: '5.2',
        text: 'SIDEBAR.EXPENDITURE_STATEMENT',
        routeTo: '/project/:code/:contract/payment-record/expenditure-statement',
      },
      {
        index: '5.3',
        text: 'SIDEBAR.EXECUTION_STATUS',
        routeTo: INERT,
      },
      {
        index: '5.4',
        text: 'SIDEBAR.IDB_RECONCILIATION',
        routeTo: INERT,
      },
      {
        index: '5.5',
        text: 'SIDEBAR.BANK_TRANSACTIONS',
        routeTo: '/project/:code/:contract/transactions',
      },
      {
        index: '5.6',
        text: 'SIDEBAR.DISBURSEMENT_INFORMATION',
        routeTo: '/project/:code/:contract/disbursement',
      },
    ],
  },
  {
    icon: 'k-icon k-font-icon k-i-sliders',
    index: '6',
    text: 'SIDEBAR.THRESHOLDS_UCS',
    routeTo: INERT,
  },
  {
    icon: 'k-icon k-font-icon k-i-connector',
    index: '7',
    text: 'SIDEBAR.USERS_WORKFLOWS',
    routeTo: '/project/:code/:contract/usr-workflow',
  },
  {
    // No translation key exists for this entry in this release.
    icon: 'k-icon k-font-icon k-i-group',
    index: '8',
    text: 'Components Structure',
    routeTo: INERT,
  },
  {
    icon: 'k-icon k-font-icon k-i-question-circle',
    index: '9',
    text: 'SIDEBAR.FREQUENT_QUESTIONS',
    routeTo: INERT,
  },
];
