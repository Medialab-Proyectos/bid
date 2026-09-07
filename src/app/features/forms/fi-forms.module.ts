import { NgModule } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FIFormsRoutingModule } from './fi-forms-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { LabelModule } from '@progress/kendo-angular-label';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { PopupModule } from '@progress/kendo-angular-popup';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { NavigationModule } from '@progress/kendo-angular-navigation';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { GridModule } from '@progress/kendo-angular-grid';
import { FormsComponent } from './views/forms/forms.component';
import {
  TablesModule,
  DocumentsModule,
  HeaderFeatureModule,
  NotificationModule,
  LoaderModule,
  KendoModule,
  NoContentModule,
} from '@fiduciary-interface/app/shared';
import { IconsModule } from '@progress/kendo-angular-icons';
import { UiKitModule } from '@fiduciary-interface/app/shared/components/ui-kit/ui-kit.module';
import { ReviewComponent } from './components/review/review.component';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { CreateDynamicFormComponent } from './views/create-dynamic-form/create-dynamic-form.component';
import { FormSectionsModule } from '@fiduciary-interface/app/shared/components/form-sections/form-sections.module';
import { DynamicKendoComponent } from './components/dynamic-kendo/dynamic-kendo.component';
import { SpecialComponentsComponent } from './components/special-components/special-components.component';
import { DynamicPreviewDialogComponent } from './components/dynamic-preview-dialog/dynamic-preview-dialog.component';
import { DynamicFormComponent } from './components/dynamic-form/dynamic-form.component';
import { ProjectsModule } from '../projects/projects.module';
import { ProcurementProcessModule } from '../procurement/features/procurement-process/procurement-process.module';
import { ProcurementModule } from '../procurement/procurement.module';
import { ParticipantsListComponent } from './components/participants/participants-list/participants-list.component';
import { ParticipantsRejectedComponent } from './components/participants/participants-rejected/participants-rejected.component';
import { ParticipantsAwardedComponent } from './components/participants/participants-awarded/participants-awarded.component';
import { InputPhoneModule } from '@fiduciary-interface/app/shared/components/input-phone/input-phone.module';
import { ModalInfoComponent } from './components/modal/modal-info.component';
import { ModalConfirmComponent } from './components/modal-confirm/modal-confirm.component';

@NgModule({
  declarations: [
    FormsComponent,
    ReviewComponent,
    DynamicKendoComponent,
    SpecialComponentsComponent,
    DynamicPreviewDialogComponent,
    CreateDynamicFormComponent,
    DynamicFormComponent,
    ParticipantsListComponent,
    ParticipantsRejectedComponent,
    ParticipantsAwardedComponent,
    ModalInfoComponent,
    ModalConfirmComponent,
  ],
  imports: [
    CommonModule,
    FIFormsRoutingModule,
    ReactiveFormsModule,
    ButtonsModule,
    DropDownsModule,
    LabelModule,
    DateInputsModule,
    PopupModule,
    InputsModule,
    DialogModule,
    NavigationModule,
    TooltipModule,
    IconsModule,
    DocumentsModule,
    HeaderFeatureModule,
    UiKitModule,
    TablesModule,
    NotificationModule,
    TranslateModule,
    FormSectionsModule,
    LoaderModule,
    KendoModule,
    ProjectsModule,
    ProcurementProcessModule,
    ProcurementModule,
    NoContentModule,
    GridModule,
    InputPhoneModule,
  ],
  providers: [TranslatePipe, TitleCasePipe],
  exports: [
    ParticipantsListComponent,
    ModalInfoComponent,
    ModalConfirmComponent,
  ],
})
export class FIFormsModule {}
