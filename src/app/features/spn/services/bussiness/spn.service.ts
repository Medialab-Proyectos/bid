import { Injectable } from '@angular/core';
import { LanguageOptions, SpnNoticeType } from '../../enums';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SpnService {
  constructor() {}

  private isSDP = new BehaviorSubject<boolean>(false);
  public isSDP$: Observable<boolean> = this.isSDP.asObservable();

  languageMap = {
    [LanguageOptions.ENGLISH]: 'en',
    [LanguageOptions.SPANISH]: 'es',
    [LanguageOptions.FRENCH]: 'fr',
    [LanguageOptions.PORTUGUESE]: 'pt',
  };

  spnOptionsMap = {
    [SpnNoticeType.SDP]: 'SDP',
    [SpnNoticeType.SDO]: 'SDO',
  };

  get isSDPNotice(): boolean {
    return this.isSDP.value;
  }

  set isSDPNotice(value: boolean) {
    this.isSDP.next(value);
  }

  getLangOptions() {
    return Object.entries(this.languageMap).map(([key, value]) => ({
      key,
      value,
    }));
  }

  getSpnOptions() {
    return Object.entries(this.spnOptionsMap).map(([key, value]) => ({
      key,
      value,
    }));
  }

  convertUtcToLocalDate(utcDate: string): Date {
    return new Date(utcDate + 'Z');
  }

  getKeyByValue(value: string) {
    return this.getLangOptions()?.find((e) => e.value === value)?.key;
  }

  getValueOptions(options: any, id: string) {
    return options?.find((e) => e.id === id)?.name;
  }

  getUnitOfTimeName(unitsOfTime: any, unitOfTimeId: string) {
    return unitsOfTime.find((unit) => unit.id === unitOfTimeId).name;
  }
}
