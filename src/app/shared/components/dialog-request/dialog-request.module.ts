import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DialogRequestComponent } from './components/dialog-request.component';

@NgModule({
  declarations: [DialogRequestComponent],
  imports: [CommonModule],
  exports: [CommonModule, DialogRequestComponent],
})
export class DialogaRquestModule {}
