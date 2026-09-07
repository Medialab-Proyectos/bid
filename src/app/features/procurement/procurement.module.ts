import { ComponentsChangesComponent } from './components/components-changes/components-changes.component';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ProcurementComponent } from './views/procurement/procurement.component';
import { ProcurementRoutingModule } from './procurement-routing.module';
import { TabContentLoadOnDemandDirective } from '@core/directives/lazyload.directive';
import { StoreModule } from '@ngrx/store';
import { headerProcessReducer, biddingProcessPlanReducer } from '@core/store';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbModule } from 'xng-breadcrumb';
import {
  FilterModule,
  NoContentModule,
  TablesModule,
  KendoModule,
  PipeModule,
  HeaderFeatureModule,
  CommentsCounterModule,
  AdvanceMilestoneModule,
  LoaderModule,
  DropdownbuttonModule,
  DirectivesModule,
  StatusLabelModule,
  AvatarModule,
  DialogCommentsModule,
} from '@fiduciary-interface/app/shared';
import { CardProcurementComponent } from './components/card-procurement/card-procurement.component';
import { TableAggregatesComponent } from './components/table-aggregates/table-aggregates.component';
import { RowDetailComponent } from './components/table-aggregates/components/row-detail/row-detail.component';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { ScrollButtonModule } from '@fiduciary-interface/app/shared/components/scroll-button/scroll-button.module';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { StatusDropdownComponent } from './components/status-dropdown/status-dropdown.component';
import { ApprovedPlansComponent } from './components/approved-plans/approved-plans.component';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { MessageService } from '@progress/kendo-angular-l10n';
import { KendoKeysMessageService } from '@fiduciary-interface/app/shared/services/kendo-keys-message.service';
import { IFDatePipe } from '@fiduciary-interface/app/shared/pipes/if-date-pipe.pipe';
import { IfNumberPipe } from '@fiduciary-interface/app/shared/pipes/if-number.pipe';
import { HistoricChangesContainerComponent } from './components/historic-changes-container/historic-changes-container.component';
import { ProcessChangesComponent } from './components/process-changes/process-changes.component';
import { MilestonesChangesComponent } from './components/milestones-changes/milestones-changes.component';
import { HistoricChangesTabstripComponent } from './components/historic-changes-tabstrip/historic-changes-tabstrip.component';
import { ComponentsHistoricTableComponent } from './components/components-historic-table/components-historic-table.component';
import { MilestonesHistoricChangesComponent } from './components/milestones-historic-changes/milestones-historic-changes.component';
import { PlanCommentsComponent } from './components/plan-comments/plan-comments.component';
import { PlanCommentsDetailsComponent } from './components/plan-comments-details/plan-comments-details.component';
import { OrderablePipe } from '@fiduciary-interface/app/shared/pipes/orderable-pipe.pipe';
import { DialogRequestWithCommentsModule } from '@fiduciary-interface/app/shared/components/dialog-request-with-comments/dialog-request-with-comments.module';
import { DelayedMilestoneTableComponent } from './components/delayed-milestone-table/delayed-milestone-table.component';
import { ProcurementTabMenuComponent } from './views/procurement-tab-menu/procurement-tab-menu.component';
import { ProcessMonitoringComponent } from './features/procurement-process/components/process-monitoring/process-monitoring.component';

@NgModule({
  imports: [
    DialogCommentsModule,
    DialogRequestWithCommentsModule,
    AvatarModule,
    CommonModule,
    ProcurementRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    KendoModule,
    BreadcrumbModule,
    FilterModule,
    NoContentModule,
    TablesModule,
    PipeModule,
    HeaderFeatureModule,
    TranslateModule,
    CommentsCounterModule,
    AdvanceMilestoneModule,
    LoaderModule,
    DropdownbuttonModule,
    DirectivesModule,
    ScrollButtonModule,
    IndicatorsModule,
    StatusLabelModule,
    ButtonsModule,
    StoreModule.forFeature('biddingProcessPlan', biddingProcessPlanReducer),
    StoreModule.forFeature('headerProcess', headerProcessReducer),
  ],
  declarations: [
    ProcurementComponent,
    TabContentLoadOnDemandDirective,
    CardProcurementComponent,
    TableAggregatesComponent,
    RowDetailComponent,
    StatusDropdownComponent,
    ApprovedPlansComponent,
    HistoricChangesContainerComponent,
    ProcessChangesComponent,
    MilestonesChangesComponent,
    ComponentsChangesComponent,
    HistoricChangesTabstripComponent,
    ComponentsHistoricTableComponent,
    MilestonesHistoricChangesComponent,
    PlanCommentsComponent,
    PlanCommentsDetailsComponent,
    DelayedMilestoneTableComponent,
    ProcurementTabMenuComponent,
    ProcessMonitoringComponent,
  ],
  providers: [
    DecimalPipe,
    TranslatePipe,
    DatePipe,
    IFDatePipe,
    IfNumberPipe,
    OrderablePipe,
    { provide: MessageService, useClass: KendoKeysMessageService },
  ],
  exports: [ProcurementComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProcurementModule {}
