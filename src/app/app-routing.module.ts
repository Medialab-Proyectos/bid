import { NgModule } from '@angular/core';
import { Routes, RouterModule, ExtraOptions } from '@angular/router';
import { BrowserUtils } from '@azure/msal-browser';
import { UiKitComponent } from './shared/components/ui-kit/ui-kit.component';
import { ProjectsResolverResolver } from '@core/resolvers/projects-resolver.resolver';
import { TransactionsResolver } from '@core/resolvers/transactions-resolver.resolver';
import { SelectedProjectGuard } from '@core/guards/selected-project.guard';
import { DashboardResolver } from '@core/resolvers/dashboard.resolver';
import { userPilotGuard } from '@core/guards/userPilot.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'forms',
    loadChildren: () =>
      import('./features/forms/fi-forms.module').then((m) => m.FIFormsModule),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard.module').then(
        (m) => m.DashboardModule
      ),
    canActivate: [userPilotGuard],
    resolve: {
      enums: DashboardResolver,
    },
  },
  {
    path: 'activities',
    loadChildren: () =>
      import('./features/activities/activities.module').then(
        (m) => m.ActivitiesModule
      ),
    canActivate: [userPilotGuard],
    resolve: {
      enums: ProjectsResolverResolver,
    },
  },
  {
    path: 'notification',
    loadChildren: () =>
      import('./features/notifications/notifications.module').then(
        (m) => m.NotificationsModule
      ),
    canActivate: [userPilotGuard],
  },
  {
    path: 'project/:code/:contract',
    loadChildren: () =>
      import('./features/projects/projects.module').then(
        (m) => m.ProjectsModule
      ),
    canActivate: [SelectedProjectGuard, userPilotGuard],
    data: { breadcrumb: { skip: true } },
    runGuardsAndResolvers: 'always',
    resolve: {
      enums: ProjectsResolverResolver,
    },
  },
  {
    path: 'project/:code/:contract/transactions',
    loadChildren: () =>
      import('./features/transactions/transactions.module').then(
        (m) => m.TransactionsModule
      ),
    canActivate: [userPilotGuard],
    // data: { breadcrumb: { skip: true } },
    // pathMatch: 'full',
    resolve: {
      enums: TransactionsResolver,
    },
  },
  {
    path: 'project/:code/:contract/disbursement',
    loadChildren: () =>
      import('./features/disbursement-info/disbursement-info.module').then(
        (m) => m.DisbursementInfoModule
      ),
    canActivate: [userPilotGuard],
  },
  {
    path: 'project/:code/:contract/usr-workflow',
    loadChildren: () =>
      import('./features/workflow/workflow.module').then(
        (m) => m.WorkflowModule
      ),
    canActivate: [userPilotGuard],
    // data: { breadcrumb: { skip: true } },
    // pathMatch: 'full',
    resolve: {
      enums: ProjectsResolverResolver,
    },
  },
  {
    path: 'ui-kit',
    component: UiKitComponent,
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
const routerOptions: ExtraOptions = {
  scrollPositionRestoration: 'enabled',
  paramsInheritanceStrategy: 'always',
  anchorScrolling: 'enabled',
  scrollOffset: [0, 64],
  useHash: true,
  initialNavigation:
    !BrowserUtils.isInIframe() && !BrowserUtils.isInPopup()
      ? 'enabledNonBlocking'
      : 'disabled',
};
@NgModule({
  imports: [RouterModule.forRoot(routes, routerOptions)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
