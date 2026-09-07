import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DisbursementContainerComponent } from './components/disbursement-container/disbursement-container.component';
import { DisbursementInfoRoutingModule } from './disbursement-info-routing.module';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import {
  DirectivesModule,
  KendoModule,
  LoaderModule,
  PipeModule,
} from '@fiduciary-interface/app/shared';
import { ComponentsTableComponent } from './components/components-table/components-table.component';
import { DisbursementHeaderComponent } from './components/disbursement-header/disbursement-header.component';
import { BreadcrumbModule } from 'xng-breadcrumb';
import { IfNumberPipe } from '@fiduciary-interface/app/shared/pipes/if-number.pipe';
import { IFDatePipe } from '@fiduciary-interface/app/shared/pipes/if-date-pipe.pipe';

@NgModule({
  declarations: [
    DisbursementContainerComponent,
    ComponentsTableComponent,
    DisbursementHeaderComponent,
  ],
  imports: [
    CommonModule,
    DisbursementInfoRoutingModule,
    TranslateModule,
    PipeModule,
    KendoModule,
    BreadcrumbModule,
    DirectivesModule,
    LoaderModule,
  ],
  providers: [TranslatePipe, IfNumberPipe, IFDatePipe],
})
export class DisbursementInfoModule {}
