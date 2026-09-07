import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { EditorModule } from '@progress/kendo-angular-editor';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { LayoutModule } from '@progress/kendo-angular-layout';

import { IndicatorsModule, BadgeModule, LoaderModule } from '@progress/kendo-angular-indicators';
import { UploadModule, FileSelectModule, UploadsModule } from '@progress/kendo-angular-upload';

import { IconsModule } from '@progress/kendo-angular-icons';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { ContextMenuModule } from '@progress/kendo-angular-menu';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { GridModule } from '@progress/kendo-angular-grid';
import { TreeViewModule } from '@progress/kendo-angular-treeview';
import { NavigationModule } from '@progress/kendo-angular-navigation';

@NgModule({
  declarations: [],
  exports:[
    ButtonsModule,
    DropDownsModule,
    EditorModule,
    InputsModule,
    LabelModule,
    DateInputsModule,
    LayoutModule,
  ]
})
export class KendoFormsModule { }

@NgModule({
  declarations: [],
  exports:[
    IndicatorsModule,
    BadgeModule,
    LoaderModule
  ]
})
export class KendoIndicatorsModule { }

@NgModule({
  declarations: [],
  exports:[
    UploadModule,
    FileSelectModule,
    UploadsModule
  ]
})
export class KendoUploadModule { }

@NgModule({
  declarations: [],
  exports:[
    IconsModule,
    DialogModule,
    ContextMenuModule,
    PopupModule,
    TooltipModule,
    GridModule,
    TreeViewModule,
    NavigationModule,
  ]
})
export class KendoComponentsModule { }

@NgModule({
  declarations: [],
  imports: [],
  exports:[
    CommonModule,
    KendoFormsModule,
    KendoIndicatorsModule,
    KendoUploadModule,
    KendoComponentsModule
  ]
})
export class KendoModule { }


