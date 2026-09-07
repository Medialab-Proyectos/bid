import { FormArray, FormControl, FormGroup } from '@angular/forms';

export interface UBOBiddersRequest extends UBOBidders {
  executor: string;
}

export interface UBOBidders {
  bidders: UBOBidder[];
}

export interface UBOBidder {
  participantId: string;
  bidderId: string;
  name: string;
  emails: Email[];
  envelopeId: string;
  envelopeStatusId: number | null;
}

export interface Email {
  recipientId: string | null;
  emailAddress: string;
  recipientStatus: number | null;
  fullName: string;
}

export interface EmailRequest
  extends Pick<Email, 'emailAddress' | 'fullName'> {}

export interface EmailForm {
  email: FormControl<string>;
  fullName: FormControl<string>;
}

export interface BidderForm {
  name: FormControl<string>;
  emails: FormArray<FormGroup<EmailForm>>;
  bidderId: FormControl<string>;
}

export interface UBOForm {
  bidders: FormArray<FormGroup<BidderForm>>;
}

export interface UboInfo {
  countryCode: string;
  category: string;
  procurementMethod: string;
  supervisionMethod: string;
  uboInfo: UBOData;
}

/* JSON format */
interface ConfigUbo {
  value: boolean;
  mandatory: boolean;
}

interface SupervisionMethods {
  [key: string]: ConfigUbo;
}

interface ProcessRules {
  [key: string]: SupervisionMethods;
}

interface ProcessCategories {
  [key: string]: ProcessRules;
}

interface Countries {
  [key: string]: ProcessCategories;
}

export interface UBOData {
  [key: string]: Countries;
}
