import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectComponent } from './views/project/project.component';
import { TransactionsResolver } from '@core/resolvers/transactions-resolver.resolver';

const routes: Routes = [
  {
    path: '',
    component: ProjectComponent,
    children: [
      {
        path: 'gpn',
        loadChildren: () =>
          import('../gpn/gpn.module').then((m) => m.GpnModule),
        data: {
          breadcrumb: {
            alias: 'gpn',
          },
        },
      },
      {
        path: 'eoi',
        loadChildren: () =>
          import('../eoi/eoi.module').then((m) => m.EoiModule),
        data: {
          breadcrumb: {
            alias: 'eoi',
          },
        },
      },
      {
        path: 'procurement',
        loadChildren: () =>
          import('../procurement/procurement.module').then(
            (m) => m.ProcurementModule
          ),
        data: {
          breadcrumb: {
            alias: 'procurement',
          },
        },
      },
      {
        path: 'payment-record',
        loadChildren: () =>
          import('../payment-record/payment-record.module').then(
            (m) => m.PaymentRecordModule
          ),
        data: {
          breadcrumb: {
            alias: 'paymentRecord',
          },
        },
      },
      {
        path: 'transactions',
        loadChildren: () =>
          import('../transactions/transactions.module').then(
            (m) => m.TransactionsModule
          ),
        data: {
          breadcrumb: {
            alias: 'transactions',
          },
        },
      },
      {
        path: 'disbursement',
        loadChildren: () =>
          import('../disbursement-info/disbursement-info.module').then(
            (m) => m.DisbursementInfoModule
          ),
      },
      {
        path: 'usr-workflow',
        loadChildren: () =>
          import('../workflow/workflow.module').then((m) => m.WorkflowModule),
        data: {
          breadcrumb: {
            alias: 'usr-workflow',
          },
        },
      },
    ],
    resolve: {
      TransactionsResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectsRoutingModule { }
