import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DisbursementContainerComponent } from './components/disbursement-container/disbursement-container.component';

export const routes: Routes = [
  {
    path: '',
    component: DisbursementContainerComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class DisbursementInfoRoutingModule {}
