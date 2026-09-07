import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';

@Component({
  selector: 'fi-multiselect',
  templateUrl: './multiselect.component.html',
})
export class MultiselectComponent {
  // Not typed because the component is reusable
  @Input() data: Array<any>;
  @Input() label: string;
  @Input() id: string;
  @Input() textField: string;
  @Input() valueField: string;
  @Input() disabled = false;
  @Input() prop: string;
  @Input() set values(data: string[]) {
    this._values = this.data.filter((el) => data?.includes(el[this.prop]));
  }

  @Input() formControl: UntypedFormControl;

  @Output() multiSelectChange: EventEmitter<string[]> = new EventEmitter<
    string[]
  >();

  public _values: any[];

  valueChange(event: string[]): void {
    this.multiSelectChange.emit(event);
  }
}
