import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MobileTableComponent } from './components/mobile-table/mobile-table.component';
import { OptionsMenuComponent } from './components/options-menu/options-menu.component';
import { SimpleTableComponent } from './components/simple-table/simple-table.component';
import { CrudItemComponent } from './components/crud-item/crud-item.component';

import { LayoutModule } from '@progress/kendo-angular-layout';
import { LabelModule } from '@progress/kendo-angular-label';
import { PopupModule } from '@progress/kendo-angular-popup';
import { GridModule } from '@progress/kendo-angular-grid';
import { TreeViewModule } from '@progress/kendo-angular-treeview';

import { PipeModule } from './../../pipes/pipe.module';
import { FilterModule } from './../filter/filter.module';

import { TranslateModule, TranslatePipe } from '@ngx-translate/core';

@NgModule({
  declarations: [
    SimpleTableComponent,
    MobileTableComponent,
    OptionsMenuComponent,
    CrudItemComponent
  ],
  imports: [
    CommonModule,
    LabelModule,
    LayoutModule,
    PopupModule,
    GridModule,
    TreeViewModule,
    PipeModule,
    FilterModule,
    TranslateModule,
  ],
  exports: [
    CommonModule,
    SimpleTableComponent,
    MobileTableComponent,
    OptionsMenuComponent,    
    CrudItemComponent
  ],
  providers: [TranslatePipe],
})
export class TablesModule {}
