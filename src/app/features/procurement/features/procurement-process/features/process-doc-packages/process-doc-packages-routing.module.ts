import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DocumentsTabComponent } from './views/documents-tab/documents-tab.component';

const routes: Routes = [
  {
    path: '',
    component: DocumentsTabComponent,
    data: {
      canDisplayWorkflow: true,
    },
  },
  {
    path: ':packageId/spn',
    loadChildren: () =>
      import('../../../../../spn/spn.module').then((m) => m.SpnModule),
    data: {
      breadcrumb: {
        alias: 'spn',
        skip: true,
      },
    },
  },
  {
    path: ':documentPackageId/eoi',
    loadChildren: () =>
      import('../../../../../eoi/eoi.module').then((m) => m.EoiModule),
    data: {
      breadcrumb: {
        alias: 'eoi',
        skip: true,
      },
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProcessDocPackagesRoutingModule {}
