import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { FiInputNumeric } from './components/input-numeric/input-numeric.component';

@NgModule({
  declarations: [FiInputNumeric],
  imports: [CommonModule, InputsModule, LabelModule, ButtonsModule],
  exports: [FiInputNumeric],
})
export class FiInputNumericModule {}
