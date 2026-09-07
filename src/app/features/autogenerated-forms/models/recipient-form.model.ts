import { FormControl } from '@angular/forms';

export type RecipientFormModel = {
  [key in keyof RecipientFormData]: FormControl<RecipientFormData[key]>;
};

export interface RecipientFormData {
  address: string;
  executingAgency: string;
  responsible: string;
  phone: string;
  email: string;
  website: string;
}
