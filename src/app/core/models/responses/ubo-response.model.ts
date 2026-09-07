import { MasterDataEnum } from '../masterDataEnum.model';

export interface UBOBiddersResponse {
  bidders: UBOBidderResponse[];
}
export interface UBOBidderResponse {
  participantId: string;
  bidderId: string;
  name: string;
  emails: EmailResponse[];
  envelopeId: string;
  envelopeStatus: MasterDataEnum;
  propertyEffectiveDocument: PropertyEffective;
}

export interface EmailResponse {
  recipientId: string;
  recipientStatus: MasterDataEnum;
  emailAddress: string;
  fullName: string;
}

interface PropertyEffective {
  id: string;
  name: string;
  ezshareNumber: string | null;
}
