import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormTitleComponent } from './components/form-title/form-title.component';
import { TitleDescriptionComponent } from './components/title-description/title-description.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [FormTitleComponent, TitleDescriptionComponent],
  imports: [CommonModule, TooltipModule, TranslateModule],
  exports: [FormTitleComponent, TitleDescriptionComponent],
})
export class FormTitleModule {}
