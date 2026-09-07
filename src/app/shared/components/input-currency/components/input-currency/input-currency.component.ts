import {
  Component,
  forwardRef,
  Input,
  ViewChild,
  ElementRef,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import {
  ControlValueAccessor,
  UntypedFormGroup,
  NG_VALUE_ACCESSOR,
  Validators,
} from '@angular/forms';
import { CurrencyEnum } from '@core/models';
import { Subscription } from 'rxjs';
import { inputCurrency } from './input-currency-form.form';

@Component({
  selector: 'fi-input-currency',
  templateUrl: './input-currency.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FiInputCurrencyComponent),
      multi: true,
    },
  ],
})
export class FiInputCurrencyComponent
  implements ControlValueAccessor, OnInit, OnChanges{
    
  @ViewChild('currencyDropdown') currencyField: ElementRef;
  @Input() config: string;
  @Input() currencies: CurrencyEnum[] = [];
  @Input() form: UntypedFormGroup = inputCurrency();
  @Input() id: number;
  @Input() isAmountRequired: boolean;
  @Input() labelText: string;
  @Input() numberOfDecimals = 2;
  @Input() spinnerVisibility = false;
  @Input() currencyDisabled = false;
  @Output() selectedValue = new EventEmitter<string>();

  private readonly suscription = new Subscription();
  format: string;
  isDisabled: boolean;

  ngOnInit(): void {
    this.valueChangeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.numberOfDecimals && changes.numberOfDecimals.currentValue) {
      this.setFormat(this.numberOfDecimals);
    }

    if (changes.isAmountRequired && changes.isAmountRequired.currentValue) {
      this.form.get('amount').setValidators([Validators.required]);
    } else {
      this.form.get('amount').setValidators([]);
    }

    if((changes.currencyDisabled && changes.currencyDisabled.currentValue === true)  || this.isDisabled)
    {
      this.form.get('amount').disable();
      this.form.get('currency').disable();
    }
  }

  setFormat(numberOfDecimals: number): void {
    if (numberOfDecimals === 2) {
      this.format = 'n2';
    } else {
      this.format = 'n0';
    }
  }

  valueChangeForm(): void {
    const sub = this.form.valueChanges.subscribe((data) => {
      if (data !== undefined && this.val !== data) {
        this.val = data;
        this.onChange(data);
        this.onTouch(data);
      }
    });
    this.suscription.add(sub)
  }

  onCurrencyChange(newCurrency: string) {
    this.selectedValue.emit(newCurrency)
  }

  onChange: any = () => {};
  onTouch: any = () => {};
  val = '';

  set value(val) {
    if (val !== undefined && this.val !== val) {
      this.val = val;
      this.onChange(val);
      this.onTouch(val);
    }
  }

  writeValue(value: any): void {
    this.value = value;
    if (value) {
      this.form.setValue({
        amount: value.amount,
        currency: value.currency.currency,
      });
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }
}
