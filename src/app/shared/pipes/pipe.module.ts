import { LOCALE_ID, NgModule } from '@angular/core';

import { HighlightSearchPipe } from './highlight-search.pipe';
import { TranslateEnumPipe } from './translate-enum.pipe';
import { IFDatePipe } from './if-date-pipe.pipe';
import '@progress/kendo-angular-intl/locales/en/all';
import '@progress/kendo-angular-intl/locales/fr/all';
import '@progress/kendo-angular-intl/locales/es/all';
import '@progress/kendo-angular-intl/locales/pt/all';
import localeFr from '@angular/common/locales/fr';
import localeEs from '@angular/common/locales/es';
import localePt from '@angular/common/locales/pt';
import localeEn from '@angular/common/locales/en';
import { registerLocaleData } from '@angular/common';
import { IfNumberPipe } from './if-number.pipe';
import { OrderablePipe } from './orderable-pipe.pipe';
import { TranslateMasterDataEnumPipe } from './translate-master-data-enum.pipe';
registerLocaleData(localeFr);
registerLocaleData(localeEs);
registerLocaleData(localePt);
registerLocaleData(localeEn);

@NgModule({
  declarations: [
    HighlightSearchPipe,
    TranslateEnumPipe,
    IFDatePipe,
    IfNumberPipe,
    OrderablePipe,
    TranslateMasterDataEnumPipe,
  ],
  exports: [
    HighlightSearchPipe,
    TranslateEnumPipe,
    IFDatePipe,
    IfNumberPipe,
    OrderablePipe,
    TranslateMasterDataEnumPipe,
  ],
  providers: [
    TranslateEnumPipe,
    {
      provide: LOCALE_ID,
      useValue: 'en-US',
    },
  ],
})
export class PipeModule {}
