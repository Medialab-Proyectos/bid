import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ActivitiesRoutingModule } from './activities-routing.module';
import { ActivitiesComponent } from './views/activities/activities.component';
import { InputsModule } from '@progress/kendo-angular-inputs';

import { DashboardComponentRoutingModule } from '../dashboard/dashboard-routing.module';
import { StoreModule } from '@ngrx/store';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import {
  DialogCommentsModule,
  DirectivesModule,
  DropdownbuttonModule,
  FilterModule,
  KendoModule,
  LoaderModule,
  NoContentModule,
  PipeModule,
  StatusLabelModule,
} from '@fiduciary-interface/app/shared';

import { projectReducer } from '@core/store/projects/reducers/projects.reducer';
import { ScrollButtonModule } from '@fiduciary-interface/app/shared/components/scroll-button/scroll-button.module';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { ActivitiesTableComponent } from './components/activities-table/activities-table.component';
import { ActivityDetailTabComponent } from './components/activities-table/components/activity-detail-tab/activity-detail-tab.component';
import { ActivityTaskTableComponent } from './components/activities-table/components/activity-detail-task-table/activity-detail-task-table.component';
import { ActivityDetailDocumentsComponent } from './components/activities-table/components/activitiy-detail-documents/activity-detail-documents.component';

@NgModule({
  declarations: [
    ActivitiesComponent,
    ActivitiesTableComponent,
    ActivityDetailTabComponent,
    ActivityTaskTableComponent,
    ActivityDetailDocumentsComponent,
  ],
  imports: [
    CommonModule,
    ActivitiesRoutingModule,
    InputsModule,
    DashboardComponentRoutingModule,
    TranslateModule,
    FilterModule,
    PipeModule,
    KendoModule,
    LoaderModule,
    NoContentModule,
    DropdownbuttonModule,
    DirectivesModule,
    ScrollButtonModule,
    IndicatorsModule,
    StatusLabelModule,
    ButtonsModule,
    DialogCommentsModule,
    StoreModule.forFeature('projects', projectReducer),
  ],
  exports: [
    ActivitiesComponent,
    ActivitiesTableComponent,
    ActivityDetailTabComponent,
    ActivityTaskTableComponent,
  ],
  schemas: [NO_ERRORS_SCHEMA],
  providers: [TranslatePipe],
})
export class ActivitiesModule {}
