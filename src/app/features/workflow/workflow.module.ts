import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkflowRoutingModule } from './workflow-routing.module';
import { WorkflowComponent } from './views/workflow/workflow.component';
import {
  DirectivesModule,
  DropdownbuttonModule,
  KendoModule,
  LoaderModule,
  MultiselectModule,
  NotificationModule,
  PipeModule,
} from '@fiduciary-interface/app/shared';
import { TranslateModule } from '@ngx-translate/core';
import { StoreModule } from '@ngrx/store';
import { workflowReducer } from './store/workflow/reducers/workflow.reducers';
import { WorkflowListComponent } from './components/workflow-list/workflow-list.component';
import { IFDatePipe } from '@fiduciary-interface/app/shared/pipes/if-date-pipe.pipe';

@NgModule({
  declarations: [WorkflowComponent, WorkflowListComponent],
  imports: [
    CommonModule,
    WorkflowRoutingModule,
    KendoModule,
    TranslateModule,
    PipeModule,
    DirectivesModule,
    DropdownbuttonModule,
    MultiselectModule,
    LoaderModule,
    NotificationModule,
    StoreModule.forFeature('projectWorkflow', workflowReducer),
  ],
  providers: [IFDatePipe],
})
export class WorkflowModule {}
