import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import {
  HeadersModule,
  KendoModule,
  StatusLabelModule,
  DirectivesModule,
} from '../..';
import { FormSectionsModule } from '../form-sections/form-sections.module';
import { FiInputCurrencyModule } from '../input-currency/input-currency.module';
import { UiKitComponent } from './ui-kit.component';

@NgModule({
  declarations: [UiKitComponent],
  exports: [UiKitComponent],
  imports: [
    KendoModule,
    FiInputCurrencyModule,
    HeadersModule,
    StatusLabelModule,
    TranslateModule,
    ReactiveFormsModule,
    FormSectionsModule,
    DirectivesModule,
    FormsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UiKitModule {}
