import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProcessPaymentsRoutingModule } from './process-payments-routing.module';
import { PaymentsComponent } from './views/payments/payments.component';

@NgModule({
  declarations: [PaymentsComponent],
  imports: [CommonModule, ProcessPaymentsRoutingModule],
})
export class ProcessPaymentsModule { }
