import { Project, BiddingProcessProcurementProcess } from '@core/models';
import { UndbProjectComplementaryInfo } from '@core/models/responses/undb-project-info-response.model';

export type EoiViewModel = {
  selectedProject: Project;
  selectedLanguage: string;
  projectCountry: string;
  procurementProcess: BiddingProcessProcurementProcess;
  projectComplementaryData: UndbProjectComplementaryInfo;
};

export interface GetEoiResponse {
  id: string;
  procurementNoticeId: string;
  documentPackageId: string;
  documentId: string;
  publicationNumber: string;
  projectName: string;
  version: number;
  processSummary: string;
  receptionDeadLine: string;
  consultingServices: string;
  exceptionalEligibilityRules: string;
  startOperationHour: string;
  endOperationHour: string;
  electronicOffers: boolean;
  qualificationDemonstration: string;
  linksRelatedWithTheDocument: string[];
  address: string;
  executingAgency: string;
  responsible: string;
  phone: string;
  email: string;
  webSite: string;
}
