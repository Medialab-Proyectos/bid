import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollButtonComponent } from './components/scroll-button.component';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { ButtonsModule } from '@progress/kendo-angular-buttons';

@NgModule({
  declarations: [ScrollButtonComponent],
  imports: [CommonModule, ButtonsModule, TranslateModule],
  exports: [ScrollButtonComponent],
  providers: [TranslatePipe]
})
export class ScrollButtonModule { }
