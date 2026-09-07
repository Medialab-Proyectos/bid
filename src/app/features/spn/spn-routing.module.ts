import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SpnComponent } from './components/spn/spn.component';
import { RegisterSpnSpdComponent } from './views/register-spn-spd/register-spn-spd.component';
import { SpnPreviewSdpComponent } from './components/spn-preview-sdp/spn-preview-sdp.component';
import { spnTypeGuard } from './guards/spn-type.guard';

const routes: Routes = [
  {
    path: '',
    component: SpnComponent,
    children: [
      {
        path: '',
        redirectTo: 'register',
        pathMatch: 'full',
      },
      {
        path: 'register',
        data: {
          breadcrumb: {
            skip: true,
          },
        },
        children: [
          {
            path: 'sdp',
            component: RegisterSpnSpdComponent,
            canActivate: [spnTypeGuard],
            data: {
              breadcrumb: {
                alias: 'register-spd',
              },
            },
          },
          {
            path: 'sdo',
            component: RegisterSpnSpdComponent,
            canActivate: [spnTypeGuard],
            data: {
              breadcrumb: {
                alias: 'register-sdo',
              },
            },
          },
        ],
      },
      {
        path: ':noticeId/update',
        component: RegisterSpnSpdComponent,
        data: {
          breadcrumb: {
            alias: 'update-spn',
          },
        },
      },
      {
        path: ':noticeId/preview',
        component: SpnPreviewSdpComponent,
        data: {
          breadcrumb: {
            alias: 'preview-spn',
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
export class SpnRoutingModule {}
