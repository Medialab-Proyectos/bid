import {
  Component,
  forwardRef,
  Input,
  HostListener,
  OnInit,
  Output,
  EventEmitter,
  Injector,
  ChangeDetectorRef,
  OnDestroy,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  NgControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { AppState } from '@core/store';
import { map, take } from 'rxjs';
import { LanguagesCode } from '@core/enums';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'fi-mat-numeric',
  standalone: true,
  imports: [
    MatFormFieldModule,
    CommonModule,
    MatInputModule,
    NgIf,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './mat-numeric.component.html',
  styleUrls: ['./mat-numeric.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MatNumericComponent),
      multi: true,
    },
  ],
})
export class MatNumericComponent
  implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit
{
  @ViewChild(MatInput, { static: false }) matInput: MatInput;

  @Input() set decimals(value: number) {
    if (value === null || value === undefined) {
      this.dec = 2;
    } else {
      this.dec = value;
    }
    this.initRegex();

    if (this._rawValue !== null && this._rawValue !== undefined) {
      this._internalValue = this._rawValue;
      this._displayValue = this.formatDisplayValue(this._rawValue, true);
    }
  }
  @Input() separator: string = ',';
  @Input() placeholder: string = '';
  @Input() label: string = '';
  @Input() min: number;
  @Input() max: number;
  @Input() requiredLiteral = 'BIDDER.REQUIRED';
  @Input() textPrefix: string = null;
  @Input() step = 1;
  @Input() icon = false;
  @Input() tooltipText = '';
  @Input() readonly = false;
  @Input() suffix_icon: string;
  @Output() valueChange: EventEmitter<number> = new EventEmitter<number>();

