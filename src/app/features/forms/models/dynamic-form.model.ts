import { FormValidatorType } from '../enums/validators-type.enum';
import { Comments } from './comment.model';
import { ParticipantNoaGet } from './response/participant-noa-detail-response.model';

export interface JsonFormModel {
  id: string;
  idDocument: string;
  headerTitle: string;
  instruccions: string;
  dynamicActions: DynamicActions;
  errorDefinitions: ErrorDefinitions[];
  status: number;
  type: string;
  numerals: Numeral[];
  participants?: ParticipantNoaGet[];
  publications?: Publication[];
  language?: string;
}

export interface Numeral {
  title: string;
  tooltip?: string;
  number: number;
  rows: Rows[];
  comments?: Comments[];
  subtitle?: string;
}

export interface ErrorDefinitions {
  key: string;
  name: string;
}

export interface Component {
  type: string;
  templateVariable: string;
  id: string;
  dataTestId: string;
  value: any;
  formControlName: string;
  class: string;
  key: string;
  placeHolder?: string;
  associationNumber: number;
  dropdownOptions?: DropdownOptions[];
  evaluatedBiddersList: EvaluatedBiddersList[];
  textAreaOptions?: TextAreaOptions;
  defaultItem?: string;
  inputNumericOptions?: InputNumericOptions;
  radioButtonList?: RadioButtonList[];
  specialOptions?: SpecialOptions;
  datePickerOptions?: DatePickerOptions;
  validators?: FormValidator[];
  kendoLabel: KendoLabel;
  showRequired?: string;
  errorMsg?: ErrorMsg;
  filterable?: boolean;
}

export interface SpecialOptions {
  rows: Rows[];
}

export interface DatePickerOptions {
  calendarType: string;
  format: string;
  min?: string;
  max?: string;
}

export interface TextAreaOptions {
  description?: string;
}

export interface RadioButtonList {
  idRadioButton: string;
  value: number;
  dataTestId: string;
  label: string;
  description?: string;
}

export interface InputNumericOptions {
  decimals?: number;
  min?: string;
  max?: string;
}

export interface DropdownOptions {
  id: number;
  value: string;
  text: string;
  description?: string;
}

export interface Rows {
  components: Component[];
}

// AGREGAR MAS VALIDADORES
export interface DynamicActions {
  preview: string;
  requestAuthorizationEnpoint: string;
  createDocument: string;
  generateDocument: string;
  save: string;
}

export interface FormValidator {
  name: FormValidatorType;
  value: string;
  errorMsg: string;
  required: boolean;
}

export interface KendoLabel {
  for: string;
  text: string;
}

export interface ErrorMsg {
  key: string;
}

export interface EvaluatedBiddersList {
  name: string;
  score: number;
  finalPrice: number;
  initialPrice: number;
  offererNationality: string;
}

export interface Publication {
  undbVersionNumber: string;
  undbPublicationDate: Date;
  version: number;
  address: string;
}
