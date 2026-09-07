import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownbuttonComponent } from './component/dropdownbutton.component';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';

@NgModule({
  declarations: [DropdownbuttonComponent],
  imports: [CommonModule, ButtonsModule, TranslateModule],
  exports: [DropdownbuttonComponent],
  providers: [TranslatePipe],
})
export class DropdownbuttonModule {}
