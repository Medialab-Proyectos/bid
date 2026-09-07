import { NgModule } from '@angular/core';
import { MsalModule as MsalAngularModule } from '@azure/msal-angular';
import { MSALProviders } from './msal.config';
@NgModule({
  imports: [MsalAngularModule],
  providers: MSALProviders,
})
export class MsalModule {}
