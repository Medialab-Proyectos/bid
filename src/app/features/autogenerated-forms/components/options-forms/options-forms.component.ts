import { Component, Input, OnInit, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import {
  FormsModule,
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
} from '@angular/forms';
import { OptionsFormModel } from '../../models';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'fi-options-forms',
  standalone: true,
  imports: [CommonModule, MatRadioModule, FormsModule, TranslateModule],
  templateUrl: './options-forms.component.html',
  styleUrls: ['./options-forms.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OptionsFormsComponent),
      multi: true,
    },
  ],
})
export class OptionsFormsComponent implements OnInit, ControlValueAccessor {
  @Input() data: OptionsFormModel = {
    options: [],
    selectedOption: '',
    title: '',
  };
  @Input() defaultValue: string = '';

  selectedOption: string = '';

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    // Ya no asignamos selectedOption aquí porque puede ser sobrescrito por writeValue
  }

  writeValue(value: string): void {
    if (value) {
      this.selectedOption = value;
    } else {
      this.selectedOption = this.data.selectedOption || this.defaultValue;
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(_: boolean): void {}

  onSelectionChange(value: string): void {
    this.selectedOption = value;
    this.onChange(value);
    this.onTouched();
  }
}
