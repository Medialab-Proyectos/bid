import { Injectable } from '@angular/core';
import { AppStateWithUsrPreferences } from '@core/store';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Subscription } from 'rxjs';
import { GridSettings } from './models/grid-settings.model';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private readonly suscription = new Subscription();

  selectedLanguage = '';
  private readonly _currentLanguage = new BehaviorSubject<string>('');
  readonly currentLanguage$ = this._currentLanguage.asObservable();

  public get currentLanguage() {
    return this._currentLanguage.getValue();
  }

  public set currentLanguage(val: string) {
    if (val) {
      this._currentLanguage.next(val);
    }
  }

  constructor(readonly storePreferences: Store<AppStateWithUsrPreferences>) {}

  getCurrentLang(): void {
    const sub = this.storePreferences
      .select('preferences')
      .subscribe((data) => {
        if (data && data.preferences.preferredLanguage) {
          this.selectedLanguage = data.preferences.preferredLanguage;
          this.currentLanguage = this.selectedLanguage;
        }
      });

    this.suscription.add(sub);
  }

  public get<T>(token: string): T {
    const settings = localStorage.getItem(token);
    return settings ? JSON.parse(settings) : settings;
  }

  public set(token: string, gridConfig: GridSettings): void {
    localStorage.setItem(
      token,
      JSON.stringify(gridConfig, getCircularReplacer())
    );
  }
}

const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (_, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};
