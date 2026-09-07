import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BreadcrumbModule } from 'xng-breadcrumb';
import {
  FilterModule,
  KendoModule,
  NoContentModule,
  NotificationModule,
  PipeModule,
  StatusLabelModule,
} from '@fiduciary-interface/app/shared';

import { PaymentRecordRoutingModule } from './payment-record-routing.module';
import { PaymentRecordListComponent } from './views/payment-record-list/payment-record-list.component';
import { CommitmentPaymentsComponent } from './views/commitment-payments/commitment-payments.component';
import { ExpenditureStatementComponent } from './views/expenditure-statement/expenditure-statement.component';
import { StatementComponentComponent } from './views/statement-component/statement-component.component';
import { ExecutorSituationComponent } from './views/executor-situation/executor-situation.component';
import { ProjectSummaryCardComponent } from './components/project-summary-card/project-summary-card.component';
import { CommitmentSummaryCardComponent } from './components/commitment-summary-card/commitment-summary-card.component';
import { ExchangeRateDialogComponent } from './components/exchange-rate-dialog/exchange-rate-dialog.component';
import { AddPaymentsDialogComponent } from './components/add-payments-dialog/add-payments-dialog.component';
import { UpdatePaymentDialogComponent } from './components/update-payment-dialog/update-payment-dialog.component';
import { ImportedPaymentsDialogComponent } from './components/imported-payments-dialog/imported-payments-dialog.component';
import { PaymentMechanismDialogComponent } from './components/payment-mechanism-dialog/payment-mechanism-dialog.component';
import { PickPaymentsDialogComponent } from './components/pick-payments-dialog/pick-payments-dialog.component';
import { PickCommitmentDialogComponent } from './components/pick-commitment-dialog/pick-commitment-dialog.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { PaymentConceptPipe } from './pipes/payment-concept.pipe';
import { PaymentRecordDialogService } from './services/payment-record-dialog.service';

@NgModule({
  declarations: [
    PaymentRecordListComponent,
    CommitmentPaymentsComponent,
    ExpenditureStatementComponent,
    StatementComponentComponent,
    ExecutorSituationComponent,
    ProjectSummaryCardComponent,
    CommitmentSummaryCardComponent,
    ExchangeRateDialogComponent,
    AddPaymentsDialogComponent,
    UpdatePaymentDialogComponent,
    ImportedPaymentsDialogComponent,
    PaymentMechanismDialogComponent,
    PickPaymentsDialogComponent,
    PickCommitmentDialogComponent,
    ConfirmDialogComponent,
    PaymentConceptPipe,
  ],
  imports: [
    CommonModule,
    FormsModule,
    PaymentRecordRoutingModule,
    TranslateModule,
    BreadcrumbModule,
    KendoModule,
    PipeModule,
    FilterModule,
    StatusLabelModule,
    NoContentModule,
    NotificationModule,
  ],
  providers: [PaymentRecordDialogService],
})
export class PaymentRecordModule {}
