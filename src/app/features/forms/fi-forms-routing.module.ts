import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormsComponent } from './views/forms/forms.component';
import { CreateDynamicFormComponent } from './views/create-dynamic-form/create-dynamic-form.component';
import { CanDeactivateFromGuard } from '@core/guards/canDeactivateForm.guard';

const routes: Routes = [
  {
    path: '',
    component: FormsComponent,
    children: [
      {
        path: '',
        component: CreateDynamicFormComponent,
        canDeactivate: [CanDeactivateFromGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [CanDeactivateFromGuard],
})
export class FIFormsRoutingModule {}
