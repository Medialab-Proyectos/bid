import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ErrorListComponent } from './components/error-list/error-list.component';
import { AlertComponent } from './components/alert/alert.component';
import { ToastComponent } from './components/toast/toast.component';

import { LayoutModule } from '@progress/kendo-angular-layout';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { InfoBannerComponent } from './components/info-banner/info-banner.component';

@NgModule({
  declarations: [
    AlertComponent,
    ErrorListComponent,
    ToastComponent,
    InfoBannerComponent,
  ],
  imports: [CommonModule, LayoutModule, TranslateModule],
  exports: [
    CommonModule,
    AlertComponent,
    ErrorListComponent,
    ToastComponent,
    InfoBannerComponent,
  ],
  providers: [TranslatePipe],
})
export class NotificationModule {}
