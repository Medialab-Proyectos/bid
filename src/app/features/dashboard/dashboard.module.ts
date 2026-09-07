import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardComponentRoutingModule } from './dashboard-routing.module';
import { StoreModule } from '@ngrx/store';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import {
  FilterModule,
  KendoModule,
  LoaderModule,
  PipeModule,
  StatusLabelModule,
} from '@fiduciary-interface/app/shared';

import { projectReducer } from '@core/store/projects/reducers/projects.reducer';

import { DashboardComponent } from './views/dashboard.component';
import { ProjectCardComponent } from '@fiduciary-interface/app/features/dashboard/components/project-card/project-card.component';

@NgModule({
  declarations: [DashboardComponent, ProjectCardComponent],
  imports: [
    CommonModule,
    DashboardComponentRoutingModule,
    TranslateModule,
    FilterModule,
    PipeModule,
    KendoModule,
    StatusLabelModule,
    LoaderModule,
    StoreModule.forFeature('projects', projectReducer)
  ],
  exports: [DashboardComponent],
  providers: [TranslatePipe],
})
export class DashboardModule { }
