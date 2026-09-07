import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { AppStateWithUsrPreferences, UsrPreferencesState } from '@core/store';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Pipe({
  name: 'dateIfComments',
})
export class DateIfCommentsPipe implements PipeTransform {
  selectedLanguage: string;
  constructor(
    readonly storePreferences: Store<AppStateWithUsrPreferences>,
    private readonly datePipe: DatePipe
  ) {
    this.getPreferences().subscribe((data) => {
      if (data.preferences) {
        if (
          data.preferences.preferredLanguage === '' ||
          !data.preferences.preferredLanguage
        ) {
          this.selectedLanguage = data.preferences.defaultLanguage;
        } else {
          this.selectedLanguage = data.preferences.preferredLanguage;
        }
      }
    });
  }

  convertUTCToLocal(isoDateString) {
    const utcDate = new Date(isoDateString);
    const timezoneOffset = utcDate.getTimezoneOffset();
    const localDate = new Date(utcDate.getTime() - timezoneOffset * 60 * 1000);
    const isoLocalDate = localDate.toISOString();
    return isoLocalDate;
  }

  transform(value: string, format: 'EEEE' | 'shortTime' | 'short'): unknown {
    if (value === null) {
      return null;
    }
    let dateToLocalTime = this.convertUTCToLocal(value);
    if (format === 'EEEE' || format === 'shortTime') {
      const datePipe = new DatePipe(this.selectedLanguage);
      return this.capitalize(datePipe.transform(dateToLocalTime, format));
    } else {
      const formatDate = this.getFormatByLang(this.selectedLanguage);
      return this.datePipe.transform(
        dateToLocalTime,
        formatDate,
        this.selectedLanguage
      );
    }
  }

  public getPreferences(): Observable<UsrPreferencesState> {
    return this.storePreferences.select('preferences');
  }

  capitalize(value: string) {
    if (!value) {
      return value;
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  getFormatByLang(language: string): string {
    switch (language) {
      case 'es':
      case 'pt':
      case 'fr':
        return 'dd/MM/yy';
      case 'en':
        return 'MM/dd/yy';
    }
  }
}
