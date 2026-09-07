import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CanDeactivateFromGuard } from '@core/guards/canDeactivateForm.guard';
import { HasPermissionGuard } from '@core/guards/hasPermission.guard';
import { CreateProcurementProcessComponent } from './views/create-procurement-process/create-procurement-process.component';
import { EditProcurementProcessComponent } from './views/edit-procurement-process/edit-procurement-process.component';
import { ReplicateProcurementProcessComponent } from './views/replicate-procurement-process/replicate-procurement-process.component';
import { ProcurementProcessComponent } from './views/procurement-process/procurement-process.component';
import { ContractsResolverResolver } from '@core/resolvers/contracts-resolver.resolver';
import { ParticipantsResolver } from '@core/resolvers/participants.resolver';
import { ProjectsResolverResolver } from '@core/resolvers/projects-resolver.resolver';

const routes: Routes = [
  {
    path: 'create',
    component: CreateProcurementProcessComponent,
    canDeactivate: [CanDeactivateFromGuard],
    data: {
      breadcrumb: {
        alias: 'createProcurement',
      },
    },
    resolve: {
      enums: ProjectsResolverResolver,
    },
  },
  {
    path: ':processId',
    component: ProcurementProcessComponent,
    children: [
      {
        path: 'edit',
        component: EditProcurementProcessComponent,
        canDeactivate: [CanDeactivateFromGuard],
        data: {
          breadcrumb: {
            alias: 'editProcurement',
          },
        },
      },
      {
        path: 'replicate',
        component: ReplicateProcurementProcessComponent,
        canDeactivate: [CanDeactivateFromGuard],
        data: {
          breadcrumb: {
            alias: 'replicateProcurement',
          },
        },
      },
      { path: '', redirectTo: 'doc-packages', pathMatch: 'full' },
      {
        path: 'doc-packages',
        loadChildren: () =>
          import(
            './features/process-doc-packages/process-doc-packages.module'
          ).then((m) => m.ProcessDocPackagesModule),
        data: { breadcrumb: { skip: true } },
      },
      {
        path: 'additional-doc-packages',
        loadChildren: () =>
          import(
            './features/process-additional-doc-packages/process-additional-doc-packages.module'
          ).then((m) => m.ProcessAdditionalDocPackagesModule),
        data: { breadcrumb: { skip: true } },
      },
      {
        path: 'participant',
        loadChildren: () =>
          import(
            './features/process-participants/process-participants.module'
          ).then((m) => m.ProcessParticipantsModule),
        data: { breadcrumb: { skip: true } },
        resolve: {
          enum: ParticipantsResolver,
        },
      },
      {
        path: 'contracts',
        canActivate: [HasPermissionGuard],
        canActivateChild: [HasPermissionGuard],
        loadChildren: () =>
          import('./features/process-contracts/process-contracts.module').then(
            (m) => m.ProcessContractsModule
          ),
        data: {
          breadcrumb: { skip: true },
        },
        resolve: {
          enums: ContractsResolverResolver,
        },
      },
      {
        path: 'payments',
        loadChildren: () =>
          import('./features/process-payments/process-payments.module').then(
            (m) => m.ProcessPaymentsModule
          ),
        data: { breadcrumb: { skip: true } },
      },
      {
        path: 'comments',
        loadChildren: () =>
          import('./features/process-comments/process-comments.module').then(
            (m) => m.ProcessCommentsModule
          ),
        data: { breadcrumb: { skip: true } },
      },
    ],
    data: {
      breadcrumb: {
        alias: 'adquisitionProcess',
      },
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [CanDeactivateFromGuard],
})
export class ProcurementProcessRoutingModule {}
