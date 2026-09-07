import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import {
  AccordionModule,
  DirectivesModule,
  KendoFormsModule,
  NotificationModule,
  PipeModule,
} from '../..';
import { CostDistributionComponent } from './components/cost-distribution/cost-distribution.component';
import { CostDistributionProcessComponent } from './components/cost-distribution-process/cost-distribution-process.component';
import { ErrorFormMsgComponent } from './components/error-msg/error-msg.component';
import { ErrorsFormMsgComponent } from './components/errors-msg/errors-msg.component';
import { MatNumericComponent } from '../mat-numeric/mat-numeric.component';

@NgModule({
  declarations: [
    CostDistributionComponent,
    ErrorFormMsgComponent,
    ErrorsFormMsgComponent,
    CostDistributionProcessComponent,
  ],
  imports: [
    CommonModule,
    AccordionModule,
    KendoFormsModule,
    NotificationModule,
    TranslateModule,
    DirectivesModule,
    PipeModule,
    MatNumericComponent,
  ],
  exports: [
    CostDistributionProcessComponent,
    CostDistributionComponent,
    ErrorFormMsgComponent,
    ErrorsFormMsgComponent,
  ],
})
export class FormSectionsModule {}
