import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivePlanComponent } from './views/active-plan/active-plan.component';

const routes: Routes = [
  {
    path: '',
    component: ActivePlanComponent,
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
