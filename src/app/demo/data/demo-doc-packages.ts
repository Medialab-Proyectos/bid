import { DocumentPackagesStatus } from '@core/enums';
import { DEMO_PACKAGE_CODE_IDS } from './demo-enums';

const day = 24 * 60 * 60 * 1000;
const daysAgo = (days: number): Date => new Date(Date.now() - days * day);

interface DemoPackageInput {
  code: number;
  status: DocumentPackagesStatus;
  order: number;
  mandatory: number;
  uploaded: number;
  ageInDays: number | null;
}

const DEMO_PACKAGE_INPUTS: DemoPackageInput[] = [
  {
    code: DEMO_PACKAGE_CODE_IDS.BIDDING_DOCUMENTS,
    status: DocumentPackagesStatus.COMPLETE,
    order: 1,
    mandatory: 3,
    uploaded: 3,
    ageInDays: 96,
  },
  {
    code: DEMO_PACKAGE_CODE_IDS.OPENING_RECORD,
    status: DocumentPackagesStatus.COMPLETE,
    order: 2,
    mandatory: 2,
    uploaded: 2,
    ageInDays: 48,
  },
  {
    code: DEMO_PACKAGE_CODE_IDS.EVALUATION_REPORT,
    status: DocumentPackagesStatus.UNDER_REVIEW,
    order: 3,
    mandatory: 2,
    uploaded: 2,
    ageInDays: 12,
  },
  {
    code: DEMO_PACKAGE_CODE_IDS.AWARD_NOTIFICATION,
    status: DocumentPackagesStatus.NOT_STARTED,
    order: 4,
    mandatory: 1,
    uploaded: 0,
    ageInDays: null,
  },
  {
    code: DEMO_PACKAGE_CODE_IDS.CONTRACT_AWARD,
    status: DocumentPackagesStatus.NOT_STARTED,
    order: 5,
    mandatory: 1,
    uploaded: 0,
    ageInDays: null,
  },
];

/**
 * `GET /api/v3/procurement-processes/{processId}/document-packages`.
 *
 * `isOptional=true` asks for the additional packages tab, which stays empty in
 * the demo; the mandatory sequence is what the process detail screen shows.
 */
export function buildDemoDocumentPackages(
  processId: string,
  isOptional: boolean
) {
  const packages = isOptional
    ? []
    : DEMO_PACKAGE_INPUTS.map((input) => ({
        id: `${processId}-package-${input.order}`,
        status: input.status,
        code: input.code,
        totalMandatoryDocuments: input.mandatory,
        totalUploadedDocuments: input.uploaded,
        totalComments: 0,
        order: input.order,
        requireNonObjection: input.order <= 3,
        actualDate: input.ageInDays === null ? null : daysAgo(input.ageInDays),
        isOptional: false,
        biddingProcessDocumentGroups: [],
        documentsToUpload: [],
        isReadOnly: input.status === DocumentPackagesStatus.COMPLETE,
        uploadedDocAfterCompletionExist: false,
        bidValidityExtensionDate: null,
      }));

  return {
    biddingProcessDocumentPackage: packages,
    lastBidValidityExtensionDate: null,
  };
}

/** `GET /api/v3/procurement-processes/document-packages/{id}/document-groups`. */
export function buildDemoDocumentGroups() {
  return { biddingProcessDocumentGroups: [] };
}
