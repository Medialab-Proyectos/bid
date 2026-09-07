import { Component, Input, inject, Optional, Self } from '@angular/core';
import { FormControl, ControlValueAccessor, NgControl } from '@angular/forms';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { AppState } from '@core/store';
import { Store } from '@ngrx/store';
import { filter, map, take } from 'rxjs';


@Component({
  selector: 'fi-undb-date-picker',
  templateUrl: './undb-date-picker.component.html',
  styleUrls: ['./undb-date-picker.component.scss'],
})
export class UndbDatePickerComponent implements ControlValueAccessor {
  private _adapter = inject(DateAdapter<any>)
  private _locale = inject(MAT_DATE_LOCALE)
  private preferencesStoreService = inject(Store<AppState>)

  @Input() label = '';
  @Input() minDate = new Date();
  @Input() set isSubmitted(submitted: boolean) {
    this._isSubmitted = submitted;
    if (this._isSubmitted) {
      if (this.ngControl) {
        this.ngControl.control.markAsTouched()
      }
    }
  }
  _isSubmitted: boolean;
  isDateInvalid: boolean;

  innerControl = new FormControl(null); // Control interno

  onChange: (value: Date | null) => void = () => { };
  onTouched: () => void = () => { };

  constructor(@Self() @Optional() public ngControl: NgControl) {
    this.getActualLang();
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }


  writeValue(_value: Date | null): void { }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(_: boolean): void { }


  getActualLang() {
    this.preferencesStoreService
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


}
