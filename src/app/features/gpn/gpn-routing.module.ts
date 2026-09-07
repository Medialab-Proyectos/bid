import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GpnComponent } from './views/gpn/gpn.component';
import { ProjectsResolverResolver } from '@core/resolvers/projects-resolver.resolver';

const routes: Routes = [
  {
    path: '',
    component: GpnComponent,
    data: {
      breadcrumb: { alias: 'gpn' },
      canDisplayWorkflow: true,
    },
    resolve: {
      enums: ProjectsResolverResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GpnRoutingModule {}
