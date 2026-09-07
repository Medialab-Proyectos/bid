import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelModule } from '@progress/kendo-angular-label';
import { ProcurementProcessRoutingModule } from './procurement-process-routing.module';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { ReactiveFormsModule } from '@angular/forms';
import { AccordionModule } from '@fiduciary-interface/app/shared/components/accordion/accordion.module';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { EditorModule } from '@progress/kendo-angular-editor';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { FormSectionsModule } from '@fiduciary-interface/app/shared/components/form-sections/form-sections.module';
import { ProcurementProcessDataComponent } from './components/procurement-process-data/procurement-process-data.component';
import { ProcessOutputsComponent } from './components/process-outputs/process-outputs.component';
import { ProcessAdditionalInfoComponent } from './components/process-additional-info/process-additional-info.component';
import { ProcessMilestonesComponent } from './components/process-milestones/process-milestones.component';
import { ProcessCommentsComponent } from './components/process-comments/process-comments.component';
import { CreateProcurementProcessComponent } from './views/create-procurement-process/create-procurement-process.component';
import { EditProcurementProcessComponent } from './views/edit-procurement-process/edit-procurement-process.component';
import { ReplicateProcurementProcessComponent } from './views/replicate-procurement-process/replicate-procurement-process.component';
import { ProcurementProcessComponent } from './views/procurement-process/procurement-process.component';
import { TabMenuComponent } from './components/tab-menu/tab-menu.component';
import { MilestoneComponentComponent } from './components/milestone-component/milestone-component.component';
import { InfoProcessTitleComponent } from './components/info-process-title/info-process-title.component';
import { DistributionCostComponent } from './components/distribution-cost/distribution-cost.component';
import { ProcurementFormComponent } from './components/procurement-form/procurement-form.component';

import {
  AvatarModule,
  DirectivesModule,
  FormTitleModule,
  HeaderFeatureModule,
  LoaderModule,
  NotificationModule,
  PipeModule,
} from '@fiduciary-interface/app/shared';
import { DatePickerModule } from '@progress/kendo-angular-dateinputs';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { ProcessHeaderComponent } from './components/process-header/process-header.component';
import { SustainabilityComponent } from './components/sustainability/sustainability.component';
import { IfNumberPipe } from '@fiduciary-interface/app/shared/pipes/if-number.pipe';
import { ProcurementModule } from '../../procurement.module';

@NgModule({
  declarations: [
    CreateProcurementProcessComponent,
    EditProcurementProcessComponent,
    ReplicateProcurementProcessComponent,
    ProcurementProcessComponent,
    ProcurementProcessDataComponent,
    ProcessOutputsComponent,
    ProcessAdditionalInfoComponent,
    ProcessMilestonesComponent,
    MilestoneComponentComponent,
    ProcessCommentsComponent,
    TabMenuComponent,
    InfoProcessTitleComponent,
    DistributionCostComponent,
    ProcurementFormComponent,
    ProcessHeaderComponent,
    SustainabilityComponent,
  ],
  imports: [
    CommonModule,
    ProcurementProcessRoutingModule,
    LabelModule,
    InputsModule,
    DropDownsModule,
    ReactiveFormsModule,
    TooltipModule,
    AccordionModule,
    ButtonsModule,
    EditorModule,
    FormSectionsModule,
    AvatarModule,
    NotificationModule,
    HeaderFeatureModule,
    DatePickerModule,
    FormTitleModule,
    TranslateModule,
    DirectivesModule,
    PipeModule,
    LoaderModule,
    ProcurementModule
  ],
  exports: [ProcurementProcessComponent],
  providers: [TranslatePipe, IfNumberPipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProcurementProcessModule {}