  _displayValue: string = '';
  _internalValue: number = null;
  _rawValue: number = null;
  dec: number;
  touched = false;
  private regex: RegExp;
  isDisabled: boolean = false;
  private onChange: (value: any) => void = () => {};
  public onTouched: () => void = () => {
    this.touched = true;
  };
  public ngControl: NgControl | null = null;
  private thousandsSeparator: string = ',';
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store<AppState>,
    private injector: Injector,
    private cdr: ChangeDetectorRef
  ) {}

  initRegex() {
    this.store
      .select('preferences')
      .pipe(
        map((data) => data.preferences.preferredLanguage),
        take(1)
      )
      .subscribe((language) => {
        this.separator = language === LanguagesCode.ENGLISH ? '.' : ',';
        this.thousandsSeparator =
          language === LanguagesCode.ENGLISH ? ',' : '.';
        this.regex = new RegExp(
          this.dec > 0
            ? `^-?\\d*(\\${this.separator}\\d{0,${this.dec}})?$`
            : `^-?\\d+$`
        );
      });
  }

  ngOnInit(): void {
    const ngControl = this.injector.get(NgControl, null, {
      optional: true,
      self: true,
    });
    if (ngControl) {
      this.ngControl = ngControl;
      this.ngControl.valueAccessor = this;

      // Suscribirse a cambios de estado
      if (this.ngControl.control) {
        this.ngControl.control.statusChanges
          ?.pipe(takeUntil(this.destroy$))
          .subscribe(() => {
            // Sincronizar el estado touched
            if (this.ngControl.control.touched && !this.touched) {
              this.touched = true;
            }
            // Forzar actualización del MatInput
            if (this.matInput) {
              this.matInput.stateChanges.next();
            }
            this.cdr.detectChanges();
          });
      }
    }

    this.initRegex();
  }

  ngAfterViewInit(): void {
    // Conectar el MatInput con el control
    if (this.matInput && this.ngControl) {
      this.matInput.ngControl = this.ngControl;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get displayValue(): string {
    return this._displayValue;
  }

  private getIntegerForForm(value: number): number {
    if (value === null || value === undefined || isNaN(value)) {
      return null;
    }
    return Math.floor(Math.abs(value)) * (value < 0 ? -1 : 1);
  }

  private formatDisplayValue(
    value: number,
    withThousands: boolean = false
  ): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '';
    }

    const formattedValue = value.toFixed(this.dec);
    const [integerPart, decimalPart] = formattedValue.split('.');

    if (withThousands) {
      const integerWithSeparators = integerPart.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        this.thousandsSeparator
      );
      return decimalPart
        ? `${integerWithSeparators}${this.separator}${decimalPart}`
        : integerWithSeparators;
    } else {
      return formattedValue.replace('.', this.separator);
    }
  }

  writeValue(value: any): void {
    if (value !== null && value !== undefined) {
      const numValue = Number(value);
      this._internalValue = numValue;
      this._rawValue = numValue;

      if (this.dec !== undefined && this.dec !== null) {
        this._displayValue = this.formatDisplayValue(numValue, true);
      } else {
        this._displayValue = String(numValue);
      }
    } else {
      this._internalValue = null;
      this._rawValue = null;
      this._displayValue = '';
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onInput(event: Event): void {
    const input = (event.target as HTMLInputElement).value;

    if (this.regex.test(input) || input === '') {
      this._displayValue = input;

      if (input === '' || input === null) {
        this._internalValue = null;
        this._rawValue = null;
        this.onChange(null);
        this.valueChange.emit(null);
      } else {
        const numericValue = Number(this.parseValue(input));
        this._internalValue = numericValue;
        this._rawValue = numericValue;

        const integerForForm = this.getIntegerForForm(numericValue);
        this.onChange(integerForForm);
        this.valueChange.emit(integerForForm);
      }
    } else {
      (event.target as HTMLInputElement).value = this._displayValue;
    }
  }

  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      this.separator,
    ];
    const isNumber = /^[0-9]$/.test(event.key);

    if (event.key === this.separator) {
      if (this._displayValue.includes(this.separator)) {
        event.preventDefault();
      }
    }

    if (!isNumber && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  updateValue(step: number): void {
    const currentValue = this._internalValue || 0;
    const newValue = currentValue + step;

    if (
      (this.min !== undefined && newValue < this.min) ||
      (this.max !== undefined && newValue > this.max)
    ) {
      return;
    }

    this._internalValue = newValue;
    this._rawValue = newValue;
    this._displayValue = this.formatDisplayValue(newValue);

    const integerForForm = this.getIntegerForForm(newValue);
    this.onChange(integerForForm);
    this.valueChange.emit(integerForForm);
  }

  onBlur(): void {
    if (this._displayValue !== '' && this._displayValue !== null) {
      const numericValue = Number(this.parseValue(this._displayValue));

      let finalValue = numericValue;
      if (this.min !== undefined && finalValue < this.min) {
        finalValue = this.min;
      }
      if (this.max !== undefined && finalValue > this.max) {
        finalValue = this.max;
      }

      finalValue = Number(finalValue.toFixed(this.dec));

      this._internalValue = finalValue;
      this._rawValue = finalValue;

      this._displayValue = this.formatDisplayValue(finalValue, true);

      this.onChange(this._internalValue);
      this.valueChange.emit(this._internalValue);
    } else {
      this._internalValue = null;
      this._rawValue = null;
      this._displayValue = '';
      this.onChange(null);
      this.valueChange.emit(null);
    }

    this.onTouched();
  }

  onFocus(): void {
    if (this._internalValue !== null && this._internalValue !== undefined) {
      this._displayValue = this.formatDisplayValue(this._internalValue, false);
    }
  }

  private parseValue(value: string): string {
    return value?.replace(this.separator, '.');
  }

  get isInvalid(): boolean {
    if (!this.ngControl?.control) {
      return false;
    }
    const control = this.ngControl.control;
    return control.invalid && (control.touched || control.dirty);
  }

  get isRequired(): boolean {
    return this.ngControl?.control?.hasValidator(Validators.required) ?? false;
  }
}
