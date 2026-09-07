import {
  Component,
  inject,
  Inject,
  Input,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MAT_MOMENT_DATE_FORMATS,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  NgControl,
  Validators,
  Validator,
  AbstractControl,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { filter, map, Subject, takeUntil, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '@core/store';
import moment from 'moment';
import 'moment/locale/es';
import 'moment/locale/pt';
import 'moment/locale/fr';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'fi-mat-date',
  standalone: true,
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './mat-date.component.html',
  styleUrls: ['./mat-date.component.scss'],
})
export class MatDateComponent
  implements ControlValueAccessor, Validator, OnInit, OnDestroy, AfterViewInit
{
  @ViewChild(MatInput, { static: false }) matInput: MatInput;

  private destroy$ = new Subject<void>();
  private valueChangesSubscription: Subscription | null = null;
  ngControl = inject(NgControl, { self: true, optional: true });

  @Input() label = '';
  @Input() minDate = undefined;
  @Input() maxDate = undefined;
  @Input() outputFormat = '';

  innerControl = new FormControl<Date | null>(null);
  isDisabled = false;

  constructor(
    private _adapter: DateAdapter<any>,
    @Inject(MAT_DATE_LOCALE) private _locale: string,
    private storePreferencesSvc: Store<AppState>,
    private cdr: ChangeDetectorRef
  ) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    this.getActualLang();
  }

  ngOnInit(): void {
    if (this.isRequired) {
      this.innerControl.addValidators(Validators.required);
      this.innerControl.updateValueAndValidity({ emitEvent: false });
    }

    if (this.ngControl?.control) {
      this.ngControl.control.statusChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.syncErrors();
          if (this.matInput) {
            this.matInput.stateChanges.next();
          }
          this.cdr.detectChanges();
        });
    }
  }

  ngAfterViewInit(): void {
    if (this.matInput && this.ngControl) {
      this.matInput.ngControl = this.ngControl;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.valueChangesSubscription) {
      this.valueChangesSubscription.unsubscribe();
      this.valueChangesSubscription = null;
    }
  }

  onChange: (value: Date | string | null) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: Date | string | null): void {
    if (value) {
      let dateValue: Date;

      if (typeof value === 'string') {
        const momentDate = moment(value, 'YYYY-MM-DD', true);
        dateValue = momentDate.isValid()
          ? momentDate.toDate()
          : new Date(value);
      } else {
        dateValue = value;
      }

      this.innerControl.setValue(dateValue, { emitEvent: false });
    } else {
      this.innerControl.setValue(null, { emitEvent: false });
    }
  }

  registerOnChange(fn: (value: Date | string | null) => void): void {
    this.onChange = fn;

    if (this.valueChangesSubscription) {
      this.valueChangesSubscription.unsubscribe();
    }

    this.valueChangesSubscription = this.innerControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        const formattedValue = this.formatOutputValue(value);
        fn(formattedValue);
      });
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(value: boolean): void {
    this.isDisabled = value;
    if (value) {
      this.innerControl.disable({ emitEvent: false });
    } else {
      this.innerControl.enable({ emitEvent: false });
    }
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return control.errors;
  }

  registerOnValidatorChange(_: () => void): void {}

  onDateChange(_: Date | null): void {
    this.onTouched();
  }

  private formatOutputValue(value: Date | null): Date | string | null {
    if (!value) {
      return null;
    }
    if (this.outputFormat) {
      return moment(value).format(this.outputFormat);
    }
    return value;
  }

  private syncErrors(): void {
    const parentErrors = this.ngControl?.control?.errors;

    if (parentErrors) {
      this.innerControl.setErrors(parentErrors, { emitEvent: false });
    } else if (!this.innerControl.hasError('required')) {
      this.innerControl.setErrors(null, { emitEvent: false });
    }
  }

  getActualLang() {
    this.storePreferencesSvc
      .select('preferences')
      .pipe(
        filter((data) => data.preferences !== null),
        map((data) => data?.preferences?.preferredLanguage),
        takeUntil(this.destroy$)
      )
      .subscribe((data) => {
        this.changeLang(data);
      });
  }

  changeLang(lang: string) {
    this._locale = lang;
    this._adapter.setLocale(this._locale);
  }

  get isRequired(): boolean {
    if (this.ngControl?.control) {
      return this.ngControl.control.hasValidator(Validators.required);
    }
    return false;
  }
}
