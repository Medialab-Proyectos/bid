export const ProjectKeysOptionals = {
  Executor: 'executor',
  ProposalTitle: 'proposalTitle',
  ProposalNumber: 'proposalNumber',
} as const;

export const ProjectKeysMandatory = {
  InstitutionName: 'institutionName',
  Country: 'country',
  ProjectName: 'projectName',
  OperationNumber: 'operationNumber',
  ContractNumber: 'contractNumber',
  EconomicSector: 'economicSector',
} as const;

export type ProjectKeys =
  | (typeof ProjectKeysOptionals)[keyof typeof ProjectKeysOptionals]
  | (typeof ProjectKeysMandatory)[keyof typeof ProjectKeysMandatory];

export type ProjectInfo = {
  [key in (typeof ProjectKeysOptionals)[keyof typeof ProjectKeysOptionals]]?: string;
} & {
  [key in (typeof ProjectKeysMandatory)[keyof typeof ProjectKeysMandatory]]: string;
};

export type ProjectInfoField = {
  key: ProjectKeys;
  label: string;
};

const eoiTranslationMap: Record<keyof ProjectInfo, string> = {
  institutionName: 'UNDB.PROJECT_INFO.INSTITUTION',
  country: 'ANT_TRANSACTION.BENEFICIARY.BENEFICIARYBANK.COUNTRY',
  projectName: 'ACTIVITIES.OPERATION',
  operationNumber: 'UNDB.PROJECT_INFO.PROJECT_NUMBER',
  contractNumber: 'UNDB.PROJECT_INFO.CONTRACT_NUMBER',
  economicSector: 'UNDB.PROJECT_INFO.SECTOR',
  executor: 'UNDB.PROJECT_INFO.EXECUTING_AGENCY',
  proposalNumber: 'UNDB.PROJECT_INFO.PROPOSAL_NUMBER',
  proposalTitle: 'UNDB.PROJECT_INFO.PROPOSAL_TITLE',
};

const spnTranslationMap: Record<keyof ProjectInfo, string> = {
  institutionName: 'UNDB.PROJECT_INFO.INSTITUTION',
  country: 'ANT_TRANSACTION.BENEFICIARY.BENEFICIARYBANK.COUNTRY',
  projectName: 'ACTIVITIES.OPERATION',
  operationNumber: 'UNDB.PROJECT_INFO.PROJECT_NUMBER',
  contractNumber: 'UNDB.PROJECT_INFO.CONTRACT_NUMBER',
  economicSector: 'UNDB.PROJECT_INFO.SECTOR',
  executor: 'UNDB.PROJECT_INFO.EXECUTING_AGENCY',
  proposalNumber: 'UNDB.PROJECT_INFO.PROPOSAL_NUMBER',
  proposalTitle: 'UNDB.PROJECT_INFO.PROPOSAL_TITLE',
};

const sdoTranslationMap: Record<keyof ProjectInfo, string> = {
  institutionName: 'UNDB.PROJECT_INFO.INSTITUTION',
  country: 'ANT_TRANSACTION.BENEFICIARY.BENEFICIARYBANK.COUNTRY',
  projectName: 'ACTIVITIES.OPERATION',
  operationNumber: 'UNDB.PROJECT_INFO.PROJECT_NUMBER',
  contractNumber: 'UNDB.PROJECT_INFO.CONTRACT_NUMBER',
  economicSector: 'UNDB.PROJECT_INFO.SECTOR',
  executor: 'UNDB.PROJECT_INFO.EXECUTING_AGENCY',
  proposalNumber: 'UNDB.PROJECT_INFO.PROPOSAL_NUMBER.SPN',
  proposalTitle: 'UNDB.PROJECT_INFO.PROPOSAL_TITLE.SPN',
};

export enum NoticeType {
  EOI = 0,
  SDP,
  SDO,
  AGA,
}

export function getTranslationMap(noticeType: NoticeType) {
  switch (noticeType) {
    case NoticeType.EOI:
      return eoiTranslationMap;

    case NoticeType.SDP:
      return spnTranslationMap;

    case NoticeType.SDO:
      return sdoTranslationMap;
    case NoticeType.AGA:
    default:
      return eoiTranslationMap;
  }
}
