import { MasterData, MasterDataEnum } from '../masterDataEnum.model';

export type Score = 'O' | 'R' | 'N';

interface BaseSettingsParticipants {
  technicalScore: Score;
  financialScore: Score;
  overallScore: Score;
  awardedAmount: Score;
}

export interface SettingsParticipantsResponse extends BaseSettingsParticipants {
  id: string;
  countryCode: string;
  category: string;
  procurementMethod: string;
  availableResults: MasterDataEnum[];
  packageCode: string;
  text: string;
}

export interface SettingsParticipants extends BaseSettingsParticipants {
  availableResults: MasterData[];
  text: string;
}
