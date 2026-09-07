import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputPhoneComponent } from './components/input-phone/input-phone.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LabelModule } from '@progress/kendo-angular-label';
import { GridModule } from '@progress/kendo-angular-grid';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { IconsModule } from '@progress/kendo-angular-icons';
import { TablesModule } from '../tables/tables.module';
import { FormSectionsModule } from '../form-sections/form-sections.module';
import { LoaderModule } from '@progress/kendo-angular-indicators';
import { KendoModule } from '../../kendo/kendo.module';
@NgModule({
  declarations: [InputPhoneComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LabelModule,
    GridModule,
    InputsModule,
    FormsModule,
    TooltipModule,
    IconsModule,
    TablesModule,
    FormSectionsModule,
    LoaderModule,
    KendoModule,
  ],
  exports: [InputPhoneComponent],
})
export class InputPhoneModule {}
