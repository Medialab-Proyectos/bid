import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KendoModule } from '@fiduciary-interface/app/shared/kendo/kendo.module';

import { CardSystemOperationsComponent } from './components/card-system-operations.component';
import { DetailsSystemOperationsComponent } from './components/details-system-operations/details-system-operations.component';

@NgModule({
  declarations: [
    CardSystemOperationsComponent,
    DetailsSystemOperationsComponent,
  ],
  imports: [CommonModule, KendoModule],
  exports: [
    CommonModule,
    CardSystemOperationsComponent,
    DetailsSystemOperationsComponent,
  ],
})
export class CardSystemOpertationsModule {}
