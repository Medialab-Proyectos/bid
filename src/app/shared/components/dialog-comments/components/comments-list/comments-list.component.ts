import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ProcurementComment } from '../../models';
import { DatePipe } from '@angular/common';
import { PreferencesstoreService } from '@core/services/store-services/preferences/preferencesstore.service';
import { Subscription, filter, take } from 'rxjs';
import { DateFormat, LanguageFormatCodes, LanguagesCode } from '@core/enums';

@Component({
  selector: 'fi-comments-list',
  templateUrl: './comments-list.component.html',
})
export class CommentsListComponent implements OnInit, OnDestroy {
  private readonly subscription = new Subscription();

  @Input() comment: ProcurementComment;

  language: string = null;
  languagesCodeEnum = LanguagesCode;
  dateFormatEnum = DateFormat;
  format: string;
  localDate: string;
  DATE_FORMAT = 'yyyy-MM-dd HH:mm:ss';

  constructor(
    private datePipe: DatePipe,
    private readonly preferencesstoreService: PreferencesstoreService
  ) {
    this.setStoreLanguage();
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.localDate = this.convertDate(String(this.comment.created));
  }

  setStoreLanguage(): void {
    const sub = this.preferencesstoreService
      .selectPreferences()
      .pipe(
        filter(
          (usrPreferencesState) =>
            !!usrPreferencesState &&
            !!usrPreferencesState.preferences.preferredLanguage
        ),
        take(1)
      )
      .subscribe((usrPreferencesState) => {
        switch (usrPreferencesState.preferences.preferredLanguage) {
          case this.languagesCodeEnum.ENGLISH:
            this.language = LanguageFormatCodes.ENGLISH;
            this.format = this.dateFormatEnum.ENGLISH;
            break;
          case this.languagesCodeEnum.FRENCH:
            this.language = LanguageFormatCodes.FRENCH;
            this.format = this.dateFormatEnum.GLOBAL;
            break;
          case this.languagesCodeEnum.SPANISH:
            this.language = LanguageFormatCodes.SPANISH;
            this.format = this.dateFormatEnum.GLOBAL;
            break;
          case this.languagesCodeEnum.PORTUGUESE:
            this.language = LanguageFormatCodes.PORTUGUESE;
            this.format = this.dateFormatEnum.GLOBAL;
            break;
          default:
            this.language = LanguageFormatCodes.ENGLISH;
            this.format = this.dateFormatEnum.GLOBAL;
            break;
        }
      });
    this.subscription.add(sub);
  }

  convertDate(fecha: string): string {
    const dateUTC = new Date(fecha);
    const dateLocal = this.datePipe.transform(
      dateUTC,
      this.DATE_FORMAT,
      null,
      this.language
    );
    return dateLocal;
  }
}
