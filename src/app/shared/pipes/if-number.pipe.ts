import { DecimalPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { LanguagesCode } from '@core/enums';
import { Subscription } from 'rxjs';
import { PreferencesstoreService } from '@core/services/store-services/preferences/preferencesstore.service';

@Pipe({
  name: 'ifNumber',
})
export class IfNumberPipe implements PipeTransform {
  private readonly subscription = new Subscription();
  language: string = LanguagesCode.ENGLISH;

  constructor(
    private readonly preferencesstoreService: PreferencesstoreService
  ) {
    this.setStoreLanguage();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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

  transform(value: any, decimals: number = 2): string {
    const format = `1.${decimals}-${decimals}`;

    switch (this.language) {
      case LanguagesCode.ENGLISH:
        return new DecimalPipe('en-US').transform(value, format);
      case LanguagesCode.FRENCH:
        return new DecimalPipe('fr-FR').transform(value, format);
      case LanguagesCode.SPANISH:
        return new DecimalPipe('es-ES').transform(value, format);
      case LanguagesCode.PORTUGUESE:
        return new DecimalPipe('pt-PT').transform(value, format);
      default:
        return new DecimalPipe('en-US').transform(value, format);
    }
  }
}
