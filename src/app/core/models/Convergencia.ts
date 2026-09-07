import { Publication } from '@fiduciary-interface/app/features/forms/models/dynamic-form.model';
export interface Convergencia {
  countryCode: string;
  country: string;
  TotalFinanceCost: number;
  projectName: string;
  executingAgency: string;
  approvalNumber: string;
  operationId: string;
  operationNumber: string;
  lenguage?: string;
}

export interface FormConvergencia {
  convergence: Convergencia;
  language: string;
  timeZone: string;
  publications: Publication[];
}
