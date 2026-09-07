import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { Userpilot } from 'userpilot';

if (environment.production) {
  enableProdMode();
}

if(environment.userPilot.enabled) {
  Userpilot.initialize(environment.userPilot.appToken);
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
