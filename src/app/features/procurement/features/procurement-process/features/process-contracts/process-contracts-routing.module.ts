import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContractsComponent } from './views/contracts/contracts.component';
import { CreateContractComponent } from './views/create-contract/create-contract.component';
import { EditContractComponent } from './views/edit-contract/edit-contract.component';
import { DetailContractComponent } from './views/detail-contract/detail-contract.component';
import { AddAmendmentComponent } from './views/add-amendment/add-amendment.component';
import { CanDeactivateFromGuard } from '@core/guards/canDeactivateForm.guard';
import { unsavedChangesGuard } from './guard/unsaved-contract-changes.guard';
import { RContractsStepperComponent } from './components/r-contracts-stepper/r-contracts-stepper.component';
import { contractVersion } from './guard/contract-version.guard';

const routes: Routes = [
  { path: '', component: ContractsComponent },
  {
    path: 'create',
    component: CreateContractComponent,
    canDeactivate: [CanDeactivateFromGuard],
    canActivate: [contractVersion],
    data: { breadcrumb: { skip: true } },
  },
  {
    path: 'new-create',
    component: RContractsStepperComponent,
    data: { breadcrumb: { skip: true } },
    canActivate: [contractVersion],
    canDeactivate: [unsavedChangesGuard],
  },
  {
    path: 'v2/:contractId',
    component: RContractsStepperComponent,
    data: { breadcrumb: { skip: true } },
    canDeactivate: [unsavedChangesGuard],
  },
  {
    path: ':contractId/edit',
    component: EditContractComponent,
    canDeactivate: [CanDeactivateFromGuard],
    data: { breadcrumb: { skip: true } },
  },
  {
    path: ':contractId/detail',
    component: DetailContractComponent,
    data: { breadcrumb: { alias: 'contractDetail' } },
  },
  {
    path: 'v2/:contractId/detail',
    component: RContractsStepperComponent,
    data: { breadcrumb: { skip: true } },
    canDeactivate: [unsavedChangesGuard],
  },
  {
    path: ':contractId/:mode',
    component: AddAmendmentComponent,
    canDeactivate: [CanDeactivateFromGuard],
    data: { breadcrumb: { skip: true } },
  },
  {
    path: ':contractId/:mode/:amendmentId',
    canDeactivate: [CanDeactivateFromGuard],
    component: AddAmendmentComponent,
    data: {
      breadcrumb: { alias: 'amendmentDetail' },
      canDisplayWorkflow: true,
    },
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [CanDeactivateFromGuard],
})
export class ProcessContractsRoutingModule {}
