import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ProcessCommentsRoutingModule } from './process-comments-routing.module';
import { PlanContainerComponent } from './views/plan-container/plan-container.component';
import { ProcessContainerComponent } from './views/process-container/process-container.component';
import { CommentsContainerComponent } from './views/comments-container/comments-container.component';
import { EntityCommentTabstripComponent } from './components/entity-comment-tabstrip/entity-comment-tabstrip.component';
import { CommentsFilterComponent } from './components/comments-filter/comments-filter.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  AvatarModule,
  DirectivesModule,
  FilterModule,
  KendoFormsModule,
  KendoModule,
  LoaderModule,
  NoContentModule,
  NotificationModule,
  PipeModule,
  StatusLabelModule,
} from '@fiduciary-interface/app/shared';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { ProcessCommentsViewComponent } from './views/process-comments-view/process-comments-view.component';
import { ProcurementDraftCommentsComponent } from './components/procurement-process-draft-comments/procurement-process-draft-comments.component';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { EditorModule } from '@progress/kendo-angular-editor';
import { IFDatePipe } from '@fiduciary-interface/app/shared/pipes/if-date-pipe.pipe';
import { ProcurementProcessCompletedCommentsComponent } from './components/procurement-process-completed-comments/procurement-process-completed-comments.component';
import { PlanCommentsActiveViewComponent } from './views/plan-comments-active-view/plan-comments-active-view.component';
import { PlanCommentsHistoricViewComponent } from './views/plan-comments-historic-view/plan-comments-historic-view.component';
import { ProcessCommentsGroupByProcessComponent } from './views/process-comments-group-by-process/process-comments-group-by-process.component';
import { ProcurementCommentsGroupByProcessDetailComponent } from './procurement-comments-group-by-process-detail/procurement-comments-group-by-process-detail.component';
import { DateIfCommentsPipe } from './pipes/date-if-comments.pipe';

@NgModule({
  declarations: [
    PlanContainerComponent,
    ProcessContainerComponent,
    CommentsContainerComponent,
    EntityCommentTabstripComponent,
    CommentsFilterComponent,
    ProcurementDraftCommentsComponent,
    ProcessCommentsViewComponent,
    ProcurementProcessCompletedCommentsComponent,
    PlanCommentsActiveViewComponent,
    PlanCommentsHistoricViewComponent,
    ProcessCommentsGroupByProcessComponent,
    ProcurementCommentsGroupByProcessDetailComponent,
    DateIfCommentsPipe,
  ],
  imports: [
    CommonModule,
    ProcessCommentsRoutingModule,
    ReactiveFormsModule,
    KendoFormsModule,
    TranslateModule,
    FilterModule,
    PipeModule,
    KendoModule,
    StatusLabelModule,
    LoaderModule,
    ButtonsModule,
    AvatarModule,
    NoContentModule,
    FormsModule,
    InputsModule,
    LabelModule,
    NotificationModule,
    EditorModule,
    DirectivesModule,
  ],
  providers: [TranslatePipe, DatePipe, IFDatePipe],
})
export class ProcessCommentsModule {}
