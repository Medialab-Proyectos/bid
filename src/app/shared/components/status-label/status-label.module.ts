import { PipeModule } from './../../pipes/pipe.module';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { StatusLabelComponent } from './components/status-label/status-label.component';

@NgModule({
  declarations: [StatusLabelComponent],
  imports: [CommonModule, PipeModule, TranslateModule],
  exports: [StatusLabelComponent],
  providers: [TranslatePipe],
})
export class StatusLabelModule {}
