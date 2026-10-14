import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivePlanComponent } from './views/active-plan/active-plan.component';
import { ComponentDetailComponent } from './views/component-detail/component-detail.component';

const routes: Routes = [
  {
    path: '',
    component: ActivePlanComponent,
  },
  {
    // Drill-down of one component of the plan -- "Plan activo" and
    // "Simulación" both link into it (see `?selectable=1`, set only by the
    // simulation's own link).
    path: 'components/:componentCode',
    component: ComponentDetailComponent,
    data: { breadcrumb: { alias: 'financialPlanComponentDetail' } },
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FinancialPlanRoutingModule {}
