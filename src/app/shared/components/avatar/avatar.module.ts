import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AvatarComponent } from './components/avatar.component';

import { LayoutModule } from '@progress/kendo-angular-layout';

@NgModule({
  declarations: [AvatarComponent],
  imports: [CommonModule, LayoutModule],
  exports: [AvatarComponent],
})
export class AvatarModule {}
