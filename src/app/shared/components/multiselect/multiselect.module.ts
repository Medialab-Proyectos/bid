import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiselectComponent } from './components/multiselect/multiselect.component';
import { FormsModule } from '@angular/forms';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { LabelModule } from '@progress/kendo-angular-label';
import { TranslateModule } from '@ngx-translate/core';
import { MultiselectFormComponent } from './components/multiselect-form/multiselect-form.component';
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
  declarations: [MultiselectComponent, MultiselectFormComponent],
  imports: [
    DirectivesModule,
    CommonModule,
    FormsModule,
    DropDownsModule,
    LabelModule,
    TranslateModule,
  ],
  exports: [MultiselectComponent, MultiselectFormComponent],
})
export class MultiselectModule {}
