import { Operation } from './operation.model';

export class Project {
  name: string;
  projectName: {
    en: string;
    es: string;
    pt: string;
    fr: string;
  };
  nameEn: string;
  nameEs: string;
  nameFr: string;
  namePt: string;
  operationNumber: string;
  executor: string;
  executorAcronym: string;
  contract: string;
  approvedAmount: number;
  location?: string;
  status?: ProjectStatus;
  institution?: string;
  operation?: Operation;
  countryCode: string;
  projectBucketId: string;
  id: string;
  currentApprovedAmount: number;
  favorite: boolean;
}

export enum ProjectStatus {
  InProgress = 'In progress',
  Finished = 'Finished',
}

export interface ContractOperation {
  id: string;
  operation: string;
  project: string;
  countryCode: string;
  executor: string;
  executorAcronym: string;
  projectName: {
    en: string;
    es: string;
    pt: string;
    fr: string;
  };
  nameEs: string;
  nameEn: string;
  namePt: string;
  nameFr: string;
  currentApprovedAmount: number;
  originalApprovedAmount: number;
}
export interface Operations {
  cursor: string;
  data: ContractOperation[];
  total: number;
}

export interface CountriesResponse {
  countries: CountryData[];
}

export interface CountryData {
  countryCode: string;
  total: number;
}

export interface CountryEffectResponse extends CountryData {
  name: string;
  isoCountryCode: string;
}
