import { EvaluationParticipantsConfig } from '@core/enums';
import { MasterData } from '../masterDataEnum.model';

export interface EvaluationParticipantsResponse {
  awardedAmount: EvaluationParticipantsConfig;
  financialScore: EvaluationParticipantsConfig;
  overallScore: EvaluationParticipantsConfig;
  technicalScore: EvaluationParticipantsConfig;
  texto?: string;
  availableResults?: MasterData[];
}
