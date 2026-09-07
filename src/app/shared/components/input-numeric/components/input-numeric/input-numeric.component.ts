/* eslint-disable @typescript-eslint/no-empty-function */
import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'fi-input-numeric',
  templateUrl: './input-numeric.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FiInputNumeric),
      multi: true,
    },
  ],
})
export class FiInputNumeric implements ControlValueAccessor {
  @Input() currentValue = 0;
  @Input() id: number;
  @Input() decimals = 0;
  @Input() isEditMode: boolean;
  @Input() placeholder: number;
  @Output() add: EventEmitter<number> = new EventEmitter();
  @Output() sub: EventEmitter<number> = new EventEmitter();
  @Output() typed: EventEmitter<number> = new EventEmitter();

  MAX_VALUE = 90000;

  onChange = (_: any) => {};
  onTouch = () => {};

  addNumber(): void {
    this.add.emit(this.currentValue);
  }

  subNumber(): void {
    this.sub.emit(this.currentValue);
  }

  onChangeNumber(event: number): void {
    this.typed.emit(event);
  }

  writeValue(value: number): void {
    if (value >= 0) {
      this.currentValue = value;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(): void {}
}
