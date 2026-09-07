import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdditionalDocumentTabComponent } from './views/additional-document-tab/additional-document-tab.component';

const routes: Routes = [
  {
    path: '',
    component: AdditionalDocumentTabComponent,
    data: {
      canDisplayWorkflow: true,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProcessAdditionalDocPackagesRoutingModule {}
