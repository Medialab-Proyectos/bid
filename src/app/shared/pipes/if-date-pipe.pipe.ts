import { DatePipe } from '@angular/common';
import { OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { LanguagesCode } from '@core/enums';
import { PreferencesstoreService } from '@core/services/store-services/preferences/preferencesstore.service';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'dateIF',
  pure: false,
})
export class IFDatePipe implements PipeTransform, OnDestroy {
  private readonly subscription = new Subscription();

  language: string = LanguagesCode.ENGLISH;

  constructor(
    private readonly datePipe: DatePipe,
    private readonly preferencesstoreService: PreferencesstoreService
  ) {
    this.setStoreLanguage();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  transform(value: any, dateFormat: string = 'dd MMM yyyy', useUTC: boolean = false): string {
    const timezone = useUTC ? 'UTC' : null;

    switch (this.language) {
      case LanguagesCode.ENGLISH:
        return this.datePipe.transform(value, dateFormat, timezone, 'en-US');
      case LanguagesCode.FRENCH:
        return this.datePipe.transform(value, dateFormat, timezone, 'fr-FR');
      case LanguagesCode.SPANISH:
        return this.datePipe.transform(value, dateFormat, timezone, 'es-ES');
      case LanguagesCode.PORTUGUESE:
        return this.datePipe.transform(value, dateFormat, timezone, 'pt-PT');
      default:
        return this.datePipe.transform(value, dateFormat, timezone, 'en-US');
    }
  }

  setStoreLanguage(): void {
    const sub = this.preferencesstoreService
      .selectPreferences()
      .subscribe((usrPreferencesState) => {
        if (
          usrPreferencesState &&
          usrPreferencesState.preferences.preferredLanguage
        ) {
          this.language = usrPreferencesState.preferences.preferredLanguage;
        }
      });
    this.subscription.add(sub);
  }
}
