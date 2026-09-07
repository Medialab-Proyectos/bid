import { FormControl, FormGroup } from '@angular/forms';

export interface CommentDateRange {
  initialDate: FormControl<Date>;
  endDate: FormControl<Date>;
}

export interface CommentFilterForm {
  user: FormControl<string>;
  visibility: FormControl<string>;
  dateRange: FormGroup<CommentDateRange>;
  activeVersion: FormControl<boolean>;
  dropdownSelection: FormControl<string>;
  processId: FormControl<string>;
  processName: FormControl<string>;
  marked: FormControl<boolean>;
}
