import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MsalBroadcastService,
  MsalService,
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
} from '@azure/msal-angular';
import {
  MSALGuardConfigFactory,
  MSALInstanceFactory,
} from '@fiduciary-interface/app/msal/msal.config';

@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: [
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory,
    },
    MsalBroadcastService,
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory,
    },
    MsalService,
  ],
})
export class MsalTestModule {}
