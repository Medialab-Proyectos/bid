import { APP_INITIALIZER, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InitService } from '@core/services/app';

@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: InitialServices,
      deps: [InitService],
      multi: true,
    },
  ],
})
export class InitialQueriesModule {}

function InitialServices(loader: InitService) {
  return async (): Promise<boolean> => loader.initializeFunction();
}
