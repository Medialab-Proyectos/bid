import { Component, Input, Output, EventEmitter } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { ProcurementProcess } from '../../procurement-process.form';

@Component({
  selector: 'fi-procurement-process-data',
  templateUrl: './procurement-process-data.component.html',
})
export class ProcurementProcessDataComponent {
  public justificationIsRequired = false;

  visibleWarningMessage: boolean;
  _warningMessage: string;
  maxlengthProcessName = 1024;

  @Input() categories$: Observable<any>;
  @Input() procurementMethods$: Observable<any>;
  @Input() supervisionMethods$: Observable<any>;

  @Input() processForm: UntypedFormGroup = ProcurementProcess();
  @Input() number;

  @Input() justificationVisibility: boolean;

  @Input() set warningMessage(value: string) {
    if (value) {
      this.visibleWarningMessage = true;
      this._warningMessage = value;
    } else {
      this.visibleWarningMessage = false;
    }
  }

  @Output() changeDropdown = new EventEmitter<any>();

  constructor() {}

  get categoryControl(): UntypedFormControl {
    return this.processForm.get('category') as UntypedFormControl;
  }

  get justificationControl(): UntypedFormControl {
    return this.processForm.get('justification') as UntypedFormControl;
  }

  valueChange(event, dropdownValue): void {
    this.changeDropdown.emit({ event, dropdownValue });
  }

  addPrefix(key: string, mode: string): string {
    if (mode === 'category') {
      return `PROCUREMENT.CATEGORIES.${key}`;
    } else {
      if (mode === 'adquisitonMethod') {
        return `PROCUREMENT.PROCUREMENT_METHOD.${key}`;
      } else {
        return `PROCUREMENT.SUPERVISION_METHOD.${key}`;
      }
    }
  }
}
