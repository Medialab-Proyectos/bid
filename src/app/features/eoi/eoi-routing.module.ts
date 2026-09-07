import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EoiComponent } from './views/eoi/eoi.component';
import { RegisterEoiComponent } from './views/register-eoi/register-eoi.component';
import { PreviewEoiComponent } from './views/preview-eoi/preview-eoi.component';

const routes: Routes = [
  {
    path: '',
    component: EoiComponent,
    children: [
      {
        path: '',
        redirectTo: 'register',
        pathMatch: 'full',
      },
      {
        path: 'register',
        component: RegisterEoiComponent,
        data: {
          breadcrumb: {
            alias: 'eoi-register',
          },
        },
      },
      {
        path: ':eoiId/update',
        component: RegisterEoiComponent,
        data: {
          breadcrumb: {
            alias: 'eoi-update',
          },
        },
      },
      {
        path: 'preview/:eoiId',
        component: PreviewEoiComponent,
        data: {
          breadcrumb: {
            alias: 'eoi-preview',
          },
        },
      },
      {
        path: 'preview/:eoiId/:groupId',
        component: PreviewEoiComponent,
        data: {
          breadcrumb: {
            alias: 'eoi-preview-amendment',
          },
        },
      },
      {
        path: 'preview/:eoiId/:groupId/readonly',
        component: PreviewEoiComponent,
        data: {
          breadcrumb: {
            alias: 'eoi-preview-amendment',
          },
        },
      },
      {
        path: ':groupId/register-amendment',
        component: RegisterEoiComponent,
        data: {
          breadcrumb: {
            alias: 'eoi-register-amendment',
          },
        },
      },
      {
        path: ':groupId/update-amendment',
        component: RegisterEoiComponent,
        data: {
          breadcrumb: {
            alias: 'eoi-update-amendment',
          },
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EoiRoutingModule {}
