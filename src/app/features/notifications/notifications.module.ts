import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotifacionsComponentRoutingModule } from './notifications-routing.module';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import {
  FilterModule,
  KendoModule,
  LoaderModule,
  PipeModule,
  StatusLabelModule,
} from '@fiduciary-interface/app/shared';
import { NotificationsComponent } from './views/notifacions/notificationsEmail.component';
import { IFDatePipe } from '@fiduciary-interface/app/shared/pipes/if-date-pipe.pipe';

@NgModule({
  declarations: [NotificationsComponent],
  imports: [
    CommonModule,
    NotifacionsComponentRoutingModule,
    TranslateModule,
    FilterModule,
    PipeModule,
    KendoModule,
    StatusLabelModule,
    LoaderModule,
  ],
  exports: [NotificationsComponent],
  providers: [TranslatePipe, IFDatePipe],
})
export class NotificationsModule {}
