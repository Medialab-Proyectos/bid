import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  UntypedFormGroup,
  ValidationErrors,
} from '@angular/forms';
import { ComboBoxComponent } from '@progress/kendo-angular-dropdowns';
import { inputPhone, phoneNumberValidator } from './input-phone-form.form';

@Component({
  selector: 'fi-input-phone',
  templateUrl: './input-phone.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputPhoneComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => InputPhoneComponent),
      multi: true,
    },
  ],
})
export class InputPhoneComponent implements OnInit, ControlValueAccessor {
  @Input() gridData: any[];
  @Input() disabled: boolean;
  @Input() value: any;
  showGrid = false;
  content = '';
  selectedValue = '';
  @ViewChild('combobox', { static: false }) combobox: ComboBoxComponent;

  @Output() change: EventEmitter<any> = new EventEmitter();
  @Output() select: EventEmitter<any> = new EventEmitter();

  public data: Array<any>;
  @Input() form: UntypedFormGroup = inputPhone();

  constructor() {}

  ngOnInit(): void {
    this.data = this.gridData?.slice();
    if (this.value) {
      if (typeof this.value === 'string') {
        this.processPhoneNumber();
      } else {
        this.selectedValue = this.value.dialCode;
        this.form?.setValue({
          number: this.value.number,
          dialCode: this.value.dialCode,
        });
      }
    }
  }

  onChange: (value: unknown) => void = () => {};
  onTouched: () => void = () => {};

  public writeValue(value: string) {
    this.content = value;
  }

  public registerOnChange(fn: any) {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  public onValueChangeTextBoxPhone(value: any): void {
    const dialCode = this.form.get('dialCode').value;

    this.form.setValue({
      dialCode,
      number: value.replace(/\s+/g, ''),
    });

    this.change.emit(this.form.value);
    this.onChange(this.form.value);
  }

  handleFilter(code: string) {
    this.data = this.gridData.filter(
      (s) => s.country.toLowerCase().indexOf(code.toLowerCase()) !== -1
    );
  }

  onValueChange(value: any) {
    const selectedItem = this.data.find((item) => item?.code === value?.code);
    this.selectedValue = selectedItem ? selectedItem.code : '';
    this.combobox.valueField = this.selectedValue;

    this.form.setValue({
      dialCode: value?.code ?? value ?? '',
      number: this.form.get('number').value,
    });

    this.select.emit(this.form.value);
    this.onChange(this.form.value);
  }

  validate(control: AbstractControl): ValidationErrors {
    return phoneNumberValidator()(control);
  }

  private processPhoneNumber(): void {
    const dataNumber = this.value?.split(' ');

    if (dataNumber.length === 2) {
      this.selectedValue = dataNumber[0];
      this.form?.setValue({
        number: dataNumber[1],
        dialCode: this.selectedValue,
      });
    } else {
      if (dataNumber.length === 3) {
        this.selectedValue = `${dataNumber[0]} ${dataNumber[1]}`;
        this.form?.setValue({
          number: dataNumber[2],
          dialCode: this.selectedValue,
        });
      }
    }
  }
}
