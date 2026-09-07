import {
  Component,
  Inject,
  Input,
  OnInit,
  Optional,
  Self,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NgControl,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import 'moment/locale/es';
import 'moment/locale/pt';
import 'moment/locale/fr';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MAT_MOMENT_DATE_FORMATS,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { AppState } from '@core/store';
import { filter, map, take } from 'rxjs';

@Component({
  selector: 'fi-date-time-picker',
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.scss'],
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
})
export class DateTimePickerComponent implements ControlValueAccessor, OnInit {
  @Input() label = '';
  @Input() minDate = new Date();
  @Input() set isSubmitted(submitted: boolean) {
    this._isSubmitted = submitted;
    if (this._isSubmitted && this.date === null) {
      this.isDateInvalid = true;
    }
  }
  formattedTime: string = '';
  _isSubmitted: boolean;
  isDateInvalid: boolean;

  constructor(
    private _adapter: DateAdapter<any>,
    @Inject(MAT_DATE_LOCALE) private _locale: string,
    private storePreferencesSvc: Store<AppState>,
    @Optional() @Self() public ngControl: NgControl
  ) {
    this.getActualLang();

    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    this.formattedTime = null;
  }

  date: Date | null = null;
  time: string = '';
  innerControl = new FormControl(null); // Control interno

  onChange: (value: Date | null) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: Date | null): void {
    if (value !== null) {
      this.formattedTime = this.getHoursAndMinutes(value);
    }
    if (value) {
      this.date = value;
      this.innerControl.setValue(value);
    } else {
      this.date = null;
      this.time = '';
      this.innerControl.setValue(null);
    }
  }

  getHoursAndMinutes(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(_: boolean): void {
    this.innerControl.disabled
      ? this.innerControl.disable()
      : this.innerControl.enable();
  }

  validate(): ValidationErrors | null {
    return this.innerControl.valid ? null : { required: true };
  }

  get isInvalid(): boolean {
    return this.innerControl.invalid && this.innerControl.touched;
  }

  onDateChange(event: Date | null): void {
    this.date = event;
    this.updateValue();
  }

  onTimeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.time = input.value;
    this.updateValue();
  }

  private updateValue(): void {
    if (this.date && this.formattedTime) {
      const [hours, minutes] = this.formattedTime.split(':').map(Number);
      const newDate = new Date(this.date);
      newDate.setHours(hours, minutes, 0, 0);
      this.innerControl.setValue(newDate);
      this.onChange(newDate);
    } else {
      this.innerControl.setValue(null);
      this.onChange(null);
    }
  }

  getActualLang() {
    this.storePreferencesSvc
      .select('preferences')
      .pipe(
        filter((data) => data.preferences !== null),
        map((data) => data?.preferences?.preferredLanguage),
        take(1)
      )
      .subscribe((data) => {
        this.changeLang(data);
      });
  }

  changeLang(lang: string) {
    this._locale = lang;
    this._adapter.setLocale(this._locale);
  }

  moveToMinutes(inputElement: HTMLInputElement, event): void {
    setTimeout(() => inputElement.setSelectionRange(3, 5));
    event.preventDefault();
  }

  moveToHour(inputElement: HTMLInputElement, event): void {
    setTimeout(() => inputElement.setSelectionRange(0, 2));
    event.preventDefault();
  }

  onKeyDown(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const cursorPosition = inputElement.selectionStart || 0;
    let isHour = cursorPosition < 3;
    if (this.formattedTime !== null) {
      let [hours, minutes] = this.formattedTime
        .split(':')
        .map((num) => parseInt(num, 10));

      switch (event.key) {
        case 'ArrowUp':
          if (isHour) {
            hours = (hours + 1) % 24;
          } else {
            minutes = (minutes + 1) % 60;
          }
          break;
        case 'ArrowDown':
          if (isHour) {
            hours = hours === 0 ? 23 : hours - 1;
          } else {
            minutes = minutes === 0 ? 59 : minutes - 1;
          }
          break;
        case 'ArrowRight':
          if (isHour) {
            this.moveToMinutes(inputElement, event);
            return;
          }
          break;
        case 'ArrowLeft':
          if (!isHour) {
            this.moveToHour(inputElement, event);
            return;
          }
          break;
      }
      if (!isNaN(Number(event.key))) {
        if (cursorPosition < 3) {
          if (hours >= 3) {
            if (Number(event.key) < hours) {
              hours = Number(event.key);
            } else {
              if (Number(event.key) > hours && Number(event.key) >= 3) {
                hours = Number(event.key);
                isHour = false;
                this.moveToMinutes(inputElement, event);
              }
            }
          } else {
            if (hours === 1) {
              hours = 10 + Number(event.key);
              isHour = false;
              this.moveToMinutes(inputElement, event);
            } else {
              if (hours === 2) {
                hours = 20 + Number(event.key);
                if (hours >= 23) {
                  hours = 23;
                }
                isHour = false;
                this.moveToMinutes(inputElement, event);
              } else {
                if (hours === 0) {
                  hours = Number(event.key);
                  isHour = false;
                  this.moveToMinutes(inputElement, event);
                }
              }
            }
          }
        } else {
          if (minutes > 10 && minutes < 99) {
            minutes = Number(event.key);
          } else {
            if (minutes === 0) {
              minutes = Number(event.key);
            } else {
              minutes = minutes * 10 + Number(event.key);
            }
          }
          if (minutes > 59) {
            minutes = 59;
          }
        }
      }
      this.formattedTime = this.formatTime(hours, minutes);
      setTimeout(() => {
        inputElement.setSelectionRange(isHour ? 0 : 3, isHour ? 2 : 5);
      });
      event.preventDefault();
      this.updateValue();
    }
  }

  onInput(event: any) {
    let value = event.target.value.replace(/[^0-9:]/g, '');
    if (value.length > 2 && !value.includes(':')) {
      value = value.substring(0, 2) + ':' + value.substring(2);
    }
    if (value.length > 5) {
      value = value.substring(0, 5);
    }
    const parts = value.split(':');
    let hours = parseInt(parts[0], 10);
    let minutes = parts[1] ? parseInt(parts[1], 10) : 0;
    if (isNaN(hours) || hours > 23) hours = 23;
    if (isNaN(minutes) || minutes > 59) minutes = 59;
    this.formattedTime = this.formatTime(hours, minutes);
    setTimeout(() => {
      const inputElement = event.target as HTMLInputElement;
      const cursorPosition = inputElement.selectionStart || 0;
      const isHour = cursorPosition < 3;
      inputElement.setSelectionRange(isHour ? 0 : 3, isHour ? 2 : 5);
    });
    this.updateValue();
  }

  private formatTime(hours: number, minutes: number): string {
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;
  }

  get isRequired() {
    if (this.ngControl && this.ngControl.control) {
      return this.ngControl.control.hasValidator(Validators.required);
    }
    return false;
  }
}
