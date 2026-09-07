import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HasPermissionGuard } from '@core/guards/hasPermission.guard';
import { ProcurementComponent } from './views/procurement/procurement.component';
import { ProcurementTabMenuComponent } from './views/procurement-tab-menu/procurement-tab-menu.component';
import { ApprovedPlansComponent } from './components/approved-plans/approved-plans.component';
import { ProcessMonitoringComponent } from './features/procurement-process/components/process-monitoring/process-monitoring.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [HasPermissionGuard],
    component: ProcurementTabMenuComponent,
    canActivateChild: [HasPermissionGuard],
    children: [
      {
        path: 'comments',
        loadChildren: () =>
          import('./features/procurement-process/features/process-comments/process-comments.module').then(
            (m) => m.ProcessCommentsModule
          ),
      },
      {
        path: 'approved-plans',
        component: ApprovedPlansComponent,
      },
      {
        path: 'monitoring',
        component: ProcessMonitoringComponent,
      },
      {
        path: '',
        component: ProcurementComponent,
      },
    ],
    data: {
      canDisplayWorkflow: true,
    },
  },
  {
    path: ':procurementId/process',
    canActivate: [HasPermissionGuard],
    canActivateChild: [HasPermissionGuard],
    loadChildren: () =>
      import('./features/procurement-process/procurement-process.module').then(
        (m) => m.ProcurementProcessModule
      ),
    data: {
      breadcrumb: { skip: true },
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProcurementRoutingModule {}
