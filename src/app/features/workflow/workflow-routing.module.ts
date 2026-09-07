import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanDeactivateFromGuard } from '@core/guards/canDeactivateForm.guard';
import { WorkflowComponent } from './views/workflow/workflow.component';

const routes: Routes = [
  {
    path: '',
    component: WorkflowComponent,
    canDeactivate: [CanDeactivateFromGuard],
    data: {
      breadcrumb: {
        alias: 'workflow',
      },
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [CanDeactivateFromGuard],
})
export class WorkflowRoutingModule {}
