export class Beneficiary {
  institutionName: string;
  acronym: string;
  beneficiaryName: string;
  accountNumber: string;
  bankFlowId: string;
  beneficiaryId?: string;
  details?: BeneficiaryDetails;
}

export interface ExecutorBeneficiaries {
  beneficiaries: Beneficiary[];
  itemsCount: number;
}

export interface BeneficiaryDetails {
  intermediaryBank: IntermediaryBank;
  beneficiaryBank: BeneficiaryBank;
  beneficiaryBasicData: BeneficiaryBasicData;
  beneficiaryAccountData: BeneficiaryAccountData;
}

export interface IntermediaryBank {
  name: string;
  branchName: string;
  swiftCode: string;
  abaRoutingCode: string;
  streetAddress: string;
  city: string;
  country: string;
  zipCode: string;
  specialInstructions: string;
}

export interface BeneficiaryBank {
  name: string;
  branchName: string;
  swiftCode: string;
  abaRoutingCode: string;
  streetAddress: string;
  city: string;
  country: string;
  zipCode: string;
  specialInstructions: string;
}

export interface BeneficiaryBasicData {
  institutionName: string;
  streetAddress: string;
  city: string;
  country: string;
  zipCode: string;
  typeName: string;
  type: string;
  id: string;
  contactFirstName: string;
  contactEmail: string;
}

export interface BeneficiaryAccountData {
  name: string;
  bankAccountNumber: string;
  accountCurrency: string;
  accountSpecialInstructions: string;
}

export interface BeneficiaryEmmiter {
  bankFlowId: string;
  accountCurrency: string;
}

export const executorBeneficiaries: ExecutorBeneficiaries = {
  beneficiaries: [
    {
      institutionName: 'Ministerio de Educación 1',
      acronym: 'COL-MIN-EDU',
      beneficiaryName: 'Ministerio de Educación',
      bankFlowId: '46f5-a4fa-13ee8c3e6416',
      accountNumber: '9988-8887-00099-009',
      details: {
        intermediaryBank: {
          name: 'string',
          branchName: 'string',
          swiftCode: 'string',
          abaRoutingCode: 'string',
          streetAddress: 'string',
          city: 'string',
          country: 'string',
          zipCode: 'string',
          specialInstructions: 'string',
        },
        beneficiaryBank: {
          name: 'string',
          branchName: 'string',
          swiftCode: 'string',
          abaRoutingCode: 'string',
          streetAddress: 'string',
          city: 'string',
          country: 'string',
          zipCode: 'string',
          specialInstructions: 'string',
        },
        beneficiaryBasicData: {
          institutionName: 'string',
          streetAddress: 'string',
          city: 'string',
          country: 'string',
          zipCode: 'string',
          typeName: 'string',
          type: 'string',
          id: 'string',
          contactFirstName: 'string',
          contactEmail: 'string',
        },
        beneficiaryAccountData: {
          name: 'string',
          bankAccountNumber: 'string',
          accountCurrency: 'string',
          accountSpecialInstructions: 'string',
        },
      },
    },
    {
      institutionName: 'Ornitorrinco',
      acronym: 'COL-MIN-EDU',
      beneficiaryName: 'Ministerio de Educación',
      bankFlowId: '46f5-a4fa-13ee8c3e6614',
      accountNumber: '9988-8887-00099-009',
      details: {
        intermediaryBank: {
          name: 'string',
          branchName: 'string',
          swiftCode: 'string',
          abaRoutingCode: 'string',
          streetAddress: 'string',
          city: 'string',
          country: 'string',
          zipCode: 'string',
          specialInstructions: 'string',
        },
        beneficiaryBank: {
          name: 'string',
          branchName: 'string',
          swiftCode: 'string',
          abaRoutingCode: 'string',
          streetAddress: 'string',
          city: 'string',
          country: 'string',
          zipCode: 'string',
          specialInstructions: 'string',
        },
        beneficiaryBasicData: {
          institutionName: 'string',
          streetAddress: 'string',
          city: 'string',
          country: 'string',
          zipCode: 'string',
          typeName: 'string',
          type: 'string',
          id: 'string',
          contactFirstName: 'string',
          contactEmail: 'string',
        },
        beneficiaryAccountData: {
          name: 'string',
          bankAccountNumber: 'string',
          accountCurrency: 'string',
          accountSpecialInstructions: 'string',
        },
      },
    },
  ],
  itemsCount: 1,
};
