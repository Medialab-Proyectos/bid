import { Component, Input, inject } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

@Component({
  selector: 'fi-optional-field',
  templateUrl: './optional-field.component.html',
  styleUrls: ['./optional-field.component.scss'],
})
export class OptionalFieldComponent implements ControlValueAccessor {
  ngControl = inject(NgControl, { optional: true, self: true });

  value: any;
  @Input() title: string = 'UNDB.FORM.COMMON.OPTIONAL_FIELD.TITLE';
  @Input() subtitle: string = '';
  @Input() label: string = '';
  @Input() tooltip: string = '';
  @Input() maxlength = 500;

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  writeValue(obj: any): void {
    this.value = obj;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onInputChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.onChange(value);
  }

  onChange: any = () => {};
  onTouched: any = () => {};
  isDisabled: boolean = false;
}
