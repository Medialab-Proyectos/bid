import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'fi-multiselect-form',
  templateUrl: './multiselect-form.component.html',
  styleUrls: ['./multiselect-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiselectFormComponent),
      multi: true,
    },
  ],
})
export class MultiselectFormComponent implements ControlValueAccessor {
  @Input() text: string;
  @Input() data: Array<{ text: string; value: number }> = [];

  value: number[] = [];
  disabled: boolean;

  onChange: (value: number[]) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: number[]): void {
    this.value = value || [];
  }

  registerOnChange(fn: (value: number[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  public closed(): void {
    this.onTouched();
  }
}
