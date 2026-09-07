import { NgModule } from '@angular/core';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { LoaderComponent } from './components/loader.component';

@NgModule({
  declarations: [LoaderComponent],
  imports: [IndicatorsModule],
  exports: [LoaderComponent],
})
export class LoaderModule {}
