import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BreadcrumbModule } from 'xng-breadcrumb';
import {
  FilterModule,
  KendoModule,
  NoContentModule,
  NotificationModule,
  PipeModule,
  StatusLabelModule,
} from '@fiduciary-interface/app/shared';

import { FinancialPlanRoutingModule } from './financial-plan-routing.module';
import { ActivePlanComponent } from './views/active-plan/active-plan.component';
import { ConfirmAniDialogComponent } from './components/confirm-ani-dialog/confirm-ani-dialog.component';
import { ComponentDetailDialogComponent } from './components/component-detail-dialog/component-detail-dialog.component';
import { SimulationStepperComponent } from './components/simulation-stepper/simulation-stepper.component';
import { AdjustRateDialogComponent } from './components/adjust-rate-dialog/adjust-rate-dialog.component';
import { AdjustPlanDialogComponent } from './components/adjust-plan-dialog/adjust-plan-dialog.component';
import { ConfirmPlanDialogComponent } from './components/confirm-plan-dialog/confirm-plan-dialog.component';
import { PreviousPlansComponent } from './components/previous-plans/previous-plans.component';
import { PreviousPlanDetailDialogComponent } from './components/previous-plan-detail-dialog/previous-plan-detail-dialog.component';

@NgModule({
  declarations: [
    ActivePlanComponent,
    ConfirmAniDialogComponent,
    ComponentDetailDialogComponent,
    SimulationStepperComponent,
    AdjustRateDialogComponent,
    AdjustPlanDialogComponent,
    ConfirmPlanDialogComponent,
    PreviousPlansComponent,
    PreviousPlanDetailDialogComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    FinancialPlanRoutingModule,
    TranslateModule,
    BreadcrumbModule,
    KendoModule,
    PipeModule,
    NotificationModule,
    FilterModule,
    StatusLabelModule,
    NoContentModule,
  ],
})
export class FinancialPlanModule {}
