import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FiInputCurrencyComponent } from './components/input-currency/input-currency.component';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormSectionsModule } from '../form-sections/form-sections.module';

@NgModule({
  declarations: [FiInputCurrencyComponent],
  imports: [
    CommonModule,
    InputsModule,
    LabelModule,
    ButtonsModule,
    DropDownsModule,
    FormsModule,
    ReactiveFormsModule,
    FormSectionsModule
  ],
  exports: [FiInputCurrencyComponent],
})
export class FiInputCurrencyModule { }
