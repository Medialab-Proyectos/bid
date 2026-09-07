import { EvaluationParticipantsConfig } from '@core/enums';

export interface ParticipantConfig {
  awardedAmount: EvaluationParticipantsConfig;
  financialScore: EvaluationParticipantsConfig;
  overallScore: EvaluationParticipantsConfig;
  technicalScore: EvaluationParticipantsConfig;
}
