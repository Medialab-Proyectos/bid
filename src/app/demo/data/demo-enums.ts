import { EnumeratorCodeName, Enumerator } from '@core/models';
import {
  BiddingProcessPlanStatus,
  BiddingProcessProcurementProcessStatuses,
  BiddingProcurementProcessSupervisionMethods,
  DocumentPackagesStatus,
} from '@core/enums';
import { TransactionsStatus } from '@fiduciary-interface/app/features/transactions/enums';

/**
 * IDB country codes (the internal two letter code, not ISO) mapped to the
 * names the API would return. countryDictionary translates them to ISO codes
 * for the flag icons.
 */
export const DEMO_COUNTRIES: EnumeratorCodeName[] = [
  { code: 'AR', name: 'Argentina' },
  { code: 'BA', name: 'Barbados' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BR', name: 'Brazil' },
  { code: 'CH', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'DR', name: 'Dominican Republic' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'ES', name: 'El Salvador' },
  { code: 'GU', name: 'Guatemala' },
  { code: 'GY', name: 'Guyana' },
  { code: 'HA', name: 'Haiti' },
  { code: 'HO', name: 'Honduras' },
  { code: 'JA', name: 'Jamaica' },
  { code: 'ME', name: 'Mexico' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'PE', name: 'Peru' },
  { code: 'PN', name: 'Panama' },
  { code: 'PR', name: 'Paraguay' },
  { code: 'SU', name: 'Suriname' },
  { code: 'TT', name: 'Trinidad and Tobago' },
  { code: 'UR', name: 'Uruguay' },
  { code: 'VE', name: 'Venezuela' },
];

type NumericEnumSource = Record<string, string | number>;

/** Turns a numeric TS enum into the enumerator list the API would return. */
function fromNumericEnum(
  source: NumericEnumSource,
  prefix = ''
): Enumerator[] {
  return Object.keys(source)
    .filter((key) => typeof source[key] === 'number')
    .map((key) => ({ id: source[key] as number, name: prefix + key }));
}

const list = (entries: Array<[number, string]>): Enumerator[] =>
  entries.map(([id, name]) => ({ id, name }));

const PACKAGE_CODE = 'ENUM.PROCESS.DOCUMENT.PACKAGE.CODE.';

/**
 * Ids reused by demo-procurement.ts so every process resolves against the
 * enumerations below. Mismatched ids leave the procurement table blank.
 */
export const DEMO_CATEGORY_IDS = {
  WORKS: 1,
  GOODS: 2,
  NON_CONSULTING: 3,
  CONSULTING_FIRMS: 6,
};

export const DEMO_PROCUREMENT_METHOD_IDS = {
  ICB: 1,
  NCB: 2,
  DCS: 3,
  CQS: 6,
};

export const DEMO_PACKAGE_CODE_IDS = {
  BIDDING_DOCUMENTS: 1,
  OPENING_RECORD: 2,
  EVALUATION_REPORT: 3,
  AWARD_NOTIFICATION: 4,
  CONTRACT_AWARD: 5,
};

export const DEMO_MILESTONE_IDS = {
  BIDDING_DOCUMENTS: 1,
  INVITATION: 2,
  BID_OPENING: 3,
  EVALUATION: 4,
  AWARD: 5,
  SIGNED_CONTRACT: 6,
};

/**
 * Enumerations served in demo mode, keyed by the path segment the front end
 * requests (GET {api}/api/{enumType}).
 *
 * Names follow what the real API returns: a full translation key when the
 * screen translates the name directly, and a bare code when the reducer or the
 * template adds the prefix itself.
 *
 * Anything not listed here answers with an empty enumeration, which the
 * reducers handle gracefully: the related dropdown simply shows no options.
 */
export const DEMO_ENUMS: { [enumType: string]: Enumerator[] } = {
  // Translated as-is by the screens, so the name is the full key.
  biddingProcessPlanStatuses: fromNumericEnum(
    BiddingProcessPlanStatus as unknown as NumericEnumSource,
    'ENUM.PROCUREMENT.PLAN.STATUS.'
  ),
  biddingProcessProcurementProcessStatuses: fromNumericEnum(
    BiddingProcessProcurementProcessStatuses as unknown as NumericEnumSource,
    'ENUM.PROCUREMENT.PROCESS.STATUS.'
  ),

  // The enums reducer prepends PROCUREMENT.CATEGORIES. and friends.
  biddingProcessProcurementProcessCategories: list([
    [DEMO_CATEGORY_IDS.WORKS, 'PROCT_WORKS'],
    [DEMO_CATEGORY_IDS.GOODS, 'PROCT_GOODS'],
    [DEMO_CATEGORY_IDS.NON_CONSULTING, 'PROCT_NCSVC'],
    [DEMO_CATEGORY_IDS.CONSULTING_FIRMS, 'PROCT_CSTFRM'],
  ]),
  biddingProcessProcurementProcessProcurementMethods: list([
    [DEMO_PROCUREMENT_METHOD_IDS.ICB, 'PROCT_ICB'],
    [DEMO_PROCUREMENT_METHOD_IDS.NCB, 'PROCT_NCB'],
    [DEMO_PROCUREMENT_METHOD_IDS.DCS, 'PROCT_DCS'],
    [DEMO_PROCUREMENT_METHOD_IDS.CQS, 'PROCT_CQS'],
  ]),
  biddingProcessProcurementProcessSupervisionMethods: list([
    [BiddingProcurementProcessSupervisionMethods.EX_ANTE, 'ExAnte'],
    [BiddingProcurementProcessSupervisionMethods.EX_POST, 'ExPost'],
    [
      BiddingProcurementProcessSupervisionMethods.NATIONAL_SYSTEM,
      'NationalSystem',
    ],
    [
      BiddingProcurementProcessSupervisionMethods.EXTERNAL_AUDIT,
      'ExternalAudit',
    ],
    [BiddingProcurementProcessSupervisionMethods.LOCAL, 'Local'],
  ]),

  // The template builds PROCUREMENT.MILESTONES.<name>.
  biddingProcessMilestoneCodes: list([
    [DEMO_MILESTONE_IDS.BIDDING_DOCUMENTS, 'CHK_MI_BDO'],
    [DEMO_MILESTONE_IDS.INVITATION, 'CHK_MI_INV'],
    [DEMO_MILESTONE_IDS.BID_OPENING, 'CHK_MI_BD'],
    [DEMO_MILESTONE_IDS.EVALUATION, 'CHK_MI_EV'],
    [DEMO_MILESTONE_IDS.AWARD, 'CHK_MI_AW'],
    [DEMO_MILESTONE_IDS.SIGNED_CONTRACT, 'CHK_MI_CS'],
  ]),
  biddingProcessMilestoneStatuses: list([
    [0, 'PENDING'],
    [1, 'COMPLETED'],
  ]),

  biddingProcessProcurementProcessSustainabilities: list([
    [0, 'NONE'],
    [1, 'CLIMATE'],
    [2, 'GENDER'],
  ]),
  biddingProcessProcurementProcessGoodsReferences: list([
    [0, 'STANDARD'],
    [1, 'CUSTOM'],
  ]),

  commentSources: list([
    [0, 'ENUM.COMMENT.SOURCE.USER'],
    [1, 'ENUM.COMMENT.SOURCE.EXTERNAL'],
    [2, 'ENUM.COMMENT.SOURCE.BANK_SYSTEM'],
    [3, 'ENUM.COMMENT.SOURCE.FIDUCIARY_INTERFACE'],
  ]),
  commentStatuses: list([
    [0, 'ENUM.COMMENT.STATUS.DRAFT'],
    [1, 'ENUM.COMMENT.STATUS.COMPLETED'],
  ]),
  commentVisibilities: list([
    [0, 'ENUM.COMMENT.VISIBILITY.PUBLIC'],
    [1, 'ENUM.COMMENT.VISIBILITY.PRIVATE'],
  ]),
  CommentViewType: list([
    [0, 'DRAFT'],
    [1, 'COMPLETE'],
    [2, 'DRAFT_COMPLETE'],
  ]),

  projectTaskTypes: list([
    [0, 'ACTIVITIES'],
    [1, 'COMPONENT'],
    [2, 'DELIVERABLES'],
    [4, 'OUTPUT'],
    [5, 'SUB_COMPONENT'],
  ]),
  projectTaskStatuses: list([
    [0, 'ACTIVE'],
    [1, 'CLOSED'],
  ]),
  projectBucketStatuses: list([
    [0, 'ACTIVE'],
    [1, 'CLOSED'],
  ]),
  documentDomain: list([
    [0, 'PROCUREMENT'],
    [1, 'FINANCIAL'],
  ]),

  fiduciaryProcessDocumentsStatuses: list([
    [0, 'DRAFT_PENDING_UPLOAD'],
    [1, 'UPLOADED'],
    [2, 'IN_REVISION'],
    [3, 'DISCLOSED'],
  ]),
  fiduciaryProcessDocumentsTypes: list([
    [0, 'GENERAL_PROCUREMENT_NOTICE'],
    [1, 'SPECIFIC_PROCUREMENT_NOTICE'],
    [2, 'EXPRESSION_OF_INTEREST'],
  ]),

  biddingProcessDocumentPackageStatuses: fromNumericEnum(
    DocumentPackagesStatus as unknown as NumericEnumSource,
    'ENUM.PROCESS.DOCUMENT.PACKAGE.STATUS.'
  ),
  biddingProcessDocumentPackageCodes: list([
    [DEMO_PACKAGE_CODE_IDS.BIDDING_DOCUMENTS, PACKAGE_CODE + 'PUBLICATION_SPN'],
    [DEMO_PACKAGE_CODE_IDS.OPENING_RECORD, PACKAGE_CODE + 'RECORD_OPENING'],
    [
      DEMO_PACKAGE_CODE_IDS.EVALUATION_REPORT,
      PACKAGE_CODE + 'TECHNICAL_REPORT',
    ],
    [
      DEMO_PACKAGE_CODE_IDS.AWARD_NOTIFICATION,
      PACKAGE_CODE + 'NOTIFICATION_AWARD',
    ],
    [
      DEMO_PACKAGE_CODE_IDS.CONTRACT_AWARD,
      PACKAGE_CODE + 'PUBLICATION_CONTRACT_AWARD',
    ],
  ]),
  biddingProcessDocumentGroupCodes: list([
    [0, 'DRAFT_DOCUMENT'],
    [1, 'FINAL_DOCUMENT'],
    [2, 'BANK_RESPONSE'],
  ]),
  biddingProcessDocumentgroupResults: list([
    [0, 'NO_OBJECTION'],
    [1, 'WITH_COMMENTS'],
  ]),
  biddingProcessDocumentGroupVisibilities: list([
    [0, 'PUBLIC'],
    [1, 'PRIVATE'],
  ]),

  workflowActions: list([
    [0, 'STARTWORKFLOW'],
    [1, 'REVIEW'],
    [2, 'VALIDATE'],
    [3, 'AUTHORIZE'],
    [4, 'SENTTOIDB'],
  ]),
  workflowSteps: list([
    [0, 'CREATION'],
    [1, 'REVIEW'],
    [2, 'AUTHORIZATION'],
    [3, 'CLOSED'],
  ]),
  workflowRoles: list([
    [0, 'OPERATIONAL_TEAM'],
    [1, 'FIDUCIARY_SPECIALIST'],
    [2, 'EXECUTING_AGENCY'],
  ]),
  workflowTypes: list([
    [0, 'ONLINE_DISBURSEMENT'],
    [1, 'PROCUREMENT'],
  ]),
  WorkFlowDocumentVisibilities: list([
    [0, 'PUBLIC'],
    [1, 'PRIVATE'],
  ]),
  onlineDisburmentWorkflowSteps: list([
    [0, 'CREATION'],
    [1, 'REVIEW'],
    [2, 'AUTHORIZATION'],
  ]),
  onlineDisburmentWorkflowActions: list([
    [0, 'STARTWORKFLOW'],
    [1, 'REVIEW'],
    [2, 'AUTHORIZE'],
    [3, 'SENTTOIDB'],
  ]),

  TransactionStatuses: fromNumericEnum(
    TransactionsStatus as unknown as NumericEnumSource,
    'ENUM.TRANSACTION.STATUS.'
  ),
  transactionDocumentGroupCodes: list([
    [0, 'INVOICE'],
    [1, 'RECEIPT'],
    [2, 'OTHER'],
  ]),
};

/** Enum names that answer with code/name pairs instead of id/name pairs. */
export const DEMO_LOCATION_ENUMS: { [key: string]: EnumeratorCodeName[] } = {
  countries: DEMO_COUNTRIES,
  beneficiaryCountries: DEMO_COUNTRIES,
  memberCountries: DEMO_COUNTRIES,
};
