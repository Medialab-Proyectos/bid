import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommitmentPaymentsComponent } from './views/commitment-payments/commitment-payments.component';
import { ExpenditureStatementComponent } from './views/expenditure-statement/expenditure-statement.component';
import { PaymentRecordListComponent } from './views/payment-record-list/payment-record-list.component';
import { StatementComponentComponent } from './views/statement-component/statement-component.component';
import { ExecutorSituationComponent } from './views/executor-situation/executor-situation.component';

const routes: Routes = [
  {
    path: '',
    component: PaymentRecordListComponent,
  },
  {
    // Alternative reading of the same records: the position of the agency
    // rather than the ledger. Sits beside the list, not instead of it.
    path: 'situation',
    component: ExecutorSituationComponent,
    data: { breadcrumb: { alias: 'executorSituation' } },
  },
  {
    // Drill-down of one component of the statement being built.
    path: 'expenditure-statement/components/:componentCode',
    component: StatementComponentComponent,
    data: { breadcrumb: { alias: 'statementComponent' } },
  },
  {
    // Must stay ahead of `:commitmentId`, which would otherwise swallow it.
    path: 'expenditure-statement',
    component: ExpenditureStatementComponent,
    data: { breadcrumb: { alias: 'expenditureStatement' } },
  },
  {
    path: ':commitmentId',
    component: CommitmentPaymentsComponent,
    data: { breadcrumb: { alias: 'paymentRecordCommitment' } },
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentRecordRoutingModule {}
