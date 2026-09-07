import { TransactionsComponent } from './views/transactions/transactions.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TransactionCardsComponent } from './views/transaction-cards/transaction-cards.component';
import { TransactionAntComponent } from './views/transaction-ant/transaction-ant.component';
import { TransactionAnjComponent } from './views/transaction-anj/transaction-anj.component';
import { TransactionAtjComponent } from './views/transaction-atj/transaction-atj.component';
import { TransactionDpbComponent } from './views/transaction-dpb/transaction-dpb.component';
import { TransactionDpsComponent } from './views/transaction-dps/transaction-dps.component';
import { AuditTrailComponent } from './components/audit-trail/audit-trail.component';
import { TransactionDrpComponent } from './views/transaction-drp/transaction-drp.component';
import { TransactionAniComponent } from './views/transaction-ani/transaction-ani.component';
import { CanDeactivateFromGuard } from '@core/guards/canDeactivateForm.guard';
import { TransactionDpiComponent } from './views/transaction-dpi/transaction-dpi.component';
import { TransactionsResolver } from '@core/resolvers/transactions-resolver.resolver';

export const routes: Routes = [
  {
    path: '',
    component: TransactionsComponent,
  },
  {
    path: 'new-transaction',
    component: TransactionCardsComponent,
    data: {
      breadcrumb: {
        alias: 'newTransaction',
      },
    },
    resolve: {
      enums: TransactionsResolver,
    },
  },
  {
    path: 'ant',
    component: TransactionAntComponent,
    canDeactivate: [CanDeactivateFromGuard],
    data: {
      breadcrumb: {
        alias: 'ant',
      },
      canDisplayWorkflow: true,
    },
    resolve: {
      enums: TransactionsResolver,
    },
  },
  {
    path: 'ant/:id',
    component: TransactionAntComponent,
    canDeactivate: [CanDeactivateFromGuard],
    data: {
      breadcrumb: {
        alias: 'ant',
      },
      canDisplayWorkflow: true,
    },
    resolve: {
      enums: TransactionsResolver,
    },
  },
  {
    path: 'anj',
    component: TransactionAnjComponent,
    canDeactivate: [CanDeactivateFromGuard],
    data: {
      breadcrumb: {
        alias: 'anj',
      },
      canDisplayWorkflow: true,
    },
    resolve: {
      enums: TransactionsResolver,
    },
  },
  {
    path: 'anj/:id',
    component: TransactionAnjComponent,
    canDeactivate: [CanDeactivateFromGuard],
    data: {
      breadcrumb: {
        alias: 'anj',
      },
      canDisplayWorkflow: true,
    },
    resolve: {
      enums: TransactionsResolver,
    },
  },
  {
    path: 'atj',
    component: TransactionAtjComponent,
    canDeactivate: [CanDeactivateFromGuard],
    data: {
      breadcrumb: {
        alias: 'atj',
      },
      canDisplayWorkflow: true,
    },
    resolve: {
      enums: TransactionsResolver,
    },
  },
  {
    path: 'atj/:id',
    component: TransactionAtjComponent,
    canDeactivate: [CanDeactivateFromGuard],
    data: {
      breadcrumb: {
        alias: 'atj',
      },
      canDisplayWorkflow: true,
    },
    resolve: {
      enums: TransactionsResolver,
    },
  },
  {
    path: 'dpb',
    component: TransactionDpbComponent,
    canDeactivate: [CanDeactivateFromGuard],
    data: {
      breadcrumb: {
        alias: 'dpb',
      },
      canDisplayWorkflow: true,
    },
    resolve: {
      enums: TransactionsResolver,
    },
  },
  {
    path: 'dpb/:id',
    component: TransactionDpbComponent,
    canDeactivate: [CanDeactivateFromGuard],
    data: {
      breadcrumb: {
        alias: 'dpb',
      },
      canDisplayWorkflow: true,
    },
    resolve: {
      enums: TransactionsResolver,
    },
  },

  {
    path: 'dpi',
    component: TransactionDpiComponent,
    canDeactivate: [CanDeactivateFromGuard],
    data: {
      breadcrumb: {
        alias: 'dpi',
      },
      canDisplayWorkflow: true,
    },
  },
  {
    path: 'dpi/:id',
    component: TransactionDpiComponent,
    canDeactivate: [CanDeactivateFromGuard],
    data: {
      breadcrumb: {
        alias: 'dpi',
      },
      canDisplayWorkflow: true,
    },
  },
  {
    path: 'dps',

    component: TransactionDpsComponent,
    canDeactivate: [CanDeactivateFromGuard],
    data: {
      breadcrumb: {
        alias: 'dps',
      },
      canDisplayWorkflow: true,
    },
    resolve: {
      enums: TransactionsResolver,
    },
  },
  {
    path: 'dps/:id',
    component: TransactionDpsComponent,
    canDeactivate: [CanDeactivateFromGuard],
    data: {
      breadcrumb: {
        alias: 'dps',
      },
      canDisplayWorkflow: true,
    },
    resolve: {
      enums: TransactionsResolver,
    },
  },
  {
    path: 'drp',

    component: TransactionDrpComponent,
    canDeactivate: [CanDeactivateFromGuard],
    data: {
      breadcrumb: {
        alias: 'drp',
      },
      canDisplayWorkflow: true,
    },
    resolve: {
      enums: TransactionsResolver,
    },
  },
  {
    path: 'drp/:id',
    component: TransactionDrpComponent,
    canDeactivate: [CanDeactivateFromGuard],
    data: {
      breadcrumb: {
        alias: 'drp',
      },
      canDisplayWorkflow: true,
    },
    resolve: {
      enums: TransactionsResolver,
    },
  },
  {
    path: 'ani',
    component: TransactionAniComponent,
    canDeactivate: [CanDeactivateFromGuard],
    data: {
      breadcrumb: {
        alias: 'ani',
      },
      canDisplayWorkflow: true,
    },
    resolve: {
      enums: TransactionsResolver,
    },
  },
  {
    path: 'ani/:id',
    component: TransactionAniComponent,
    canDeactivate: [CanDeactivateFromGuard],
    data: {
      breadcrumb: {
        alias: 'ani',
      },
      canDisplayWorkflow: true,
    },
    resolve: {
      enums: TransactionsResolver,
    },
  },
  {
    path: ':id/audit-trail',
    component: AuditTrailComponent,
    data: {
      breadcrumb: {
        alias: 'audit-trail',
      },
      canDisplayWorkflow: true,
    },
    resolve: {
      enums: TransactionsResolver,
    },
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [CanDeactivateFromGuard],
})
export class TransactionsRoutingModule {}
